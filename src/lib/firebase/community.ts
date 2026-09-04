import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
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

/** Private marker so the client knows this person already contributed today. */
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
 * Security rules allow exactly one field to move, and only by +1, so a client
 * cannot rewrite the board. They cannot however prove that a given person has
 * not already counted today — that would need a server-side function, and the
 * rules engine cannot see a sibling write in the same batch. The private
 * marker below is what enforces once-a-day in practice; a determined user
 * could inflate a mood tally, which costs nobody anything.
 */
export async function contributeToPulse(
  uid: string,
  primary: PrimaryEmotionId,
  day = dayKey(),
): Promise<void> {
  await setDoc(pulseRef(day), { [primary]: increment(1) }, { merge: true });
  await setDoc(contributionRef(uid, day), {
    primary,
    createdAt: serverTimestamp(),
  });
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
  /** Present so someone can delete their own; never rendered. */
  authorId: string;
}

const reflectionsRef = () => collection(getDb(), "reflections");

const resonanceRef = (reflectionId: string, uid: string) =>
  doc(getDb(), "reflections", reflectionId, "resonances", uid);

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
            authorId: data.authorId ?? "",
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

export async function postReflection(
  uid: string,
  text: string,
  primary: PrimaryEmotionId | null,
): Promise<void> {
  await addDoc(reflectionsRef(), {
    text: text.trim(),
    primary,
    authorId: uid,
    resonateCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function deleteReflection(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "reflections", id));
}

/** Which of the visible reflections this person has already acknowledged. */
export function subscribeToMyResonances(
  uid: string,
  reflectionIds: string[],
  onData: (ids: Set<string>) => void,
) {
  // One listener per reflection would be wasteful; a single read per id on
  // demand is enough, since the set only changes when this user taps.
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
    // A failed lookup just means no hearts are lit; never an unhandled
    // rejection in the console.
    .catch(() => {
      if (!cancelled) onData(new Set());
    });

  return () => {
    cancelled = true;
  };
}

export async function toggleResonance(
  reflectionId: string,
  uid: string,
  on: boolean,
): Promise<void> {
  if (on) {
    await setDoc(resonanceRef(reflectionId, uid), {
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(getDb(), "reflections", reflectionId), {
      resonateCount: increment(1),
    });
  } else {
    await deleteDoc(resonanceRef(reflectionId, uid));
    await updateDoc(doc(getDb(), "reflections", reflectionId), {
      resonateCount: increment(-1),
    });
  }
}
