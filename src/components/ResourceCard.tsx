"use client";

import { useEffect, useState } from "react";

import { type ResourceFile } from "@/data/portal-data";

type ResourceCardProps = {
  resource: ResourceFile;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const [fileStatus, setFileStatus] = useState<"checking" | "available" | "missing">(
    "checking"
  );

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const checkFile = async () => {
      try {
        const response = await fetch(resource.filePath, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!isActive) {
          return;
        }

        setFileStatus(response.ok ? "available" : "missing");
      } catch {
        if (isActive) {
          setFileStatus("missing");
        }
      }
    };

    void checkFile();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [resource.filePath]);

  const isAvailable = fileStatus === "available";

  return (
    <article className="premium-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-[var(--primary)]">{resource.title}</h3>
        <div className="flex gap-1.5">
          {resource.platform && (
            <span className="rounded-full border border-[var(--secondary)]/40 bg-[var(--secondary)]/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-[var(--secondary)]">
              {resource.platform}
            </span>
          )}
          <span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold tracking-wide text-[#225da8]">
            {resource.type}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-[#2f4f79]">{resource.description}</p>
      <p className="mt-2 text-xs text-[#5077a8]">{resource.filePath}</p>
      {fileStatus === "missing" && (
        <p className="mt-2 text-xs font-medium text-amber-600">File not added yet</p>
      )}
      <div className="mt-4 flex gap-2">
        <a
          href={isAvailable ? resource.filePath : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!isAvailable}
          className={`inline-flex rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
            isAvailable
              ? "border-[var(--secondary)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white"
              : "cursor-not-allowed border-[#d6e5fb] bg-[#eef5ff] text-[#85a4cc]"
          }`}
        >
          View
        </a>
        <a
          href={isAvailable ? resource.filePath : undefined}
          download
          aria-disabled={!isAvailable}
          className={`inline-flex rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
            isAvailable
              ? "border-[var(--border-soft)] bg-[var(--surface-soft)] text-[var(--primary)] hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
              : "cursor-not-allowed border-[#d6e5fb] bg-[#eef5ff] text-[#85a4cc]"
          }`}
        >
          Download
        </a>
      </div>
    </article>
  );
}
