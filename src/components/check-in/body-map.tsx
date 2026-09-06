"use client";

import type { ReactNode } from "react";

import type { BodyRegion } from "@/lib/data/body-parts";

interface BodyMapProps {
  /** Region currently being browsed in the picker. */
  activeRegion: BodyRegion;
  onRegionChange: (region: BodyRegion) => void;
  /** Regions that already hold a logged sensation, for the warm highlight. */
  loggedRegions: Set<BodyRegion>;
}

const SHIFT = "transition-[fill,stroke] duration-200 ease-out";

const LABELS: Record<Exclude<BodyRegion, "whole">, string> = {
  head: "Head and neck",
  torso: "Torso",
  arms: "Arms and hands",
  legs: "Legs and feet",
};

/**
 * An artist's mannequin: the figure a life-drawing class blocks in before any
 * detail goes on. Ribcage and pelvis are separate masses joined by a waist,
 * the shoulders and knees carry visible ball joints, and the limbs taper from
 * thigh to ankle the way real ones do.
 *
 * Painted back to front — legs, arms, then torso and head — so every limb
 * tucks under the mass above it instead of butting against it.
 */
export function BodyMap({
  activeRegion,
  onRegionChange,
  loggedRegions,
}: BodyMapProps) {
  const paint = (region: BodyRegion) => {
    if (activeRegion === region || activeRegion === "whole") {
      return "var(--color-deep-500)";
    }
    if (loggedRegions.has(region) || loggedRegions.has("whole")) {
      return "var(--color-happy)";
    }
    return "var(--border-strong)";
  };

  const zone = (region: Exclude<BodyRegion, "whole">) => ({
    region,
    active: activeRegion === region,
    logged: loggedRegions.has(region),
    onSelect: onRegionChange,
  });

  return (
    <svg
      viewBox="0 0 160 380"
      className="mx-auto block h-auto w-full"
      role="group"
      aria-label="Body regions"
    >
      <Zone {...zone("legs")}>
        {/* Thigh swells at the top, narrows to the knee ball, calf swells
            again, then the ankle pinches into the foot. */}
        <path
          d="M62.5 196
             C 58 210 56 226 56.5 242
             C 57 254 58.5 264 59 272
             L 74 272
             C 74.5 262 75.5 250 76 238
             C 76.5 222 77 208 77.5 196 Z"
          fill={paint("legs")}
          className={SHIFT}
        />
        <path
          d="M97.5 196
             C 102 210 104 226 103.5 242
             C 103 254 101.5 264 101 272
             L 86 272
             C 85.5 262 84.5 250 84 238
             C 83.5 222 83 208 82.5 196 Z"
          fill={paint("legs")}
          className={SHIFT}
        />
        {/* Knees */}
        <circle cx="66.5" cy="276" r="10" fill={paint("legs")} className={SHIFT} />
        <circle cx="93.5" cy="276" r="10" fill={paint("legs")} className={SHIFT} />
        {/* Calf into ankle */}
        <path
          d="M58.5 278
             C 56.5 292 55.5 306 56.5 318
             C 57.2 328 59 338 60.5 346
             L 70 346
             C 70.5 336 71 324 71.5 312
             C 72 298 73 288 74.5 278 Z"
          fill={paint("legs")}
          className={SHIFT}
        />
        <path
          d="M101.5 278
             C 103.5 292 104.5 306 103.5 318
             C 102.8 328 101 338 99.5 346
             L 90 346
             C 89.5 336 89 324 88.5 312
             C 88 298 87 288 85.5 278 Z"
          fill={paint("legs")}
          className={SHIFT}
        />
        {/* Feet, wedged forward from the ankle */}
        <path
          d="M59 344 h12 l2 14 c 0 4 -3 6 -8 6 h-14 c -4 0 -5 -3 -2 -6 z"
          fill={paint("legs")}
          className={SHIFT}
        />
        <path
          d="M101 344 h-12 l-2 14 c 0 4 3 6 8 6 h14 c 4 0 5 -3 2 -6 z"
          fill={paint("legs")}
          className={SHIFT}
        />
      </Zone>

      <Zone {...zone("arms")}>
        {/* Upper arm tapering to the elbow */}
        <path
          d="M48 98 C 44 114 41 130 39.5 147 L 50 149 C 51.5 133 54 117 57 103 Z"
          fill={paint("arms")}
          className={SHIFT}
        />
        <path
          d="M112 98 C 116 114 119 130 120.5 147 L 110 149 C 108.5 133 106 117 103 103 Z"
          fill={paint("arms")}
          className={SHIFT}
        />
        <circle cx="44.5" cy="151" r="7" fill={paint("arms")} className={SHIFT} />
        <circle cx="115.5" cy="151" r="7" fill={paint("arms")} className={SHIFT} />
        {/* Forearm narrowing to the wrist */}
        <path
          d="M38.5 154 C 37 171 36 188 35.5 202 L 44 203 C 45 188 46.5 171 49 155 Z"
          fill={paint("arms")}
          className={SHIFT}
        />
        <path
          d="M121.5 154 C 123 171 124 188 124.5 202 L 116 203 C 115 188 113.5 171 111 155 Z"
          fill={paint("arms")}
          className={SHIFT}
        />
        {/* Hands */}
        <path
          d="M35.5 202 h8.5 c 1.5 8 1 16 -1 21 c -1.5 4 -5.5 4 -7 0 c -2 -6 -2 -13 -0.5 -21 z"
          fill={paint("arms")}
          className={SHIFT}
        />
        <path
          d="M124.5 202 h-8.5 c -1.5 8 -1 16 1 21 c 1.5 4 5.5 4 7 0 c 2 -6 2 -13 0.5 -21 z"
          fill={paint("arms")}
          className={SHIFT}
        />
      </Zone>

      {/* Neck, layered under the torso so a lit head does not spill over the
          collarbone. */}
      <path
        d="M71 62 h18 v22 h-18 z"
        fill={paint("head")}
        pointerEvents="none"
        className={SHIFT}
      />

      <Zone {...zone("torso")}>
        {/* Ribcage: broad at the shoulders, tucking in under the ribs. */}
        <path
          d="M80 80
             C 68 80 58 84 53 91
             C 49.5 96 48.5 104 49.5 114
             C 50.5 126 53 138 56.5 149
             C 59 157 62 163 64 168
             L 96 168
             C 98 163 101 157 103.5 149
             C 107 138 109.5 126 110.5 114
             C 111.5 104 110.5 96 107 91
             C 102 84 92 80 80 80 Z"
          fill={paint("torso")}
          className={SHIFT}
        />
        {/* Shoulder balls sit proud of the ribcage. */}
        <circle cx="53" cy="95" r="11.5" fill={paint("torso")} className={SHIFT} />
        <circle cx="107" cy="95" r="11.5" fill={paint("torso")} className={SHIFT} />
        {/* Waist */}
        <path
          d="M64 166 h32 c -1 8 -1.5 16 -1 22 h-30 c 0.5 -6 0 -14 -1 -22 z"
          fill={paint("torso")}
          className={SHIFT}
        />
        {/* Pelvis: the wider mass the legs hang from. */}
        <path
          d="M64.5 186
             C 60 190 57.5 196 57.5 203
             C 57.5 212 62 220 69 224
             C 73 226 77 227 80 227
             C 83 227 87 226 91 224
             C 98 220 102.5 212 102.5 203
             C 102.5 196 100 190 95.5 186 Z"
          fill={paint("torso")}
          className={SHIFT}
        />
      </Zone>

      <Zone {...zone("head")}>
        {/* The classic egg: cranium wide, jaw narrowing to the chin. */}
        <path
          d="M80 14
             C 92 14 101 25 101 40
             C 101 50 97 60 91 66
             C 87.5 69.5 84 71 80 71
             C 76 71 72.5 69.5 69 66
             C 63 60 59 50 59 40
             C 59 25 68 14 80 14 Z"
          fill={paint("head")}
          className={SHIFT}
        />
      </Zone>
    </svg>
  );
}

function Zone({
  region,
  active,
  logged,
  onSelect,
  children,
}: {
  region: Exclude<BodyRegion, "whole">;
  active: boolean;
  logged: boolean;
  onSelect: (region: BodyRegion) => void;
  children: ReactNode;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${LABELS[region]}${logged ? ", has logged sensations" : ""}`}
      aria-pressed={active}
      onClick={() => onSelect(region)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(region);
        }
      }}
      className="cursor-pointer transition-opacity hover:opacity-80"
    >
      {children}
    </g>
  );
}
