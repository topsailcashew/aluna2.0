"use client";

import type { CSSProperties } from "react";

import { dominantEmotion, weeklyIntensityAverage } from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

const FACE: Record<string, string> = {
  happy: "🙂",
  surprised: "😮",
  bad: "😑",
  fearful: "😰",
  angry: "😠",
  disgusted: "😖",
  sad: "🙁",
};

/**
 * Three numbers that used to be three separate tiles: which family shows up
 * most, when the last check-in was, and how strong the week's sensations have
 * been. They belong together — each is only meaningful next to the others.
 */
export function PatternCard({ entries }: { entries: CheckInEntry[] }) {
  const dominant = dominantEmotion(entries);
  const weekly = weeklyIntensityAverage(entries);
  const latest = entries[0];

  return (
    <section
      aria-label="Your pattern"
      className="tone-surface overflow-hidden rounded-4xl"
      style={
        {
          "--tone": dominant?.color ?? "var(--ink-subtle)",
        } as CSSProperties
      }
    >
      <div className="flex items-center gap-4 p-5">
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-3xl bg-surface/45 text-3xl"
        >
          {dominant ? FACE[dominant.id] : "·"}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-70">
            Most logged
          </p>
          <p className="text-3xl leading-tight font-extrabold tracking-tight">
            {dominant?.label ?? "—"}
          </p>
          <p className="text-xs opacity-75">
            {dominant
              ? "the family that comes up most often"
              : "log a feeling and it will appear here"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-surface/30 px-5 py-3 text-xs font-semibold">
        <span className="truncate opacity-80">
          Last {latest ? relativeTime(latest.createdAt) : "— not yet"}
        </span>
        <span aria-hidden className="opacity-40">
          |
        </span>
        <span className="whitespace-nowrap opacity-80">
          Avg {weekly.value === null ? "—" : `${weekly.value.toFixed(1)}/10`}
        </span>
      </div>
    </section>
  );
}
