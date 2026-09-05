"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, Check, Flame } from "lucide-react";

interface HeroCheckInProps {
  accent: string | null;
  checkedInToday: boolean;
  familyLabel: string | null;
  streak: number;
}

/**
 * The reference's hero "Activity" card, repurposed as the primary check-in
 * surface. A mood-coloured gradient panel with the day's state as a big display
 * line and a circular action affordance — it stays the primary action after a
 * check-in rather than becoming a receipt.
 */
export function HeroCheckIn({
  accent,
  checkedInToday,
  familyLabel,
  streak,
}: HeroCheckInProps) {
  const tone = accent ?? "var(--color-deep-400)";

  return (
    <Link
      href="/check-in?mode=quick"
      className="card-hero relative block overflow-hidden p-5 transition-transform active:scale-[0.99]"
      style={{ "--tone": tone } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-75">
          {checkedInToday && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
          {checkedInToday ? "Checked in today" : "Today"}
        </span>
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-full text-white"
          style={{ backgroundColor: "var(--marker)", color: "var(--marker-ink)" }}
        >
          <ArrowUpRight className="size-4" strokeWidth={2.5} />
        </span>
      </div>

      <p className="font-display mt-6 text-3xl text-balance">
        {checkedInToday && familyLabel ? `Mostly ${familyLabel.toLowerCase()}` : "How do you feel?"}
      </p>
      <p className="mt-1 text-sm opacity-75">
        {checkedInToday ? "Tap to add another check-in" : "A minute of noticing"}
      </p>

      {streak > 0 && (
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface/55 px-2.5 py-1 text-[11px] font-bold">
          <Flame className="size-3" aria-hidden />
          {streak} day{streak === 1 ? "" : "s"} in a row
        </span>
      )}
    </Link>
  );
}
