# Aluna — Admin Monitoring Dashboard: build brief

> Hand this whole file to a fresh Claude Code session as the spec for building a
> **separate, internal, admin-only monitoring dashboard** for the Aluna app.
> It describes the existing app, its real data model, and — critically — the
> hard limits that end-to-end encryption places on what can be monitored.

---

## 0. The one constraint that shapes everything

**Aluna is end-to-end encrypted.** Every check-in and journal note is encrypted
in the browser with a key the server never sees. The Firebase project owner
(and therefore any admin dashboard) **cannot read**: emotions logged, body
sensations, thought patterns, journal text, or check-in notes.

So this dashboard is **not** a window into what users feel. It is a **monitoring
tool** built on three readable layers:

1. **Metadata** — account records, document counts, timestamps (when, how often,
   how many — never *what*).
2. **Aggregates** — the anonymous community mood pulse.
3. **Community wall** — anonymous public reflections (plaintext, for moderation).

Everything below is scoped to those layers. Do not design features that require
reading user content; they are impossible by construction, and that is the point
of the product.

---

## 1. The existing app

- **Aluna** — a private mental-wellness app: daily emotional check-ins (a
  three-level emotion wheel of ~82 emotions across 7 families, a body-sensation
  scan of ~30 body parts, ~9 thought patterns, context tags, guided journal),
  plus breathing, a speech-to-text "Ramble", a guided "Regulation Journey", an
  encrypted freeform Journal, and an anonymous Community tab.
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
  Firebase (Auth + Firestore + App Check) · deployed on **Vercel**
  (repo `github.com/topsailcashew/aluna2.0`, branch `main`, auto-deploy on push).
- **Client data libs** live in `src/lib/firebase/*`; the security rules are in
  `firestore.rules`; the encryption is in `src/lib/crypto/*`.

---

## 2. Firebase backend the admin app connects to

- **Project ID:** `studio-6491013315-e8442`
  (auth domain `studio-6491013315-e8442.firebaseapp.com`).
- **Services in use:** Firebase Auth (email/password only), Cloud Firestore,
  Firebase App Check (reCAPTCHA Enterprise).
- **How the admin app must connect:** the **Firebase Admin SDK** with a
  **service-account key**, server-side only. The Admin SDK **bypasses Firestore
  security rules**, so it can read everything the rules restrict — which is what
  makes aggregate monitoring possible, and why the admin app must be locked down
  (see §7–8).
- **Do NOT use the client Web SDK / the `NEXT_PUBLIC_FIREBASE_*` keys** for the
  dashboard: that API key is HTTP-referrer-restricted and App-Check-gated, and
  the client rules only ever expose a single user's own data.

---

## 3. Firestore data model (the real shapes)

Legend: 🔓 plaintext / readable · 🔒 ciphertext / unreadable · 🧍 PII.

### `users/{uid}` — profile document
| field | type | notes |
|---|---|---|
| `displayName` | string ≤60 | 🧍 PII |
| `avatarUrl` | string (data URL) ≤200 KB | 🧍 optional inline image |
| `avatarColor` | string ≤32 | 🔓 |
| `shareToCommunity` | bool | 🔓 opted into community pulse |
| `reminderHour` | int 0–23 \| null | 🔓 daily reminder setting |
| `onboardedAt` | ISO string \| null | 🔓 **onboarding completion** signal |
| `keyEnvelope` | object | 🔒 wrapped encryption keys — opaque, useless |
| `updatedAt` | timestamp | 🔓 |

### `users/{uid}/entries/{entryId}` — check-ins (append-only, never edited)
| field | type | notes |
|---|---|---|
| `v` | 1 | schema version |
| `payload` | string ≤200 KB | 🔒 **encrypted** blob = emotions, sensations, thoughts, tags, journal answers. **Unreadable.** |
| `createdAt` | timestamp (serverTimestamp) | 🔓 **the key metric surface** — when a check-in happened |

→ Admin can count entries and read their timestamps. **Never their content.**

### `users/{uid}/journal/{noteId}` — freeform notes (editable)
Same shape as an entry (`v`, `payload` 🔒 ≤400 KB, `createdAt` 🔓) plus
`updatedAt` on edit. Ramble output and Regulation-Journey summaries are saved
here too, so today they are **not distinguishable** from hand-written notes
(see §5 "instrument this").

### `users/{uid}/contributions/{day}` — 🔓 private once-a-day pulse marker (bookkeeping)

### `communityPulse/{day}` — 🔓 **anonymous daily mood tally**
One doc per day (`day` = `YYYY-MM-DD`), a count per family:
`{ happy, surprised, bad, fearful, angry, disgusted, sad }` (each an int).
This is the **only aggregate emotional signal available**, and it is anonymous.

