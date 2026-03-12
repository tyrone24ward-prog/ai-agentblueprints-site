import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { FULL_PORTAL_ENTITLEMENT } from "@/lib/access/entitlements";
import { grantEntitlement, grantPortalAccess } from "@/lib/access/store";
import { ensureUserForEmail } from "@/lib/auth/user-store";
import {
  BILLING_PROVIDER,
  getBillingProductByKey,
  getBillingProductByLemonVariantId,
  isBillingProductKey,
  isLemonSqueezyConfigured,
} from "@/lib/billing/config";
import { verifyLemonSqueezySignature } from "@/lib/billing/lemonsqueezy";
import { claimWebhookEvent, finalizeWebhookEvent, recordPurchase } from "@/lib/billing/persistence";

export const runtime = "nodejs";

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      productKey?: string;
      userEmail?: string;
    };
  };
  data?: {
    id?: string | number;
    type?: string;
    attributes?: {
      status?: string;
      user_email?: string;
      currency?: string;
      total?: number | string;
      test_mode?: boolean;
      first_order_item?: {
        variant_id?: number | string;
      };
      identifier?: string;
      order_number?: number | string;
    };
  };
};

export async function POST(request: Request) {
  if (BILLING_PROVIDER !== "lemonsqueezy") {
    return NextResponse.json(
      {
        error:
          "LemonSqueezy webhook route is disabled because BILLING_PROVIDER is not set to lemonsqueezy.",
      },
      { status: 501 },
    );
  }

  if (!isLemonSqueezyConfigured) {
    return NextResponse.json({ error: "LemonSqueezy webhook is not configured." }, { status: 500 });
  }

  const headerStore = await headers();
  const signature = headerStore.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing LemonSqueezy signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = (JSON.parse(rawBody) as LemonWebhookPayload) ?? {};
  const eventType = payload.meta?.event_name ?? "unknown";
  const orderId = String(payload.data?.id ?? "");
  const eventId = `${eventType}:${orderId || "unknown"}`;

  if (eventType !== "order_created" && eventType !== "order_refunded") {
    return NextResponse.json({ received: true, ignored: true, eventType });
  }

  const claim = await claimWebhookEvent({
    provider: "lemonsqueezy",
    eventId,
    eventType,
    payload: {
      eventType,
      orderId,
      orderStatus: payload.data?.attributes?.status ?? null,
      email: payload.data?.attributes?.user_email ?? null,
      customData: payload.meta?.custom_data ?? {},
      firstOrderItem: payload.data?.attributes?.first_order_item ?? null,
      total: payload.data?.attributes?.total ?? null,
      currency: payload.data?.attributes?.currency ?? null,
      testMode: payload.data?.attributes?.test_mode ?? null,
    },
  });
  if (!claim.claimed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const attributes = payload.data?.attributes;
    const email = String(
      attributes?.user_email ??
        payload.meta?.custom_data?.userEmail ??
        "",
    )
      .trim()
      .toLowerCase();
    const variantId = attributes?.first_order_item?.variant_id
      ? String(attributes.first_order_item.variant_id)
      : null;
    const productKey = payload.meta?.custom_data?.productKey ?? "";
    const productFromCustomData =
      isBillingProductKey(productKey) ? getBillingProductByKey(productKey) : null;
    const selectedProduct = productFromCustomData ?? getBillingProductByLemonVariantId(variantId);
    const paymentStatus = (attributes?.status ?? "").toLowerCase();
    const isPaid = paymentStatus === "paid";
    const isRefundedEvent = eventType === "order_refunded";

    if ((isPaid || isRefundedEvent) && email) {
      const totalRaw = attributes?.total;
      const amountCents =
        typeof totalRaw === "number"
          ? totalRaw
          : typeof totalRaw === "string"
            ? Number.parseInt(totalRaw, 10)
            : null;

      await recordPurchase({
        email,
        provider: "lemonsqueezy",
        providerCheckoutId: String(attributes?.identifier ?? orderId),
        providerOrderId: String(attributes?.order_number ?? orderId),
        productKey: selectedProduct?.key ?? null,
        status: isRefundedEvent ? "failed" : "paid",
        amountCents: Number.isFinite(amountCents) ? amountCents : null,
        currency: attributes?.currency ?? null,
        metadata: {
          mode: "webhook",
          lemonsqueezyOrderId: orderId,
          status: attributes?.status ?? null,
          eventType,
          variantId,
        },
      });

      if (!isRefundedEvent) {
        const entitlementsToGrant = selectedProduct?.grantedEntitlements ?? [FULL_PORTAL_ENTITLEMENT];
        for (const entitlement of entitlementsToGrant) {
          await grantEntitlement(email, entitlement);
        }
        if (entitlementsToGrant.includes(FULL_PORTAL_ENTITLEMENT)) {
          await grantPortalAccess(email);
        }
        await ensureUserForEmail(email);
      }
    }

    await finalizeWebhookEvent({
      provider: "lemonsqueezy",
      eventId,
      status: "processed",
    });
  } catch {
    await finalizeWebhookEvent({
      provider: "lemonsqueezy",
      eventId,
      status: "failed",
    });
    throw new Error(`Unable to process LemonSqueezy ${eventType} event.`);
  }

  return NextResponse.json({ received: true });
}
