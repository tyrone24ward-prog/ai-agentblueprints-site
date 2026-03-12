"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StickyCta() {
  const [isVisible, setIsVisible] = useState(false);
  const [isNearPageBottom, setIsNearPageBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const viewportBottom = scrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight;

      setIsVisible(scrollY > 300);
      // Hide sticky CTA near footer so it never blocks footer content.
      setIsNearPageBottom(viewportBottom > pageBottom - 180);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 transition-all duration-300 ${
        isVisible && !isNearPageBottom
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Link
        href="/pricing"
        className="inline-flex rounded-xl bg-gradient-to-r from-[#1F7AFF] to-[#4FE3FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(31,122,255,0.35)]"
      >
        Unlock AgentBlueprints
      </Link>
    </div>
  );
}
