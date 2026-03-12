import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { hasEntitlement } from "@/lib/access/entitlements";
import { ResourceCard } from "@/components/ResourceCard";
import { getModuleBySlug, portalModules } from "@/data/portal-data";
import { getCurrentSessionUser } from "@/lib/auth/session-server";

type ModulePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { slug } = await params;
  const portalModule = getModuleBySlug(slug);

  if (!portalModule) {
    return {
      title: "Module Not Found | AgentBlueprints Portal",
    };
  }

  return {
    title: `${portalModule.title} | AgentBlueprints Portal`,
    description: portalModule.summary,
  };
}

export function generateStaticParams() {
  return portalModules.map((module) => ({
    slug: module.slug,
  }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const portalModule = getModuleBySlug(slug);
  const sessionUser = await getCurrentSessionUser();

  if (!portalModule) {
    notFound();
  }

  const moduleResources =
    portalModule.key !== "core-setup-guides"
      ? portalModule.resources
      : portalModule.resources.filter((resource) => {
          if (!resource.platform) {
            return true;
          }

          if (sessionUser?.accessLevel === "portal") {
            return true;
          }

          if (resource.platform === "Bland") {
            return hasEntitlement(sessionUser?.entitlements ?? [], "platform.bland");
          }
          if (resource.platform === "Retell") {
            return hasEntitlement(sessionUser?.entitlements ?? [], "platform.retell");
          }
          if (resource.platform === "Vapi") {
            return hasEntitlement(sessionUser?.entitlements ?? [], "platform.vapi");
          }
          return false;
        });

  return (
    <div className="space-y-6">
      <section className="premium-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
              Module Library
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-[var(--primary)]">{portalModule.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-[#2f4f79]">{portalModule.summary}</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-[var(--border-soft)] px-3 py-2 text-sm font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--primary)]">Resources</h2>
          <p className="text-sm text-[#2f4f79]">
            Browse and open module files from your protected resource set.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {moduleResources.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>
      </section>
    </div>
  );
}
