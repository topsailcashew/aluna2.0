# Aluna

A calm, cloud-backed daily check-in for your body, your emotions and your mind.
Log where sensation lives, name what you feel on a three-level emotion wheel,
notice what your thoughts have been doing — then watch the patterns surface on a
personal dashboard.

Nothing is shared. Every entry belongs to the account that wrote it.

## Getting started

```bash
npm install
```

Create a Firebase project, then copy the config into your environment:

```bash
cp .env.local.example .env.local
```

Fill in the six `NEXT_PUBLIC_FIREBASE_*` values from **Project settings → Your
apps → Web app**. In the Firebase console also:

1. Enable **Authentication → Sign-in method → Email/Password**.
2. Create a **Firestore** database.
3. Deploy the security rules: `firebase deploy --only firestore:rules`.

Then:

```bash
npm run dev
```

Running without those keys is safe — the app shows a setup screen naming exactly
what is missing rather than failing with an SDK error.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## How it fits together

```
src/
  app/
    (auth)/            sign-in, sign-up
    (app)/             dashboard, check-in, breathe, profile — behind AuthGate
  components/
    breathe/           the full-screen guided session
    crypto/            recovery phrase, unlock screen
    check-in/          the three steps, the emotion wheel, the body map
    community/         the daily pulse and the reflection wall
    dashboard/         hero, week strip, tiles, charts, recent entries
    layout/            nav, header, theme, auth gate
    insights/          the twenty-week pixel grid
    profile/           avatar editor, theme choice, password and danger zones
    ui/                button, card, input, textarea, slider, skeleton…
  hooks/               live Firestore views, hydration and media-query helpers
  lib/
    data/              emotions (82), body parts (29), thought patterns (8),
                       breath patterns, weekly prompts
    crypto/            AES-GCM cipher, key envelope, wordlist, vault context
    firebase/          config, auth, entries, profile, account, community,
                       key envelope
    insights.ts        observations, with sample floors
    analytics.ts       dashboard aggregation
    breath-audio.ts    synthesised session tones (Web Audio)
    image.ts           client-side avatar resizing
    schemas.ts         Zod validation
    wheel-geometry.ts  polar maths for the wheel
```

### Data model

One document per check-in at `users/{uid}/entries/{entryId}`:

```ts
{
  sensations: { bodyPart: string; intensity: number; note: string }[],
  emotions: string[],        // "happy.peaceful.calm"
  primaryEmotions: string[], // denormalised for cheap aggregation
  subCategories: string[],   // ditto
  thoughtPatterns: string[],
  thoughtNote: string,
  createdAt: Timestamp,
}
```

Emotion ids are dotted paths, so a level-3 id carries its whole lineage. The
dashboard reads `primaryEmotions` and `subCategories` directly instead of
re-parsing every id on render.

Entries are append-only: `firestore.rules` allows create and delete for the
owner, and refuses updates. A check-in records a moment; editing it later would
make the history a worse record, not a better one.

### The emotion wheel

Follows the Feelings Wheel: seven primary families → 41 sub-categories (4–9
each) → 82 specific emotions (2 each), all in `src/lib/data/emotions.ts`. The
wheel renders straight from that structure, so adding a feeling means editing
the array and nothing else.

A handful of labels repeat across branches — "Overwhelmed" sits under both Bad
and Fearful, "Embarrassed" under both Sad and Disgusted. That comes from the
source wheel and is deliberate; ids carry the whole lineage
(`sad.hurt.embarrassed`), so they stay distinct even where the words do not.

Rings appear as you drill in rather than showing every label at once. Level-3
selection is multi-select and spans families — pick two contradictory feelings
if that is the truth — with counts rolling back up through the rings.

Label direction flips for slices on the left of the wheel so text never reads
upside down. The bound is inclusive at 270°, because a sub-category with
exactly two emotions centres a slice there.

### Session audio

Synthesised at runtime rather than shipped as files. Each phase turn plays a
singing-bowl strike — a low fundamental plus two quiet inharmonic partials,
low-passed, slow attack, long tail — over a swell of pink noise whose gain and
filter track the breath itself. An open fifth drones underneath. Nothing is
brighter than 2.2 kHz and nothing changes pitch mid-note; an earlier version
glided between pitches and read as cartoonish.

Structural state — which rings exist, which slices are dimmed, which step is on
screen — is driven by CSS transitions and animations that carry no fill-mode.
If an animation never runs, the interface still renders at rest. Framer Motion
is used only where a missing animation costs nothing (the entry/exit of pills).

### Security headers

`src/middleware.ts` sets a Content-Security-Policy with a per-request nonce;
`next.config.ts` carries the static headers (frame denial, nosniff, referrer
and permissions policy, COOP).

The nonce matters more here than it would elsewhere. Entries are end-to-end
encrypted, so the decryption key sits in JavaScript memory while the app is
open — an injected script would read the key and every decrypted entry with
it, not merely a session token. `script-src 'unsafe-inline'` would leave that
door open, so Next's bootstrap and next-themes' pre-paint script are nonced
and `strict-dynamic` lets them pull their own chunks.

The cost is that every route renders on demand rather than statically: reading
the nonce header opts the layout into dynamic rendering. Each page is an
auth-gated client shell with nothing worth caching, so this is cheap here — it
would not be on a content site.

`connect-src` names only the three Google endpoints the app actually uses, so
even a successful injection has nowhere to send what it reads. Styles keep
`unsafe-inline` — Tailwind and styled-jsx both need it, and injected CSS cannot
exfiltrate a CryptoKey.

### Screens

Four tabs — Home, Check-in, Breathe, Profile — with Profile acting as a hub
out to Insights, History, Community, Settings and Help. Analytics behind a
"Profile" label is a compromise; the alternative was six tabs on a 375px
screen.

Check-in has two paths. Quick is the wheel alone and saves in a tap; Full adds
the body scan, context tags, thought patterns and a guided journal. Both write
an identical entry — the quick one simply leaves the other fields empty, which
is also what skipping them does.

### Insights

Observations are held to a floor: ten entries overall, four on each side of any
comparison, and a fifteen-point gap before a difference is worth mentioning.
A mood app that announces a pattern from four check-ins is laundering noise
into advice, on a subject where people take advice seriously. Each observation
shows what it rests on.

### Community

Two things, both deliberately small. **Today's pulse** is one tally per emotion
family per day; contributing is opt-in and sends nothing but the family name.
**Reflections** is an anonymous wall with a weekly prompt — no names, no
avatars, no replies, and a single "resonates" acknowledgement rather than a
score to chase. A post carries its author's id so its author can delete it;
that id is never rendered, and the app says so on the page.

Rules keep the shared documents honest: a pulse write may move exactly one
family by exactly one, and a reflection is immutable apart from its
acknowledgement tally. What rules cannot do is prove someone has not already
counted today — a sibling write in the same batch is invisible to them — so
once-a-day is enforced client-side against a private marker. Inflating a mood
tally costs nobody anything; the alternative was a Cloud Function.

### Theme

`next-themes` writes a class on `<html>`, and `globals.css` declares
`@custom-variant dark (&:where(.dark, .dark *))` so Tailwind's `dark:` variant
follows that class. Without the custom variant, Tailwind v4 resolves `dark:`
against `prefers-color-scheme`, which quietly disagrees with a person who has
chosen Light while their OS is dark.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Firebase Auth &
Firestore · Recharts · Framer Motion · Zod · React Hook Form · next-themes ·
Sonner · Web Audio API
# aluna2.0
