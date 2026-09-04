import {
  addDoc,
  collection,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { getDb } from "@/lib/firebase/config";
import { primaryOf, subOf } from "@/lib/data/emotions";
import type { CheckInValues } from "@/lib/schemas";
import type { CheckInEntry } from "@/lib/types";

/** Entries live under the owning user so security rules stay a one-liner. */
const entriesRef = (uid: string) => collection(getDb(), "users", uid, "entries");

const uniq = (values: (string | undefined)[]) =>
  Array.from(new Set(values.filter((v): v is string => Boolean(v))));

/**
 * Writes one check-in. Primary categories and sub-categories are denormalised
 * on write so the dashboard can aggregate without re-parsing every emotion id.
 */
export async function createEntry(uid: string, values: CheckInValues) {
  const payload = {
    sensations: values.sensations.map((s) => ({
      bodyPart: s.bodyPart,
      intensity: s.intensity,
      note: s.note?.trim() ?? "",
    })),
    emotions: values.emotions,
    primaryEmotions: uniq(values.emotions.map((id) => primaryOf(id)?.id)),
    subCategories: uniq(values.emotions.map((id) => subOf(id)?.id)),
    thoughtPatterns: values.thoughtPatterns,
    thoughtNote: values.thoughtNote?.trim() ?? "",
    createdAt: serverTimestamp(),
  };

  const doc = await addDoc(entriesRef(uid), payload);
  return doc.id;
}

/**
 * Live subscription to a user's entries, newest first.
 * Returns the unsubscribe function.
 */
export function subscribeToEntries(
  uid: string,
  onData: (entries: CheckInEntry[]) => void,
  onError: (error: Error) => void,
  max = 200,
) {
  const q = query(entriesRef(uid), orderBy("createdAt", "desc"), fbLimit(max));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt;
        return {
          id: doc.id,
          sensations: data.sensations ?? [],
          emotions: data.emotions ?? [],
          primaryEmotions: data.primaryEmotions ?? [],
          subCategories: data.subCategories ?? [],
          thoughtPatterns: data.thoughtPatterns ?? [],
          thoughtNote: data.thoughtNote ?? "",
          // A pending server timestamp reads as null until the write lands;
          // treat it as "now" so optimistic entries sort to the top.
          createdAt:
            createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
        } satisfies CheckInEntry;
      });
      onData(entries);
    },
    (error) => onError(error),
  );
}
