/** A sensation as stored inside an entry's encrypted payload. */
export interface StoredSensation {
  bodyPart: string;
  intensity: number;
  note: string;
}

/** Everything encrypted into a single blob on the entry document. */
export interface EntryContent {
  sensations: StoredSensation[];
  /** Level-3 emotion ids, e.g. `happy.peaceful.loving`. */
  emotions: string[];
  thoughtPatterns: string[];
  thoughtNote: string;
}

/** One check-in, after decryption. */
export interface CheckInEntry extends EntryContent {
  id: string;
  createdAt: Date;
  /** True when this row's payload could not be opened with the current key. */
  undecryptable: boolean;
}
