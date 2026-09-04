/**
 * Step 3 of the check-in. Deliberately phrased without judgement — these are
 * modes the mind moves through, not mistakes to correct.
 */

export interface ThoughtPattern {
  id: string;
  label: string;
  hint: string;
}

export const THOUGHT_PATTERNS: ThoughtPattern[] = [
  {
    id: "future-worry",
    label: "Worrying about the future",
    hint: "Rehearsing what might go wrong",
  },
  {
    id: "past-dwelling",
    label: "Dwelling on the past",
    hint: "Replaying something already done",
  },
  {
    id: "self-criticism",
    label: "Engaging in self-criticism",
    hint: "Speaking to yourself harshly",
  },
  {
    id: "black-and-white",
    label: "Black-and-white thinking",
    hint: "All good or all bad, nothing between",
  },
  {
    id: "gratitude",
    label: "Feeling grateful or appreciative",
    hint: "Noticing what is good right now",
  },
  {
    id: "planning",
    label: "Planning or problem-solving",
    hint: "Working a situation forward",
  },
  {
    id: "present-observing",
    label: "Simply observing the present",
    hint: "Watching without adding a story",
  },
  {
    id: "mind-wandering",
    label: "Mind wandering or daydreaming",
    hint: "Drifting somewhere else entirely",
  },
];

export const THOUGHT_PATTERN_BY_ID = new Map(
  THOUGHT_PATTERNS.map((p) => [p.id, p]),
);

export function thoughtPatternLabel(id: string): string {
  return THOUGHT_PATTERN_BY_ID.get(id)?.label ?? id;
}
