"use client";

import { useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";

import { EmotionDistribution } from "@/components/dashboard/emotion-distribution";
import { SensationTimeline } from "@/components/dashboard/sensation-timeline";
import { PixelGrid } from "@/components/insights/pixel-grid";
import { BackHeader } from "@/components/layout/back-header";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { useEntries } from "@/hooks/use-entries";
import {
  buildObservations,
  observationsBlockedBy,
  RANGES,
  withinRange,
  type RangeDays,
} from "@/lib/insights";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  const { entries, loading } = useEntries();
  const [range, setRange] = useState<RangeDays>(30);

  const scoped = withinRange(entries, range);
  // Observations always read the whole history: a pattern needs every entry it
  // can get, and narrowing the range would only make claims flimsier.
  const observations = buildObservations(entries);
  const blocked = observationsBlockedBy(entries);

  return (
    <div className="space-y-5">
      <BackHeader
        eyebrow="Profile"
        title="Insights"
        subtitle="What your check-ins add up to"
      />

      <div
        role="radiogroup"
        aria-label="Time range"
        className="grid grid-cols-4 gap-2"
      >
        {RANGES.map((option) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={range === option.days}
            onClick={() => setRange(option.days)}
            className={cn(
              "rounded-2xl border py-2.5 text-sm font-bold transition-colors",
              range === option.days
                ? "border-deep-600 bg-deep-600 text-white"
                : "border-line bg-surface text-ink hover:border-deep-300",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <Lightbulb className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle>What stands out</CardTitle>
            <CardSubtitle>Tendencies, not verdicts</CardSubtitle>
          </div>
        </div>

        {blocked ? (
          <p className="rounded-2xl bg-surface-sunken p-3.5 text-xs leading-relaxed text-ink-muted">
            {blocked} Aluna waits for enough entries before drawing anything
            from them — a pattern found in four check-ins is usually just
            noise.
          </p>
        ) : observations.length === 0 ? (
          <p className="rounded-2xl bg-surface-sunken p-3.5 text-xs leading-relaxed text-ink-muted">
            Nothing stands out yet. Your check-ins do not lean strongly one way
            against any of the context you have logged, which is a perfectly
            ordinary result.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {observations.map((observation) => (
              <li
                key={observation.id}
                className="rounded-2xl bg-surface-sunken p-3.5"
              >
                <p className="text-sm leading-snug font-semibold text-ink">
                  {observation.text}
                </p>
                <p className="mt-1 text-[11px] text-ink-subtle">
                  Based on {observation.basedOn} check-ins
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {loading ? (
        <>
          <ChartSkeleton />
          <ChartSkeleton height={144} />
        </>
      ) : scoped.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Nothing in this range"
            description="Try a longer range, or add a check-in and come back."
          />
        </Card>
      ) : (
        <>
          <SensationTimeline entries={scoped} />
          <EmotionDistribution entries={scoped} />
          <PixelGrid entries={entries} />
        </>
      )}
    </div>
  );
}
