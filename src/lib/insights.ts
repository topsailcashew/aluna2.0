/**
 * Plain-language observations drawn from a person's own entries.
 *
 * The governing rule here is that nothing is said without enough evidence to
 * say it. A mood app that announces "you are calmer when you sleep well" from
 * four entries is not being helpful — it is laundering noise into advice, on a
 * subject where people take advice seriously. Every observation below carries
 * a minimum sample, compares two groups rather than describing one, and is
 * worded as a tendency rather than a finding.
 */

import {
  ACTIVITY_TAG_BY_ID,
  SCALE_TAG_BY_ID,
} from "@/lib/data/context-tags";
import { primaryIdsFrom } from "@/lib/data/emotions";
import type { CheckInEntry } from "@/lib/types";

/** Entries needed on *each* side of a comparison before it is shown. */
export const MIN_GROUP = 4;
/** Entries needed overall before any observation appears. */
export const MIN_ENTRIES = 10;

/** Families counted as pleasant, for a crude but honest positivity ratio. */
const PLEASANT = new Set(["happy", "surprised"]);

export interface Observation {
  id: string;
  text: string;
  /** How many entries the claim rests on, shown alongside it. */
  basedOn: number;
}

/** Share of an entry's emotion families that are pleasant ones. */
function positivity(entry: CheckInEntry): number | null {
  const families = primaryIdsFrom(entry.emotions);
  if (families.length === 0) return null;
  return families.filter((f) => PLEASANT.has(f)).length / families.length;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Compares the positivity of two groups of entries and phrases the difference
 * only if it is worth mentioning — at least fifteen percentage points, on top
 * of the sample floors.
 */
function compare(
  id: string,
  withGroup: CheckInEntry[],
  withoutGroup: CheckInEntry[],
  phrase: (direction: "better" | "harder") => string,
): Observation | null {
  const a = withGroup.map(positivity).filter((v): v is number => v !== null);
  const b = withoutGroup.map(positivity).filter((v): v is number => v !== null);
  if (a.length < MIN_GROUP || b.length < MIN_GROUP) return null;

  const difference = mean(a) - mean(b);
  if (Math.abs(difference) < 0.15) return null;

  return {
    id,
    text: phrase(difference > 0 ? "better" : "harder"),
    basedOn: a.length + b.length,
  };
}

export function buildObservations(entries: CheckInEntry[]): Observation[] {
  const usable = entries.filter((entry) => !entry.undecryptable);
  if (usable.length < MIN_ENTRIES) return [];

  const out: Observation[] = [];

  // Each scale tag: high end against low end.
  for (const id of ["sleep", "energy", "stress"] as const) {
    const tag = SCALE_TAG_BY_ID.get(id);
    if (!tag) continue;

    const observation = compare(
      `scale-${id}`,
      usable.filter((e) => e.tags?.[id] === "high"),
      usable.filter((e) => e.tags?.[id] === "low"),
      (direction) =>
        `Your check-ins tend to read ${direction === "better" ? "lighter" : "heavier"} ` +
        `${tag.insight.high} than ${tag.insight.low}.`,
    );
    if (observation) out.push(observation);
  }

  // Activities: days containing one against days without it.
  for (const [id, tag] of ACTIVITY_TAG_BY_ID) {
    const withIt = usable.filter((e) => e.tags?.activities?.includes(id));
    const withoutIt = usable.filter((e) => !e.tags?.activities?.includes(id));
    const observation = compare(
      `activity-${id}`,
      withIt,
      withoutIt,
      (direction) =>
        `Days with ${tag.label.toLowerCase()} tend to read ` +
        `${direction === "better" ? "lighter" : "heavier"} than days without.`,
    );
    if (observation) out.push(observation);
  }

  // Weekday against weekend — needs no tags, so it often lands first.
  const weekday = usable.filter((e) => {
    const day = e.createdAt.getDay();
    return day >= 1 && day <= 5;
  });
  const weekend = usable.filter((e) => {
    const day = e.createdAt.getDay();
    return day === 0 || day === 6;
  });
  const rhythm = compare(
    "weekday",
    weekend,
    weekday,
    (direction) =>
      `Your weekends tend to read ${direction === "better" ? "lighter" : "heavier"} than your weekdays.`,
  );
  if (rhythm) out.push(rhythm);

  // Strongest evidence first, and never a wall of them.
  return out.sort((a, b) => b.basedOn - a.basedOn).slice(0, 4);
}

/** What is still missing before observations can appear. */
export function observationsBlockedBy(entries: CheckInEntry[]): string | null {
  const usable = entries.filter((entry) => !entry.undecryptable);
  if (usable.length < MIN_ENTRIES) {
    const left = MIN_ENTRIES - usable.length;
    return `${left} more check-in${left === 1 ? "" : "s"} before patterns are worth reading into.`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Ranges                                                              */
/* ------------------------------------------------------------------ */

export const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 0, label: "All" },
] as const;

export type RangeDays = (typeof RANGES)[number]["days"];

export function withinRange(
  entries: CheckInEntry[],
  days: RangeDays,
  now = new Date(),
): CheckInEntry[] {
  if (days === 0) return entries;
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => entry.createdAt.getTime() >= cutoff);
}
