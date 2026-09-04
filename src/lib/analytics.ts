import {
  EMOTIONS,
  PRIMARY_BY_ID,
  type PrimaryEmotion,
  type PrimaryEmotionId,
} from "@/lib/data/emotions";
import type { CheckInEntry } from "@/lib/types";
import { average } from "@/lib/utils";

export interface EmotionSlice {
  id: PrimaryEmotionId;
  label: string;
  color: string;
  count: number;
}

export interface TimelinePoint {
  /** Epoch ms — Recharts sorts and formats from this. */
  timestamp: number;
  intensity: number;
  sensationCount: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Mean intensity across every sensation in a single entry. */
export function entryIntensity(entry: CheckInEntry): number | null {
  if (!entry.sensations.length) return null;
  return average(entry.sensations.map((s) => s.intensity));
}

/**
 * Average sensation intensity over the trailing week.
 * Entries with no sensations are excluded rather than counted as zero — a
 * check-in without body notes is silence, not calm.
 */
export function weeklyIntensityAverage(
  entries: CheckInEntry[],
  now = new Date(),
): { value: number | null; sampleCount: number } {
  const cutoff = now.getTime() - 7 * DAY_MS;
  const intensities = entries
    .filter((entry) => entry.createdAt.getTime() >= cutoff)
    .flatMap((entry) => entry.sensations.map((s) => s.intensity));

  return {
    value: intensities.length ? average(intensities) : null,
    sampleCount: intensities.length,
  };
}

/** Primary-category tallies, ordered by the canonical wheel order. */
export function emotionDistribution(entries: CheckInEntry[]): EmotionSlice[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    // One vote per category per entry, so a person who picks six shades of
    // "sad" in one sitting doesn't outweigh six separate sad days.
    for (const primary of new Set(entry.primaryEmotions)) {
      counts.set(primary, (counts.get(primary) ?? 0) + 1);
    }
  }

  return EMOTIONS.map((primary) => ({
    id: primary.id,
    label: primary.label,
    color: primary.color,
    count: counts.get(primary.id) ?? 0,
  })).filter((slice) => slice.count > 0);
}

/** The most-logged primary category, or null when nothing has been logged. */
export function dominantEmotion(entries: CheckInEntry[]) {
  const distribution = emotionDistribution(entries);
  if (!distribution.length) return null;

  const top = distribution.reduce((best, slice) =>
    slice.count > best.count ? slice : best,
  );
  return PRIMARY_BY_ID.get(top.id) ?? null;
}

/**
 * Oldest-first intensity series for the timeline chart, limited to entries
 * that actually carry sensations.
 */
export function intensityTimeline(
  entries: CheckInEntry[],
  maxPoints = 30,
): TimelinePoint[] {
  return entries
    .filter((entry) => entry.sensations.length > 0)
    .slice(0, maxPoints)
    .map((entry) => ({
      timestamp: entry.createdAt.getTime(),
      intensity: Number((entryIntensity(entry) ?? 0).toFixed(1)),
      sensationCount: entry.sensations.length,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/** Consecutive days ending today (or yesterday) that contain a check-in. */
export function currentStreak(entries: CheckInEntry[], now = new Date()): number {
  if (!entries.length) return 0;

  const days = new Set(
    entries.map((entry) => startOfDay(entry.createdAt).getTime()),
  );

  let cursor = startOfDay(now).getTime();
  // A streak survives until the end of the following day, so an evening
  // person who hasn't checked in yet today keeps yesterday's run.
  if (!days.has(cursor)) cursor -= DAY_MS;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export interface DayMood {
  date: Date;
  /** The family logged most often that day, or null for a blank day. */
  primary: PrimaryEmotion | null;
  entryCount: number;
  isToday: boolean;
}

/**
 * The trailing seven days, oldest first, each carrying its dominant emotion.
 * Blank days are included deliberately — the gaps are part of the picture.
 */
export function weekStrip(entries: CheckInEntry[], now = new Date()): DayMood[] {
  const byDay = new Map<number, CheckInEntry[]>();
  for (const entry of entries) {
    const key = startOfDay(entry.createdAt).getTime();
    byDay.set(key, [...(byDay.get(key) ?? []), entry]);
  }

  const today = startOfDay(now).getTime();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today - (6 - index) * DAY_MS);
    const dayEntries = byDay.get(date.getTime()) ?? [];

    const counts = new Map<string, number>();
    for (const entry of dayEntries) {
      for (const primary of new Set(entry.primaryEmotions)) {
        counts.set(primary, (counts.get(primary) ?? 0) + 1);
      }
    }

    let topId: string | null = null;
    let topCount = 0;
    for (const [id, count] of counts) {
      if (count > topCount) {
        topId = id;
        topCount = count;
      }
    }

    return {
      date,
      primary: topId
        ? (PRIMARY_BY_ID.get(topId as PrimaryEmotionId) ?? null)
        : null,
      entryCount: dayEntries.length,
      isToday: date.getTime() === today,
    };
  });
}

/** True when a check-in has already been written today. */
export function hasCheckedInToday(
  entries: CheckInEntry[],
  now = new Date(),
): boolean {
  const today = startOfDay(now).getTime();
  return entries.some(
    (entry) => startOfDay(entry.createdAt).getTime() === today,
  );
}
