import { LogoutButton } from "@/components/LogoutButton";

type HeaderProps = {
  title: string;
  subtitle: string;
  accessStatus: "active" | "not-active";
};

export function Header({ title, subtitle, accessStatus }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-soft)] bg-white/85 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--secondary)]">
            Protected Member Portal
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--primary)]">{title}</h2>
          <p className="mt-1 text-sm text-[#2f4f79]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium text-[var(--primary)] sm:block">
            Access: {accessStatus === "active" ? "Active" : "Not Active"}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
