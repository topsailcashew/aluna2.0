"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/firebase/auth-context";
import {
  subscribeToPulse,
  subscribeToReflections,
  type PulseCounts,
  type Reflection,
} from "@/lib/firebase/community";

interface CommunityState {
  pulse: PulseCounts;
  reflections: Reflection[];
  loading: boolean;
  error: string | null;
}

const RULES_HINT =
  "Community data is not readable yet. Deploy the latest firestore.rules.";

/** Live view of the shared pulse and the reflection wall. */
export function useCommunity(): CommunityState {
  const { user, configured } = useAuth();
  const [pulse, setPulse] = useState<PulseCounts | null>(null);
  const [reflections, setReflections] = useState<Reflection[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !user) return;

    const fail = (e: Error) =>
      setError(e.message.includes("permission") ? RULES_HINT : e.message);

    const stopPulse = subscribeToPulse((counts) => setPulse(counts), fail);
    const stopReflections = subscribeToReflections(
      (items) => setReflections(items),
      fail,
    );

    return () => {
      stopPulse();
      stopReflections();
    };
  }, [configured, user]);

  return {
    pulse: pulse ?? {},
    reflections: reflections ?? [],
    loading: Boolean(user) && (pulse === null || reflections === null) && !error,
    error,
  };
}
