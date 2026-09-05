# Security

Aluna stores emotional health data, so the bar is higher than for a typical
side project. This is what is in place, what is deliberately not, and what
still needs doing in a console.

## Threat model

The unusual property is end-to-end encryption. Entry content is encrypted in
the browser with a key derived from the account password, and that key is held
in JavaScript memory while the app is open. It is never written to
localStorage, sessionStorage or IndexedDB, which is why a reload asks you to
unlock again.

That shapes everything below. **Script injection is the primary risk**, because
an injected script would read the key and every decrypted entry with it — not
merely a session token. A stolen database, by contrast, yields ciphertext.

## In place

| Control | Where |
| --- | --- |
| Deny-by-default Firestore rules with a `{document=**}` catch-all | `firestore.rules` |
| Ownership enforced on every path | `firestore.rules` |
| Field allow-lists on writes (`hasOnly`) | `firestore.rules` |
| Entries append-only; server-forced `createdAt` | `firestore.rules` |
| Shared counters move by exactly ±1 | `firestore.rules` |
| AES-GCM content encryption, PBKDF2 key wrapping | `src/lib/crypto/` |
| Nonce-based CSP, no `script-src 'unsafe-inline'` | `src/middleware.ts` |
| Frame denial, nosniff, referrer, permissions, COOP | `next.config.ts` |
| App Check client wiring (inert until keyed) | `src/lib/firebase/app-check.ts` |
| Error boundaries that leak nothing to third parties | `src/app/error.tsx` |

`connect-src` names only the endpoints the app actually uses, so even a
successful injection has nowhere to send what it read.

## Not applicable

- **Storage rules** — the Storage SDK is never imported. Avatars are resized
  on-device and stored as data URLs on the user's own document.
- **Role escalation** — there are no roles, no admin surface and no payments.
- **OAuth redirect URIs** — email/password is the only provider.
- **Cloud Functions / Admin SDK** — there is no privileged logic to move
  server-side. Adding one would mean a component that *can* read plaintext,
  which is worth avoiding unless something genuinely needs it.

## Deliberately not done

**Third-party error tracking.** Sentry and similar would be the obvious
addition, and both checklists ask for it. The problem is that React error
messages routinely include the props that caused them, which here means
decrypted journal text; breadcrumbs and session replay make it worse.
**LogRocket-style session recording is disqualified outright** — it would
record decrypted entries as they are read on screen.

If it is wanted later, the minimum safe shape is: `beforeSend` that drops
`extra`, `contexts` and message bodies, no replay, no breadcrumbs on input
events, and an explicit opt-in in Settings. Until then errors go to the
console and the user gets a recovery screen.

## Still to do — console only

These cannot be done from the repository.

### 1. App Check (highest value remaining)

The client is wired and inert. Enabling it is a strict order, because turning
enforcement on before clients send tokens locks every user out.

1. Google Cloud Console → reCAPTCHA Enterprise → create a **website** key for
   `aluna-2-0.vercel.app`. Copy the site key.
2. Firebase Console → App Check → register the web app with that key.
3. Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in Vercel (Production), redeploy.
4. Watch App Check → Requests for a day. Wait until **verified requests appear
   and unverified ones are near zero.**
5. Only then press **Enforce**, for Authentication and Firestore separately.

To develop locally afterwards, set `NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN=true`,
copy the token the console prints, and register it under App Check → Manage
debug tokens.

### 2. Restrict the API key

Google Cloud Console → APIs & Services → Credentials → the browser key →
Application restrictions → **Websites** → add `aluna-2-0.vercel.app`. The key
is public by design, but this stops it being used from anywhere else.

### 3. Deployment protection

Every push to `main` deploys to production. Add branch protection on GitHub
(require a pull request), or Vercel → Settings → Deployment Protection.

### 4. Billing alerts

Firebase and Vercel both bill on usage. Set budget alerts before anything is
shared publicly, not after.

### 5. Separate projects per environment

One Firebase project currently serves everything. Preview deployments would hit
production data — currently moot only because Preview has no environment
variables, so previews render the setup screen instead. That fails safe by
accident, not by design.

## Reporting

Aluna is a personal project with no security team. Please raise issues on the
repository rather than disclosing them publicly.
