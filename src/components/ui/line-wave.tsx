"use client";

interface LineWaveProps {
  /** Values 0..1; rendered as thin vertical strokes of varying height. */
  values: number[];
  color: string;
  height?: number;
  className?: string;
}

/**
 * The reference's heart-rate motif: a row of thin vertical strokes whose
 * heights trace a small trend. Non-pitched, decorative-but-real — pass the
 * series you actually have. Hand-rolled SVG, no library.
 */
export function LineWave({ values, color, height = 40, className }: LineWaveProps) {
  const n = Math.max(values.length, 1);
  const width = 120;
  const step = width / n;
  const mid = height / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      preserveAspectRatio="none"
      style={{ width: "100%", height }}
    >
      {values.map((v, i) => {
        const h = Math.max(3, v * (height - 6));
        const x = i * step + step / 2;
        return (
          <line
            key={i}
            x1={x}
            y1={mid - h / 2}
            x2={x}
            y2={mid + h / 2}
            stroke={color}
            strokeWidth={2.4}
            strokeLinecap="round"
            opacity={0.75}
          />
        );
      })}
    </svg>
  );
}
