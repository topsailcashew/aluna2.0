"use client";

import { useMemo } from "react";

import { Card } from "@/components/ui/card";
import { primaryIdsFrom } from "@/lib/data/emotions";
import type { DayMood } from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";
import { dayKey } from "@/lib/data/prompts";

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
const PLEASANT = new Set(["happy", "surprised"]);

const WIDTH = 320;
const HEIGHT = 62;
const PAD_X = 14;

/**
 * The week as a line rather than a row of blocks.
 *
 * Height is the share of that day's emotion families that were pleasant ones —
 * a crude measure, but an honest one, and it gives the week a shape you can
 * read at a glance. Days with no check-in sit apart from the line at rest
 * height: the wave only connects points that actually exist, so a quiet week
 * looks quiet instead of looking flat.
 */
export function WeekWave({
  days,
  entries,
}: {
  days: DayMood[];
  entries: CheckInEntry[];
}) {
  const points = useMemo(() => {
    const byDay = new Map<string, CheckInEntry[]>();
    for (const entry of entries) {
      const key = dayKey(entry.createdAt);
      byDay.set(key, [...(byDay.get(key) ?? []), entry]);
    }

    const step = (WIDTH - PAD_X * 2) / 6;

    return days.map((day, index) => {
      const dayEntries = byDay.get(dayKey(day.date)) ?? [];
      const families = dayEntries.flatMap((e) => primaryIdsFrom(e.emotions));

      const share = families.length
        ? families.filter((f) => PLEASANT.has(f)).length / families.length
        : null;

      return {
        day,
        x: PAD_X + index * step,
        // Inverted: pleasant sits high, which is the only direction that reads.
        y: share === null ? HEIGHT / 2 : HEIGHT - 10 - share * (HEIGHT - 22),
        hasData: share !== null,
      };
    });
  }, [days, entries]);

  /** Segments only between consecutive days that both hold a check-in. */
  const segments = useMemo(() => {
    const runs: string[] = [];
    let current: string[] = [];

    for (const point of points) {
      if (point.hasData) {
        current.push(`${point.x},${point.y}`);
      } else {
        if (current.length > 1) runs.push(current.join(" "));
        current = [];
      }
    }
    if (current.length > 1) runs.push(current.join(" "));
    return runs;
  }, [points]);

  const logged = days.filter((day) => day.entryCount > 0).length;

  return (
    <Card className="space-y-2 bg-surface/70 backdrop-blur">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold text-ink">Your week</p>
        <p className="text-xs text-ink-subtle">{logged} of 7 days logged</p>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label={`Seven day mood wave. ${logged} of 7 days have a check-in.`}
      >
        {segments.map((segment) => (
          <polyline
            key={segment}
            points={segment}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {points.map(({ day, x, y, hasData }) => (
          <g key={day.date.toISOString()}>
            {day.isToday && hasData && (
              <circle
                cx={x}
                cy={y}
                r={10}
                fill={day.primary?.color ?? "var(--color-deep-400)"}
                opacity={0.25}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={hasData ? 5.5 : 3}
              fill={
                hasData
                  ? (day.primary?.color ?? "var(--color-deep-400)")
                  : "var(--border-strong)"
              }
              stroke={day.isToday ? "var(--surface)" : "none"}
              strokeWidth={day.isToday ? 2 : 0}
            />
          </g>
        ))}
      </svg>

      <div className="flex justify-between px-[10px]">
        {days.map((day) => (
          <span
            key={day.date.toISOString()}
            className={
              day.isToday
                ? "text-[11px] font-bold text-ink"
                : "text-[11px] font-bold text-ink-subtle"
            }
          >
            {WEEKDAY.format(day.date)}
          </span>
        ))}
      </div>
    </Card>
  );
}
