import { SetPasswordForm } from "@/components/SetPasswordForm";

type SetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function SetPasswordPage({ searchParams }: SetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="premium-card w-full max-w-md rounded-3xl p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
          AgentBlueprints Portal
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--primary)]">
          Set Your Password
        </h1>
        <p className="mt-2 text-sm text-[#2f4f79]">
          Create your login to enter your newly unlocked portal account.
        </p>

        {!token ? (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Missing setup token. Please use the link from your purchase email.
          </p>
        ) : (
          <div className="mt-6">
            <SetPasswordForm token={token} />
          </div>
        )}
      </section>
    </main>
  );
}
