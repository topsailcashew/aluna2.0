import { doc, getDoc, setDoc } from "firebase/firestore";

import { getDb } from "@/lib/firebase/config";
import type { KeyEnvelope } from "@/lib/crypto/keys";

/**
 * The wrapped-key envelope lives on the user's own document, beside the
 * profile. It has to be readable before anything can be decrypted, which is
 * fine: on its own it is two ciphertexts and two salts, useless without the
 * password or the recovery phrase.
 */

const userRef = (uid: string) => doc(getDb(), "users", uid);

export async function loadEnvelope(uid: string): Promise<KeyEnvelope | null> {
  const snapshot = await getDoc(userRef(uid));
  const envelope = snapshot.data()?.keyEnvelope;
  return envelope && envelope.v === 1 ? (envelope as KeyEnvelope) : null;
}

export async function saveEnvelope(
  uid: string,
  envelope: KeyEnvelope,
): Promise<void> {
  await setDoc(userRef(uid), { keyEnvelope: envelope }, { merge: true });
}