### `reflections/{reflectionId}` — 🔓 **anonymous public wall post**
| field | type | notes |
|---|---|---|
| `text` | string 1–240 | 🔓 plaintext, user-written — **the only free-text an admin can read** |
| `primary` | family \| null | 🔓 mood tag |
| `resonateCount` | int ≥0 | 🔓 likes |
| `createdAt` | timestamp | 🔓 |
Carries **no author id** by design. Sub-collection `resonances/{uid}` = per-user
acknowledgement markers.

### `reflectionAuthors/{reflectionId}` — `{ authorId }` — ⚠️ **privacy landmine**
Maps a reflection to its author. The client rules make it readable only by that
author, so the wall is anonymous in the product. **The Admin SDK can read it and
thereby deanonymize every post. DO NOT build any feature that joins reflections
to authors.** Treat this collection as off-limits except, at most, for executing
a moderation delete (delete the post + its author record + resonances together).

### Firebase Auth users (via Admin Auth SDK, not Firestore)
`uid`, `email` 🧍, `displayName` 🧍, `emailVerified`, `disabled`,
`metadata.creationTime` 🔓, `metadata.lastSignInTime` 🔓.

---

## 4. Encryption model (why content is invisible — don't fight it)

- One random **AES-256-GCM** data key encrypts every entry/note.
- The data key is stored only as two **wrapped** copies inside `keyEnvelope`:
  one sealed by a key derived from the **account password**, one by the
  **recovery phrase** (PBKDF2-SHA256, 310,000 iterations, per-secret salt).
- The data key is **never** written to the server; it lives only in the browser
  tab's memory after unlock.
- Consequences the admin app must respect:
  - The server/admin **cannot decrypt** any entry or note. No exceptions.
  - **Resetting a user's password does NOT give access** to their data — it
    would only orphan it. Don't offer "reset to inspect".
  - If a user loses both password and phrase, their data is permanently
    unreadable, including to the project owner. That's expected.

---

## 5. What the dashboard CAN monitor (the feature set)

### A. Growth & acquisition
- Total registered users; new sign-ups over time (Auth `creationTime`).
- **Onboarding completion rate** = share of profiles with `onboardedAt != null`.
- Verified-email rate; disabled/blocked accounts.

### B. Engagement & retention (metadata only)
- **DAU / WAU / MAU** — from `entries.createdAt` (collection-group query) and/or
  Auth `lastSignInTime`.
- Check-ins per day/week; average check-ins per active user.
- **Streak distribution** — derive per user from the gaps between their
  `entries.createdAt` values (the app already computes `currentStreak` in
  `src/lib/analytics.ts` — reuse that logic server-side).
- Retention cohorts (sign-up week → % returning in week N).
- Reminder adoption = share with `reminderHour != null`, distribution by hour.

### C. Feature adoption
- **Community opt-in rate** = share with `shareToCommunity == true`.
- Journal usage = users with ≥1 `journal` note; notes over time.
- ⚠️ **Ramble / Regulation Journey / Breathe usage is NOT distinguishable today**
  (Ramble & Journey both save into `journal`; Breathe writes nothing). To measure
  these, **add lightweight analytics events** — recommend a new append-only
  `analytics/events` collection (or Firebase Analytics / GA4) that logs
  `{ type: 'ramble_saved' | 'journey_completed' | 'breathe_session' | ..., uid,
  at }` with **no content**. Call this out to the product owner as a small change
  to the main app.

### D. Community health & moderation
- Pulse trends: aggregate mood mix over time from `communityPulse/{day}` (stack/
  area charts of the 7 families) — anonymous, safe to surface.
- Reflection volume per day; resonance activity; top-resonated posts.
- **Moderation queue**: list recent `reflections` (plaintext, anonymous) with a
  keyword/heuristic flag; allow an admin to **remove** an abusive post
  (delete the reflection doc, its `resonances`, and `reflectionAuthors/{id}` in
  one batch). Keep the wall anonymous — never display or join `authorId`.

### E. Operational health
- Firestore usage & cost, Auth error rates, App Check enforcement status,
  hosting/build status — via **Google Cloud Monitoring / Firebase Management
  APIs** and the Vercel API. (These live outside Firestore.)

### F. Safety (ethical boundary — read this)
Because check-in content is encrypted, the dashboard **cannot and must not**
attempt per-user crisis detection from check-ins. The only user-authored text an
admin can see is the **anonymous** community wall, and only for moderation.
Don't build anything that implies surveillance of individuals' feelings.

---

## 6. What the dashboard CANNOT do (state these as non-goals)

- Read or search any check-in, journal note, emotion, sensation, or thought.
- Show a per-user emotional history or "profile of how someone feels".
- Deanonymize community reflections (technically possible via `reflectionAuthors`
  + Admin SDK — **explicitly forbidden**).
