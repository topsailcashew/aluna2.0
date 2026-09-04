"use client";

import Link from "next/link";
import { ArrowRight, Check, Flame } from "lucide-react";

import { primaryIdsFrom, PRIMARY_BY_ID } from "@/lib/data/emotions";
import type { CheckInEntry } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

interface HeroCardProps {
  entries: CheckInEntry[];
  streak: number;
  checkedInToday: boolean;
}

/**
 * The one thing the home screen is for. Before today's check-in it is an
 * invitation; afterwards it reflects what was logged, so opening the app on a
 * day you have already done the work feels like arriving rather than nagging.
 */
export function HeroCard({ entries, streak, checkedInToday }: HeroCardProps) {
  const latest = entries[0];
  const primary = latest ? PRIMARY_BY_ID.get(primaryIdsFrom(latest.emotions)[0]) : undefined;

  const accent = checkedInToday && primary ? primary.color : undefined;

  return (
    <Link
      href="/check-in?mode=quick"
      className="group relative block overflow-hidden rounded-4xl p-5 text-white shadow-lift transition-transform active:scale-[0.99]"
      style={{
        background: accent
          ? `linear-gradient(140deg, color-mix(in oklab, ${accent} 86%, #ffffff) 0%, ${accent} 52%, color-mix(in oklab, ${accent} 74%, #000000) 100%)`
          : "linear-gradient(140deg, var(--color-deep-600) 0%, var(--color-deep-800) 55%, var(--color-deep-900) 100%)",
      }}
    >
      {/* A soft light source in the corner keeps the block from reading flat. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/12 blur-2xl"
      />

      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          {checkedInToday ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold">
                <Check className="size-3" strokeWidth={3} aria-hidden />
                Checked in today
              </span>
              <p className="text-xl font-extrabold tracking-tight">
                Mostly {primary?.label.toLowerCase() ?? "logged"}
              </p>
              <p className="text-xs text-white/75">
                {relativeTime(latest.createdAt)} · tap to add another
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-extrabold tracking-tight">
                Start daily check-in
              </p>
              <p className="text-xs text-white/75">
                Two minutes: body, feelings, then mind
              </p>
            </>
          )}

          {streak > 0 && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">
              <Flame className="size-3" aria-hidden />
              {streak} day{streak === 1 ? "" : "s"} in a row
            </p>
          )}
        </div>

        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
