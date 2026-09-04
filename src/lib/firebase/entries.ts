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
import { decryptJson, encryptJson } from "@/lib/crypto/cipher";
import type { CheckInValues } from "@/lib/schemas";
import type { CheckInEntry, EntryContent } from "@/lib/types";

/** Entries live under the owning user so security rules stay a one-liner. */
const entriesRef = (uid: string) => collection(getDb(), "users", uid, "entries");

/**
 * Writes one check-in.
 *
 * Everything a person actually said — emotions, sensations, notes — goes into
 * a single encrypted blob. `createdAt` stays in the clear because Firestore
 * has to order and paginate on it, and a timestamp on its own says only that
 * you opened the app.
 *
 * Note what this costs: the previous version denormalised primaryEmotions onto
 * the document so the dashboard could aggregate without re-parsing. That field
 * would have leaked the one thing most worth hiding, so it is gone; the
 * dashboard now aggregates client-side after decryption instead.
 */
export async function createEntry(
  uid: string,
  dataKey: CryptoKey,
  values: CheckInValues,
) {
  const content: EntryContent = {
    sensations: values.sensations.map((s) => ({
      bodyPart: s.bodyPart,
      intensity: s.intensity,
      note: s.note?.trim() ?? "",
    })),
    emotions: values.emotions,
    thoughtPatterns: values.thoughtPatterns,
    thoughtNote: values.thoughtNote?.trim() ?? "",
  };

  const doc = await addDoc(entriesRef(uid), {
    v: 1,
    payload: await encryptJson(dataKey, content),
    createdAt: serverTimestamp(),
  });
  return doc.id;
}

const EMPTY_CONTENT: EntryContent = {
  sensations: [],
  emotions: [],
  thoughtPatterns: [],
  thoughtNote: "",
};

/**
 * Live subscription to a user's entries, newest first, decrypted on arrival.
 * Returns the unsubscribe function.
 *
 * An entry that will not decrypt is surfaced as `undecryptable` rather than
 * dropped — silently hiding somebody's history would be worse than showing
 * them that a row exists they can no longer open.
 */
export function subscribeToEntries(
  uid: string,
  dataKey: CryptoKey,
  onData: (entries: CheckInEntry[]) => void,
  onError: (error: Error) => void,
  max = 200,
) {
  const q = query(entriesRef(uid), orderBy("createdAt", "desc"), fbLimit(max));

  return onSnapshot(
    q,
    (snapshot) => {
      void Promise.all(
        snapshot.docs.map(async (entry) => {
          const data = entry.data();
          const createdAt = data.createdAt;

          let content = EMPTY_CONTENT;
          let undecryptable = false;
          try {
            content = await decryptJson<EntryContent>(dataKey, data.payload);
          } catch {
            undecryptable = true;
          }

          return {
            id: entry.id,
            ...content,
            undecryptable,
            // A pending server timestamp reads as null until the write lands;
            // treat it as "now" so optimistic entries sort to the top.
            createdAt:
              createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
          } satisfies CheckInEntry;
        }),
      )
        .then(onData)
        .catch((error) => onError(error as Error));
    },
    (error) => onError(error),
  );
}
