"use client";

import { PieChart as PieIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { emotionDistribution, type EmotionSlice } from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";

export function EmotionDistribution({ entries }: { entries: CheckInEntry[] }) {
  const data = emotionDistribution(entries);
  const total = data.reduce((sum, slice) => sum + slice.count, 0);

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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={2}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                  // Recharts builds sectors from an rAF-driven sweep, which
                  // never runs in a background tab — leaving an empty donut.
                  // The card doesn't need the flourish; correctness wins.
                  isAnimationActive={false}
                >
                  {data.map((slice) => (
                    <Cell key={slice.id} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip content={<DistributionTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <p className="text-xl font-extrabold text-ink">{total}</p>
              <p className="text-[10px] font-bold tracking-wide text-ink-subtle uppercase">
                logged
              </p>
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

function DistributionTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: EmotionSlice }[];
  total: number;
}) {
  const slice = payload?.[0]?.payload;
  if (!active || !slice) return null;

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-lift">
      <p className="flex items-center gap-2 text-xs font-bold text-ink">
        <span
          aria-hidden
          className="size-2.5 rounded-full"
          style={{ backgroundColor: slice.color }}
        />
        {slice.label}
      </p>
      <p className="text-[11px] text-ink-muted">
        {slice.count} of {total} check-ins ·{" "}
        {Math.round((slice.count / total) * 100)}%
      </p>
    </div>
  );
}
