import Link from "next/link";

import { DashboardOverview } from "@/components/DashboardOverview";
import { quickAccessFiles } from "@/data/portal-data";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="premium-card rounded-2xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
          AgentBlueprints
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[var(--primary)]">
          Welcome to Your Portal
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-[#2f4f79] md:text-base">
          Access all core setup resources, templates, customization guides, and deployment
          files from one premium workspace designed for smooth implementation.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="premium-card rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--primary)]">Start Here</h3>
          <p className="mt-2 text-sm text-[#2f4f79]">
            Begin with the Product Core module for orientation, portal usage, and your quick
            launch checklist.
          </p>
          <Link
            href="/module/product-core"
            className="premium-gradient mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Open Product Core
          </Link>
        </section>

        <section className="premium-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--primary)]">Future AI Assistant</h3>
          <p className="mt-2 text-sm text-[#2f4f79]">
            Placeholder for a future in-portal assistant panel.
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 text-sm text-[#3b689d]">
            AI helper tools will appear here in a future release.
          </div>
        </section>
      </div>

      <DashboardOverview />

      <section className="premium-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--primary)]">Quick Access</h3>
        <p className="mt-2 text-sm text-[#2f4f79]">
          Shortcuts to your most important resources and workflows.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {quickAccessFiles.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="premium-soft-card rounded-xl p-4 transition hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:shadow-xl hover:brightness-95"
            >
              <p className="font-semibold text-[var(--primary)]">{item.label}</p>
              <p className="mt-1 text-sm text-[#2f4f79]">{item.caption}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
