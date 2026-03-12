"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DevResetAccessButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onReset = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/access/dev-reset", {
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(data?.error ?? "Unable to reset access.");
        return;
      }

      router.replace("/pricing");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onReset}
        disabled={isLoading}
        className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white disabled:cursor-not-allowed disabled:border-[#d6e5fb] disabled:text-[#85a4cc]"
      >
        Reset Access
      </button>
      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
