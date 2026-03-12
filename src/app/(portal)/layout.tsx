import type { ReactNode } from "react";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentSessionUser } from "@/lib/auth/session-server";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const sessionUser = await getCurrentSessionUser();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Header
          title="AgentBlueprints"
          subtitle="Your protected portal for setup, templates, and deployment resources."
          accessStatus={sessionUser?.hasAccess ? "active" : "not-active"}
        />
        <main className="flex-1 px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
