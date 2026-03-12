import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="premium-card w-full max-w-2xl rounded-2xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
          AgentBlueprints Portal
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--primary)]">Checkout Canceled</h1>
        <p className="mt-3 text-sm text-[#2f4f79]">
          Checkout canceled. You can return anytime to unlock access.
        </p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white"
        >
          Back to Pricing
        </Link>
      </section>
    </main>
  );
}
