/**
 * Optional one-tap context recorded alongside a check-in.
 *
 * These exist so Insights can say something like "your calmer days are the
 * ones after decent sleep". That only works if logging them is nearly free,
 * so each is a single tap and every one is skippable.
 */

export type TagScale = "low" | "mid" | "high";

export interface ScaleTag {
  id: "sleep" | "energy" | "stress";
  label: string;
  question: string;
  /** Wording for each step, low to high. */
  steps: Record<TagScale, string>;
  /** True when a high value is the pleasant end — flips the colour ramp. */
  highIsGood: boolean;
  /**
   * Sentence fragments for Insights, which reads
   * "…tend to read lighter {high} than {low}". Written out per tag because
   * each takes a different preposition, and slotting the step labels into one
   * generic template produced things like "after well sleep".
   */
  insight: { high: string; low: string };
}

export const SCALE_TAGS: ScaleTag[] = [
  {
    id: "sleep",
    label: "Sleep",
    question: "How did you sleep?",
    steps: { low: "Badly", mid: "Patchy", high: "Well" },
    highIsGood: true,
    insight: { high: "after sleeping well", low: "after sleeping badly" },
  },
  {
    id: "energy",
    label: "Energy",
    question: "How much is in the tank?",
    steps: { low: "Empty", mid: "Enough", high: "Full" },
    highIsGood: true,
    insight: {
      high: "on days with energy to spare",
      low: "on days running on empty",
    },
  },
  {
    id: "stress",
    label: "Stress",
    question: "How much pressure are you under?",
    steps: { low: "Little", mid: "Some", high: "A lot" },
    highIsGood: false,
    insight: { high: "under a lot of pressure", low: "under very little" },
  },
];

export const SCALE_TAG_BY_ID = new Map(SCALE_TAGS.map((tag) => [tag.id, tag]));

export const SCALE_ORDER: TagScale[] = ["low", "mid", "high"];

/** Multi-select chips for what the day actually contained. */
export interface ActivityTag {
  id: string;
  label: string;
}

export const ACTIVITY_TAGS: ActivityTag[] = [
  { id: "work", label: "Work" },
  { id: "exercise", label: "Exercise" },
  { id: "social", label: "Time with people" },
  { id: "alone", label: "Time alone" },
  { id: "outdoors", label: "Outdoors" },
  { id: "creative", label: "Something creative" },
  { id: "rest", label: "Real rest" },
  { id: "travel", label: "Travel" },
  { id: "screens", label: "Too many screens" },
  { id: "unwell", label: "Feeling unwell" },
];

export const ACTIVITY_TAG_BY_ID = new Map(
  ACTIVITY_TAGS.map((tag) => [tag.id, tag]),
);

export function activityLabel(id: string): string {
  return ACTIVITY_TAG_BY_ID.get(id)?.label ?? id;
}

/**
 * Guided prompts for the journal. Deliberately about the situation rather
 * than about the person — "what did you need" rather than "what did you do
 * wrong".
 */
export const JOURNAL_PROMPTS = [
  {
    id: "trigger",
    question: "What set this off?",
    hint: "A moment, a person, a thought — or nothing you can name.",
  },
  {
    id: "needed",
    question: "What did you need right then?",
    hint: "Whether or not you got it.",
  },
  {
    id: "helped",
    question: "What helped, or might help next time?",
    hint: "Small counts.",
  },
] as const;

export type JournalPromptId = (typeof JOURNAL_PROMPTS)[number]["id"];
