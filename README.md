# Aluna

A private daily check-in for your body, your emotions and your mind.

Most mood trackers ask how you feel on a scale of one to five. Aluna asks
*where* you feel it, *which* feeling it actually is out of eighty-two, and what
your mind has been doing — then shows you what that adds up to over weeks.

Every entry is encrypted on your device before it is sent. Nobody else can read
your check-ins, including whoever runs the app.

**Live at [aluna-2-0.vercel.app](https://aluna-2-0.vercel.app)**

---

## What you can do with it

The app is five tabs: **Home**, **Check-in**, **Tools**, **Community**,
**Profile**.

### Check in, quickly or properly

The quick path is the emotion wheel and a few optional context taps. The full
path adds a body scan, thought patterns and a guided reflection.

Both write the same kind of entry. Skipping a step costs you nothing.

### Name the feeling precisely

Aluna uses the Feelings Wheel: seven families, forty-one sub-categories,
**eighty-two specific emotions**. You start broad — happy, sad, angry — and
narrow until it fits.

The outer ring is where a feeling is actually chosen; the first two rings open
the next one in. Precision is the point. "Uneasy" and "dreading" ask for
different things, and noticing which one it is tends to be more useful than any
advice about it. You can pick as many as are true, including contradictory ones,
across different families.

### Log where the body feels it

Twenty-nine locations on a figure you can tap, each with an intensity from zero
to ten and room for a note. Bodies often notice before minds do.

### Get something back afterwards

Saving a check-in offers a short piece of writing about what you logged — what
that feeling tends to be like, and three ordinary things that can help. Written
in advance and reviewed, not generated (see *Why the guidance is hard-coded*).

Pleasant feelings get noticing rather than fixing. Nothing here treats a good
day as a problem to manage.

### Tools

The Tools tab gathers the four things that are not check-ins:

- **Regulate Now** — a five-step guided path through a feeling: Notice, Name it,
  Allow it, Understand, Choose. Self-contained; it writes nothing unless you
  ask it to.
- **Breathe** — four guided patterns (box, 4·7·8, coherent, extended exhale)
  with sound synthesised in the browser rather than shipped as audio files. A
  session ends with an optional grounding exercise: four senses, three things
  each.
- **Ramble** — say it out loud instead of typing. Transcription is done by your
  own browser or phone, so that part is *not* covered by Aluna's encryption; the
  note it saves is. The audio itself is never stored. The app says all of this
  before you start.
- **Journal** — a blank page, separate from check-ins, encrypted the same way.
  No prompts, no structure, no length anyone expects of you. Note previews stay
  hidden in the list until you ask for them.

### See what it adds up to

- **Insights** — mood trend, emotion distribution, a twenty-week grid, and
  plain-language observations about what your feelings travel with.
- **History** — a month calendar coloured by dominant feeling; tap any day.
- **Home** — the week as hatched bars, and a screen that takes the colour of
  whatever today has been.

Observations only appear once there is enough to draw on: ten entries overall,
four either side of any comparison, and a real gap between them. A pattern found
in four check-ins is noise, and saying it confidently would be worse than saying
nothing.

### Or don't, for a while

There is no streak to protect and no notification that can interrupt you. Home
counts *days logged out of the last seven* — a gap lowers the number and breaks
nothing, because there is no run to lose. The calendar shows the gaps honestly
rather than smoothing them over.

---

## Privacy

This is the part that shapes everything else.

Entry content — emotions, sensations, notes, journal — is encrypted in your
browser with a key derived from your password. **The key never reaches the
server.** A random data key does the encrypting and is stored only as two
wrapped copies: one sealed by your password, one by a twelve-word recovery
phrase shown once at signup.

Consequences worth knowing before you rely on it:

- Changing your password re-wraps the key. Instant, however many entries exist.
- Losing both the password and the phrase makes every entry permanently
  unreadable, by anyone. There is no reset and no backup.
- The key lives in memory only, so a reload asks you to unlock again. That is
  the whole trade, and the unlock screen says so.

What is *not* encrypted, because the app cannot work otherwise: your email,
display name, avatar, timestamps, preferences, and anything you deliberately
post to Community. The [privacy page](https://aluna-2-0.vercel.app/privacy)
says so plainly rather than implying everything is covered.

Deleting your account walks every subcollection under `users/{uid}` before
removing the profile and the auth user — in that order, because once the auth
user is gone nothing left behind can satisfy the security rules, and it would be
unreachable and undeletable forever.

See [SECURITY.md](SECURITY.md) for the threat model and the deployment
checklist.

---

## Running it

```bash
npm install
cp .env.local.example .env.local
```

Fill in the six `NEXT_PUBLIC_FIREBASE_*` values from **Project settings → Your
apps → Web app**. Then in the Firebase console:

1. Enable **Authentication → Sign-in method → Email/Password**.
2. Create a **Firestore** database.
3. Deploy the rules: `firebase deploy --only firestore:rules`.

```bash
npm run dev
```

Running without those keys is safe — the app shows a setup screen naming what is
missing rather than failing with an SDK error.

If you restrict the API key by website, add `localhost/*` alongside your
production domain or local development stops working. SECURITY.md covers this.

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `firebase deploy --only firestore:rules --dry-run` | Compiles the rules without deploying. Worth running before every rules change — a syntax error fails closed and locks out every user |
| `./scripts/vercel-env.sh` | Copies the `NEXT_PUBLIC_FIREBASE_*` values into the linked Vercel project |
| `node --experimental-strip-types scripts/verify-encryption.mjs` | Proves encryption end to end against the live project, on a throwaway account it then deletes |

The verification script signs in from Node, which sends no HTTP referrer. If the
API key is referrer-restricted the script cannot run — that failure is the
restriction working, not a bug.

---

## How it is put together

```
src/
  app/
    (auth)/            sign-in, sign-up
    (onboarding)/      welcome — auth gate, no app chrome
    (legal)/           privacy, terms — deliberately outside the auth gate
    (app)/             everything behind AuthGate:
                       dashboard, check-in, after, insights, history,
                       community, tools, breathe, ramble, journey,
                       journal, profile, settings, help
  components/
    breathe/           full-screen session, grounding
    check-in/          the steps, the emotion wheel, the body map
    community/         daily pulse, reflection wall
    crypto/            recovery phrase, unlock screen
    dashboard/         aura, hero, week wave, timelines, pattern metrics
    insights/          twenty-week grid
    layout/ profile/ ui/
  hooks/               live Firestore views, hydration, speech, media queries
  lib/
    crypto/            AES-GCM cipher, key envelope, wordlist, vault
    data/              emotions, body parts, breath patterns, guidance
    firebase/          config, auth, entries, journal, profile, community
    analytics.ts       aggregation
    insights.ts        observations, with sample floors
    wheel-geometry.ts  polar helpers shared by the wheel and the donut
```

### Data model

One document per check-in at `users/{uid}/entries/{entryId}`:

```ts
{ v: 1, payload: "<ciphertext>", createdAt: Timestamp }
```

`createdAt` stays in the clear because Firestore has to order and paginate on
it; a timestamp alone reveals only that the app was opened. Everything else —
including which emotion family it was — lives inside `payload`.

That has a cost worth naming: security rules cannot validate the shape of
something they cannot read. Ownership, append-only writes, an exact field list
and a size ceiling still hold server-side. The content limits moved to Zod on
the client, and `firestore.rules` says so rather than pretending otherwise.

Entries are append-only — a check-in records a moment, and editing it later
would make the history a worse record. Journal notes *are* editable, because a
piece of writing is a draft until its author says otherwise.

Every query is a single-field `orderBy("createdAt")`, which Firestore indexes
automatically. That is why `firestore.indexes.json` is empty; it is not an
oversight.

### Community, and how anonymity survives a raw query

Posts on the wall carry **no author id at all**. Ownership lives in a separate
top-level `reflectionAuthors/{reflectionId}` document that only its author can
read, written in the same batch as the post and immutable afterwards — so it
cannot be forged later to seize someone else's post, and anonymity holds against
someone querying the documents directly rather than relying on the UI to hide a
field.

The resonance count can only move in step with the caller's own acknowledgement
marker: +1 while creating it, −1 while removing it. One person can shift any
post's count by at most their single vote.

The daily pulse counts emotion families and nothing else — never the specific
feelings, the sensations, the notes, or your name. Adding to it requires writing
your own private contribution marker for that day in the same batch. That makes
once-a-day the ordinary case rather than a hard guarantee, and
`firestore.rules` explains exactly where the limit stops holding instead of
overstating it.

### The emotion wheel

Seven families → forty-one sub-categories → eighty-two emotions, all in
`src/lib/data/emotions.ts`. The wheel renders straight from that array, so
adding a feeling means editing data and nothing else.

A few labels repeat across branches — "Overwhelmed" under both Bad and Fearful.
That comes from the source wheel. Ids carry the whole lineage
(`sad.hurt.embarrassed`), so they stay distinct where the words do not.

### Charts

All hand-rolled SVG, no charting library. `HatchedBars` (diagonal hatch fill,
exactly one bar solid to mark today or the peak) and the distribution donut,
which reuses `ringSlicePath` from the wheel's own geometry. Each chart states
what its fills mean rather than leaving the encoding to be guessed.

This is deliberate. A charting library cost 324KB of JavaScript for a single
donut, built its sectors from a requestAnimationFrame sweep that never runs in a
background tab, and put its tooltip out of reach of screen readers.

### Why the guidance is hard-coded

An API would mean sending the user's emotional state to a third party on every
check-in — exactly the data the encryption exists to keep off other people's
servers. The promise on the signup screen would become a lie the moment it
shipped.

Fixed text also means every sentence can be reviewed before someone in a bad
state reads it, which matters where a confidently wrong line lands hard.

### Session audio

Synthesised at runtime. Each phase turn is a singing-bowl strike — a low
fundamental plus two quiet inharmonic partials, low-passed, slow attack — over a
swell of pink noise whose gain and filter follow the breath. An earlier version
glided between pitches and read as cartoonish.

### Animation

Structural state — which step is showing, which rings exist — is CSS-driven with
no `fill-mode`, so the interface renders at rest if an animation never runs.
Framer Motion is used only where a missing animation costs nothing.

### Theme

`next-themes` writes a class on `<html>`, and `globals.css` declares
`@custom-variant dark (&:where(.dark, .dark *))` so Tailwind's `dark:` follows
that class. Without it, Tailwind v4 resolves `dark:` against
`prefers-color-scheme`, which disagrees with anyone who has chosen Light while
their OS is dark.

### Headers

`next.config.ts` carries the static security headers and `src/middleware.ts` the
Content-Security-Policy, which needs a fresh nonce per request. The
Permissions-Policy denies camera, geolocation, payment, USB, magnetometer and
gyroscope outright; microphone is `(self)` because Ramble needs it. An empty
allowlist there denies the app its own microphone, which is not obvious from
reading it.

---

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Firebase Auth & Firestore ·
Web Crypto · Web Audio · Web Speech · Framer Motion · Zod · next-themes · Sonner

## Not a medical service

Aluna is a notebook for noticing how you feel. It does not diagnose anything and
is not a substitute for a doctor, a therapist or a crisis line. Support numbers
are listed under Help in the app, and linked from the Journal.
