import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import type { FirebaseApp } from "firebase/app";

/**
 * Firebase App Check: proves requests come from this app rather than from a
 * script someone wrote against the public config.
 *
 * Security rules already stop an attacker reading anyone else's data, so what
 * this adds is abuse resistance — quota burn, signup spam, brute force against
 * the auth endpoint.
 *
 * It stays inert until NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set. That ordering is
 * deliberate: turning enforcement on in the Firebase console before clients
 * are sending tokens locks every user out, so the client side ships first and
 * runs unenforced until the console side is verified.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Lets a local dev session register a debug token instead of solving reCAPTCHA. */
const DEBUG_TOKEN = process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN;

let started = false;

export const isAppCheckConfigured = Boolean(SITE_KEY);

export function startAppCheck(app: FirebaseApp): void {
  if (started || !SITE_KEY || typeof window === "undefined") return;
  started = true;

  if (DEBUG_TOKEN) {
    // Firebase reads this global before initialisation. `true` asks the SDK to
    // print a token to the console for registering in the Firebase console.
    (
      window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN =
      DEBUG_TOKEN === "true" ? true : DEBUG_TOKEN;
  }

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(SITE_KEY),
      // Refresh in the background so a long session does not stall on a token.
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // A failure here must never take the app down. Unenforced, requests still
    // succeed; enforced, they fail loudly at the call site where the message
    // is actually useful.
  }
}
