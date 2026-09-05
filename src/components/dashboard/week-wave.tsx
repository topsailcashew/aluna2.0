"use client";

import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import { HatchedBars, type HatchedBar } from "@/components/ui/hatched-bars";
import { primaryIdsFrom } from "@/lib/data/emotions";
import type { DayMood } from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";
import { dayKey } from "@/lib/data/prompts";

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
const PLEASANT = new Set(["happy", "surprised"]);

/**
 * The week as hatched bars (the reference's signature chart). Bar height is the
 * share of that day's families that were pleasant ones — crude but honest — and
 * today is drawn solid as the single focal marker. Empty days keep a faint
 * track so a quiet week reads as quiet, not flat.
 */
export function WeekWave({
  days,
  entries,
}: {
  days: DayMood[];
  entries: CheckInEntry[];
}) {
  const bars = useMemo<HatchedBar[]>(() => {
    const byDay = new Map<string, CheckInEntry[]>();
    for (const entry of entries) {
      const key = dayKey(entry.createdAt);
      byDay.set(key, [...(byDay.get(key) ?? []), entry]);
    }

    return days.map((day) => {
      const dayEntries = byDay.get(dayKey(day.date)) ?? [];
      const families = dayEntries.flatMap((e) => primaryIdsFrom(e.emotions));
      const share = families.length
        ? families.filter((f) => PLEASANT.has(f)).length / families.length
        : 0;

      return {
        // A little floor so a logged-but-heavy day still shows a stub.
        value: dayEntries.length ? 0.18 + share * 0.82 : 0,
        color: day.primary?.color ?? "var(--color-deep-400)",
        label: WEEKDAY.format(day.date),
        solid: day.isToday,
      };
    });
  }, [days, entries]);

  const logged = days.filter((day) => day.entryCount > 0).length;

  return (
    <Card className="space-y-3 bg-surface/70 backdrop-blur">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold text-ink">Your week</p>
        <p className="text-xs text-ink-subtle">{logged} of 7 days logged</p>
      </div>
      <HatchedBars bars={bars} height={124} />
    </Card>
  );
}
