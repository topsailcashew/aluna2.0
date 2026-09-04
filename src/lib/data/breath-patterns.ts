/**
 * Breathing practices offered on the Breathe tab.
 *
 * A pattern is just a loop of phases. Rendering, timing, audio cues and the
 * spoken labels all derive from this array, so adding a practice means adding
 * an entry and nothing else.
 */

export type BreathPhaseKind = "inhale" | "hold" | "exhale";

export interface BreathPhase {
  kind: BreathPhaseKind;
  /** Shown in the middle of the orb while this phase runs. */
  label: string;
  seconds: number;
}

export interface BreathPattern {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Hex accent used for the orb and the card. */
  accent: string;
  phases: BreathPhase[];
}

const inhale = (seconds: number): BreathPhase => ({
  kind: "inhale",
  label: "Breathe in",
  seconds,
});
const hold = (seconds: number): BreathPhase => ({
  kind: "hold",
  label: "Hold",
  seconds,
});
const exhale = (seconds: number): BreathPhase => ({
  kind: "exhale",
  label: "Breathe out",
  seconds,
});

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: "box",
    name: "Box breathing",
    tagline: "Steady and square",
    description:
      "Four equal sides. Used by people who need to stay level under pressure — it asks nothing of you but evenness.",
    accent: "#22867c",
    phases: [inhale(4), hold(4), exhale(4), hold(4)],
  },
  {
    id: "relaxing",
    name: "4 · 7 · 8",
    tagline: "For a racing mind",
    description:
      "A long hold and a longer exhale. The out-breath is where the nervous system settles, so this one leans on it hard.",
    accent: "#9377c4",
    phases: [inhale(4), hold(7), exhale(8)],
  },
  {
    id: "coherent",
    name: "Coherent breathing",
    tagline: "Five in, five out",
    description:
      "No holds, no effort — just a slow even rhythm at roughly six breaths a minute. The easiest one to keep going.",
    accent: "#2e7b9e",
    phases: [inhale(5), exhale(5)],
  },
  {
    id: "extended",
    name: "Extended exhale",
    tagline: "Downshift",
    description:
      "Out for half again as long as in. Short, unfussy, and useful in the ninety seconds before something difficult.",
    accent: "#ef8a43",
    phases: [inhale(4), exhale(6)],
  },
];

export const BREATH_PATTERN_BY_ID = new Map(
  BREATH_PATTERNS.map((pattern) => [pattern.id, pattern]),
);

export function cycleSeconds(pattern: BreathPattern): number {
  return pattern.phases.reduce((total, phase) => total + phase.seconds, 0);
}

export function cadenceLabel(pattern: BreathPattern): string {
  return pattern.phases.map((phase) => phase.seconds).join(" · ");
}

/** Session lengths offered before starting. */
export const SESSION_MINUTES = [1, 3, 5, 10] as const;
export type SessionMinutes = (typeof SESSION_MINUTES)[number];
