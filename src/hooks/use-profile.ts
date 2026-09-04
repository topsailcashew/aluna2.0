"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/firebase/auth-context";
import {
  DEFAULT_PROFILE,
  subscribeToProfile,
  type UserProfile,
} from "@/lib/firebase/user-profile";

interface Snapshot {
  uid: string;
  profile: UserProfile;
}

/** Live view of the signed-in user's profile document. */
export function useProfile(): { profile: UserProfile; loading: boolean } {
  const { user, configured } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!configured || !user) return;
    const uid = user.uid;
    return subscribeToProfile(
      uid,
      (profile) => setSnapshot({ uid, profile }),
      // A missing or unreadable profile is not worth blocking the UI over —
      // fall back to defaults and let the rest of the page work.
      () => setSnapshot({ uid, profile: DEFAULT_PROFILE }),
    );
  }, [configured, user]);

  const fresh = user && snapshot?.uid === user.uid ? snapshot : null;

  return {
    profile: fresh?.profile ?? {
      ...DEFAULT_PROFILE,
      displayName: user?.displayName ?? "",
    },
    loading: Boolean(user) && fresh === null,
  };
}
