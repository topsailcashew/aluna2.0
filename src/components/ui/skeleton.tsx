import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-xl bg-surface-sunken", className)}
      style={style}
    />
  );
}

export function ChartSkeleton({ height = 176 }: { height?: number }) {
  return (
    <div className="card space-y-4 p-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="w-full rounded-2xl" style={{ height }} />
    </div>
  );
}
