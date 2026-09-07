import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { getDb } from "@/lib/firebase/config";
import { saveProfile } from "@/lib/firebase/user-profile";

/**
 * Firebase treats password changes and account deletion as recent-login
 * operations: a session older than a few minutes has to prove itself again.
 */
async function reauthenticate(user: User, password: string): Promise<void> {
  if (!user.email) {
    throw new Error("This account has no email address to re-authenticate.");
  }
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

/**
 * Changing the password re-wraps the data key as part of the same operation.
 * `rewrap` runs first: if it failed after the Firebase password had already
 * changed, the account would still be signed in but permanently unable to open
 * its own entries.
 */
export async function changePassword(
  user: User,
  currentPassword: string,
  nextPassword: string,
  rewrap: (nextPassword: string) => Promise<void>,
): Promise<void> {
  await reauthenticate(user, currentPassword);
  await rewrap(nextPassword);
  await updatePassword(user, nextPassword);
}

/** Keeps the auth record and the profile document in step. */
export async function changeDisplayName(
  user: User,
  displayName: string,
): Promise<void> {
  await updateProfile(user, { displayName });
  await saveProfile(user.uid, { displayName });
}

/** Every subcollection hanging off users/{uid}. Deleting the parent document
 *  does NOT remove these — Firestore has no cascade — so each has to be walked
 *  by name. Add to this list when a new subcollection appears, or its contents
 *  will outlive the account that wrote them. */
const USER_SUBCOLLECTIONS = ["entries", "journal", "contributions"] as const;

/** Deletes every document in one subcollection, batched to Firestore's limit. */
async function purgeSubcollection(uid: string, name: string): Promise<void> {
  const snapshot = await getDocs(collection(getDb(), "users", uid, name));

  // Firestore caps a batch at 500 writes.
  for (let i = 0; i < snapshot.docs.length; i += 400) {
    const batch = writeBatch(getDb());
    for (const entry of snapshot.docs.slice(i, i + 400)) {
      batch.delete(entry.ref);
    }
    await batch.commit();
  }
}

/**
 * Removes the account and everything under it.
 *
 * Order matters twice over. Every subcollection is emptied before the profile
 * document, and the profile document before the auth user: once the auth user
 * is gone the client can no longer satisfy the security rules, so anything left
 * behind is unreachable by the person who wrote it and undeletable by anyone.
 *
 * Journal notes in particular are the most personal thing the app holds. They
 * are encrypted, but "delete my account" has to mean the ciphertext goes too.
 */
export async function deleteAccount(
  user: User,
  currentPassword: string,
): Promise<void> {
  await reauthenticate(user, currentPassword);

  for (const name of USER_SUBCOLLECTIONS) {
    await purgeSubcollection(user.uid, name);
  }

  await deleteDoc(doc(getDb(), "users", user.uid));
  await deleteUser(user);
}

export interface ExportBundle {
  exportedAt: string;
  account: { uid: string; email: string | null; displayName: string | null };
  entryCount: number;
  entries: unknown[];
}

/** Everything Aluna holds about a person, as plain JSON. */
export function buildExport(
  user: User,
  entries: { id: string; createdAt: Date }[],
): ExportBundle {
  return {
    exportedAt: new Date().toISOString(),
    account: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    },
    entryCount: entries.length,
    entries: entries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}

/** Hands the bundle to the browser as a download. */
export function downloadExport(bundle: ExportBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aluna-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
