/**
 * Aluna's three-level emotion taxonomy, following the Feelings Wheel.
 *
 * Level 1 — 7 primary families
 * Level 2 — 41 sub-categories (4-9 per family)
 * Level 3 — 82 specific emotions (2 per sub-category)
 *
 * The wheel renders directly from this structure, so the ordering here is the
 * ordering on screen: families run clockwise from the top, arranged so the
 * lighter feelings sit beside each other rather than alternating.
 *
 * A few labels repeat across branches — "Overwhelmed" belongs to both Bad and
 * Fearful, "Embarrassed" to both Sad and Disgusted. That is deliberate and
 * comes from the source wheel; ids carry the whole lineage, so they stay
 * distinct even where the words do not.
 */

export type PrimaryEmotionId =
  | "happy"
  | "surprised"
  | "bad"
  | "fearful"
  | "angry"
  | "disgusted"
  | "sad";

export interface SubEmotion {
  id: string;
  label: string;
  emotions: { id: string; label: string }[];
}

export interface PrimaryEmotion {
  id: PrimaryEmotionId;
  label: string;
  /** Base hue used for the wheel ring, pills, charts and entry cards. */
  color: string;
  /** Lighter tint for the level-2 ring. */
  tint: string;
  /** Lightest wash for the level-3 ring. */
  wash: string;
  /** Readable text colour on top of `tint` / `wash`. */
  ink: string;
  subCategories: SubEmotion[];
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Expands a plain string list into `{ id, label }` records. */
const toEmotions = (parent: string, labels: string[]) =>
  labels.map((label) => ({ id: `${parent}.${slug(label)}`, label }));

const sub = (
  primary: PrimaryEmotionId,
  label: string,
  labels: string[],
): SubEmotion => {
  const id = `${primary}.${slug(label)}`;
  return { id, label, emotions: toEmotions(id, labels) };
};

export const EMOTIONS: PrimaryEmotion[] = [
  {
    id: "happy",
    label: "Happy",
    color: "#EF8A43",
    tint: "#F7B57E",
    wash: "#FBDCC2",
    ink: "#7C3F10",
    subCategories: [
      sub("happy", "Playful", ["Aroused", "Cheeky"]),
      sub("happy", "Content", ["Free", "Joyful"]),
      sub("happy", "Interested", ["Curious", "Inquisitive"]),
      sub("happy", "Proud", ["Successful", "Confident"]),
      sub("happy", "Accepted", ["Respected", "Valued"]),
      sub("happy", "Powerful", ["Courageous", "Creative"]),
      sub("happy", "Peaceful", ["Loving", "Thankful"]),
      sub("happy", "Trusting", ["Sensitive", "Intimate"]),
      sub("happy", "Optimistic", ["Hopeful", "Inspired"]),
    ],
  },
  {
    id: "surprised",
    label: "Surprised",
    color: "#E5B93C",
    tint: "#F0D584",
    wash: "#F8EBC4",
    ink: "#6E5309",
    subCategories: [
      sub("surprised", "Excited", ["Eager", "Energetic"]),
      sub("surprised", "Amazed", ["Astonished", "Awe"]),
      sub("surprised", "Confused", ["Perplexed", "Disillusioned"]),
      sub("surprised", "Startled", ["Dismayed", "Shocked"]),
    ],
  },
  {
    id: "bad",
    label: "Bad",
    color: "#7F8A93",
    tint: "#AEB6BC",
    wash: "#D8DDE0",
    ink: "#3A464E",
    subCategories: [
      sub("bad", "Bored", ["Indifferent", "Apathetic"]),
      sub("bad", "Busy", ["Pressured", "Rushed"]),
      sub("bad", "Stressed", ["Overwhelmed", "Out of control"]),
      sub("bad", "Tired", ["Sleepy", "Unfocussed"]),
    ],
  },
  {
    id: "fearful",
    label: "Fearful",
    color: "#22867C",
    tint: "#79BAB2",
    wash: "#C0DED9",
    ink: "#0E4A44",
    subCategories: [
      sub("fearful", "Scared", ["Helpless", "Frightened"]),
      sub("fearful", "Anxious", ["Overwhelmed", "Worried"]),
      sub("fearful", "Insecure", ["Inadequate", "Inferior"]),
      sub("fearful", "Weak", ["Worthless", "Insignificant"]),
      sub("fearful", "Rejected", ["Excluded", "Persecuted"]),
      sub("fearful", "Threatened", ["Nervous", "Exposed"]),
    ],
  },
  {
    id: "angry",
    label: "Angry",
    color: "#2E7B9E",
    tint: "#7EB2CB",
    wash: "#C3DBE7",
    ink: "#14435A",
    subCategories: [
      sub("angry", "Let down", ["Betrayed", "Resentful"]),
      sub("angry", "Humiliated", ["Disrespected", "Ridiculed"]),
      sub("angry", "Bitter", ["Indignant", "Violated"]),
      sub("angry", "Mad", ["Furious", "Jealous"]),
      sub("angry", "Aggressive", ["Provoked", "Hostile"]),
      sub("angry", "Frustrated", ["Infuriated", "Annoyed"]),
      sub("angry", "Distant", ["Withdrawn", "Numb"]),
      sub("angry", "Critical", ["Sceptical", "Dismissive"]),
    ],
  },
  {
    id: "disgusted",
    label: "Disgusted",
    color: "#9377C4",
    tint: "#BCA9DC",
    wash: "#DDD3EE",
    ink: "#48307A",
    subCategories: [
      sub("disgusted", "Disapproving", ["Judgmental", "Embarrassed"]),
      sub("disgusted", "Disappointed", ["Appalled", "Revolted"]),
      sub("disgusted", "Awful", ["Nauseated", "Detestable"]),
      sub("disgusted", "Repelled", ["Horrified", "Hesitant"]),
    ],
  },
  {
    id: "sad",
    label: "Sad",
    color: "#E890B0",
    tint: "#F2B8CE",
    wash: "#F9DCE7",
    ink: "#8A2F52",
    subCategories: [
      sub("sad", "Hurt", ["Embarrassed", "Disappointed"]),
      sub("sad", "Depressed", ["Inferior", "Empty"]),
      sub("sad", "Guilty", ["Remorseful", "Ashamed"]),
      sub("sad", "Despair", ["Powerless", "Grief"]),
      sub("sad", "Vulnerable", ["Fragile", "Victimised"]),
      sub("sad", "Lonely", ["Isolated", "Abandoned"]),
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export const PRIMARY_BY_ID = new Map(EMOTIONS.map((p) => [p.id, p]));

export const SUB_BY_ID = new Map(
  EMOTIONS.flatMap((p) => p.subCategories.map((s) => [s.id, s] as const)),
);

export const EMOTION_LABEL_BY_ID = new Map(
  EMOTIONS.flatMap((p) =>
    p.subCategories.flatMap((s) => s.emotions.map((e) => [e.id, e.label] as const)),
  ),
);

export const TOTAL_EMOTIONS = EMOTIONS.reduce(
  (total, primary) =>
    total +
    primary.subCategories.reduce((sum, s) => sum + s.emotions.length, 0),
  0,
);

export const TOTAL_SUB_CATEGORIES = EMOTIONS.reduce(
  (total, primary) => total + primary.subCategories.length,
  0,
);

/** `"happy.peaceful.loving"` -> the owning primary family. */
export function primaryOf(emotionId: string): PrimaryEmotion | undefined {
  return PRIMARY_BY_ID.get(emotionId.split(".")[0] as PrimaryEmotionId);
}

export function subOf(emotionId: string): SubEmotion | undefined {
  const [primary, subId] = emotionId.split(".");
  return SUB_BY_ID.get(`${primary}.${subId}`);
}

export function labelOf(emotionId: string): string {
  const known = EMOTION_LABEL_BY_ID.get(emotionId);
  if (known) return known;

  // The wheel has been reshaped before and may be again. Rather than printing
  // "sad.vulnerable.exposed" at someone, recover the word from the last
  // segment — it is still the thing they chose.
  const leaf = emotionId.split(".").pop() ?? emotionId;
  return leaf.charAt(0).toUpperCase() + leaf.slice(1).replace(/-/g, " ");
}

export function colorOf(primaryId: string): string {
  return PRIMARY_BY_ID.get(primaryId as PrimaryEmotionId)?.color ?? "#94A3B8";
}

/** Distinct primary families represented in a list of level-3 emotion ids. */
export function primaryIdsFrom(emotionIds: string[]): PrimaryEmotionId[] {
  const seen = new Set<PrimaryEmotionId>();
  for (const id of emotionIds) {
    const primary = id.split(".")[0] as PrimaryEmotionId;
    if (PRIMARY_BY_ID.has(primary)) seen.add(primary);
  }
  return [...seen];
}

/** Distinct sub-categories represented in a list of level-3 emotion ids. */
export function subIdsFrom(emotionIds: string[]): string[] {
  const seen = new Set<string>();
  for (const id of emotionIds) {
    const [primary, subId] = id.split(".");
    const key = `${primary}.${subId}`;
    if (SUB_BY_ID.has(key)) seen.add(key);
  }
  return [...seen];
}
