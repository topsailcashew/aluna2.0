import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit as fbLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { getDb } from "@/lib/firebase/config";
import { decryptJson, encryptJson } from "@/lib/crypto/cipher";

/**
 * Free-form journal entries, encrypted exactly like check-ins.
 *
 * Separate from the reflection prompts inside a check-in: those answer three
 * fixed questions about one moment, this is a blank page. Same crypto, same
 * ownership rules, its own collection so neither has to carry the other's
 * shape.
 */

export interface JournalContent {
  title: string;
  body: string;
}

export interface JournalNote extends JournalContent {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  /** True when this note could not be opened with the current key. */
  undecryptable: boolean;
}

const journalRef = (uid: string) => collection(getDb(), "users", uid, "journal");

export async function createNote(
  uid: string,
  dataKey: CryptoKey,
  content: JournalContent,
): Promise<string> {
  const note = await addDoc(journalRef(uid), {
    v: 1,
    payload: await encryptJson(dataKey, {
      title: content.title.trim(),
      body: content.body.trim(),
    }),
    createdAt: serverTimestamp(),
  });
  return note.id;
}

/**
 * Journal notes, unlike check-ins, are editable. A check-in records what was
 * true at a moment and should not be rewritten; a piece of writing is a draft
 * until its author says otherwise.
 */
export async function updateNote(
  uid: string,
  dataKey: CryptoKey,
  id: string,
  content: JournalContent,
): Promise<void> {
  await updateDoc(doc(getDb(), "users", uid, "journal", id), {
    payload: await encryptJson(dataKey, {
      title: content.title.trim(),
      body: content.body.trim(),
    }),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "users", uid, "journal", id));
}

export function subscribeToJournal(
  uid: string,
  dataKey: CryptoKey,
  onData: (notes: JournalNote[]) => void,
  onError: (error: Error) => void,
  max = 200,
) {
  const q = query(journalRef(uid), orderBy("createdAt", "desc"), fbLimit(max));

  return onSnapshot(
    q,
    (snapshot) => {
      void Promise.all(
        snapshot.docs.map(async (entry) => {
          const data = entry.data();

          let content: JournalContent = { title: "", body: "" };
          let undecryptable = false;
          try {
            content = await decryptJson<JournalContent>(dataKey, data.payload);
          } catch {
            undecryptable = true;
          }

          return {
            id: entry.id,
            ...content,
            undecryptable,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : null,
          } satisfies JournalNote;
        }),
      )
        .then(onData)
        .catch((error) => onError(error as Error));
    },
    (error) => onError(error),
  );
}
