import { NextResponse } from "next/server";

import { FULL_PORTAL_ENTITLEMENT, isEntitlement } from "@/lib/access/entitlements";
import { grantEntitlement, grantPortalAccess } from "@/lib/access/store";
import { APP_BASE_URL } from "@/lib/auth/config";
import { setSessionCookie } from "@/lib/auth/cookies";
import { createSessionToken } from "@/lib/auth/session";
import { getCurrentSessionUser } from "@/lib/auth/session-server";
import { ensureUserForEmail, issueSetPasswordToken } from "@/lib/auth/user-store";
import {
  BILLING_PROVIDER,
  ENABLE_LEMON_DEV_CONFIRM_FALLBACK,
  getBillingProductByKey,
  isBillingProductKey,
  isStripeConfigured,
  type BillingProductKey,
} from "@/lib/billing/config";
import {
  findMostRecentPaidLemonOrderForVariant,
  findPaidLemonOrderForEmailAndProduct,
} from "@/lib/billing/lemonsqueezy";
import { hasPaidPurchaseForEmail, recordPurchase } from "@/lib/billing/persistence";
import { getStripeServerClient } from "@/lib/billing/stripe";
import { sendSetPasswordEmail } from "@/lib/notifications/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const sessionUser = await getCurrentSessionUser();
  const body = (await request.json().catch(() => null)) as
    | {
        sessionId?: string;
        email?: string;
        productKey?: BillingProductKey;
      }
    | null;

  if (BILLING_PROVIDER === "stripe") {
    const sessionId = body?.sessionId;
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id." }, { status: 400 });
    }

    if (!isStripeConfigured) {
      return NextResponse.json(
        { error: "Stripe is not configured in this environment." },
        { status: 500 },
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

    const legacyEntitlementRaw = checkoutSession.metadata?.entitlement ?? "";
    const legacyEntitlement = isEntitlement(legacyEntitlementRaw) ? legacyEntitlementRaw : null;
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

  const email = (body?.email ?? sessionUser?.email ?? "").trim().toLowerCase();
  const selectedProduct =
    body?.productKey && isBillingProductKey(body.productKey)
      ? getBillingProductByKey(body.productKey)
      : null;

  if (!email) {
    return NextResponse.json({ error: "Missing checkout email." }, { status: 400 });
  }
  if (!selectedProduct) {
    return NextResponse.json({ error: "Missing or invalid product key." }, { status: 400 });
  }
  if (sessionUser && email !== sessionUser.email.toLowerCase()) {
    return NextResponse.json({ error: "Session email mismatch." }, { status: 403 });
  }

  const hasPaidPurchase = await hasPaidPurchaseForEmail({
    email,
    provider: "lemonsqueezy",
    productKey: selectedProduct.key,
  });
  if (!hasPaidPurchase) {
    const providerOrder = await findPaidLemonOrderForEmailAndProduct({
      email,
      productKey: selectedProduct.key,
    });
    if (providerOrder) {
      await recordPurchase({
        email,
        provider: "lemonsqueezy",
        providerCheckoutId: providerOrder.identifier ?? providerOrder.orderId,
        providerOrderId: providerOrder.orderNumber ?? providerOrder.orderId,
        productKey: selectedProduct.key,
        status: "paid",
        amountCents: providerOrder.amountCents,
        currency: providerOrder.currency,
        metadata: {
          mode: "confirm-fallback",
          lemonsqueezyOrderId: providerOrder.orderId,
          variantId: providerOrder.variantId,
        },
      });
    }
  }

  // Dev resilience: if payer edits checkout email, webhook/confirm can lag behind.
  // In local testing only, map the most recent paid order for this variant to the signed-in user.
  if (
    !hasPaidPurchase &&
    process.env.NODE_ENV !== "production" &&
    ENABLE_LEMON_DEV_CONFIRM_FALLBACK &&
    sessionUser &&
    selectedProduct.lemonVariantId
  ) {
    const fallbackOrder = await findMostRecentPaidLemonOrderForVariant({
      variantId: selectedProduct.lemonVariantId,
    });
    const createdMs = fallbackOrder?.createdAt
      ? new Date(fallbackOrder.createdAt).getTime()
      : 0;
    const isRecent = createdMs > 0 && Date.now() - createdMs <= 1000 * 60 * 60;
    if (fallbackOrder && isRecent) {
      await recordPurchase({
        email,
        provider: "lemonsqueezy",
        providerCheckoutId: fallbackOrder.identifier ?? fallbackOrder.orderId,
        providerOrderId: fallbackOrder.orderNumber ?? fallbackOrder.orderId,
        productKey: selectedProduct.key,
        status: "paid",
        amountCents: fallbackOrder.amountCents,
        currency: fallbackOrder.currency,
        metadata: {
          mode: "confirm-dev-fallback",
          lemonsqueezyOrderId: fallbackOrder.orderId,
          variantId: fallbackOrder.variantId,
          payerEmail: fallbackOrder.email,
        },
      });
    }
  }

  const hasVerifiedPurchase = await hasPaidPurchaseForEmail({
    email,
    provider: "lemonsqueezy",
    productKey: selectedProduct.key,
  });
  if (!hasVerifiedPurchase) {
    return NextResponse.json(
      {
        success: false,
        pending: true,
        error: "Purchase is still being processed. Please wait a few seconds and try again.",
      },
      { status: 409 },
    );
  }

  const entitlementsToGrant = selectedProduct.grantedEntitlements;
  let accessState = await grantEntitlement(email, entitlementsToGrant[0] ?? FULL_PORTAL_ENTITLEMENT);
  for (const entitlement of entitlementsToGrant.slice(1)) {
    accessState = await grantEntitlement(email, entitlement);
  }
  if (entitlementsToGrant.includes(FULL_PORTAL_ENTITLEMENT)) {
    accessState = await grantPortalAccess(email);
  }

  const user = await ensureUserForEmail(email);

  if (sessionUser && sessionUser.email.toLowerCase() === email) {
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
