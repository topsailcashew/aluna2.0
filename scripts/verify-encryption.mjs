/**
 * End-to-end proof that Aluna's encryption works against the live project.
 *
 * Creates a throwaway account, writes an encrypted entry, and then checks the
 * properties that matter — including the ones that would be catastrophic to
 * get wrong. Deletes the account and its data on the way out, whether it
 * passes or fails.
 *
 *   node --experimental-strip-types scripts/verify-encryption.mjs
 *
 * Nothing here touches your own account.
 */
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolvePath(HERE, "..");

// Let this script import the app's own modules, aliases and all, so the test
// exercises the shipping code rather than a copy of it.
const hooks = pathToFileURL(resolvePath(HERE, ".alias-hooks.mjs")).href;
register(hooks, import.meta.url);

for (const line of readFileSync(resolvePath(ROOT, ".env.local"), "utf8").split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i > 0) process.env[line.slice(0, i)] = line.slice(i + 1);
}

const { initializeApp } = await import("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
        signOut, deleteUser, updatePassword, EmailAuthProvider,
        reauthenticateWithCredential } = await import("firebase/auth");
const { getFirestore, doc, setDoc, getDoc, addDoc, collection, getDocs,
        deleteDoc, serverTimestamp } = await import("firebase/firestore");

const { createEnvelope, openWithPassword, openWithPhrase, rewrapForPassword,
        generatePhrase } = await import("@/lib/crypto/keys");
const { encryptJson, decryptJson } = await import("@/lib/crypto/cipher");

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

let failures = 0;
const step = async (name, fn) => {
  try { await fn(); console.log("  PASS  " + name); }
  catch (e) {
    const message = e?.message ?? String(e);
    // Node sends no Referer, so an API key restricted by website will refuse
    // every call here. That is the restriction working, not a broken app —
    // worth saying once, clearly, rather than failing eight times over.
    if (message.includes("requests-from-referer")) {
      console.log("\n  This key is restricted by HTTP referrer, and Node sends none.");
      console.log("  The restriction is working; this script simply cannot run against it.");
      console.log("  To verify encryption, either:");
      console.log("    - temporarily remove the website restriction, run this, and restore it, or");
      console.log("    - create a second unrestricted key for testing and put it in .env.local.\n");
      process.exit(2);
    }
    console.log("  FAIL  " + name + "\n        " + message);
    failures++;
  }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const EMAIL = `aluna-verify-${Date.now()}@example.com`;
const PASSWORD = "first-password-9482";
const NEXT_PASSWORD = "second-password-5517";
const PHRASE = generatePhrase();

const CONTENT = {
  sensations: [{ bodyPart: "chest", intensity: 7, note: "a tightness" }],
  emotions: ["sad.lonely.isolated", "happy.optimistic.hopeful"],
  thoughtPatterns: ["future-worry"],
  thoughtNote: "CANARY-a-private-sentence",
};

let uid = null;
let entryId = null;

console.log(`\nVerifying encryption against ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
console.log(`Throwaway account: ${EMAIL}\n`);

try {
  await step("account created and envelope stored", async () => {
    const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    uid = cred.user.uid;
    const { envelope, dataKey } = await createEnvelope(PASSWORD, PHRASE);
    await setDoc(doc(db, "users", uid), { keyEnvelope: envelope }, { merge: true });
    globalThis.__key = dataKey;
  });

  await step("entry written as ciphertext the rules accept", async () => {
    const ref = await addDoc(collection(db, "users", uid, "entries"), {
      v: 1,
      payload: await encryptJson(globalThis.__key, CONTENT),
      createdAt: serverTimestamp(),
    });
    entryId = ref.id;
  });

  await step("stored document reveals no plaintext", async () => {
    const snap = await getDoc(doc(db, "users", uid, "entries", entryId));
    const raw = JSON.stringify(snap.data());
    assert(!raw.includes("CANARY"), "the private note is readable in Firestore");
    assert(!raw.includes("lonely"), "an emotion id is readable in Firestore");
    assert(!raw.includes("chest"), "a body part is readable in Firestore");
    assert(!("emotions" in snap.data()), "emotions stored outside the payload");
  });

  await step("rules reject an entry with plaintext fields", async () => {
    let rejected = false;
    try {
      await addDoc(collection(db, "users", uid, "entries"), {
        v: 1, payload: "x", emotions: ["happy.playful.cheeky"], createdAt: serverTimestamp(),
      });
    } catch { rejected = true; }
    assert(rejected, "a plaintext field was accepted by the rules");
  });

  await step("a fresh sign-in decrypts the entry", async () => {
    await signOut(auth);
    const cred = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
    const envSnap = await getDoc(doc(db, "users", cred.user.uid));
    const key = await openWithPassword(envSnap.data().keyEnvelope, PASSWORD);
    const entry = await getDoc(doc(db, "users", uid, "entries", entryId));
    const out = await decryptJson(key, entry.data().payload);
    assert(JSON.stringify(out) === JSON.stringify(CONTENT), "decrypted content differs");
  });

  await step("password change keeps the entry readable", async () => {
    const envSnap = await getDoc(doc(db, "users", uid));
    const envelope = envSnap.data().keyEnvelope;
    const key = await openWithPassword(envelope, PASSWORD);

    const rewrapped = await rewrapForPassword(envelope, key, NEXT_PASSWORD);
    await setDoc(doc(db, "users", uid), { keyEnvelope: rewrapped }, { merge: true });
    await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(EMAIL, PASSWORD));
    await updatePassword(auth.currentUser, NEXT_PASSWORD);

    await signOut(auth);
    await signInWithEmailAndPassword(auth, EMAIL, NEXT_PASSWORD);
    const after = await openWithPassword(rewrapped, NEXT_PASSWORD);
    const entry = await getDoc(doc(db, "users", uid, "entries", entryId));
    const out = await decryptJson(after, entry.data().payload);
    assert(JSON.stringify(out) === JSON.stringify(CONTENT), "entry unreadable after password change");
  });

  await step("recovery phrase still opens the re-wrapped envelope", async () => {
    const envSnap = await getDoc(doc(db, "users", uid));
    const key = await openWithPhrase(envSnap.data().keyEnvelope, PHRASE);
    const entry = await getDoc(doc(db, "users", uid, "entries", entryId));
    const out = await decryptJson(key, entry.data().payload);
    assert(JSON.stringify(out) === JSON.stringify(CONTENT), "phrase recovery failed");
  });

  await step("the old password no longer opens anything", async () => {
    const envSnap = await getDoc(doc(db, "users", uid));
    let rejected = false;
    try { await openWithPassword(envSnap.data().keyEnvelope, PASSWORD); }
    catch { rejected = true; }
    assert(rejected, "the previous password still unwraps the key");
  });
} finally {
  process.stdout.write("\n  cleaning up… ");
  try {
    if (uid && auth.currentUser) {
      const entries = await getDocs(collection(db, "users", uid, "entries"));
      for (const e of entries.docs) await deleteDoc(e.ref);
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(auth.currentUser);
      console.log("test account and its data removed.");
    } else {
      console.log(`could not sign in to clean up; delete ${EMAIL} in the Firebase console.`);
    }
  } catch (e) {
    console.log(`cleanup failed (${e.message}); delete ${EMAIL} in the Firebase console.`);
  }
}

console.log(failures === 0
  ? "\nEncryption verified end to end.\n"
  : `\n${failures} check(s) FAILED.\n`);
process.exit(failures === 0 ? 0 : 1);
