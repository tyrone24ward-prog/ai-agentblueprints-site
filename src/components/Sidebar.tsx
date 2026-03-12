 "use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { moduleNavigation } from "@/data/portal-data";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r border-[var(--border-soft)] bg-white/88 px-4 py-6 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:px-6">
      <div className="mb-8">
        <div className="mb-4 flex justify-center">
          <Image
            src="/branding/AgentBlueprints Logo.png"
            alt="AgentBlueprints logo"
            width={800}
            height={240}
            className="h-auto w-[95%] object-contain"
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--secondary)]">
          AgentBlueprints Portal
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--primary)]">Navigation</h1>
      </div>

      <nav className="space-y-1.5">
        {moduleNavigation.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                isActive
                  ? "border-[var(--secondary)] bg-[var(--primary)] text-white shadow-sm"
                  : "border-[var(--border-soft)] bg-white text-[var(--primary)] hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white"
              }`}
            >
              <span
                className={`inline-flex size-6 items-center justify-center rounded-md text-xs font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[var(--surface-soft)] text-[var(--primary)] group-hover:bg-white/20 group-hover:text-white"
                }`}
              >
                {index + 1}
              </span>
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
