"use client";

import { useMemo } from "react";

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { PRIMARY_BY_ID, primaryIdsFrom, type PrimaryEmotionId } from "@/lib/data/emotions";
import { dayKey } from "@/lib/data/prompts";
import type { CheckInEntry } from "@/lib/types";

/**
 * One square per day for the last twenty weeks, coloured by that day's
 * dominant emotion family. Blank days stay hollow: the gaps are part of the
 * picture, and filling them in would flatter the record.
 */
export function PixelGrid({ entries }: { entries: CheckInEntry[] }) {
  const { weeks, monthMarks } = useMemo(() => {
    const byDay = new Map<string, CheckInEntry[]>();
    for (const entry of entries) {
      const key = dayKey(entry.createdAt);
      byDay.set(key, [...(byDay.get(key) ?? []), entry]);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Wind back to the most recent Sunday so columns are whole weeks.
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const columns: { date: Date; family: PrimaryEmotionId | null; count: number }[][] = [];
    const marks: { column: number; label: string }[] = [];
    const cursor = new Date(end);
    cursor.setDate(cursor.getDate() - (20 * 7 - 1));

    for (let week = 0; week < 20; week += 1) {
      const column: { date: Date; family: PrimaryEmotionId | null; count: number }[] = [];
      for (let day = 0; day < 7; day += 1) {
        const date = new Date(cursor);
        const dayEntries = byDay.get(dayKey(date)) ?? [];

        const counts = new Map<PrimaryEmotionId, number>();
        for (const entry of dayEntries) {
          for (const family of primaryIdsFrom(entry.emotions)) {
            counts.set(family, (counts.get(family) ?? 0) + 1);
          }
        }
        let family: PrimaryEmotionId | null = null;
        let best = 0;
        for (const [id, count] of counts) {
          if (count > best) {
            family = id;
            best = count;
          }
        }

        if (date.getDate() <= 7 && day === 0) {
          marks.push({
            column: week,
            label: date.toLocaleDateString(undefined, { month: "short" }),
          });
        }

        column.push({ date, family, count: dayEntries.length });
        cursor.setDate(cursor.getDate() + 1);
      }
      columns.push(column);
    }

    return { weeks: columns, monthMarks: marks };
  }, [entries]);

  const today = dayKey();

  return (
    <Card className="space-y-3">
      <div className="space-y-0.5">
        <CardTitle>Twenty weeks</CardTitle>
        <CardSubtitle>
          A square per day, coloured by whichever family led that day
        </CardSubtitle>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-max">
          <div className="mb-1 flex gap-1">
            {weeks.map((_, index) => {
              const mark = monthMarks.find((m) => m.column === index);
              return (
                <span
                  key={index}
                  className="w-3.5 text-[9px] font-bold text-ink-subtle"
                >
                  {mark?.label ?? ""}
                </span>
              );
            })}
          </div>

          <div className="flex gap-1">
            {weeks.map((column, index) => (
              <div key={index} className="flex flex-col gap-1">
                {column.map((cell) => {
                  const isToday = dayKey(cell.date) === today;
                  const future = cell.date.getTime() > Date.now();
                  return (
                    <span
                      key={cell.date.toISOString()}
                      title={`${cell.date.toLocaleDateString()} — ${
                        cell.count === 0
                          ? "no check-in"
                          : `${cell.count} check-in${cell.count === 1 ? "" : "s"}`
                      }`}
                      className="size-3.5 rounded-[3px]"
                      style={{
                        backgroundColor: future
                          ? "transparent"
                          : cell.family
                            ? PRIMARY_BY_ID.get(cell.family)?.color
                            : "var(--surface-sunken)",
                        outline: isToday ? "1.5px solid var(--color-deep-500)" : undefined,
                        outlineOffset: "1px",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
