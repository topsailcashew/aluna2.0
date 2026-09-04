"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { NotebookPen } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { labelOf, primaryOf, subOf } from "@/lib/data/emotions";
import type { CheckInEntry } from "@/lib/types";
import { relativeTime } from "@/lib/utils";

/** A face per emotion family, so the list scans without reading a word. */
const FACE: Record<string, string> = {
  happy: "🙂",
  surprised: "😮",
  bad: "😑",
  fearful: "😰",
  angry: "😠",
  disgusted: "😖",
  sad: "🙁",
};

export function RecentEntries({ entries }: { entries: CheckInEntry[] }) {
  const recent = entries.slice(0, 5);

  return (
    <Card className="space-y-4">
      <div className="space-y-0.5">
        <CardTitle>Wellness journey</CardTitle>
        <CardSubtitle>Your five most recent check-ins</CardSubtitle>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Your journey starts with one entry"
          description="A check-in takes about two minutes. Nothing here is shared with anyone."
          action={
            <Link
              href="/check-in"
              className={buttonClasses({ size: "sm", className: "mt-1" })}
            >
              Start your first check-in
            </Link>
          }
        />
      ) : (
        <ul className="max-h-80 space-y-2.5 overflow-y-auto pr-0.5">
          {recent.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function EntryRow({ entry }: { entry: CheckInEntry }) {
  const leadEmotion = entry.emotions[0];
  const primary = leadEmotion ? primaryOf(leadEmotion) : undefined;
  const sub = leadEmotion ? subOf(leadEmotion) : undefined;

  const emotionNames = entry.emotions.slice(0, 3).map(labelOf).join(", ");
  const extra = entry.emotions.length - 3;

  return (
    <li
      className="tone-surface flex items-center gap-3 rounded-2xl p-3"
      style={{ "--tone": primary?.color ?? "var(--ink-subtle)" } as CSSProperties}
    >
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface/70 text-lg"
      >
        {primary ? FACE[primary.id] : "•"}
      </span>

      <div className="min-w-0 flex-1">
        <p className="tone-strong truncate text-sm font-extrabold">
          {primary?.label ?? "Check-in"}
          {sub && (
            <span className="font-semibold opacity-70"> · {sub.label}</span>
          )}
        </p>
        <p className="truncate text-xs font-medium opacity-80">
          {emotionNames}
          {extra > 0 && ` +${extra} more`}
        </p>
        <p className="text-[11px] opacity-65">
          {entry.sensations.length} sensation
          {entry.sensations.length === 1 ? "" : "s"}
          {entry.thoughtPatterns.length > 0 &&
            ` · ${entry.thoughtPatterns.length} thought pattern${entry.thoughtPatterns.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <span className="shrink-0 text-[11px] font-bold whitespace-nowrap opacity-70">
        {relativeTime(entry.createdAt)}
      </span>
    </li>
  );
}
