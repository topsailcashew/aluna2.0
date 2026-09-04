/**
 * Key management for Aluna's end-to-end encryption.
 *
 * A single random 256-bit data key encrypts every entry. That key is never
 * stored anywhere — only two *wrapped* copies of it are, one sealed by a key
 * derived from the account password and one by a key derived from the recovery
 * phrase. Either opens it; neither is recoverable from the other.
 *
 * The consequence is deliberate: changing a password only re-wraps the data
 * key, which is instant regardless of how many entries exist. Losing both the
 * password and the phrase makes every entry permanently unreadable, including
 * to whoever runs the Firebase project.
 */

import {
  decryptString,
  encryptString,
  fromBase64,
  randomBytes,
  toBase64,
} from "@/lib/crypto/cipher";
import {
  BITS_PER_WORD,
  PHRASE_LENGTH,
  PHRASE_WORDS,
} from "@/lib/crypto/wordlist";

/**
 * PBKDF2 work factor. High enough to make a stolen envelope expensive to
 * attack, low enough that unlocking on a mid-range phone stays under a second.
 */
const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;

/** Known plaintext, so a failed unwrap is detected before touching entries. */
const VERIFIER_TEXT = "aluna.v1";

export interface KeyEnvelope {
  v: 1;
  passwordSalt: string;
  passwordWrapped: string;
  phraseSalt: string;
  phraseWrapped: string;
  /** VERIFIER_TEXT encrypted under the data key. */
  verifier: string;
}

export class WrongSecretError extends Error {
  constructor(message = "That password or recovery phrase is not correct.") {
    super(message);
    this.name = "WrongSecretError";
  }
}

/* ------------------------------------------------------------------ */
/* Derivation                                                          */
/* ------------------------------------------------------------------ */

/** Stretches a human secret into an AES key used only to wrap the data key. */
async function deriveWrappingKey(
  secret: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** The key entries are actually encrypted with. Extractable so it can be wrapped. */
async function generateDataKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

async function wrapDataKey(
  dataKey: CryptoKey,
  secret: string,
): Promise<{ salt: string; wrapped: string }> {
  const salt = randomBytes(SALT_BYTES);
  const wrappingKey = await deriveWrappingKey(secret, salt);
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", dataKey));

  return {
    salt: toBase64(salt),
    wrapped: await encryptString(wrappingKey, toBase64(raw)),
  };
}

async function unwrapDataKey(
  secret: string,
  saltB64: string,
  wrapped: string,
): Promise<CryptoKey> {
  const wrappingKey = await deriveWrappingKey(secret, fromBase64(saltB64));

  let rawB64: string;
  try {
    rawB64 = await decryptString(wrappingKey, wrapped);
  } catch {
    // AES-GCM authentication failed: the secret is wrong, or the envelope was
    // tampered with. Either way there is nothing usable here.
    throw new WrongSecretError();
  }

  return crypto.subtle.importKey(
    "raw",
    fromBase64(rawB64),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

/* ------------------------------------------------------------------ */
/* Envelope lifecycle                                                  */
/* ------------------------------------------------------------------ */

export async function createEnvelope(
  password: string,
  phrase: string,
): Promise<{ envelope: KeyEnvelope; dataKey: CryptoKey }> {
  const dataKey = await generateDataKey();
  const byPassword = await wrapDataKey(dataKey, password);
  const byPhrase = await wrapDataKey(dataKey, normalisePhrase(phrase));

  return {
    dataKey,
    envelope: {
      v: 1,
      passwordSalt: byPassword.salt,
      passwordWrapped: byPassword.wrapped,
      phraseSalt: byPhrase.salt,
      phraseWrapped: byPhrase.wrapped,
      verifier: await encryptString(dataKey, VERIFIER_TEXT),
    },
  };
}

/** Confirms a key really is this envelope's data key before it gets used. */
async function assertVerifier(
  envelope: KeyEnvelope,
  dataKey: CryptoKey,
): Promise<void> {
  try {
    if ((await decryptString(dataKey, envelope.verifier)) !== VERIFIER_TEXT) {
      throw new WrongSecretError();
    }
  } catch {
    throw new WrongSecretError();
  }
}

export async function openWithPassword(
  envelope: KeyEnvelope,
  password: string,
): Promise<CryptoKey> {
  const dataKey = await unwrapDataKey(
    password,
    envelope.passwordSalt,
    envelope.passwordWrapped,
  );
  await assertVerifier(envelope, dataKey);
  return dataKey;
}

export async function openWithPhrase(
  envelope: KeyEnvelope,
  phrase: string,
): Promise<CryptoKey> {
  const dataKey = await unwrapDataKey(
    normalisePhrase(phrase),
    envelope.phraseSalt,
    envelope.phraseWrapped,
  );
  await assertVerifier(envelope, dataKey);
  return dataKey;
}

/**
 * Re-seals the same data key under a new password. Entries are untouched,
 * so this costs the same whether there are three of them or three thousand.
 */
export async function rewrapForPassword(
  envelope: KeyEnvelope,
  dataKey: CryptoKey,
  newPassword: string,
): Promise<KeyEnvelope> {
  const byPassword = await wrapDataKey(dataKey, newPassword);
  return {
    ...envelope,
    passwordSalt: byPassword.salt,
    passwordWrapped: byPassword.wrapped,
  };
}

/* ------------------------------------------------------------------ */
/* Recovery phrase                                                     */
/* ------------------------------------------------------------------ */

/** Twelve words drawn with rejection sampling, so every word is equally likely. */
export function generatePhrase(): string {
  const words: string[] = [];
  const listSize = PHRASE_WORDS.length;
  // 2^16 is an exact multiple of 1024, so a 16-bit draw needs no rejection.
  const draws = crypto.getRandomValues(new Uint16Array(PHRASE_LENGTH));

  for (let i = 0; i < PHRASE_LENGTH; i += 1) {
    words.push(PHRASE_WORDS[draws[i] % listSize]);
  }
  return words.join(" ");
}

/** Case and spacing are not part of the secret; the words are. */
export function normalisePhrase(input: string): string {
  return input.trim().toLowerCase().split(/\s+/).filter(Boolean).join(" ");
}

export function phraseLooksValid(input: string): boolean {
  const words = normalisePhrase(input).split(" ").filter(Boolean);
  return (
    words.length === PHRASE_LENGTH && words.every((w) => PHRASE_WORDS.includes(w))
  );
}

/** Which words are not in the list — used to point at the typo. */
export function unknownPhraseWords(input: string): string[] {
  return normalisePhrase(input)
    .split(" ")
    .filter((word) => word && !PHRASE_WORDS.includes(word));
}

export const PHRASE_ENTROPY_BITS = PHRASE_LENGTH * BITS_PER_WORD;
