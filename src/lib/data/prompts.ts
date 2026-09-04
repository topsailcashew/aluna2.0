/**
 * The weekly reflection prompt shown on the Community tab.
 *
 * Chosen from the ISO week number rather than stored anywhere, so every reader
 * sees the same prompt on the same day with no backend and no scheduled job.
 */

export const WEEKLY_PROMPTS = [
  "What has been kinder to you this week than you expected?",
  "Name one thing your body has been trying to tell you.",
  "What did you let go of, even a little?",
  "Where did you find a moment of quiet?",
  "What would you say to someone else feeling what you feel?",
  "What is one small thing that is going well?",
  "What have you been carrying that is not yours?",
  "When did you last feel genuinely at ease?",
  "What is worth noticing about today, however ordinary?",
  "What have you been avoiding, and what would help?",
  "Which feeling surprised you this week?",
  "What are you slowly getting better at?",
  "What does rest actually look like for you?",
];

export function isoWeek(date = new Date()): number {
  const copy = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // Thursday determines the ISO year, so shift onto it before counting.
  copy.setUTCDate(copy.getUTCDate() + 4 - (copy.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil(((copy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function weeklyPrompt(date = new Date()): string {
  return WEEKLY_PROMPTS[isoWeek(date) % WEEKLY_PROMPTS.length];
}

/** `2026-09-04` in the viewer's own timezone — the key for a day's pulse. */
export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
