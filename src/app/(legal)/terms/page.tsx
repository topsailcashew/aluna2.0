import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "What Aluna is, what it is not, and what is expected of you.",
};

export default function TermsPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-display text-ink">
          Terms
        </h1>
        <p className="text-sm text-ink-muted">
          Last updated 5 September 2026. Plain language, because obscure terms
          on a mental-health app would be its own kind of problem.
        </p>
      </header>

      <Section title="What Aluna is">
        <p>
          A private notebook for noticing how you feel. It is a personal
          project, offered free and as-is, with no company behind it and no
          support desk.
        </p>
      </Section>

      <Section title="What Aluna is not">
        <p>
          It is not a medical device and not a health service. It does not
          diagnose, treat or monitor any condition, and nothing it shows you is
          clinical advice. It is not a substitute for a doctor, a therapist or a
          crisis line. If you are in immediate danger, contact your local
          emergency number.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You need a working email address and a password you can remember. That
          password also derives the key to your entries, so it cannot be reset
          for you — the twelve-word recovery phrase shown at signup is the only
          other way in. Keep both somewhere safe. If you lose them, your entries
          are unreadable permanently, and no request to anyone can recover them.
        </p>
      </Section>

      <Section title="Community">
        <p>
          Posts in Community are anonymous but visible to everyone signed in.
          Do not post anything identifying about yourself or anybody else, and
          do not post abuse, harassment, or content encouraging self-harm. Posts
          that do may be removed. You can delete your own posts at any time.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          Aluna is provided without warranty of any kind. It may be unavailable,
          may lose data, and may stop being maintained. Because entries are
          encrypted with a key only you hold, nobody can recover them on your
          behalf if something goes wrong at your end. Export anything you would
          be upset to lose.
        </p>
      </Section>

      <Section title="Ending it">
        <p>
          Delete your account in Settings whenever you like; it removes every
          entry and the account itself, immediately and permanently. Accounts
          used to abuse others may be removed without notice.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          These terms may change as the app does. The date at the top says when
          they last did.
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-extrabold tracking-tight text-ink">
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}
