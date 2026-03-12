"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onLogout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isLoading}
      className="rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2 text-xs font-medium text-[var(--primary)] transition hover:border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white disabled:cursor-not-allowed disabled:border-[#d6e5fb] disabled:text-[#85a4cc]"
    >
      {isLoading ? "Signing Out..." : "Logout"}
    </button>
  );
}
