import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { getDb } from "@/lib/firebase/config";

/** The `users/{uid}` document — settings and identity, never entry content. */
export interface UserProfile {
  displayName: string;
  /** Data URL of a resized avatar, or "" when using the colour fallback. */
  avatarUrl: string;
  avatarColor: string;
  /** Opt-in: contributes an anonymous mood signal to the community pulse. */
  shareToCommunity: boolean;
  /** Hour of day (0-23) the in-app nudge starts appearing. */
  reminderHour: number | null;
  /** Set once the welcome flow has been seen, so it never repeats. */
  onboardedAt: string | null;
}

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "",
  avatarUrl: "",
  avatarColor: "#164452",
  shareToCommunity: false,
  reminderHour: 20,
  onboardedAt: null,
};

const profileRef = (uid: string) => doc(getDb(), "users", uid);

export function subscribeToProfile(
  uid: string,
  onData: (profile: UserProfile) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    profileRef(uid),
    (snapshot) => {
      const data = snapshot.data();
      onData({
        displayName: data?.displayName ?? DEFAULT_PROFILE.displayName,
        avatarUrl: data?.avatarUrl ?? DEFAULT_PROFILE.avatarUrl,
        avatarColor: data?.avatarColor ?? DEFAULT_PROFILE.avatarColor,
        shareToCommunity:
          data?.shareToCommunity ?? DEFAULT_PROFILE.shareToCommunity,
        reminderHour: data?.reminderHour ?? DEFAULT_PROFILE.reminderHour,
        onboardedAt: data?.onboardedAt ?? DEFAULT_PROFILE.onboardedAt,
      });
    },
    (error) => onError(error),
  );
}

/** Merges a partial update into the profile, creating the doc if needed. */
export async function saveProfile(
  uid: string,
  changes: Partial<UserProfile>,
): Promise<void> {
  await setDoc(
    profileRef(uid),
    { ...changes, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
