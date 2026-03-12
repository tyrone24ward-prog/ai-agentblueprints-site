"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BILLING_PRODUCTS, type BillingProductKey } from "@/lib/billing/config";
import type { Entitlement } from "@/lib/auth/types";

type PurchaseActionsProps = {
  isAuthenticated: boolean;
  sessionEmail?: string;
  hasAccess: boolean;
  accessLevel: "none" | "platform" | "portal";
  entitlements: Entitlement[];
  isDevelopment: boolean;
};

export function PurchaseActions({
  isAuthenticated,
  sessionEmail,
  hasAccess,
  accessLevel,
  entitlements,
  isDevelopment,
}: PurchaseActionsProps) {
  const router = useRouter();
  const [checkoutEmail, setCheckoutEmail] = useState(sessionEmail ?? "");
  const [activeProductKey, setActiveProductKey] = useState<BillingProductKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasFullPortalEntitlement = entitlements.includes("portal.full");
  const canUpgradeToFull = accessLevel === "platform" && !hasFullPortalEntitlement;

  const beginCheckout = async (productKey: BillingProductKey) => {
    setErrorMessage("");

    if (!isAuthenticated && !checkoutEmail.trim()) {
      setErrorMessage("Please enter your email to continue.");
      return;
    }

    setActiveProductKey(productKey);
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: checkoutEmail, productKey }),
      });
      const data = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !data?.url) {
        setErrorMessage(data?.error ?? "Unable to start checkout.");
        return;
      }

      window.location.href = data.url;
    } finally {
      setIsLoading(false);
      setActiveProductKey(null);
    }
  };

  const unlockDevAccess = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/access/dev-grant", {
        method: "POST",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(data?.error ?? "Unable to unlock demo access.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {!isAuthenticated && !hasAccess && (
        <div>
          <label
            htmlFor="checkout-email"
            className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[#3b689d]"
          >
            Email for purchase and account setup
          </label>
          <input
            id="checkout-email"
            name="checkout-email"
            type="email"
            required
            value={checkoutEmail}
            onChange={(event) => setCheckoutEmail(event.target.value)}
            className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-sm text-[var(--primary)] outline-none transition focus:border-[var(--secondary)] focus:ring-2 focus:ring-[#d9e9ff]"
            placeholder="you@company.com"
          />
        </div>
      )}

      <button
        type="button"
        onClick={
          hasAccess
            ? () => router.push(accessLevel === "portal" ? "/dashboard" : "/module/core-setup-guides")
            : () => beginCheckout("full")
        }
        disabled={isLoading}
        className="premium-gradient w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading
          ? "Processing..."
          : hasAccess
            ? accessLevel === "portal"
              ? "Enter Portal"
              : "Enter Your Package"
            : "Unlock Full Access"}
      </button>
      {canUpgradeToFull && (
        <button
          type="button"
          onClick={() => beginCheckout("full")}
          disabled={isLoading}
          className="w-full rounded-xl border border-[var(--secondary)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--secondary)] transition hover:bg-[var(--secondary)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && activeProductKey === "full" ? "Processing..." : "Upgrade to Full Access"}
        </button>
      )}
      {!hasAccess && (
        <div className="space-y-2">
          {BILLING_PRODUCTS.map((product) => {
            const isOwned =
              product.grantedEntitlements.every((entitlement) =>
                entitlements.includes(entitlement),
              ) || (accessLevel === "portal" && product.key !== "full");

            return (
              <button
                key={product.key}
                type="button"
                onClick={() => beginCheckout(product.key)}
                disabled={isLoading || isOwned}
                className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2 text-left text-xs font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white disabled:cursor-not-allowed disabled:border-[#d6e5fb] disabled:text-[#85a4cc]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{product.title}</span>
                  <span className="text-[11px] uppercase tracking-[0.08em]">
                    {isOwned
                      ? "Owned"
                      : isLoading && activeProductKey === product.key
                        ? "Processing..."
                        : product.priceDisplay}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] opacity-80">{product.subtitle}</div>
              </button>
            );
          })}
        </div>
      )}

      {isAuthenticated && !hasAccess && isDevelopment && (
        <>
          {/* DEVELOPMENT-ONLY LOCAL TESTING CONTROL:
              Use this as fallback while Stripe test credentials are not ready. */}
          <button
            type="button"
            onClick={unlockDevAccess}
            disabled={isLoading}
            className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2 text-xs font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white disabled:cursor-not-allowed disabled:border-[#d6e5fb] disabled:text-[#85a4cc]"
          >
            Demo Unlock (Dev)
          </button>
        </>
      )}

      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
