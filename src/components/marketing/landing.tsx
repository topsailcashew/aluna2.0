"use client";

import { useState } from "react";
import Link from "next/link";

import { AlunaMark } from "@/components/brand/aluna-mark";
import { EmotionWheel } from "@/components/check-in/emotion-wheel";
import { EmotionDistribution } from "@/components/dashboard/emotion-distribution";
import { HeroCheckIn } from "@/components/dashboard/hero-check-in";
import { PatternCard } from "@/components/dashboard/pattern-card";
import { WeekWave } from "@/components/dashboard/week-wave";
import { DEMO_ENTRIES } from "@/components/marketing/demo-data";
import { PhoneFrame, Photo } from "@/components/marketing/frames";
import { daysLoggedThisWeek, weekStrip } from "@/lib/analytics";
import { useAuth } from "@/lib/firebase/auth-context";
import { labelOf, primaryOf } from "@/lib/data/emotions";

/**
 * The public landing page at /, shown to everyone. Signed-in visitors get the
 * same page with its calls to action pointed at the app instead of at signup.
 *
 * Two rules held throughout. Show rather than tell: the hero is the working
 * emotion wheel and the previews are the real dashboard components, so the
 * page argues by letting you use the thing instead of describing it. And keep
 * the prose short — every section is a heading, a line, and something to look
 * at.
 *
 * Deliberately absent: the stat row the category runs on. An app that tells
 * people a pattern found in four check-ins is noise cannot open with a
 * manufactured "5,000+ people feeling lighter" and still be believed.
 */
export function Landing() {
  const [tried, setTried] = useState<string[]>([]);
  const { user } = useAuth();

  /**
   * Anyone already signed in is not a prospect, so the buttons stop selling and
   * start being useful. While auth is still resolving `user` is null, which is
   * the right guess for a landing page and costs a signed-in visitor one
   * relabel rather than everyone a spinner.
   */
  const cta = user
    ? { href: "/dashboard", label: "Open Aluna" }
    : { href: "/sign-up", label: "Start a check-in" };

  return (
    <div className="min-h-dvh text-ink">
      <SiteNav signedIn={Boolean(user)} />
      <main>
        <Hero tried={tried} onTry={setTried} cta={cta} />
        <Inside />
        <InTheDay />
        <Privacy />
        <Restraint />
        <Close cta={cta} />
      </main>
      <SiteFooter />
    </div>
  );
}

interface Cta {
  href: string;
  label: string;
}

/* ------------------------------------------------------------------ */

function SiteNav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <span className="flex items-center gap-2.5">
        <AlunaMark size={26} />
        <span className="font-display text-lg tracking-tight">Aluna</span>
      </span>

      <nav aria-label="Page sections" className="hidden gap-7 sm:flex">
        <a href="#inside" className="nav-link">
          Inside the app
        </a>
        <a href="#privacy" className="nav-link">
          Privacy
        </a>
      </nav>

      <Link
        href={signedIn ? "/dashboard" : "/sign-in"}
        className="rounded-full border border-line-strong px-4 py-2 text-sm font-bold transition-colors hover:bg-surface"
      >
        {signedIn ? "Open Aluna" : "Sign in"}
      </Link>
    </header>
  );
}

/* ------------------------------------------------------------------ */

