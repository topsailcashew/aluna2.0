"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/firebase/auth-context";
import { useVault } from "@/lib/crypto/vault";
import { subscribeToJournal, type JournalNote } from "@/lib/firebase/journal";

interface Snapshot {
  uid: string;
  notes: JournalNote[];
  error: string | null;
}

/** Live view of the signed-in user's journal, newest first, decrypted. */
export function useJournal(): {
  notes: JournalNote[];
  loading: boolean;
  error: string | null;
} {
  const { user, configured } = useAuth();
  const { dataKey } = useVault();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!configured || !user || !dataKey) return;
    const uid = user.uid;

    return subscribeToJournal(
      uid,
      dataKey,
      (notes) => setSnapshot({ uid, notes, error: null }),
      (error) =>
        setSnapshot({
          uid,
          notes: [],
          error: error.message.includes("permission")
            ? "We couldn't read your journal. Check that firestore.rules is deployed."
            : "We couldn't load your journal. Please try again.",
        }),
    );
  }, [configured, user, dataKey]);

  if (!configured || !user) {
    return { notes: [], loading: false, error: null };
  }

  const fresh = snapshot?.uid === user.uid ? snapshot : null;

  return {
    notes: fresh?.notes ?? [],
    loading: fresh === null,
    error: fresh?.error ?? null,
  };
}
