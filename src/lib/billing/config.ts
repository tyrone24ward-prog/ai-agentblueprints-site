import type { Entitlement } from "@/lib/auth/types";

export const BILLING_PRODUCT_NAME = "AgentBlueprints";
export const BILLING_PRICE_DISPLAY = process.env.NEXT_PUBLIC_PORTAL_PRICE ?? "$497";
export type BillingProvider = "stripe" | "lemonsqueezy";
const rawBillingProvider = (process.env.BILLING_PROVIDER ?? "stripe").toLowerCase();
export const BILLING_PROVIDER: BillingProvider =
  rawBillingProvider === "lemonsqueezy" ? "lemonsqueezy" : "stripe";
export const ENABLE_LEMON_DEV_CONFIRM_FALLBACK =
  process.env.ENABLE_LEMON_DEV_CONFIRM_FALLBACK === "true";

export type BillingProductKey =
  | "full"
  | "appointment-suite"
  | "bland"
  | "retell"
  | "vapi";

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
export const STRIPE_PRICE_ID_FULL = process.env.STRIPE_PRICE_ID_FULL ?? "";
export const STRIPE_PRICE_ID_APPOINTMENT_SUITE =
  process.env.STRIPE_PRICE_ID_APPOINTMENT_SUITE ?? STRIPE_PRICE_ID ?? "";
export const STRIPE_PRICE_ID_BLAND = process.env.STRIPE_PRICE_ID_BLAND ?? "";
export const STRIPE_PRICE_ID_RETELL = process.env.STRIPE_PRICE_ID_RETELL ?? "";
export const STRIPE_PRICE_ID_VAPI = process.env.STRIPE_PRICE_ID_VAPI ?? "";
export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

// LemonSqueezy placeholders (next payment provider migration).
export const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY ?? "";
export const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
export const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID ?? "";
export const LEMONSQUEEZY_VARIANT_ID_FULL = process.env.LEMONSQUEEZY_VARIANT_ID_FULL ?? "";
export const LEMONSQUEEZY_VARIANT_ID_APPOINTMENT_SUITE =
  process.env.LEMONSQUEEZY_VARIANT_ID_APPOINTMENT_SUITE ?? "";
export const LEMONSQUEEZY_VARIANT_ID_BLAND = process.env.LEMONSQUEEZY_VARIANT_ID_BLAND ?? "";
export const LEMONSQUEEZY_VARIANT_ID_RETELL = process.env.LEMONSQUEEZY_VARIANT_ID_RETELL ?? "";
export const LEMONSQUEEZY_VARIANT_ID_VAPI = process.env.LEMONSQUEEZY_VARIANT_ID_VAPI ?? "";

export const BILLING_PRODUCTS = [
  {
    key: "full",
    title: "Full Portal Access",
    subtitle: "All modules + all platforms",
    priceDisplay: process.env.NEXT_PUBLIC_PORTAL_PRICE_FULL ?? "$1497",
    stripePriceId: STRIPE_PRICE_ID_FULL,
    lemonVariantId: LEMONSQUEEZY_VARIANT_ID_FULL,
    grantedEntitlements: ["portal.full"] as Entitlement[],
  },
  {
    key: "appointment-suite",
    title: "Appointment Setter Suite",
    subtitle: "Bland + Retell + Vapi templates",
    priceDisplay: process.env.NEXT_PUBLIC_PORTAL_PRICE_APPOINTMENT_SUITE ?? "$497",
    stripePriceId: STRIPE_PRICE_ID_APPOINTMENT_SUITE,
    lemonVariantId: LEMONSQUEEZY_VARIANT_ID_APPOINTMENT_SUITE,
    grantedEntitlements: [
      "platform.bland",
      "platform.retell",
      "platform.vapi",
    ] as Entitlement[],
  },
  {
    key: "bland",
    title: "Bland Package",
    subtitle: "Bland setup + template",
    priceDisplay: process.env.NEXT_PUBLIC_PORTAL_PRICE_BLAND ?? "$197",
    stripePriceId: STRIPE_PRICE_ID_BLAND,
    lemonVariantId: LEMONSQUEEZY_VARIANT_ID_BLAND,
    grantedEntitlements: ["platform.bland"] as Entitlement[],
  },
  {
    key: "retell",
    title: "Retell Package",
    subtitle: "Retell setup + template",
    priceDisplay: process.env.NEXT_PUBLIC_PORTAL_PRICE_RETELL ?? "$197",
    stripePriceId: STRIPE_PRICE_ID_RETELL,
    lemonVariantId: LEMONSQUEEZY_VARIANT_ID_RETELL,
    grantedEntitlements: ["platform.retell"] as Entitlement[],
  },
  {
    key: "vapi",
    title: "Vapi Package",
    subtitle: "Vapi setup + template",
    priceDisplay: process.env.NEXT_PUBLIC_PORTAL_PRICE_VAPI ?? "$197",
    stripePriceId: STRIPE_PRICE_ID_VAPI,
    lemonVariantId: LEMONSQUEEZY_VARIANT_ID_VAPI,
    grantedEntitlements: ["platform.vapi"] as Entitlement[],
  },
] as const;

export const getBillingProductByKey = (key: BillingProductKey) =>
  BILLING_PRODUCTS.find((item) => item.key === key);
export const isBillingProductKey = (value: string): value is BillingProductKey =>
  BILLING_PRODUCTS.some((item) => item.key === value);

export const getBillingProductByLemonVariantId = (variantId: string | null | undefined) =>
  BILLING_PRODUCTS.find((item) => item.lemonVariantId && item.lemonVariantId === (variantId ?? ""));

export const isStripeConfigured = Boolean(
  STRIPE_SECRET_KEY &&
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    BILLING_PRODUCTS.some((item) => Boolean(item.stripePriceId))
);

export const isLemonSqueezyConfigured = Boolean(
  LEMONSQUEEZY_API_KEY &&
    LEMONSQUEEZY_WEBHOOK_SECRET &&
    LEMONSQUEEZY_STORE_ID &&
    BILLING_PRODUCTS.some((item) => Boolean(item.lemonVariantId))
);
