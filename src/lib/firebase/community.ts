import {
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { getDb } from "@/lib/firebase/config";
import { dayKey } from "@/lib/data/prompts";
import type { PrimaryEmotionId } from "@/lib/data/emotions";

export const MAX_REFLECTION_LENGTH = 240;

/* ------------------------------------------------------------------ */
/* Daily pulse                                                         */
/* ------------------------------------------------------------------ */

export type PulseCounts = Partial<Record<PrimaryEmotionId, number>>;

const pulseRef = (day: string) => doc(getDb(), "communityPulse", day);

const contributionRef = (uid: string, day: string) =>
  doc(getDb(), "users", uid, "contributions", day);

export function subscribeToPulse(
  onData: (counts: PulseCounts) => void,
  onError: (error: Error) => void,
  day = dayKey(),
) {
  return onSnapshot(
    pulseRef(day),
    (snapshot) => onData((snapshot.data() ?? {}) as PulseCounts),
    (error) => onError(error),
  );
}

export async function hasContributedToday(
  uid: string,
  day = dayKey(),
): Promise<boolean> {
  const snapshot = await getDoc(contributionRef(uid, day));
  return snapshot.exists();
}

/**
 * Adds one to a single emotion tally for the day.
 *
 * The tally write and the private contribution marker go in one batch, because
 * the rules require the marker to appear in the same write and refuse a second
 * one for the day. Once-a-day is therefore enforced server-side, not on trust
 * — a client cannot inflate the board by writing the pulse alone.
 */
export async function contributeToPulse(
  uid: string,
  primary: PrimaryEmotionId,
  day = dayKey(),
): Promise<void> {
  const batch = writeBatch(getDb());
  batch.set(pulseRef(day), { [primary]: increment(1) }, { merge: true });
  batch.set(contributionRef(uid, day), {
    primary,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

/* ------------------------------------------------------------------ */
/* Reflections                                                         */
/* ------------------------------------------------------------------ */

export interface Reflection {
  id: string;
  text: string;
  primary: PrimaryEmotionId | null;
  createdAt: Date;
  resonateCount: number;
}

const reflectionsRef = () => collection(getDb(), "reflections");

const resonanceRef = (reflectionId: string, uid: string) =>
  doc(getDb(), "reflections", reflectionId, "resonances", uid);

/**
 * Who authored a post. Kept in a separate top-level collection that is
 * readable only by the author, create-once and immutable (see firestore.rules)
 * — so the public reflection carries no author id at all, and ownership cannot
 * be forged after the fact to seize or delete someone else's post. Anonymity
 * therefore holds against querying the raw documents, not just the UI.
 */
const authorRef = (reflectionId: string) =>
  doc(getDb(), "reflectionAuthors", reflectionId);
const reflectionAuthorsRef = () => collection(getDb(), "reflectionAuthors");

export function subscribeToReflections(
  onData: (reflections: Reflection[]) => void,
  onError: (error: Error) => void,
  max = 50,
) {
  const q = query(reflectionsRef(), orderBy("createdAt", "desc"), limit(max));

  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((entry) => {
          const data = entry.data();
          return {
            id: entry.id,
            text: data.text ?? "",
            primary: data.primary ?? null,
            resonateCount: data.resonateCount ?? 0,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : new Date(),
          } satisfies Reflection;
        }),
      );
    },
    (error) => onError(error),
  );
}

/** The ids of reflections this person authored, so the UI can mark them mine. */
export function subscribeToMyReflectionIds(
  uid: string,
  onData: (ids: Set<string>) => void,
  onError: (error: Error) => void,
) {
  // The read rule only returns author records whose authorId is the caller, so
  // this query both works and reveals nobody else's authorship.
  return onSnapshot(
    query(reflectionAuthorsRef(), where("authorId", "==", uid)),
    (snapshot) => onData(new Set(snapshot.docs.map((d) => d.id))),
    (error) => onError(error),
  );
}

export async function postReflection(
  uid: string,
  text: string,
  primary: PrimaryEmotionId | null,
): Promise<void> {
  // Client-generated id so the same id names the public post and the private
  // ownership marker, both written in one batch.
  const ref = doc(reflectionsRef());
  const batch = writeBatch(getDb());
  batch.set(ref, {
    text: text.trim(),
    primary,
    resonateCount: 0,
    createdAt: serverTimestamp(),
  });
  // Author record written in the same batch; the create rule requires it.
  batch.set(authorRef(ref.id), { authorId: uid });
  await batch.commit();
}

export async function deleteReflection(id: string): Promise<void> {
  const batch = writeBatch(getDb());
  batch.delete(doc(getDb(), "reflections", id));
  batch.delete(authorRef(id));
  await batch.commit();
}

/** Which of the visible reflections this person has already acknowledged. */
export function subscribeToMyResonances(
  uid: string,
  reflectionIds: string[],
  onData: (ids: Set<string>) => void,
) {
  let cancelled = false;

  void Promise.all(
    reflectionIds.map(async (id) => {
      const snapshot = await getDoc(resonanceRef(id, uid));
      return snapshot.exists() ? id : null;
    }),
  )
    .then((results) => {
      if (!cancelled) {
        onData(new Set(results.filter((id): id is string => id !== null)));
      }
    })
    .catch(() => {
      if (!cancelled) onData(new Set());
    });

  return () => {
    cancelled = true;
  };
}

/**
 * The count and the caller's own acknowledgement move together, in one batch.
 * The rules require exactly that pairing — +1 only while creating your marker,
 * -1 only while removing it — so one person can shift any post's count by at
 * most their single vote. It cannot be inflated or griefed down.
 */
export async function toggleResonance(
  reflectionId: string,
  uid: string,
  on: boolean,
): Promise<void> {
  const batch = writeBatch(getDb());
  const parent = doc(getDb(), "reflections", reflectionId);

  if (on) {
    batch.set(resonanceRef(reflectionId, uid), { createdAt: serverTimestamp() });
    batch.update(parent, { resonateCount: increment(1) });
  } else {
    batch.delete(resonanceRef(reflectionId, uid));
    batch.update(parent, { resonateCount: increment(-1) });
  }
  await batch.commit();
}
