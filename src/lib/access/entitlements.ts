import type { AccessLevel, Entitlement } from "@/lib/auth/types";

export const PLATFORM_ENTITLEMENTS = [
  "platform.bland",
  "platform.retell",
  "platform.vapi",
] as const satisfies Entitlement[];

export const FULL_PORTAL_ENTITLEMENT: Entitlement = "portal.full";
export const ALL_ENTITLEMENTS = [
  FULL_PORTAL_ENTITLEMENT,
  ...PLATFORM_ENTITLEMENTS,
] as const satisfies Entitlement[];

export const normalizeEntitlements = (entitlements: Entitlement[]) =>
  Array.from(new Set(entitlements));

export const hasEntitlement = (entitlements: Entitlement[], entitlement: Entitlement) =>
  entitlements.includes(entitlement);

export const isEntitlement = (value: string): value is Entitlement =>
  ALL_ENTITLEMENTS.includes(value as Entitlement);

export const hasAnyPlatformEntitlement = (entitlements: Entitlement[]) =>
  PLATFORM_ENTITLEMENTS.some((key) => entitlements.includes(key));

export const hasFullPortalEntitlement = (entitlements: Entitlement[]) =>
  entitlements.includes(FULL_PORTAL_ENTITLEMENT);

export const deriveAccessLevel = (entitlements: Entitlement[]): AccessLevel => {
  if (hasFullPortalEntitlement(entitlements)) {
    return "portal";
  }
  if (hasAnyPlatformEntitlement(entitlements)) {
    return "platform";
  }
  return "none";
};