- Recover or inspect data via password reset (impossible by design).

---

## 7. Recommended architecture

- **Separate app / repo** from Aluna. Server-rendered (e.g. Next.js to match the
  team's stack, or any server framework). All Firebase access is **server-side**.
- **Admin authentication:** Firebase Auth + a custom claim `admin: true` set on
  the few admin accounts (via a one-off Admin-SDK script or a protected Cloud
  Function). Gate **every** page and API route server-side on that claim; never
  trust a client-side check. An env allowlist of admin UIDs/emails is an
  acceptable simpler v1.
- **Service account:** a dedicated GCP service account with least privilege
  (Firestore + Auth **read**; write only for moderation deletes / account
  disable). Key stored in server env or a secret manager — **never shipped to the
  browser.**
- **Aggregation strategy:** scanning every user's `entries` on each page load
  won't scale. Prefer a **scheduled job** (Cloud Function / Cloud Scheduler,
  nightly) that computes daily rollups into an admin-only
  `adminMetrics/{YYYY-MM-DD}` collection (DAU, new users, check-in counts, opt-in
  %, pulse snapshot, etc.); the dashboard reads those rollups. Use
  **collection-group queries** (`entries`, `journal`) for the rollup.
- **UI:** a monitoring dashboard, not a document — KPI cards, time-series charts,
  cohort tables, a moderation list. Match Aluna's calm visual language if desired
  but function first.

---

## 8. Security & privacy requirements for the admin app itself

- Admin-only; enforce MFA on admin accounts if possible.
- **Audit log** every admin action, especially moderation deletes and any
  account disable, to an append-only collection.
- Minimize PII exposure: only surface `email`/`displayName` where genuinely
  needed; prefer counts and ids elsewhere.
- **Read-only by default.** The only permitted writes: (a) moderation removal of
  a community reflection; (b) optionally disabling an abusive Auth account.
- Never attempt decryption; never join reflections to authors.
- Keep the service-account credential server-side; the dashboard bundle must
  contain no secrets.
- App Check note: enforcement order matters — see the main app's `SECURITY.md`
  (turning App Check enforcement on before clients send tokens locks users out).
  The Admin SDK is unaffected by App Check.

---

## 9. Metrics quick-reference (ready to implement)

| KPI | Source | Read path |
|---|---|---|
| Total users | Auth | `listUsers()` |
| New sign-ups / day | Auth | `creationTime` |
| Onboarding completion % | Firestore | `users` where `onboardedAt != null` |
| DAU / WAU / MAU | Firestore | collection-group `entries.createdAt` (or Auth `lastSignInTime`) |
| Check-ins / day | Firestore | collection-group `entries` count by `createdAt` day |
| Streak distribution | Firestore | per-user `entries.createdAt` → reuse `analytics.currentStreak` |
| Community opt-in % | Firestore | `users` where `shareToCommunity == true` |
| Reminder adoption | Firestore | `users` where `reminderHour != null` |
| Journal adoption | Firestore | collection-group `journal` distinct uids |
| Aggregate mood trend | Firestore | `communityPulse/{day}` |
| Reflection volume | Firestore | `reflections` count by `createdAt` day |
| Moderation queue | Firestore | `reflections` orderBy `createdAt` desc (+ heuristics) |
| Ramble/Journey/Breathe use | **needs new events** | proposed `analytics/events` (main-app change) |
| Firestore/Auth ops health | GCP Monitoring | Cloud Monitoring / Firebase APIs |

---

## 10. Suggested MVP → later

- **MVP:** Admin auth + service account; user/growth KPIs; DAU/WAU/MAU;
  check-ins/day; community opt-in %; aggregate mood trend; reflection moderation
  list with delete. Nightly rollup job.
- **Later:** retention cohorts, streak histograms, per-feature adoption (after
  adding events), ops-health integration, audit-log viewer, alerting.

---

## 11. Confirm with the product owner before building

1. **Who are the admins?** (emails/UIDs to grant the `admin` claim.)
2. Nightly rollups acceptable, or is near-real-time required?
3. OK to add **content-free analytics events** to the main app so Ramble /
   Journey / Breathe adoption can be measured? (Recommended.)
4. Any data-retention / GDPR obligations for the metadata surfaced here?
5. Data residency / region for the service account and any new infra.
6. Should moderation be able to **disable** an abusive account, or only remove
   posts?

---

### Appendix — reference facts
- Emotion families (7): happy, surprised, bad, fearful, angry, disgusted, sad.
- Taxonomy sizes: ~82 emotions (3 levels), ~30 body parts, 9 thought patterns.
- Entry payload cap 200 KB; journal payload cap 400 KB (both ciphertext).
- `createdAt` is always a Firestore server timestamp (safe for time-series).
- Entries are append-only (no edits/updates); journal notes are editable.
