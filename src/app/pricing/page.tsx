import { DevAccessStatePanel } from "@/components/DevAccessStatePanel";
import { LogoutButton } from "@/components/LogoutButton";
import { PurchaseActions } from "@/components/PurchaseActions";
import { getCurrentSessionUser } from "@/lib/auth/session-server";
import {
  BILLING_PRODUCTS,
  BILLING_PRODUCT_NAME,
} from "@/lib/billing/config";

export default async function PricingPage() {
  const sessionUser = await getCurrentSessionUser();
  const isAuthenticated = Boolean(sessionUser);
  const showDevAccessPanel = process.env.NODE_ENV === "development";
  const currentRouteDecision =
    sessionUser?.hasAccess && sessionUser.accessLevel === "portal"
      ? "Allow full /dashboard, /module/*, and /resources/* access."
      : sessionUser?.accessLevel === "platform"
        ? "Allow /module/core-setup-guides only. Other modules redirect to /pricing."
        : "Redirect /dashboard, /module/*, /resources/* to /pricing.";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-5 py-10">
      <section className="premium-card w-full rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
            AgentBlueprints Portal
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium text-[var(--primary)]">
              Access: {sessionUser?.hasAccess ? "Active" : "Not Active"}
            </span>
            {isAuthenticated && <LogoutButton />}
          </div>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--primary)]">
          Unlock Full Portal Access
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#2f4f79]">
          Complete your one-time purchase to unlock all setup guides, templates,
          customization resources, deployment files, and troubleshooting materials.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="premium-soft-card rounded-2xl p-5">
            <h2 className="text-xl font-semibold text-[var(--primary)]">{BILLING_PRODUCT_NAME}</h2>
            <p className="mt-1 text-sm text-[#2f4f79]">One-time purchase options</p>
            <div className="mt-4 space-y-2">
              {BILLING_PRODUCTS.map((product) => (
                <div
                  key={product.key}
                  className="flex items-center justify-between rounded-lg border border-[var(--border-soft)] bg-white/88 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--primary)]">{product.title}</p>
                    <p className="text-xs text-[#2f4f79]">{product.subtitle}</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--primary)]">{product.priceDisplay}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[#2f4f79]">
              <li>Choose Full Portal or platform-specific package access</li>
              <li>Bland, Retell, and Vapi packages are available separately</li>
              <li>Upgrade path remains available as your needs grow</li>
            </ul>
          </div>

          <div className="premium-card rounded-2xl p-5">
            <p className="text-sm text-[#2f4f79]">
              {sessionUser?.hasAccess
                ? "Your access is active."
                : "Your access is currently not active."}
            </p>
            <div className="mt-4">
              <PurchaseActions
                isAuthenticated={isAuthenticated}
                sessionEmail={sessionUser?.email}
                hasAccess={Boolean(sessionUser?.hasAccess)}
                accessLevel={sessionUser?.accessLevel ?? "none"}
                entitlements={sessionUser?.entitlements ?? []}
                isDevelopment={process.env.NODE_ENV === "development"}
              />
            </div>
            {showDevAccessPanel && sessionUser && (
              <DevAccessStatePanel
                email={sessionUser.email}
                isAuthenticated
                hasAccess={sessionUser.hasAccess}
                accessLevel={sessionUser.accessLevel}
                entitlements={sessionUser.entitlements}
                currentRouteDecision={currentRouteDecision}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
