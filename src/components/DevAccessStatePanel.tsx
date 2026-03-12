"use client";

import { BILLING_PRODUCTS } from "@/lib/billing/config";

type DevAccessStatePanelProps = {
  email: string;
  isAuthenticated: boolean;
  hasAccess: boolean;
  accessLevel: "none" | "platform" | "portal";
  entitlements?: string[];
  currentRouteDecision: string;
};

export function DevAccessStatePanel({
  email,
  isAuthenticated,
  hasAccess,
  accessLevel,
  entitlements,
  currentRouteDecision,
}: DevAccessStatePanelProps) {
  const activeEntitlements = entitlements ?? [];
  const purchasedPackages = BILLING_PRODUCTS.filter((product) =>
    product.grantedEntitlements.every((entitlement) => activeEntitlements.includes(entitlement)),
  ).map((product) => product.title);

  return (
    <div className="mt-3 rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] p-3">
      {/* DEVELOPMENT-ONLY LOCAL TESTING PANEL:
          Remove this block when live Stripe-only access controls are finalized. */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
        Dev Access Panel
      </p>
      <div className="mt-2 space-y-1 text-xs text-[#2f4f79]">
        <p>Email: {email}</p>
        <p>isAuthenticated: {String(isAuthenticated)}</p>
        <p>hasAccess: {String(hasAccess)}</p>
        <p>accessLevel: {accessLevel}</p>
        <p>entitlements: {activeEntitlements.join(", ") || "none"}</p>
        <p>purchasedPackages: {purchasedPackages.join(", ") || "none"}</p>
        <p>currentRouteDecision: {currentRouteDecision}</p>
      </div>
    </div>
  );
}
