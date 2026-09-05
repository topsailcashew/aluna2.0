"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { BackHeader } from "@/components/layout/back-header";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import {
  EMOTIONS,
  labelOf,
  PRIMARY_BY_ID,
  primaryIdsFrom,
  subOf,
  type PrimaryEmotionId,
} from "@/lib/data/emotions";
import { activityLabel } from "@/lib/data/context-tags";
import { dayKey } from "@/lib/data/prompts";
import type { CheckInEntry } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const timeOf = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export default function HistoryPage() {
  const { entries, loading } = useEntries();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(() => dayKey());
  // Captured once: reading the clock during render makes the output depend on
  // when React happens to re-run the component.
  const [openedAt] = useState(() => Date.now());
  const [filter, setFilter] = useState<PrimaryEmotionId | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      filter
        ? entries.filter((entry) =>
            primaryIdsFrom(entry.emotions).includes(filter),
          )
        : entries,
    [entries, filter],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, CheckInEntry[]>();
    for (const entry of filtered) {
      const key = dayKey(entry.createdAt);
      map.set(key, [...(map.get(key) ?? []), entry]);
    }
    return map;
  }, [filtered]);

  /** Every day of the visible month, for the horizontal strip. */
  const days = useMemo(() => {
    const count = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    return Array.from(
      { length: count },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    );
  }, [month]);

  // The selected day's entries, newest first — the timeline runs from the live
  // end downward, so the most recent check-in sits at the top and is lifted.
  const selectedEntries = useMemo(() => {
    const list = selected ? (byDay.get(selected) ?? []) : [];
    return [...list].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }, [selected, byDay]);

  const isThisMonth =
    month.getFullYear() === new Date().getFullYear() &&
    month.getMonth() === new Date().getMonth();

  const shift = (by: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));

  // Keep the chosen day in view as the month or selection changes.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(
      '[data-selected="true"]',
    );
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [selected, month]);

  return (
    <div className="space-y-5">
      <BackHeader
        eyebrow="Profile"
        title="History"
        subtitle="Every check-in you have written"
      />

      {/* Month + day strip, on the open background rather than in a card. */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <h2 className="flex-1 text-xl font-display text-ink">
            {month.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="grid size-9 place-items-center rounded-full bg-surface text-ink-muted shadow-card transition-colors hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={isThisMonth}
            aria-label="Next month"
            className="grid size-9 place-items-center rounded-full bg-surface text-ink-muted shadow-card transition-colors hover:text-ink disabled:opacity-35"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <div
          ref={stripRef}
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        >
          {days.map((date) => {
            const key = dayKey(date);
            const dayEntries = byDay.get(key) ?? [];
            const families = dayEntries.flatMap((e) =>
              primaryIdsFrom(e.emotions),
            );
            const lead = families[0]
              ? PRIMARY_BY_ID.get(families[0])
              : undefined;
            const isSelected = selected === key;
            const isToday = key === dayKey();
            const future = date.getTime() > openedAt;

            return (
              <button
                key={key}
                type="button"
                disabled={future}
                data-selected={isSelected}
                onClick={() => setSelected(key)}
                aria-pressed={isSelected}
                aria-label={`${date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}, ${
                  dayEntries.length === 0
                    ? "no check-in"
                    : `${dayEntries.length} check-in${dayEntries.length === 1 ? "" : "s"}`
                }`}
                className={cn(
                  "flex w-[3.4rem] shrink-0 flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors disabled:opacity-30",
                  isSelected
                    ? "bg-[var(--marker)] text-[var(--marker-ink)]"
                    : "bg-surface text-ink shadow-card hover:bg-surface-muted",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isSelected ? "opacity-80" : "text-ink-subtle",
                  )}
                >
                  {date.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span className="stat text-lg leading-none">
                  {date.getDate()}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    !lead && "opacity-0",
                  )}
                  style={{
                    backgroundColor: isSelected
                      ? "var(--marker-ink)"
                      : (lead?.color ?? "transparent"),
                    outline:
                      isToday && !isSelected && !lead
                        ? "1.5px solid var(--border-strong)"
                        : undefined,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Emotion filter, as pill tabs. */}
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
          <button
            type="button"
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors",
              filter === null
                ? "bg-[var(--marker)] text-[var(--marker-ink)]"
                : "bg-surface-sunken text-ink-muted hover:text-ink",
            )}
          >
            All
          </button>
          {EMOTIONS.map((primary) => (
            <button
              key={primary.id}
              type="button"
              onClick={() =>
                setFilter(filter === primary.id ? null : primary.id)
              }
              aria-pressed={filter === primary.id}
              className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-opacity"
              style={{
                backgroundColor:
                  filter === primary.id ? primary.color : `${primary.color}26`,
                color: filter === primary.id ? "#fff" : primary.color,
              }}
            >
              {primary.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <ChartSkeleton height={160} />
      ) : selectedEntries.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="Nothing on this day"
            description={
              filter
                ? "No check-in matching that filter. Try All, or pick another day."
                : "Pick a coloured day to read what you wrote."
            }
          />
        </Card>
      ) : (
        <ol className="relative space-y-3">
          {selectedEntries.map((entry, i) => {
            const families = primaryIdsFrom(entry.emotions);
            const primary = families[0]
              ? PRIMARY_BY_ID.get(families[0])
              : undefined;
            const tone = primary?.color ?? "var(--ink-subtle)";
            const newest = i === 0;
            const last = i === selectedEntries.length - 1;

            return (
              <li
                key={entry.id}
                className="relative grid grid-cols-[2.9rem_1fr] gap-3"
                style={{ "--tone": tone } as CSSProperties}
              >
                <div className="pt-2.5 text-right">
                  <p className="stat text-sm leading-none text-ink">
                    {timeOf(entry.createdAt)}
                  </p>
                </div>

                <div className="relative pl-6">
                  {/* Rail: connects nodes, stops short on the last row. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-3 left-[7px] w-px bg-line",
                      last ? "h-4" : "bottom-[-0.75rem]",
                    )}
                  />
                  <span
                    aria-hidden
                    className="absolute top-2.5 left-0 grid w-[15px] place-items-center"
                  >
                    <span
                      className={cn(
                        "rounded-full ring-4 ring-[var(--surface)]",
                        newest ? "size-3.5" : "size-2.5",
                      )}
                      style={{ backgroundColor: tone }}
                    />
                  </span>

                  <EntryDetail entry={entry} newest={newest} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function EntryDetail({
  entry,
  newest,
}: {
  entry: CheckInEntry;
  newest: boolean;
}) {
  const families = primaryIdsFrom(entry.emotions);
  const primary = families[0] ? PRIMARY_BY_ID.get(families[0]) : undefined;
  const journalAnswers = Object.entries(entry.journal ?? {}).filter(
    ([, value]) => value && value.trim(),
  );

  if (entry.undecryptable) {
    return (
      <Card className="space-y-1">
        <CardTitle>Locked entry</CardTitle>
        <CardSubtitle>
          Written {formatDateTime(entry.createdAt)}. This one could not be
          opened with your current key — it was probably written under a
          different password.
        </CardSubtitle>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "tone-surface space-y-3 rounded-3xl p-4",
        newest && "shadow-card",
      )}
      style={
        { "--tone": primary?.color ?? "var(--ink-subtle)" } as CSSProperties
      }
    >
      <div>
        <p className="text-sm font-extrabold">
          {primary?.label ?? "Check-in"}
          {entry.emotions[0] && (
            <span className="font-semibold opacity-70">
              {" · "}
              {subOf(entry.emotions[0])?.label}
            </span>
          )}
        </p>
      </div>

      {entry.emotions.length > 0 && (
        <p className="text-sm font-semibold">
          {entry.emotions.map(labelOf).join(", ")}
        </p>
      )}

      {entry.sensations.length > 0 && (
        <p className="text-xs opacity-80">
          {entry.sensations
            .map((s) => `${s.bodyPart.replace(/-/g, " ")} ${s.intensity}/10`)
            .join(" · ")}
        </p>
      )}

      {entry.tags?.activities?.length > 0 && (
        <p className="text-xs opacity-80">
          {entry.tags.activities.map(activityLabel).join(" · ")}
        </p>
      )}

      {entry.thoughtNote && (
        <p className="text-sm leading-relaxed italic opacity-90">
          “{entry.thoughtNote}”
        </p>
      )}

      {journalAnswers.length > 0 && (
        <div className="space-y-2 rounded-2xl bg-surface/50 p-3">
          {journalAnswers.map(([id, value]) => (
            <p key={id} className="text-xs leading-relaxed">
              {value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
