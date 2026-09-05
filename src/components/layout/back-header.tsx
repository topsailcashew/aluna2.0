"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Shared header for the pages that hang off Profile. */
export function BackHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <header className="space-y-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </button>
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-display text-ink">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
      </div>
    </header>
  );
}
