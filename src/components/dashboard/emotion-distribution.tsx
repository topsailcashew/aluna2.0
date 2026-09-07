"use client";

import { PieChart as PieIcon } from "lucide-react";

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { emotionDistribution } from "@/lib/analytics";
import { ringSlicePath, type Slice } from "@/lib/wheel-geometry";
import type { CheckInEntry } from "@/lib/types";

/* ringSlicePath is centred on the wheel's 400x400 frame, so this shares it. */
const OUTER = 190;
const INNER = 118; // ~62% of OUTER, matching the donut this replaced.
const GAP = 2; // degrees of breathing room between neighbours

/**
 * Proportional segments round the full circle, clockwise from twelve o'clock.
 * A segment narrower than the gap would invert into an unclosed path, so the
 * end is never allowed behind the start.
 */
function segmentsFor(counts: number[], total: number): Slice[] {
  let cursor = 0;
  return counts.map((count) => {
    const sweep = (count / total) * 360;
    const start = cursor + GAP / 2;
    const end = Math.max(start, cursor + sweep - GAP / 2);
    cursor += sweep;
    return { start, end };
  });
}

/**
 * Hand-rolled SVG rather than a charting library, like every other chart here.
 * Recharts was a 324KB chunk pulled in for this one donut, and it brought its
 * own problems: sectors were built from an rAF sweep that never runs in a
 * background tab, and its tooltip was invisible to screen readers. Each segment
 * now carries a <title>, so the same numbers are available on hover and to
 * assistive tech.
 */
export function EmotionDistribution({ entries }: { entries: CheckInEntry[] }) {
  const data = emotionDistribution(entries);
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  const segments = segmentsFor(
    data.map((slice) => slice.count),
    Math.max(total, 1),
  );

  return (
    <Card className="space-y-4">
      <div className="space-y-0.5">
        <CardTitle>Emotion distribution</CardTitle>
        <CardSubtitle>
          How your check-ins spread across the seven families
        </CardSubtitle>
      </div>

      {total === 0 ? (
        <EmptyState
          icon={PieIcon}
          title="No feelings logged yet"
          description="Once you name an emotion in a check-in, its family shows up here."
        />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-40 w-40 shrink-0">
            <svg
              viewBox="0 0 400 400"
              className="size-full"
              role="img"
              aria-label={`Emotion distribution across ${total} logged ${
                total === 1 ? "family" : "families"
              }`}
            >
              {data.map((slice, index) => (
                <path
                  key={slice.id}
                  d={ringSlicePath(INNER, OUTER, segments[index])}
                  fill={slice.color}
                >
                  <title>
                    {slice.label}: {slice.count} of {total} ·{" "}
                    {Math.round((slice.count / total) * 100)}%
                  </title>
                </path>
              ))}
            </svg>

            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <p className="text-xl font-extrabold text-ink">{total}</p>
              <p className="text-[10px] font-bold text-ink-subtle">Logged</p>
            </div>
          </div>

          <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-2">
            {data.map((slice) => (
              <li key={slice.id} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
                  {slice.label}
                </span>
                <span className="text-xs font-bold tabular-nums text-ink-subtle">
                  {Math.round((slice.count / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
