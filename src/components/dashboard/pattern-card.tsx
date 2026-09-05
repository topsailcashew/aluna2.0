"use client";

import type { CSSProperties } from "react";
import { Activity, CalendarCheck, Flame, Smile } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  currentStreak,
  dominantEmotion,
  weeklyIntensityAverage,
} from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

/**
 * The reference's metric grid: four pale-tint cards, each a small filled icon
 * chip, a label, and a big number. Replaces the old stacked pattern card —
 * dominant family, streak, last check-in, and week-average intensity read at a
 * glance and each carries its own family tint for variety.
 */
export function PatternCard({ entries }: { entries: CheckInEntry[] }) {
  const dominant = dominantEmotion(entries);
  const weekly = weeklyIntensityAverage(entries);
  const streak = currentStreak(entries);
  const latest = entries[0];

  return (
    <div className="grid grid-cols-2 gap-3">
      <Metric
        tone={dominant?.color ?? "var(--ink-subtle)"}
        icon={Smile}
        label="Most logged"
        value={dominant?.label ?? "—"}
      />
      <Metric
        tone="var(--color-happy)"
        icon={Flame}
        label="Streak"
        value={streak > 0 ? String(streak) : "0"}
        unit={streak === 1 ? "day" : "days"}
      />
      <Metric
        tone="var(--color-fearful)"
        icon={CalendarCheck}
        label="Last check-in"
        value={latest ? relativeTime(latest.createdAt) : "Not yet"}
        small
      />
      <Metric
        tone="var(--color-sad)"
        icon={Activity}
        label="Week average"
        value={weekly.value === null ? "—" : weekly.value.toFixed(1)}
        unit={weekly.value === null ? undefined : "/ 10"}
      />
    </div>
  );
}

function Metric({
  tone,
  icon: Icon,
  label,
  value,
  unit,
  small,
}: {
  tone: string;
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  small?: boolean;
}) {
  return (
    <div
      className="card-metric flex flex-col gap-3 p-4"
      style={{ "--tone": tone } as CSSProperties}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-xl text-white"
          style={{ backgroundColor: tone }}
        >
          <Icon className="size-4" strokeWidth={2.4} />
        </span>
        <span className="text-xs font-bold opacity-70">{label}</span>
      </span>
      <span className="flex items-baseline gap-1">
        <span className={small ? "stat text-lg" : "stat text-3xl"}>{value}</span>
        {unit && <span className="text-xs font-semibold opacity-70">{unit}</span>}
      </span>
    </div>
  );
}
