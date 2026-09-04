"use client";

import { useMemo, useState } from "react";
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

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });

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

  /** Leading blanks so the first of the month lands under its weekday. */
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();

    const out: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      out.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    return out;
  }, [month]);

  const selectedEntries = selected ? (byDay.get(selected) ?? []) : [];
  const isThisMonth =
    month.getFullYear() === new Date().getFullYear() &&
    month.getMonth() === new Date().getMonth();

  const shift = (by: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));

  return (
    <div className="space-y-5">
      <BackHeader
        eyebrow="Profile"
        title="History"
        subtitle="Every check-in you have written"
      />

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="grid size-9 place-items-center rounded-full bg-surface-sunken text-ink-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <p className="text-sm font-extrabold text-ink">
            {month.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={isThisMonth}
            aria-label="Next month"
            className="grid size-9 place-items-center rounded-full bg-surface-sunken text-ink-muted transition-colors hover:text-ink disabled:opacity-35"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, index) => (
            <span
              key={index}
              className="pb-1 text-center text-[10px] font-bold text-ink-subtle"
            >
              {WEEKDAY.format(new Date(2024, 8, 1 + index))}
            </span>
          ))}

          {cells.map((date, index) => {
            if (!date) return <span key={`blank-${index}`} />;

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
                onClick={() => setSelected(key)}
                aria-pressed={isSelected}
                aria-label={`${date.toLocaleDateString(undefined, { day: "numeric", month: "long" })}, ${
                  dayEntries.length === 0
                    ? "no check-in"
                    : `${dayEntries.length} check-in${dayEntries.length === 1 ? "" : "s"}`
                }`}
                className={cn(
                  "grid aspect-square place-items-center rounded-xl text-xs font-bold transition-all disabled:opacity-25",
                  isSelected && "ring-2 ring-deep-500 ring-offset-1 ring-offset-[var(--surface)]",
                  lead ? "text-white" : "text-ink-muted",
                )}
                style={{
                  backgroundColor: lead ? lead.color : "var(--surface-sunken)",
                  outline: isToday && !isSelected ? "1.5px solid var(--border-strong)" : undefined,
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
              filter === null
                ? "bg-deep-700 text-white"
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
              className="rounded-full px-2.5 py-1 text-[11px] font-bold transition-opacity"
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
      </Card>

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
        <div className="space-y-3">
          {selectedEntries.map((entry) => (
            <EntryDetail key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryDetail({ entry }: { entry: CheckInEntry }) {
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
    <Card
      className="tone-surface space-y-3 border-transparent"
      style={{ "--tone": primary?.color ?? "var(--ink-subtle)" } as CSSProperties}
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
        <p className="text-[11px] opacity-70">
          {formatDateTime(entry.createdAt)}
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
    </Card>
  );
}
