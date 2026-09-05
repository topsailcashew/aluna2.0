"use client";

import Link from "next/link";
import { Check, Flame } from "lucide-react";

interface OrbCtaProps {
  accent: string | null;
  checkedInToday: boolean;
  familyLabel: string | null;
  streak: number;
}

/**
 * The one thing this screen is for, as a single luminous target.
 *
 * It stays the primary action after a check-in rather than turning into a
 * receipt — coming back a second time in a day is a good instinct, and a
 * "done" state would quietly discourage it.
 */
export function OrbCta({
  accent,
  checkedInToday,
  familyLabel,
  streak,
}: OrbCtaProps) {
  // "Bad" is a deliberately desaturated slate, which left the orb looking
  // switched off. Blending a little of the app's own blue back in keeps every
  // family luminous without losing which one it is.
  const hue = accent
    ? `color-mix(in oklab, ${accent} 78%, var(--color-deep-400))`
    : "var(--color-deep-400)";

  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <Link
        href="/check-in?mode=quick"
        className="group relative grid size-44 place-items-center rounded-full transition-transform duration-300 active:scale-[0.97]"
        style={{
          background: `radial-gradient(circle at 50% 34%, color-mix(in oklab, ${hue} 46%, var(--surface)), color-mix(in oklab, ${hue} 22%, var(--surface)))`,
          boxShadow: `0 0 0 1px color-mix(in oklab, ${hue} 40%, transparent), 0 24px 60px -24px ${hue}, inset 0 1px 0 color-mix(in oklab, #fff 40%, transparent)`,
        }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: `0 0 44px 6px color-mix(in oklab, ${hue} 45%, transparent)` }}
        />
        <span className="relative flex flex-col items-center gap-1 px-6 text-center">
          {checkedInToday && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-ink-muted uppercase">
              <Check className="size-3" strokeWidth={3} aria-hidden />
              Checked in
            </span>
          )}
          <span className="text-xl leading-tight font-extrabold tracking-tight text-balance text-ink">
            {checkedInToday && familyLabel ? `Mostly ${familyLabel.toLowerCase()}` : "Check in"}
          </span>
          <span className="text-[11px] leading-snug text-ink-muted">
            {checkedInToday ? "Add another" : "Under a minute"}
          </span>
        </span>
      </Link>

      {streak > 0 && (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-3 py-1 text-[11px] font-bold text-ink-muted backdrop-blur">
          <Flame className="size-3" aria-hidden />
          {streak} day{streak === 1 ? "" : "s"} in a row
        </p>
      )}
    </div>
  );
}
