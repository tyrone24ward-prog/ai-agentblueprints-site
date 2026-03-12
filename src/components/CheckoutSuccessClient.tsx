"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BillingProductKey } from "@/lib/billing/config";

type ConfirmState = "processing" | "success" | "error";

export function CheckoutSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);
  const provider = useMemo(
    () => (searchParams.get("provider") === "lemonsqueezy" ? "lemonsqueezy" : "stripe"),
    [searchParams],
  );
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const productKey = useMemo(
    () => (searchParams.get("productKey") ?? "") as BillingProductKey,
    [searchParams],
  );
  const hasConfirmedRef = useRef(false);
  const [state, setState] = useState<ConfirmState>("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [nextUrl, setNextUrl] = useState("/dashboard");
  const [nextLabel, setNextLabel] = useState("Enter Portal");

  useEffect(() => {
    if (hasConfirmedRef.current) {
      return;
    }
    hasConfirmedRef.current = true;

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const confirmAccess = async () => {
      if (provider === "stripe" && !sessionId) {
        setState("error");
        setErrorMessage("Missing checkout session id.");
        return;
      }
      if (provider === "lemonsqueezy" && !email) {
        setState("error");
        setErrorMessage("Missing checkout email.");
        return;
      }

      let response: Response | null = null;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        response = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            email,
            productKey,
          }),
        });
        if (response.status !== 409) {
          break;
        }
        if (attempt < 5) {
          await wait(2000);
        }
      }
      if (!response) {
        setState("error");
        setErrorMessage("Unable to confirm payment access.");
        return;
      }

      if (response.status === 409) {
        setState("error");
        setErrorMessage("Payment is still processing. Please wait 10-20 seconds and refresh.");
        return;
      }

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setState("error");
        setErrorMessage(result?.error ?? "Unable to confirm payment access.");
        return;
      }

      const result = (await response.json().catch(() => null)) as
        | {
            redirectTo?: string;
            requiresPasswordSetup?: boolean;
            setupUrl?: string;
          }
        | null;
      if (result?.requiresPasswordSetup) {
        setNextUrl(result.setupUrl ?? "/set-password");
        setNextLabel("Set Password");
      } else if (result?.redirectTo === "/login") {
        setNextUrl("/login");
        setNextLabel("Sign In");
      } else if (result?.redirectTo === "/module/core-setup-guides") {
        setNextUrl("/module/core-setup-guides");
        setNextLabel("Open Your Package");
      } else {
        setNextUrl("/dashboard");
        setNextLabel("Enter Portal");
      }

      setState("success");
      router.refresh();
    };

    void confirmAccess();
  }, [email, productKey, provider, router, sessionId]);

  return (
    <section className="premium-card w-full max-w-2xl rounded-2xl p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--secondary)]">
        AgentBlueprints Portal
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--primary)]">Checkout Confirmation</h1>

      {state === "processing" && (
        <p className="mt-3 text-sm text-[#2f4f79]">
          Confirming your payment and unlocking access...
        </p>
      )}

      {state === "success" && (
        <>
          <p className="mt-3 text-sm text-[#2f4f79]">
            Purchase successful. Your portal access is now active.
          </p>
          <Link
            href={nextUrl}
            className="premium-gradient mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95"
          >
            {nextLabel}
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
          <Link
            href="/pricing"
            className="mt-5 inline-flex rounded-xl border border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white"
          >
            Back to Pricing
          </Link>
        </>
      )}
    </section>
  );
}
