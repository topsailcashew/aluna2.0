"use client";

import Link from "next/link";
import { Moon } from "lucide-react";

/**
 * The whole reminder feature. It appears inside the app, after the hour the
 * person chose, only on days they have not checked in. No permissions, no
 * service worker, nothing that can interrupt them while they are elsewhere.
 */
export function NudgeCard({ hour }: { hour: number }) {
  const now = new Date().getHours();
  const phrase =
    now >= 21 ? "Still time for today" : "Whenever suits you today";

  return (
    <Link
      href="/check-in"
      className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
        <Moon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{phrase}</span>
        <span className="block text-xs text-ink-muted">
          You asked to be reminded around{" "}
          {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "noon" : `${hour}am`}
        </span>
      </span>
    </Link>
  );
}
