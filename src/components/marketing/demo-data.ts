import type { CheckInEntry } from "@/lib/types";

/**
 * A plausible fortnight, used only by the landing page.
 *
 * The previews on that page are the real dashboard components rendered with
 * this data, not screenshots of them. A screenshot goes stale the first time
 * someone changes a chart and nobody remembers to retake it; this cannot.
 *
 * Dates are relative to now so the week strip always looks current, and the
 * shape is deliberately uneven — a good stretch, a hard Tuesday, two gaps —
 * because a demo where every day is logged and pleasant would be a lie about
 * what using this actually looks like.
 */

const DAY = 86_400_000;
const HOUR = 3_600_000;

/**
 * Offsets back from now, never an absolute clock time. Setting an hour of the
 * day put the newest entry hours into the future whenever the page was opened
 * in the morning, and relativeTime renders a future date as "just now".
 */
const entry = (
  daysAgo: number,
  hoursAgo: number,
  emotions: string[],
  sensations: { bodyPart: string; intensity: number }[],
): CheckInEntry => {
  const createdAt = new Date(Date.now() - daysAgo * DAY - hoursAgo * HOUR);
  return {
    id: `demo-${daysAgo}-${hoursAgo}`,
    createdAt,
    undecryptable: false,
    sensations: sensations.map((s) => ({ ...s, note: "" })),
    emotions,
    thoughtPatterns: [],
    thoughtNote: "",
    tags: { activities: [] },
    journal: {},
  };
};

export const DEMO_ENTRIES: CheckInEntry[] = [
  entry(0, 2, ["happy.content.free", "bad.tired.sleepy"], [
    { bodyPart: "chest", intensity: 3 },
  ]),
  entry(1, 5, ["fearful.anxious.worried"], [
    { bodyPart: "stomach", intensity: 7 },
    { bodyPart: "jaw", intensity: 5 },
  ]),
  entry(2, 1, ["sad.lonely.isolated"], [{ bodyPart: "chest", intensity: 6 }]),
  entry(4, 8, ["happy.playful.cheeky", "surprised.excited.eager"], [
    { bodyPart: "chest", intensity: 2 },
  ]),
  entry(5, 3, ["angry.frustrated.annoyed"], [
    { bodyPart: "shoulders", intensity: 8 },
  ]),
  entry(8, 6, ["happy.proud.confident"], [{ bodyPart: "chest", intensity: 4 }]),
  entry(11, 4, ["bad.stressed.overwhelmed"], [
    { bodyPart: "neck", intensity: 7 },
  ]),
];
