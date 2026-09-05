"use client";

import { useId } from "react";

export interface HatchedBar {
  /** Colour of the hatch/solid fill for this bar. */
  color: string;
  /** 0..1 height fraction. */
  value: number;
  /** Short axis label under the bar. */
  label: string;
  /** The one bar drawn solid rather than hatched — today, or the peak. */
  solid?: boolean;
}

interface HatchedBarsProps {
  bars: HatchedBar[];
  height?: number;
  className?: string;
}

/**
 * The reference's signature chart: bars filled with a diagonal hatch, with
 * exactly one drawn solid to mark today or the peak. Hand-rolled SVG rather
 * than a chart library so the texture and the single solid marker are exact,
 * and so it renders identically in a background tab (no rAF-driven animation).
 */
export function HatchedBars({ bars, height = 132, className }: HatchedBarsProps) {
  const uid = useId().replace(/[:]/g, "");
  const gap = 10;
  const n = Math.max(bars.length, 1);
  const width = 320;
  const barW = (width - gap * (n - 1)) / n;
  const trackTop = 6;
  const trackH = height - 22;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
    >
      <defs>
        {bars.map((bar, i) => (
          <pattern
            key={i}
            id={`${uid}-h${i}`}
            width="7"
            height="7"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              className="hatch-line"
              style={{ color: bar.color }}
            />
          </pattern>
        ))}
      </defs>

      {bars.map((bar, i) => {
        const x = i * (barW + gap);
        const h = Math.max(4, bar.value * trackH);
        const y = trackTop + (trackH - h);
        const r = Math.min(barW / 2, 10);
        return (
          <g key={i}>
            {/* faint full-height track keeps empty days from vanishing */}
            <rect
              x={x}
              y={trackTop}
              width={barW}
              height={trackH}
              rx={r}
              fill="var(--surface-sunken)"
              opacity={0.5}
            />
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={r}
              fill={bar.solid ? "var(--marker)" : `url(#${uid}-h${i})`}
              stroke={bar.solid ? "none" : bar.color}
              strokeOpacity={bar.solid ? 0 : 0.4}
              strokeWidth={1}
            />
            <text
              x={x + barW / 2}
              y={height - 4}
              textAnchor="middle"
              className="fill-ink-subtle"
              style={{ fontSize: 10, fontWeight: 700 }}
            >
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
