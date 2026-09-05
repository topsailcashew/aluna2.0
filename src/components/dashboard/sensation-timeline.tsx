"use client";

import { Waves } from "lucide-react";

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { HatchedBars, type HatchedBar } from "@/components/ui/hatched-bars";
import { intensityTimeline } from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";

const ACCENT = "var(--color-fearful)";

/**
 * Sensation intensity as hatched bars (the reference's Activity chart), with
 * the most recent check-in drawn solid and its value called out as a big stat.
 */
export function SensationTimeline({ entries }: { entries: CheckInEntry[] }) {
  const data = intensityTimeline(entries).slice(-10);
  const latest = data[data.length - 1];

  const bars: HatchedBar[] = data.map((point, i) => ({
    value: point.intensity / 10,
    color: ACCENT,
    label: formatShortDate(new Date(point.timestamp)),
    solid: i === data.length - 1,
  }));

  return (
    <Card className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-0.5">
          <CardTitle>Sensation intensity</CardTitle>
          <CardSubtitle>Body strength, per check-in</CardSubtitle>
        </div>
        {latest && (
          <p className="flex items-baseline gap-1">
            <span className="stat text-3xl">{latest.intensity.toFixed(1)}</span>
            <span className="text-xs font-semibold text-ink-subtle">/ 10</span>
          </p>
        )}
      </div>

      {data.length < 2 ? (
        <EmptyState
          icon={Waves}
          title="Not enough to chart yet"
          description="Log sensations in two check-ins and the bars will start to tell you something."
        />
      ) : (
        <HatchedBars bars={bars} height={150} />
      )}
    </Card>
  );
}
