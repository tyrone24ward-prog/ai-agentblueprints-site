import crypto from "node:crypto";

import {
  LEMONSQUEEZY_API_KEY,
  LEMONSQUEEZY_STORE_ID,
  LEMONSQUEEZY_WEBHOOK_SECRET,
  getBillingProductByKey,
  isLemonSqueezyConfigured,
} from "@/lib/billing/config";
import type { BillingProductKey } from "@/lib/billing/config";

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

const ensureConfigured = () => {
  if (!isLemonSqueezyConfigured) {
    throw new Error(
      "LemonSqueezy is not configured. Set LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_WEBHOOK_SECRET, LEMONSQUEEZY_STORE_ID, and variant IDs.",
    );
  }
};

export const createLemonSqueezyCheckout = async ({
  variantId,
  email,
  productKey,
  successRedirectUrl,
}: {
  variantId: string;
  email: string;
  productKey: string;
  successRedirectUrl: string;
}) => {
  ensureConfigured();

  const response = await fetch(`${LS_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email,
            custom: {
              userEmail: email,
              productKey,
              successRedirectUrl,
            },
          },
          product_options: {
            redirect_url: successRedirectUrl,
            receipt_button_text: "Return to AgentBlueprints",
            receipt_link_url: successRedirectUrl,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        data?: {
          attributes?: {
            url?: string;
          };
        };
        errors?: Array<{ detail?: string }>;
      }
    | null;

  if (!response.ok) {
    const errorText = payload?.errors?.[0]?.detail ?? "Unable to create LemonSqueezy checkout.";
    throw new Error(errorText);
  }

  const url = payload?.data?.attributes?.url;
  if (!url) {
    throw new Error("LemonSqueezy checkout URL was not returned.");
  }

  return { url };
};

export const verifyLemonSqueezySignature = (rawBody: string, signature: string) => {
  if (!LEMONSQUEEZY_WEBHOOK_SECRET) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature ?? "", "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
};

type LemonOrderMatch = {
  orderId: string;
  identifier: string | null;
  orderNumber: string | null;
  amountCents: number | null;
  currency: string | null;
  variantId: string | null;
  email: string | null;
  createdAt: string | null;
  testMode: boolean;
};

export const findPaidLemonOrderForEmailAndProduct = async ({
  email,
  productKey,
}: {
  email: string;
  productKey: BillingProductKey;
}): Promise<LemonOrderMatch | null> => {
  ensureConfigured();

  const targetProduct = getBillingProductByKey(productKey);
  if (!targetProduct?.lemonVariantId) {
    return null;
  }

  const response = await fetch(`${LS_API_BASE}/orders?page[size]=100`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      Accept: "application/vnd.api+json",
    },
  });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        data?: Array<{
          id?: string | number;
          attributes?: {
            status?: string;
            user_email?: string;
            identifier?: string;
            order_number?: number | string;
            total?: number | string;
            currency?: string;
            first_order_item?: {
              variant_id?: number | string;
            };
          };
        }>;
      }
    | null;

  const normalizedEmail = email.trim().toLowerCase();
  const match = (payload?.data ?? []).find((order) => {
    const attributes = order.attributes;
    const orderEmail = String(attributes?.user_email ?? "").trim().toLowerCase();
    const variantId = String(attributes?.first_order_item?.variant_id ?? "");
    const status = String(attributes?.status ?? "").toLowerCase();

    return (
      orderEmail === normalizedEmail &&
      status === "paid" &&
      variantId === String(targetProduct.lemonVariantId)
    );
  });

  if (!match) {
    return null;
  }

  const amountRaw = match.attributes?.total;
  const amountCents =
    typeof amountRaw === "number"
      ? amountRaw
      : typeof amountRaw === "string"
        ? Number.parseInt(amountRaw, 10)
        : null;

  return {
    orderId: String(match.id ?? ""),
    identifier: match.attributes?.identifier ? String(match.attributes.identifier) : null,
    orderNumber: match.attributes?.order_number ? String(match.attributes.order_number) : null,
    amountCents: Number.isFinite(amountCents) ? amountCents : null,
    currency: match.attributes?.currency ? String(match.attributes.currency) : null,
    variantId: match.attributes?.first_order_item?.variant_id
      ? String(match.attributes.first_order_item.variant_id)
      : null,
    email: match.attributes?.user_email ? String(match.attributes.user_email) : null,
    createdAt: match.attributes?.created_at ? String(match.attributes.created_at) : null,
    testMode: Boolean(match.attributes?.test_mode),
  };
};

export const findMostRecentPaidLemonOrderForVariant = async ({
  variantId,
}: {
  variantId: string;
}): Promise<LemonOrderMatch | null> => {
  ensureConfigured();

  const response = await fetch(`${LS_API_BASE}/orders?page[size]=100`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
      Accept: "application/vnd.api+json",
    },
  });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        data?: Array<{
          id?: string | number;
          attributes?: {
            status?: string;
            user_email?: string;
            identifier?: string;
            order_number?: number | string;
            total?: number | string;
            currency?: string;
            created_at?: string;
            test_mode?: boolean;
            first_order_item?: {
              variant_id?: number | string;
            };
          };
        }>;
      }
    | null;

  const matches = (payload?.data ?? [])
    .filter((order) => {
      const attributes = order.attributes;
      const status = String(attributes?.status ?? "").toLowerCase();
      const orderVariantId = String(attributes?.first_order_item?.variant_id ?? "");
      return status === "paid" && orderVariantId === String(variantId);
    })
    .sort((a, b) => {
      const left = new Date(String(a.attributes?.created_at ?? 0)).getTime();
      const right = new Date(String(b.attributes?.created_at ?? 0)).getTime();
      return right - left;
    });

  const mostRecent = matches[0];
  if (!mostRecent) {
    return null;
  }

  const amountRaw = mostRecent.attributes?.total;
  const amountCents =
    typeof amountRaw === "number"
      ? amountRaw
      : typeof amountRaw === "string"
        ? Number.parseInt(amountRaw, 10)
        : null;

  return {
    orderId: String(mostRecent.id ?? ""),
    identifier: mostRecent.attributes?.identifier
      ? String(mostRecent.attributes.identifier)
      : null,
    orderNumber: mostRecent.attributes?.order_number
      ? String(mostRecent.attributes.order_number)
      : null,
    amountCents: Number.isFinite(amountCents) ? amountCents : null,
    currency: mostRecent.attributes?.currency ? String(mostRecent.attributes.currency) : null,
    variantId: mostRecent.attributes?.first_order_item?.variant_id
      ? String(mostRecent.attributes.first_order_item.variant_id)
      : null,
    email: mostRecent.attributes?.user_email ? String(mostRecent.attributes.user_email) : null,
    createdAt: mostRecent.attributes?.created_at ? String(mostRecent.attributes.created_at) : null,
    testMode: Boolean(mostRecent.attributes?.test_mode),
  };
};
