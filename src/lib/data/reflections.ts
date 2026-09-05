/**
 * The line on the home screen.
 *
 * Written to sit beside a feeling rather than argue with it. Nothing here
 * tells someone their sadness is a lesson, or that gratitude would fix it —
 * an app that answers "I feel awful" with a motivational poster is worse than
 * one that says nothing. When a family is known the line acknowledges it and,
 * at most, offers something small and concrete to try.
 */

import type { PrimaryEmotionId } from "@/lib/data/emotions";

export interface Reflection {
  text: string;
  /** Optional one-tap follow-through. */
  action?: { label: string; href: string };
}

const BREATHE = { label: "Take a minute to breathe", href: "/breathe" };
const WHEEL = { label: "Name it more precisely", href: "/check-in?mode=quick" };
const HISTORY = { label: "See how the week has gone", href: "/history" };

const BY_FAMILY: Record<PrimaryEmotionId, Reflection[]> = {
  happy: [
    { text: "Worth noticing what was different about today — good days have causes too." },
    { text: "Nothing needs doing with this. It is allowed to just be a good day." },
    { text: "If you can name what helped, it becomes something you can reach for again.", action: WHEEL },
  ],
  surprised: [
    { text: "Surprise usually means something did not match what you expected. Both halves are worth a look." },
    { text: "Give it a moment to land before deciding what it meant." },
  ],
  bad: [
    { text: "Flat is a feeling too, and it rarely wants analysing. Food, water, a walk, in that order.", action: BREATHE },
    { text: "Not every day has a story. Some are just tired.", action: HISTORY },
    { text: "You do not have to fix this to have logged it honestly." },
  ],
  fearful: [
    { text: "Fear speaks in absolutes. It is often worth asking what it is actually predicting.", action: BREATHE },
    { text: "Slow the out-breath and the body tends to follow. Not a cure — a lever.", action: BREATHE },
    { text: "Naming the specific fear usually shrinks it more than reassurance does.", action: WHEEL },
  ],
  angry: [
    { text: "Anger usually points at a line that got crossed. Worth knowing which one." },
    { text: "It does not need justifying to be real. What would you say if it were someone else's?" },
    { text: "Move it through the body before deciding what to do with it.", action: BREATHE },
  ],
  disgusted: [
    { text: "Some of this is about the situation and some about you. They are worth separating." },
    { text: "Shame gets loud and specific. It is rarely accurate about the size of things." },
  ],
  sad: [
    { text: "Sadness is not a problem to be solved. It usually just needs somewhere to sit.", action: BREATHE },
    { text: "This does not need to be productive. You logged it, which is enough for today." },
    { text: "It has been other things before, and it will be again.", action: HISTORY },
  ],
};

/** Shown before the first check-in of the day, when no family is known. */
const GENERAL: Reflection[] = [
  { text: "You cannot work with a feeling you have not named. That is the whole idea here." },
  { text: "Two minutes of noticing beats an hour of wondering why you feel off." },
  { text: "There is no streak worth protecting. Missing yesterday costs you nothing." },
  { text: "Precision helps more than positivity. “Uneasy” and “dreading” ask for different things." },
  { text: "Bodies often notice before minds do. Start there if words are not coming." },
  { text: "Whatever today is, it is allowed to be that." },
  { text: "Feeling two contradictory things at once is normal, not confusion." },
  { text: "A quiet minute now is cheaper than a hard hour later.", action: BREATHE },
];

/**
 * Picks deterministically from the date, so the line is stable all day and
 * identical on the server and the client. Choosing at random each render would
 * churn on every state change and break hydration.
 */
function pick<T>(options: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return options[Math.abs(hash) % options.length];
}

export function reflectionFor(
  family: PrimaryEmotionId | null,
  day: string,
): Reflection {
  return family
    ? pick(BY_FAMILY[family], `${day}:${family}`)
    : pick(GENERAL, day);
}
