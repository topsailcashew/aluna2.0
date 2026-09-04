import type { Timestamp } from "firebase/firestore";

/** A sensation as stored in Firestore. */
export interface StoredSensation {
  bodyPart: string;
  intensity: number;
  note: string;
}

/** One check-in document under `users/{uid}/entries/{entryId}`. */
export interface CheckInEntry {
  id: string;
  sensations: StoredSensation[];
  /** Level-3 emotion ids, e.g. `happy.peaceful.calm`. */
  emotions: string[];
  /** Denormalised for cheap dashboard aggregation. */
  primaryEmotions: string[];
  subCategories: string[];
  thoughtPatterns: string[];
  thoughtNote: string;
  createdAt: Date;
}

export interface FirestoreEntry extends Omit<CheckInEntry, "id" | "createdAt"> {
  createdAt: Timestamp | null;
}
