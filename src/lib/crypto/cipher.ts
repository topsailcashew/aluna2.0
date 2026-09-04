/**
 * AES-GCM helpers over the Web Crypto API.
 *
 * Everything here operates on a CryptoKey that never leaves the browser. The
 * server stores ciphertext and two wrapped copies of the key; it never sees
 * the key itself, which is what makes the encryption end-to-end rather than
 * merely at-rest.
 */

const ALGORITHM = "AES-GCM";
/** 96 bits is the size AES-GCM is specified around; longer gets re-hashed. */
const IV_BYTES = 12;

type Bytes = Uint8Array<ArrayBuffer>;

export function toBase64(bytes: Bytes): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function fromBase64(value: string): Bytes {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function randomBytes(length: number): Bytes {
  return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(length)));
}

/**
 * Encrypts to a single base64 string with the IV prepended.
 *
 * Keeping the IV in the same blob means a document only ever carries one
 * opaque field per payload — there is no way to store the two halves out of
 * step with each other.
 */
export async function encryptString(
  key: CryptoKey,
  plaintext: string,
): Promise<string> {
  const iv = randomBytes(IV_BYTES);
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded),
  );

  const combined = new Uint8Array(new ArrayBuffer(iv.length + ciphertext.length));
  combined.set(iv, 0);
  combined.set(ciphertext, iv.length);
  return toBase64(combined);
}

export async function decryptString(
  key: CryptoKey,
  payload: string,
): Promise<string> {
  const combined = fromBase64(payload);
  const iv = combined.subarray(0, IV_BYTES);
  const ciphertext = combined.subarray(IV_BYTES);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

/** Round-trips any JSON-serialisable value through the cipher. */
export async function encryptJson(
  key: CryptoKey,
  value: unknown,
): Promise<string> {
  return encryptString(key, JSON.stringify(value));
}

export async function decryptJson<T>(
  key: CryptoKey,
  payload: string,
): Promise<T> {
  return JSON.parse(await decryptString(key, payload)) as T;
}

/** Raised when a key cannot open a payload — wrong password, or tampering. */
export class DecryptionError extends Error {
  constructor(message = "Could not decrypt with that key.") {
    super(message);
    this.name = "DecryptionError";
  }
}
