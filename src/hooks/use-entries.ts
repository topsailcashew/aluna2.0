"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/firebase/auth-context";
import { subscribeToEntries } from "@/lib/firebase/entries";
import { useVault } from "@/lib/crypto/vault";
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

/**
 * Live view of the signed-in user's check-ins, newest first, already
 * decrypted. Produces nothing until the vault is unlocked — there is no key
 * to read them with before that.
 */
export function useEntries(): EntriesState {
  const { user, configured } = useAuth();
  const { dataKey } = useVault();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!configured || !user || !dataKey) return;
    const uid = user.uid;

    return subscribeToEntries(
      uid,
      dataKey,
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
  }, [configured, user, dataKey]);

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
