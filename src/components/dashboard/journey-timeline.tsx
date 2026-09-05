"use client";

import Link from "next/link";
import { ChevronRight, NotebookPen } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  labelOf,
  PRIMARY_BY_ID,
  primaryIdsFrom,
  subOf,
} from "@/lib/data/emotions";
import type { CheckInEntry } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

/**
 * Recent check-ins as a thread rather than a stack of cards.
 *
 * The rail makes the sequence legible — you can see a run of hard days as a
 * run — and it keeps each row light enough to hold five without the card
 * turning into a wall.
 */
export function JourneyTimeline({ entries }: { entries: CheckInEntry[] }) {
  const recent = entries.slice(0, 5);

  return (
    <Card className="space-y-4 bg-surface/70 backdrop-blur">
      <div className="space-y-0.5">
        <p className="text-base font-bold tracking-tight text-ink">
          Wellness journey
        </p>
        <p className="text-xs text-ink-muted">Your five most recent check-ins</p>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Your journey starts with one entry"
          description="A check-in takes under a minute. Nothing here is shared with anyone."
          action={
            <Link
              href="/check-in?mode=quick"
              className={buttonClasses({ size: "sm", className: "mt-1" })}
            >
              Start your first check-in
            </Link>
          }
        />
      ) : (
        <ol className="relative space-y-4">
          {/* The thread. Inset so it runs through the middle of the dots, and
              stopped short of the last one so it does not dangle. */}
          <span
            aria-hidden
            className="absolute top-3 bottom-3 left-[7px] w-px bg-line"
          />

          {recent.map((entry) => {
            const family = primaryIdsFrom(entry.emotions)[0];
            const primary = family ? PRIMARY_BY_ID.get(family) : undefined;
            const sub = entry.emotions[0] ? subOf(entry.emotions[0]) : undefined;
            const names = entry.emotions.slice(0, 3).map(labelOf).join(", ");
            const extra = entry.emotions.length - 3;

            return (
              <li key={entry.id} className="relative flex gap-3.5 pl-0">
                <span
                  aria-hidden
                  className="relative z-10 mt-1 size-3.5 shrink-0 rounded-full ring-4 ring-[var(--surface)]"
                  style={{
                    backgroundColor: primary?.color ?? "var(--border-strong)",
                  }}
                />

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-extrabold"
                    style={{ color: primary?.color }}
                  >
                    {entry.undecryptable
                      ? "Locked entry"
                      : (primary?.label ?? "Check-in")}
                    {sub && !entry.undecryptable && (
                      <span className="opacity-80">: {sub.label}</span>
                    )}
                  </p>

                  {!entry.undecryptable && names && (
                    <p className="truncate text-xs text-ink-muted">
                      {names}
                      {extra > 0 && ` +${extra} more`}
                    </p>
                  )}

                  <p className="text-[11px] text-ink-subtle">
                    {entry.sensations.length} sensation
                    {entry.sensations.length === 1 ? "" : "s"}
                    {entry.tags?.activities?.length
                      ? ` · ${entry.tags.activities.length} tag${entry.tags.activities.length === 1 ? "" : "s"}`
                      : ""}
                  </p>
                </div>

                <span className="shrink-0 text-[11px] font-semibold whitespace-nowrap text-ink-subtle">
                  {relativeTime(entry.createdAt)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <Link
        href="/history"
        className="flex items-center gap-3 border-t border-line pt-3.5"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <NotebookPen className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">
            Explore all check-ins
          </span>
          <span className="block text-[11px] text-ink-muted">
            Browse by day, filter by feeling
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
      </Link>
    </Card>
  );
}
