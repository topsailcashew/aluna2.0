"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import {
  EMOTIONS,
  type PrimaryEmotion,
  type SubEmotion,
} from "@/lib/data/emotions";
import {
  CENTER,
  equalSlices,
  fitsOnArc,
  labelArcPath,
  ringSlicePath,
  type Slice,
} from "@/lib/wheel-geometry";
import { cn } from "@/lib/utils";

/* Ring radii, inner edge to outer edge. */
const RING = {
  primary: { inner: 62, outer: 108 },
  sub: { inner: 112, outer: 152 },
  specific: { inner: 156, outer: 197 },
} as const;

const midRadius = (ring: { inner: number; outer: number }) =>
  (ring.inner + ring.outer) / 2;

/** Spring pop for a ring as it drills in — scales up from the wheel's centre. */
const ringMotion = {
  initial: { opacity: 0, scale: 0.84 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  style: {
    transformBox: "view-box" as const,
    transformOrigin: `${CENTER}px ${CENTER}px`,
  },
};

interface EmotionWheelProps {
  /** Selected level-3 emotion ids. */
  value: string[];
  onChange: (next: string[]) => void;
}

/**
 * Three concentric rings: primary categories at the core, the chosen
 * category's sub-categories next, then its nine specific emotions on the rim.
 * Rings appear as you drill in, so the wheel never shows every label at once.
 */
export function EmotionWheel({ value, onChange }: EmotionWheelProps) {
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [subId, setSubId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const primary = useMemo(
    () => EMOTIONS.find((p) => p.id === primaryId) ?? null,
    [primaryId],
  );
  const sub = useMemo(
    () => primary?.subCategories.find((s) => s.id === subId) ?? null,
    [primary, subId],
  );

  const selected = useMemo(() => new Set(value), [value]);

  const toggleEmotion = useCallback(
    (id: string) => {
      onChange(
        selected.has(id) ? value.filter((v) => v !== id) : [...value, id],
      );
    },
    [onChange, selected, value],
  );

  const primarySlices = useMemo(() => equalSlices(EMOTIONS.length, 1.6), []);
  const subSlices = useMemo(
    () =>
      primary ? equalSlices(primary.subCategories.length, 2) : ([] as Slice[]),
    [primary],
  );
  const specificSlices = useMemo(
    () => (sub ? equalSlices(sub.emotions.length, 1.4) : ([] as Slice[])),
    [sub],
  );

  const stepBack = () => {
    if (sub) setSubId(null);
    else if (primary) setPrimaryId(null);
  };

  const level = sub ? 3 : primary ? 2 : 1;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 400 400"
        className="mx-auto block w-full max-w-[26rem] touch-manipulation select-none"
        role="group"
        aria-label="Emotion wheel"
      >
        <defs>
          <filter id="wheel-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="7"
              floodColor="#0f2c33"
              floodOpacity="0.14"
            />
          </filter>
        </defs>

        {/* Placeholder rings keep the wheel's silhouette stable while empty. */}
        {!primary && (
          <>
            <GhostRing ring={RING.sub} />
            <GhostRing ring={RING.specific} />
          </>
        )}
        {primary && !sub && <GhostRing ring={RING.specific} />}

        {/* Ring 3 — specific emotions */}
        {sub && primary && (
          <motion.g key={sub.id} {...ringMotion}>
              {sub.emotions.map((emotion, index) => {
                const slice = specificSlices[index];
                const isSelected = selected.has(emotion.id);
                return (
                  <WheelSlice
                    key={emotion.id}
                    slice={slice}
                    ring={RING.specific}
                    label={emotion.label}
                    fill={isSelected ? primary.color : primary.wash}
                    labelColor={isSelected ? "#ffffff" : primary.ink}
                    fontSize={10}
                    fontWeight={isSelected ? 700 : 600}
                    selected={isSelected}
                    hovered={hovered === emotion.id}
                    onHover={() => setHovered(emotion.id)}
                    onLeave={() => setHovered(null)}
                    onSelect={() => toggleEmotion(emotion.id)}
                    ariaLabel={`${emotion.label}. ${isSelected ? "Chosen" : "Not chosen"}`}
                    tick={isSelected}
                  />
                );
            })}
          </motion.g>
        )}

        {/* Ring 2 — sub-categories */}
        {primary && (
          <motion.g key={primary.id} {...ringMotion}>
              {primary.subCategories.map((item, index) => {
                const slice = subSlices[index];
                const isActive = item.id === subId;
                const count = countSelectedIn(item, selected);
                return (
                  <WheelSlice
                    key={item.id}
                    slice={slice}
                    ring={RING.sub}
                    label={count ? `${item.label} · ${count}` : item.label}
                    fill={isActive ? primary.color : primary.tint}
                    labelColor={isActive ? "#ffffff" : primary.ink}
                    fontSize={11}
                    fontWeight={700}
                    open={isActive}
                    hovered={hovered === item.id}
                    onHover={() => setHovered(item.id)}
                    onLeave={() => setHovered(null)}
                    onSelect={() => setSubId(isActive ? null : item.id)}
                    ariaLabel={`${item.label}, opens ${item.emotions.length} feelings${count ? `, ${count} chosen` : ""}`}
                  />
                );
            })}
          </motion.g>
        )}

        {/* Ring 1 — primary categories */}
        <g>
          {EMOTIONS.map((item, index) => {
            const slice = primarySlices[index];
            const isActive = item.id === primaryId;
            const dimmed = primaryId !== null && !isActive;
            const count = countSelectedInPrimary(item, selected);
            return (
              <WheelSlice
                key={item.id}
                slice={slice}
                ring={RING.primary}
                label={item.label}
                fill={item.color}
                labelColor="#ffffff"
                fontSize={11}
                fontWeight={700}
                open={isActive}
                dimmed={dimmed}
                badge={count}
                hovered={hovered === item.id}
                onHover={() => setHovered(item.id)}
                onLeave={() => setHovered(null)}
                onSelect={() => {
                  setPrimaryId(isActive ? null : item.id);
                  setSubId(null);
                }}
                ariaLabel={`${item.label} family, opens its shades${count ? `, ${count} chosen` : ""}`}
              />
            );
          })}
        </g>

        {/* Centre — breadcrumb and step-back target */}
        <g
          onClick={level > 1 ? stepBack : undefined}
          onKeyDown={(event) => {
            if (level > 1 && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              stepBack();
            }
          }}
          role={level > 1 ? "button" : undefined}
          tabIndex={level > 1 ? 0 : undefined}
          aria-label={
            level > 1
              ? `Back to ${sub ? primary?.label : "all categories"}`
              : undefined
          }
          className={cn(level > 1 && "cursor-pointer")}
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={57}
            className="fill-surface"
            filter="url(#wheel-shadow)"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={57}
            fill="none"
            stroke={primary?.color ?? "currentColor"}
            strokeOpacity={primary ? 0.5 : 0.12}
            strokeWidth={2}
            className={primary ? undefined : "text-ink-subtle"}
          />
          <CentreLabel
            level={level}
            primary={primary}
            sub={sub}
            hovered={hovered}
            selectedCount={value.length}
          />
        </g>
      </svg>

      <p className="mt-3 text-center text-xs text-ink-muted" aria-live="polite">
        {level === 1 && "Tap a feeling family to open it"}
        {level === 2 && "Open the shade that fits closest — still narrowing"}
        {level === 3 &&
          "Tap every one that rings true, then go back for another family"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function countSelectedIn(sub: SubEmotion, selected: Set<string>) {
  return sub.emotions.filter((e) => selected.has(e.id)).length;
}

function countSelectedInPrimary(
  primary: PrimaryEmotion,
  selected: Set<string>,
) {
  return primary.subCategories.reduce(
    (total, s) => total + countSelectedIn(s, selected),
    0,
  );
}

interface WheelSliceProps {
  slice: Slice;
  ring: { inner: number; outer: number };
  label: string;
  fill: string;
  labelColor: string;
  fontSize: number;
  fontWeight: number;
  /**
   * A real choice. Only the level-3 rim can be selected, and only this state
   * gets the white outline and the tick.
   */
  selected?: boolean;
  /**
   * Disclosure state for the level-1 and level-2 rings, which navigate rather
   * than choose. Deliberately quieter than `selected`: an opened wedge lifts
   * and its siblings dim, but it never wears the outline of a chosen one.
   */
  open?: boolean;
  dimmed?: boolean;
  hovered?: boolean;
  badge?: number;
  /** Draws a tick beside the label — used for chosen level-3 emotions. */
  tick?: boolean;
  ariaLabel: string;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function WheelSlice({
  slice,
  ring,
  label,
  fill,
  labelColor,
  fontSize,
  fontWeight,
  selected,
  open,
  dimmed,
  hovered,
  badge,
  tick,
  ariaLabel,
  onSelect,
  onHover,
  onLeave,
}: WheelSliceProps) {
  const pathId = useMemo(
    () => `arc-${Math.round(ring.inner)}-${Math.round(slice.start * 10)}`,
    [ring.inner, slice.start],
  );
  const radius = midRadius(ring);
  const showLabel = fitsOnArc(label, radius, slice, fontSize);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      // A wedge that opens the next ring is a disclosure control, not a toggle,
      // so it reports expanded rather than pressed.
      aria-expanded={open}
      aria-pressed={open === undefined ? selected : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="cursor-pointer outline-none"
    >
      <path
        d={ringSlicePath(ring.inner, ring.outer, slice)}
        fill={fill}
        stroke={selected ? "#ffffff" : "transparent"}
        strokeWidth={selected ? 2 : 0}
        className="transition-[opacity,transform,fill] duration-200 ease-out"
        style={{
          opacity: dimmed ? 0.45 : 1,
          // Scaling about the wheel's centre needs the view-box as the
          // reference frame, not the path's own bounding box.
          transformBox: "view-box",
          transformOrigin: `${CENTER}px ${CENTER}px`,
          transform: hovered || selected || open ? "scale(1.025)" : undefined,
        }}
      />

      <path id={pathId} d={labelArcPath(radius, slice)} fill="none" />
      {showLabel && (
        <text
          fill={labelColor}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing="0.01em"
          pointerEvents="none"
          opacity={dimmed ? 0.6 : 1}
        >
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
      )}

      {badge ? (
        <BadgeDot slice={slice} radius={ring.outer - 9} count={badge} />
      ) : null}

      {tick && <TickMark slice={slice} radius={midRadius(ring)} />}
    </g>
  );
}

/** A small tick at the outer edge of a chosen wedge. */
function TickMark({ slice, radius }: { slice: Slice; radius: number }) {
  const mid = (slice.start + slice.end) / 2;
  const radians = ((mid - 90) * Math.PI) / 180;
  const x = CENTER + (radius + 13) * Math.cos(radians);
  const y = CENTER + (radius + 13) * Math.sin(radians);

  return (
    <path
      d={`M ${x - 3.2} ${y} l 2.4 2.6 l 4.4 -5.2`}
      fill="none"
      stroke="#ffffff"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      pointerEvents="none"
    />
  );
}

function BadgeDot({
  slice,
  radius,
  count,
}: {
  slice: Slice;
  radius: number;
  count: number;
}) {
  const mid = (slice.start + slice.end) / 2;
  const radians = ((mid - 90) * Math.PI) / 180;
  const x = CENTER + radius * Math.cos(radians);
  const y = CENTER + radius * Math.sin(radians);

  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={7} fill="#ffffff" />
      <text
        x={x}
        y={y}
        fontSize={9}
        fontWeight={800}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#12262c"
      >
        {count}
      </text>
    </g>
  );
}

function GhostRing({ ring }: { ring: { inner: number; outer: number } }) {
  return (
    <circle
      cx={CENTER}
      cy={CENTER}
      r={midRadius(ring)}
      fill="none"
      strokeWidth={ring.outer - ring.inner}
      className="stroke-surface-sunken"
      opacity={0.6}
    />
  );
}

function CentreLabel({
  level,
  primary,
  sub,
  hovered,
  selectedCount,
}: {
  level: number;
  primary: PrimaryEmotion | null;
  sub: SubEmotion | null;
  hovered: string | null;
  selectedCount: number;
}) {
  const heading = sub?.label ?? primary?.label ?? "How do you";
  const sizeFor = (text: string) =>
    text.length > 11 ? 11 : text.length > 8 ? 13 : 15;

  return (
    <g pointerEvents="none" className="fill-ink">
      {level > 1 && (
        <g transform={`translate(${CENTER - 5}, ${CENTER - 34})`}>
          <ChevronLeft
            width={10}
            height={10}
            className="stroke-ink-subtle"
            strokeWidth={3}
          />
        </g>
      )}

      {level === 1 ? (
        <>
          <text
            x={CENTER}
            y={CENTER - 8}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            className="fill-ink"
          >
            How do you
          </text>
          <text
            x={CENTER}
            y={CENTER + 8}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            className="fill-ink"
          >
            feel?
          </text>
        </>
      ) : (
        <>
          <text
            x={CENTER}
            y={CENTER - 6}
            textAnchor="middle"
            fontSize={sizeFor(heading)}
            fontWeight={800}
            fill={primary?.color}
          >
            {heading}
          </text>
          <text
            x={CENTER}
            y={CENTER + 12}
            textAnchor="middle"
            fontSize={9}
            fontWeight={600}
            className="fill-ink-subtle"
          >
            {sub ? "Tap to choose" : "Pick a shade"}
          </text>
        </>
      )}

      {selectedCount > 0 && (
        <text
          x={CENTER}
          y={CENTER + 32}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          className="fill-ink-subtle"
        >
          {selectedCount} chosen
        </text>
      )}
      {hovered ? null : null}
    </g>
  );
}
