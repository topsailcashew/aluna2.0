/**
 * Polar helpers for the emotion wheel.
 *
 * Angles are degrees with 0° at twelve o'clock, increasing clockwise — the way
 * you'd describe a slice out loud, rather than the maths convention.
 */

export const CENTER = 200;

export interface Slice {
  start: number;
  end: number;
}

export function pointOnCircle(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

/** A donut segment: outer arc clockwise, inner arc back anticlockwise. */
export function ringSlicePath(
  innerRadius: number,
  outerRadius: number,
  { start, end }: Slice,
): string {
  const largeArc = end - start > 180 ? 1 : 0;
  const o1 = pointOnCircle(outerRadius, start);
  const o2 = pointOnCircle(outerRadius, end);
  const i1 = pointOnCircle(innerRadius, end);
  const i2 = pointOnCircle(innerRadius, start);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

/**
 * The invisible baseline a slice's label rides on. Slices whose midpoint falls
 * in the lower half are drawn anticlockwise so the text never reads upside-down.
 */
export function labelArcPath(radius: number, { start, end }: Slice): string {
  const mid = (start + end) / 2;
  const flipped = mid > 90 && mid <= 270;
  const largeArc = end - start > 180 ? 1 : 0;

  if (flipped) {
    const from = pointOnCircle(radius, end);
    const to = pointOnCircle(radius, start);
    return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 0 ${to.x} ${to.y}`;
  }

  const from = pointOnCircle(radius, start);
  const to = pointOnCircle(radius, end);
  return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`;
}

/**
 * Divides the full circle into `count` slices, leaving a hairline gap between
 * neighbours so the ring reads as separate petals.
 */
export function equalSlices(count: number, gapDegrees = 1.2): Slice[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, index) => ({
    start: index * step + gapDegrees / 2,
    end: (index + 1) * step - gapDegrees / 2,
  }));
}

/** Rough character budget for a label sitting on an arc of this length. */
export function fitsOnArc(
  text: string,
  radius: number,
  slice: Slice,
  fontSize: number,
): boolean {
  const arcLength = ((slice.end - slice.start) / 360) * 2 * Math.PI * radius;
  return text.length * fontSize * 0.56 <= arcLength - 6;
}
