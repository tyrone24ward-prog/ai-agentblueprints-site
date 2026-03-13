import { NextResponse } from "next/server";

import { getAccessStateForEmail } from "@/lib/access/store";
import { APP_BASE_URL } from "@/lib/auth/config";
import { getCurrentSessionUser } from "@/lib/auth/session-server";
import {
  BILLING_PROVIDER,
  getBillingProductByKey,
  isLemonSqueezyConfigured,
  isStripeConfigured,
  type BillingProductKey,
} from "@/lib/billing/config";
import { createLemonSqueezyCheckout } from "@/lib/billing/lemonsqueezy";
import { getStripeServerClient } from "@/lib/billing/stripe";

export const runtime = "nodejs";

const resolveAppBaseUrl = (request: Request) => {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const requestHost = request.headers.get("host");
  const resolvedHost = forwardedHost ?? requestHost ?? requestUrl.host;
  const resolvedProto = forwardedProto ?? requestUrl.protocol.replace(":", "");
  const requestOrigin = `${resolvedProto}://${resolvedHost}`;
  const configuredBaseUrl = APP_BASE_URL?.trim();
  if (!configuredBaseUrl) {
    return requestOrigin;
  }

  // Safety net: never use localhost callback URLs in production traffic.
  if (
    process.env.NODE_ENV === "production" &&
    configuredBaseUrl.toLowerCase().includes("localhost")
  ) {
    return requestOrigin;
  }

  return configuredBaseUrl;
};

export async function POST(request: Request) {
  const sessionUser = await getCurrentSessionUser();
  const body = (await request.json().catch(() => null)) as
    | { email?: string; productKey?: BillingProductKey }
    | null;
  const requestedEmail = body?.email?.trim().toLowerCase() ?? "";
  const requestedProductKey = body?.productKey ?? "full";
  const selectedProduct = getBillingProductByKey(requestedProductKey);
  const checkoutEmail = sessionUser?.email ?? requestedEmail;
  const baseUrl = resolveAppBaseUrl(request);

  if (!selectedProduct) {
    return NextResponse.json({ error: "Invalid product selection." }, { status: 400 });
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

  if (BILLING_PROVIDER === "lemonsqueezy") {
    if (!isLemonSqueezyConfigured || !selectedProduct.lemonVariantId) {
      return NextResponse.json(
        {
          error:
            "LemonSqueezy is not configured. Set LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_WEBHOOK_SECRET, LEMONSQUEEZY_STORE_ID, and variant IDs.",
        },
        { status: 500 },
      );
    }

    try {
      const successUrl = `${baseUrl}/checkout/success?provider=lemonsqueezy&email=${encodeURIComponent(
        checkoutEmail,
      )}&productKey=${encodeURIComponent(selectedProduct.key)}`;
      const checkout = await createLemonSqueezyCheckout({
        variantId: selectedProduct.lemonVariantId,
        email: checkoutEmail,
        productKey: selectedProduct.key,
        successRedirectUrl: successUrl,
      });

      return NextResponse.json({ url: checkout.url });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to start LemonSqueezy checkout." },
        { status: 500 },
      );
    }
  }

  if (!selectedProduct.stripePriceId) {
    return NextResponse.json(
      { error: `Stripe price is missing for ${selectedProduct.title}.` },
      { status: 500 },
    );
  }

  if (!isStripeConfigured) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and at least one STRIPE_PRICE_ID_* value.",
      },
      { status: 500 },
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
    customer_email: checkoutEmail,
    metadata: {
      userEmail: checkoutEmail,
      productKey: selectedProduct.key,
      grantedEntitlements: selectedProduct.grantedEntitlements.join(","),
      checkoutMode: sessionUser ? "authenticated" : "guest",
    },
    success_url: `${baseUrl}/checkout/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
