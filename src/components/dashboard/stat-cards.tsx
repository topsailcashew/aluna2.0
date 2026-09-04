"use client";

import { Activity, Clock, Smile } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { dominantEmotion, weeklyIntensityAverage } from "@/lib/analytics";
import type { CheckInEntry } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

/**
 * Three compact tiles rather than three full-width cards: the numbers are
 * small, and stacking them made the top of the home screen feel like a form.
 */
export function StatCards({ entries }: { entries: CheckInEntry[] }) {
  const latest = entries[0];
  const dominant = dominantEmotion(entries);
  const weekly = weeklyIntensityAverage(entries);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Tile
        icon={Smile}
        label="Dominant"
        value={dominant?.label ?? "—"}
        detail={dominant ? "most logged family" : "log a feeling"}
        accent={dominant?.color}
        className="col-span-2"
      />
      <Tile
        icon={Clock}
        label="Last check-in"
        value={latest ? relativeTime(latest.createdAt) : "Not yet"}
      />
      <Tile
        icon={Activity}
        label="Week average"
        value={weekly.value === null ? "—" : weekly.value.toFixed(1)}
        detail={
          weekly.value === null
            ? "no sensations"
            : `${weekly.sampleCount} logged · out of 10`
        }
      >
        {weekly.value !== null && <IntensityBar value={weekly.value} />}
      </Tile>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  detail,
  accent,
  className,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  accent?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const tinted = Boolean(accent);

  return (
    <div
      className={cn("card flex flex-col gap-1 p-4", className)}
      style={
        tinted
          ? { backgroundColor: accent, borderColor: "transparent" }
          : undefined
      }
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase",
          tinted ? "text-white/80" : "text-ink-subtle",
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
      <span
        className={cn(
          "text-lg leading-tight font-extrabold tracking-tight",
          tinted ? "text-white" : "text-ink",
        )}
      >
        {value}
      </span>
      {detail && (
        <span
          className={cn(
            "text-[11px]",
            tinted ? "text-white/75" : "text-ink-subtle",
          )}
        >
          {detail}
        </span>
      )}
      {children}
    </div>
  );
}

function IntensityBar({ value }: { value: number }) {
  const percent = Math.min(100, Math.max(0, (value / 10) * 100));
  return (
    <div className="relative mt-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#bfe0e6] via-[#f3d9c4] to-[#e8767b]">
      <span
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-deep-600 bg-surface"
        style={{ left: `${percent}%` }}
        aria-hidden
      />
    </div>
  );
}
