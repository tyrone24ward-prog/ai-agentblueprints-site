import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="premium-card w-full max-w-md rounded-3xl p-6 md:p-7">
        <div className="mb-3">
          <Image
            src="/branding/AgentBlueprints Logo.png"
            alt="AgentBlueprints logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
          AgentBlueprints Portal
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--primary)]">Sign In</h1>
        <p className="mt-2 text-sm text-[#2f4f79]">
          Access your protected training resources and implementation modules.
        </p>
        <p className="mt-2 text-xs text-[#5077a8]">
          New here?{" "}
          <Link href="/pricing" className="font-semibold text-[var(--secondary)] hover:underline">
            Purchase access first
          </Link>
          .
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
