"use client";

import { useId } from "react";

export interface HatchedBar {
  /** Colour of the hatch/solid fill for this bar. */
  color: string;
  /** 0..1 height fraction. */
  value: number;
  /** Axis label under the bar. Pass the real word — the chart does the fitting. */
  label: string;
  /** The one bar drawn solid rather than hatched — today, or the peak. */
  solid?: boolean;
}

/**
 * What this chart's fills mean. "Solid" carries a different meaning in every
 * chart that uses this component — today, the latest check-in, the most-felt
 * family — so the words have to come from the caller rather than be guessed
 * here. Omit it and no key is drawn.
 */
export interface HatchedBarsLegend {
  solid: string;
  hatched: string;
  /** Only for charts with empty slots, like a week with unlogged days. */
  empty?: string;
}

interface HatchedBarsProps {
  bars: HatchedBar[];
  height?: number;
  className?: string;
  legend?: HatchedBarsLegend;
}

/**
 * The reference's signature chart: bars filled with a diagonal hatch, with
 * exactly one drawn solid to mark today or the peak. Hand-rolled SVG rather
 * than a chart library so the texture and the single solid marker are exact,
 * and so it renders identically in a background tab (no rAF-driven animation).
 */
/**
 * Widest type size at which a label still fits its bar, clipping only once even
 * the smallest size will not do. Callers used to pre-truncate to a fixed number
 * of characters, which turned "Fearful" into "Fea" even on a chart with one bar
 * and 320 units of room for it.
 */
function fitLabel(label: string, barW: number) {
  // Rough advance width for the bold grotesque used here, in em.
  const widthAt = (size: number) => label.length * size * 0.58;
  for (const size of [10, 9, 8, 7.5]) {
    if (widthAt(size) <= barW) return { size, text: label };
  }
  const size = 7.5;
  const maxChars = Math.max(2, Math.floor(barW / (size * 0.58)));
  return {
    size,
    text: label.length > maxChars ? `${label.slice(0, maxChars - 1)}\u2026` : label,
  };
}

export function HatchedBars({
  bars,
  height = 132,
  className,
  legend,
}: HatchedBarsProps) {
  const uid = useId().replace(/[:]/g, "");
  const gap = 10;
  const n = Math.max(bars.length, 1);
  const width = 320;
  const barW = (width - gap * (n - 1)) / n;
  const trackTop = 6;
  const trackH = height - 22;

  return (
    <div className="space-y-2">
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
        const label = fitLabel(bar.label, barW);
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
              style={{ fontSize: label.size, fontWeight: 700 }}
            >
              {label.text}
            </text>
          </g>
        );
      })}
    </svg>

      {legend && (
        <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-ink-subtle">
          <LegendKey swatch="solid" label={legend.solid} />
          <LegendKey swatch="hatched" label={legend.hatched} />
          {legend.empty && <LegendKey swatch="empty" label={legend.empty} />}
        </ul>
      )}
    </div>
  );
}

/** One swatch and its meaning. The swatches echo the bar fills exactly. */
function LegendKey({
  swatch,
  label,
}: {
  swatch: "solid" | "hatched" | "empty";
  label: string;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className="size-2.5 shrink-0 rounded-[3px]"
        style={
          swatch === "solid"
            ? { background: "var(--marker)" }
            : swatch === "empty"
              ? { background: "var(--surface-sunken)" }
              : {
                  // Mirrors the 45-degree SVG pattern the bars are filled with.
                  backgroundImage:
                    "repeating-linear-gradient(45deg, currentColor 0 1.2px, transparent 1.2px 4px)",
                  opacity: 0.55,
                }
        }
      />
      {label}
    </li>
  );
}
