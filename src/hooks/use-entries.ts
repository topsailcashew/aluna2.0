"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/firebase/auth-context";
import { subscribeToEntries } from "@/lib/firebase/entries";
import type { CheckInEntry } from "@/lib/types";

interface EntriesState {
  entries: CheckInEntry[];
  loading: boolean;
  error: string | null;
}

/** What the listener has delivered, tagged with the user it belongs to. */
interface Snapshot {
  uid: string;
  entries: CheckInEntry[];
  error: string | null;
}

/** Live view of the signed-in user's check-ins, newest first. */
export function useEntries(): EntriesState {
  const { user, configured } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!configured || !user) return;
    const uid = user.uid;

    return subscribeToEntries(
      uid,
      (entries) => setSnapshot({ uid, entries, error: null }),
      (error) =>
        setSnapshot({
          uid,
          entries: [],
          error: error.message.includes("permission")
            ? "We couldn't read your entries. Check that firestore.rules is deployed."
            : "We couldn't load your entries. Please try again.",
        }),
    );
  }, [configured, user]);

  if (!configured || !user) {
    return { entries: [], loading: false, error: null };
  }

  // A snapshot left over from a previous account is stale, not loaded — so
  // switching users shows the loading state rather than someone else's data.
  const fresh = snapshot?.uid === user.uid ? snapshot : null;

  return {
    entries: fresh?.entries ?? [],
    loading: fresh === null,
    error: fresh?.error ?? null,
  };
}
