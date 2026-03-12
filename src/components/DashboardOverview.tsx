import { ModuleCard } from "@/components/ModuleCard";
import { portalModules } from "@/data/portal-data";

export function DashboardOverview() {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--primary)]">Module Progress Overview</h3>
        <p className="text-sm text-[#2f4f79]">
          Track your portal sections and jump directly into each module.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {portalModules.map((module, index) => (
          <ModuleCard
            key={module.slug}
            title={module.title}
            summary={module.summary}
            resourceCount={module.resources.length}
            href={`/module/${module.slug}`}
            progressPercent={Math.min(100, 18 + index * 9)}
          />
        ))}
      </div>
    </section>
  );
}
