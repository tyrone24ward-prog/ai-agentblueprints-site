import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { grantEntitlement, grantPortalAccess } from "@/lib/access/store";
import { FULL_PORTAL_ENTITLEMENT, isEntitlement } from "@/lib/access/entitlements";
import { ensureUserForEmail } from "@/lib/auth/user-store";
import {
  BILLING_PROVIDER,
  STRIPE_WEBHOOK_SECRET,
  getBillingProductByKey,
  isBillingProductKey,
  isStripeConfigured,
} from "@/lib/billing/config";
import {
  claimWebhookEvent,
  finalizeWebhookEvent,
  recordPurchase,
} from "@/lib/billing/persistence";
import { getStripeServerClient } from "@/lib/billing/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (BILLING_PROVIDER !== "stripe") {
    return NextResponse.json(
      {
        error:
          "Stripe webhook route is disabled because BILLING_PROVIDER is not set to stripe.",
      },
      { status: 501 },
    );
  }

  if (!isStripeConfigured || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe client unavailable." }, { status: 500 });
  }

  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const email = checkoutSession.metadata?.userEmail ?? checkoutSession.customer_email ?? "";
    const productKey = checkoutSession.metadata?.productKey ?? "";
    const claim = await claimWebhookEvent({
      provider: "stripe",
      eventId: event.id,
      eventType: event.type,
      payload: {
        object: "checkout.session.completed",
        livemode: event.livemode,
        apiVersion: event.api_version ?? null,
        stripeEventId: event.id,
        sessionId: checkoutSession.id,
        email,
        productKey: productKey ?? null,
        paymentStatus: checkoutSession.payment_status,
        amountTotal: checkoutSession.amount_total ?? null,
        currency: checkoutSession.currency ?? null,
        metadata: checkoutSession.metadata ?? {},
      },
    });

    if (!claim.claimed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const selectedProduct = isBillingProductKey(productKey)
      ? getBillingProductByKey(productKey)
      : null;
    const isPaid = checkoutSession.payment_status === "paid";

    try {
      if (isPaid && email) {
        await recordPurchase({
          email,
          provider: "stripe",
          providerCheckoutId: String(checkoutSession.id),
          providerOrderId:
            typeof checkoutSession.payment_intent === "string"
              ? checkoutSession.payment_intent
              : null,
          productKey: selectedProduct?.key ?? null,
          status: "paid",
          amountCents:
            typeof checkoutSession.amount_total === "number"
              ? checkoutSession.amount_total
              : null,
          currency: checkoutSession.currency ?? null,
          metadata: {
            mode: "webhook",
            stripeEventId: event.id,
            customerEmail: checkoutSession.customer_email ?? null,
          },
        });

        const legacyEntitlementRaw = checkoutSession.metadata?.entitlement ?? "";
        const legacyEntitlement = isEntitlement(legacyEntitlementRaw)
          ? legacyEntitlementRaw
          : null;
        const entitlementsToGrant = selectedProduct?.grantedEntitlements ??
          (legacyEntitlement ? [legacyEntitlement] : [FULL_PORTAL_ENTITLEMENT]);

        // PRODUCTION ACCESS GRANT:
        // This is the canonical place to grant paid access after Stripe confirms payment.
        for (const entitlement of entitlementsToGrant) {
          await grantEntitlement(email, entitlement);
        }
        if (entitlementsToGrant.includes(FULL_PORTAL_ENTITLEMENT)) {
          await grantPortalAccess(email);
        }
        await ensureUserForEmail(email);
      }

      await finalizeWebhookEvent({
        provider: "stripe",
        eventId: event.id,
        status: "processed",
      });
    } catch {
      await finalizeWebhookEvent({
        provider: "stripe",
        eventId: event.id,
        status: "failed",
      });
      throw new Error("Unable to process checkout.session.completed event.");
    }
  }

  return NextResponse.json({ received: true });
}
