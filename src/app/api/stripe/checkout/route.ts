import { NextResponse } from "next/server";

import { getAccessStateForEmail } from "@/lib/access/store";
import { APP_BASE_URL } from "@/lib/auth/config";
import { getCurrentSessionUser } from "@/lib/auth/session-server";
import {
  BILLING_PROVIDER,
  getBillingProductByKey,
  isStripeConfigured,
  type BillingProductKey,
} from "@/lib/billing/config";
import { getStripeServerClient } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (BILLING_PROVIDER !== "stripe") {
    return NextResponse.json(
      {
        error:
          "Stripe checkout route is disabled because BILLING_PROVIDER is not set to stripe.",
      },
      { status: 501 },
    );
  }

  const sessionUser = await getCurrentSessionUser();
  const body = (await request.json().catch(() => null)) as
    | { email?: string; productKey?: BillingProductKey }
    | null;
  const requestedEmail = body?.email?.trim().toLowerCase() ?? "";
  const requestedProductKey = body?.productKey ?? "full";
  const selectedProduct = getBillingProductByKey(requestedProductKey);
  const checkoutEmail = sessionUser?.email ?? requestedEmail;

  if (!selectedProduct) {
    return NextResponse.json({ error: "Invalid product selection." }, { status: 400 });
  }

  if (!selectedProduct.stripePriceId) {
    return NextResponse.json(
      { error: `Stripe price is missing for ${selectedProduct.title}.` },
      { status: 500 },
    );
  }

  if (!checkoutEmail) {
    return NextResponse.json({ error: "Email is required to continue checkout." }, { status: 400 });
  }

  const accessState = await getAccessStateForEmail(checkoutEmail);
  const alreadyOwnsProduct = selectedProduct.grantedEntitlements.every((entitlement) =>
    accessState.entitlements.includes(entitlement),
  );
  if (alreadyOwnsProduct) {
    return NextResponse.json(
      {
        error: `This email already owns ${selectedProduct.title}.`,
      },
      { status: 400 },
    );
  }

  if (!isStripeConfigured) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and at least one STRIPE_PRICE_ID_* value.",
      },
      { status: 500 }
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client unavailable." }, { status: 500 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: selectedProduct.stripePriceId,
        quantity: 1,
      },
    ],
    // Checkout email maps payment to access and onboarding.
    customer_email: checkoutEmail,
    metadata: {
      userEmail: checkoutEmail,
      productKey: selectedProduct.key,
      grantedEntitlements: selectedProduct.grantedEntitlements.join(","),
      checkoutMode: sessionUser ? "authenticated" : "guest",
    },
    success_url: `${APP_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_BASE_URL}/checkout/cancel`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
