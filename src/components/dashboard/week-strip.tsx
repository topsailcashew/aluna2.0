"use client";

import { Card } from "@/components/ui/card";
import type { DayMood } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });

/**
 * Seven days at a glance. Each dot takes the colour of that day's dominant
 * emotion family; blank days stay hollow, because a missed day is information
 * too and hiding it would flatter the record.
 */
export function WeekStrip({ days }: { days: DayMood[] }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-bold text-ink">Your week</p>
        <p className="text-xs text-ink-subtle">
          {days.filter((day) => day.entryCount > 0).length} of 7 days logged
        </p>
      </div>

      <ul className="flex items-end justify-between gap-1">
        {days.map((day) => (
          <li
            key={day.date.toISOString()}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <span
              aria-hidden
              className={cn(
                "grid w-full place-items-center rounded-2xl transition-colors",
                day.entryCount > 0 ? "h-11" : "h-8",
              )}
              style={{
                backgroundColor: day.primary
                  ? day.primary.color
                  : "var(--surface-sunken)",
              }}
            >
              {day.entryCount > 1 && (
                <span className="text-[10px] font-black text-white">
                  {day.entryCount}
                </span>
              )}
            </span>
            <span
              className={cn(
                "text-[11px] font-bold",
                day.isToday ? "text-ink" : "text-ink-subtle",
              )}
            >
              {WEEKDAY.format(day.date)}
            </span>
            <span className="sr-only">
              {day.date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              :{" "}
              {day.entryCount === 0
                ? "no check-in"
                : `${day.entryCount} check-in${day.entryCount === 1 ? "" : "s"}, mostly ${day.primary?.label.toLowerCase()}`}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
