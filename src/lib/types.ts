import type { TagScale } from "@/lib/data/context-tags";

/** A sensation as stored inside an entry's encrypted payload. */
export interface StoredSensation {
  bodyPart: string;
  intensity: number;
  note: string;
}

/** Optional one-tap context. Everything here is skippable. */
export interface ContextTags {
  sleep?: TagScale;
  energy?: TagScale;
  stress?: TagScale;
  activities: string[];
}

/** Answers to the guided journal prompts, keyed by prompt id. */
export type JournalAnswers = Partial<Record<string, string>>;

/** Everything encrypted into a single blob on the entry document. */
export interface EntryContent {
  sensations: StoredSensation[];
  /** Level-3 emotion ids, e.g. `happy.peaceful.loving`. */
  emotions: string[];
  thoughtPatterns: string[];
  thoughtNote: string;
  tags: ContextTags;
  journal: JournalAnswers;
}

/** One check-in, after decryption. */
export interface CheckInEntry extends EntryContent {
  id: string;
  createdAt: Date;
  /** True when this row's payload could not be opened with the current key. */
  undecryptable: boolean;
}
