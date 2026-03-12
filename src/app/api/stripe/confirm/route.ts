import { NextResponse } from "next/server";

import { grantEntitlement, grantPortalAccess } from "@/lib/access/store";
import { APP_BASE_URL } from "@/lib/auth/config";
import { FULL_PORTAL_ENTITLEMENT, isEntitlement } from "@/lib/access/entitlements";
import { setSessionCookie } from "@/lib/auth/cookies";
import { createSessionToken } from "@/lib/auth/session";
import { getCurrentSessionUser } from "@/lib/auth/session-server";
import { ensureUserForEmail, issueSetPasswordToken } from "@/lib/auth/user-store";
import {
  BILLING_PROVIDER,
  getBillingProductByKey,
  isBillingProductKey,
  isStripeConfigured,
} from "@/lib/billing/config";
import { recordPurchase } from "@/lib/billing/persistence";
import { getStripeServerClient } from "@/lib/billing/stripe";
import { sendSetPasswordEmail } from "@/lib/notifications/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (BILLING_PROVIDER !== "stripe") {
    return NextResponse.json(
      {
        error:
          "Stripe confirm route is disabled because BILLING_PROVIDER is not set to stripe.",
      },
      { status: 501 },
    );
  }

  const sessionUser = await getCurrentSessionUser();

  const body = (await request.json().catch(() => null)) as
    | { sessionId?: string }
    | null;
  const sessionId = body?.sessionId;

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session id." }, { status: 400 });
  }

  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: "Stripe is not configured in this environment." },
      { status: 500 }
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client unavailable." }, { status: 500 });
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const email = checkoutSession.metadata?.userEmail ?? checkoutSession.customer_email ?? "";
  const productKey = checkoutSession.metadata?.productKey ?? "";
  const selectedProduct = isBillingProductKey(productKey)
    ? getBillingProductByKey(productKey)
    : null;
  const isPaid = checkoutSession.payment_status === "paid";

  if (!isPaid) {
    return NextResponse.json({ error: "Payment is not completed." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Missing checkout email." }, { status: 400 });
  }

  await recordPurchase({
    email,
    provider: "stripe",
    providerCheckoutId: String(checkoutSession.id),
    providerOrderId:
      typeof checkoutSession.payment_intent === "string" ? checkoutSession.payment_intent : null,
    productKey: selectedProduct?.key ?? null,
    status: "paid",
    amountCents: typeof checkoutSession.amount_total === "number" ? checkoutSession.amount_total : null,
    currency: checkoutSession.currency ?? null,
    metadata: {
      mode: "confirm-route",
      customerEmail: checkoutSession.customer_email ?? null,
    },
  });

  if (sessionUser && email.toLowerCase() !== sessionUser.email.toLowerCase()) {
    return NextResponse.json({ error: "Session email mismatch." }, { status: 403 });
  }

  // LOCAL TEST-MODE CONFIRMATION:
  // For local/dev simplicity, access is granted after server-side session verification.
  // In production, Stripe webhook remains the canonical source of truth.
  const legacyEntitlementRaw = checkoutSession.metadata?.entitlement ?? "";
  const legacyEntitlement = isEntitlement(legacyEntitlementRaw)
    ? legacyEntitlementRaw
    : null;
  const entitlementsToGrant = selectedProduct?.grantedEntitlements ??
    (legacyEntitlement ? [legacyEntitlement] : [FULL_PORTAL_ENTITLEMENT]);

  let accessState = await grantEntitlement(email, entitlementsToGrant[0] ?? FULL_PORTAL_ENTITLEMENT);
  for (const entitlement of entitlementsToGrant.slice(1)) {
    accessState = await grantEntitlement(email, entitlement);
  }
  if (entitlementsToGrant.includes(FULL_PORTAL_ENTITLEMENT)) {
    accessState = await grantPortalAccess(email);
  }
  const user = await ensureUserForEmail(email);

  if (sessionUser && sessionUser.email.toLowerCase() === email.toLowerCase()) {
    const token = await createSessionToken({
      ...sessionUser,
      hasAccess: accessState.hasAccess,
      accessLevel: accessState.accessLevel,
      entitlements: accessState.entitlements,
    });

    const response = NextResponse.json({
      success: true,
      requiresPasswordSetup: false,
      redirectTo:
        accessState.accessLevel === "portal" ? "/dashboard" : "/module/core-setup-guides",
    });
    setSessionCookie(response, token);
    return response;
  }

  if (user.passwordHash) {
    return NextResponse.json({
      success: true,
      requiresPasswordSetup: false,
      redirectTo: "/login",
    });
  }

  const setup = await issueSetPasswordToken(email);
  const setupUrl = `${APP_BASE_URL}/set-password?token=${encodeURIComponent(setup.token)}`;
  const emailResult = await sendSetPasswordEmail({ email, setupUrl });

  return NextResponse.json({
    success: true,
    requiresPasswordSetup: true,
    redirectTo: "/set-password",
    setupUrl,
    emailDelivery: emailResult.sent ? "sent" : "fallback-link",
  });
}