function Hero({
  tried,
  onTry,
  cta,
}: {
  tried: string[];
  onTry: (next: string[]) => void;
  cta: Cta;
}) {
  const named = tried.map((id) => ({
    id,
    label: labelOf(id),
    color: primaryOf(id)?.color ?? "var(--ink)",
  }));

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16 sm:px-8 sm:pt-14 sm:pb-24">
      {/* Three grid children, so a phone gets headline → wheel → copy and the
          product is visible without scrolling past the pitch first. On desktop
          the wheel spans both rows in the second column instead. */}
      <div className="grid gap-7 sm:gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] lg:items-center lg:gap-x-14 lg:gap-y-6">
        <h1 className="max-w-[13ch] font-display text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.95] tracking-[-0.035em] text-balance lg:col-start-1 lg:row-start-1">
          Finally, a word for it.
        </h1>

        <div className="w-full lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="rounded-[2.25rem] border border-line bg-surface/60 p-4 shadow-card backdrop-blur-sm sm:p-7">
            {/* Opened on a family so the rings arrive populated: a hero that
                promises precision should not show one ring inside two empty
                placeholders. */}
            <EmotionWheel
              value={tried}
              onChange={onTry}
              initialOpen={{ family: "happy" }}
            />

            {named.length > 0 && (
              <ul className="mt-4 flex flex-wrap justify-center gap-2 border-t border-line pt-4">
                {named.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-full px-3 py-1.5 text-sm font-bold text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="max-w-[34rem] lg:col-start-1 lg:row-start-2">
          <p className="max-w-[38ch] text-lg leading-relaxed text-ink-muted">
            Not a number out of five. Eighty-two feelings to choose from, a
            body to point at, and a private record of what it adds up to.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={cta.href}
              className="rounded-full bg-marker px-6 py-3.5 text-sm font-bold text-marker-ink transition-transform active:scale-[0.98]"
            >
              {cta.label}
            </Link>
            <a
              href="#inside"
              className="rounded-full border border-line-strong px-6 py-3.5 text-sm font-bold transition-colors hover:bg-surface"
            >
              Look inside
            </a>
          </div>

          <p className="mt-5 text-sm text-ink-subtle">
            Free. Encrypted on your device. No streaks, no notifications.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The real dashboard components, rendered with demo data inside phone shells.
 * Not screenshots — a screenshot is out of date the moment a chart changes,
 * and nobody ever remembers to retake it.
 */
function Inside() {
  const days = weekStrip(DEMO_ENTRIES);
  const logged = daysLoggedThisWeek(DEMO_ENTRIES);

  return (
    <section id="inside" className="scroll-mt-8 border-y border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-tight tracking-[-0.025em] text-balance">
          A minute a day, and it starts telling you things.
        </h2>

        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
          <PhoneFrame label="Home, coloured by your day">
            <div className="space-y-3">
              <HeroCheckIn
                accent="#5662B9"
                checkedInToday
                familyLabel="Fearful"
                daysLogged={logged}
              />
              <WeekWave days={days} entries={DEMO_ENTRIES} />
            </div>
          </PhoneFrame>

          <PhoneFrame label="What keeps coming back">
            <PatternCard entries={DEMO_ENTRIES} />
          </PhoneFrame>

          <PhoneFrame label="The shape of a fortnight">
            <EmotionDistribution entries={DEMO_ENTRIES} />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Photography slots.
 *
 * Set `src` to a file under /public and the panel becomes that photograph.
 * Until then each renders as a brand wash rather than a hole, so the page is
 * finished either way. Shoot or licence portrait, 4:5, around 1200x1500.
 */
const MOMENTS = [
  {
    src: null,
    alt: "Someone checking in on their phone at a kitchen table in the morning",
    caption: "Before the day starts",
  },
  {
    src: null,
    alt: "A person on a sofa, phone in hand, part-way through a check-in",
    caption: "Or after it has gone wrong",
  },
  {
    src: null,
    alt: "Close-up of hands holding a phone showing the Aluna emotion wheel",
    caption: "Wherever you actually are",
  },
];

function InTheDay() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
      <h2 className="max-w-[18ch] font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-tight tracking-[-0.025em] text-balance">
        It fits in the gaps.
      </h2>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {MOMENTS.map((moment) => (
          <figure key={moment.caption}>
            <Photo src={moment.src} alt={moment.alt} />
            <figcaption className="mt-3 text-sm font-semibold text-ink-muted">
              {moment.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Privacy() {
  return (
    <section
      id="privacy"
      // The page's one dark, serious moment. In dark mode that device inverts:
      // a darker band would vanish into the canvas, so it steps up instead.
      className="scroll-mt-8 bg-deep-900 text-deep-50 dark:bg-deep-800"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div>
            <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.4vw,3.1rem)] leading-[1.02] tracking-[-0.025em] text-balance">
              Your feelings are yours. Alone.
            </h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-deep-100">
              Everything you write is locked on your own device before it is
              sent. We hold it and we cannot open it — not our team, not
              somebody who breaks in, not anybody who asks. There is nothing on
              our side to read it with.
            </p>
            <Link
              href="/privacy"
              className="mt-8 inline-block rounded-full border border-deep-600 px-5 py-3 text-sm font-bold transition-colors hover:bg-deep-800 dark:hover:bg-deep-700"
            >
              How that works
            </Link>
          </div>

          <p className="self-center border-l-2 border-deep-600 pl-5 leading-relaxed text-deep-100">
            The honest catch: lose your password and your recovery phrase and it
            is gone for good. We cannot reset it, because we never had it.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const WONT: [string, string][] = [
  [
    "No streaks.",
    "Miss a week and nothing breaks. The calendar shows the gaps instead of hiding them.",
  ],
  [
    "No notifications.",
    "It waits for you. Nothing here interrupts your evening to protect its own numbers.",
  ],
  [
    "No AI reading your entries.",
    "What you get back was written and checked by people, in advance. Your feelings go nowhere to be interpreted.",
  ],
];

function Restraint() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <h2 className="max-w-[20ch] font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-tight tracking-[-0.025em] text-balance">
          Built to be put down.
        </h2>
        <dl className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-3">
          {WONT.map(([title, body]) => (
            <div key={title}>
              <dt className="font-display text-xl tracking-tight">{title}</dt>
              <dd className="mt-2 max-w-[38ch] leading-relaxed text-ink-muted">
                {body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Close({ cta }: { cta: Cta }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 text-center sm:px-8">
      <h2 className="mx-auto max-w-[16ch] font-display text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.0] tracking-[-0.03em] text-balance">
        Start with one word for today.
      </h2>
      <Link
        href={cta.href}
        className="mt-9 inline-block rounded-full bg-marker px-7 py-4 font-bold text-marker-ink transition-transform active:scale-[0.98]"
      >
        {cta.label}
      </Link>
      <p className="mt-5 text-sm text-ink-subtle">
        Leave whenever you like — deleting your account takes every entry with
        it.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="max-w-[52ch] text-sm leading-relaxed text-ink-muted">
          Aluna is a notebook for noticing how you feel. It does not diagnose
          anything and is not a substitute for a doctor, a therapist or a
          crisis line.
        </p>
        <nav aria-label="Legal" className="flex gap-6 text-sm font-semibold">
          <Link href="/privacy" className="nav-link">
            Privacy
          </Link>
          <Link href="/terms" className="nav-link">
            Terms
          </Link>
          <Link href="/sign-in" className="nav-link">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
