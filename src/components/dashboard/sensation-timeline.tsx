"use client";

import { Waves } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { intensityTimeline } from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";
import { formatDateTime, formatShortDate } from "@/lib/utils";

export function SensationTimeline({ entries }: { entries: CheckInEntry[] }) {
  const data = intensityTimeline(entries);

  return (
    <Card className="space-y-4">
      <div className="space-y-0.5">
        <CardTitle>Sensation intensity timeline</CardTitle>
        <CardSubtitle>
          Average strength of what your body reported, per check-in
        </CardSubtitle>
      </div>

      {data.length < 2 ? (
        <EmptyState
          icon={Waves}
          title="Not enough to chart yet"
          description="Log sensations in two check-ins and the line will start to tell you something."
        />
      ) : (
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 6, right: 8, bottom: 0, left: -22 }}
            >
              <defs>
                <linearGradient id="intensityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-deep-400)"
                    stopOpacity={0.34}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-deep-400)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value: number) =>
                  formatShortDate(new Date(value))
                }
                tick={{ fontSize: 11, fill: "var(--ink-subtle)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={26}
              />
              <YAxis
                domain={[0, 10]}
                ticks={[0, 5, 10]}
                tick={{ fontSize: 11, fill: "var(--ink-subtle)" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={<TimelineTooltip />}
                cursor={{
                  stroke: "var(--border-strong)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="intensity"
                stroke="var(--color-deep-500)"
                strokeWidth={2.5}
                fill="url(#intensityFill)"
                dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }}
                activeDot={{ r: 5, strokeWidth: 2, fill: "var(--surface)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

interface TooltipPayload {
  payload: { timestamp: number; intensity: number; sensationCount: number };
}

function TimelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-lift">
      <p className="text-xs font-bold text-ink">
        {point.intensity.toFixed(1)}{" "}
        <span className="font-semibold text-ink-subtle">/ 10</span>
      </p>
      <p className="text-[11px] text-ink-muted">
        {formatDateTime(new Date(point.timestamp))}
      </p>
      <p className="text-[11px] text-ink-subtle">
        {point.sensationCount} sensation
        {point.sensationCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
