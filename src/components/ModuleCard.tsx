import Link from "next/link";

type ModuleCardProps = {
  title: string;
  summary: string;
  resourceCount: number;
  href: string;
  progressPercent: number;
};

export function ModuleCard({
  title,
  summary,
  resourceCount,
  href,
  progressPercent,
}: ModuleCardProps) {
  return (
    <article className="premium-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--primary)]">{title}</h3>
        <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[#225da8]">
          {resourceCount} files
        </span>
      </div>
      <p className="mt-2 text-sm text-[#2f4f79]">{summary}</p>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs text-[#3b689d]">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#d9e9ff]">
          <div
            className="premium-gradient h-2 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-xl border border-[var(--secondary)] px-3 py-2 text-sm font-semibold text-[var(--secondary)] transition hover:bg-[var(--secondary)] hover:text-white"
      >
        Open Module
      </Link>
    </article>
  );
}
