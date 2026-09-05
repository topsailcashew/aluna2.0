import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Aluna stores, what it cannot read, and how to remove it.",
};

/**
 * Written from what the code actually does. Every claim here is checkable
 * against src/lib/crypto and firestore.rules — if the implementation changes,
 * this page has to change with it.
 */
export default function PrivacyPage() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Privacy
        </h1>
        <p className="text-sm text-ink-muted">
          Last updated 5 September 2026. Aluna is a personal project, not a
          company.
        </p>
      </header>

      <Section title="The short version">
        <p>
          Your check-ins are encrypted on your device before they are sent.
          Nobody else can read them — not the person who runs this app, not
          anyone with access to the database. There is no advertising, no
          analytics, no tracking, and nothing is sold or shared.
        </p>
      </Section>

      <Section title="What is encrypted">
        <p>
          Everything you write in a check-in: the emotions you choose, the body
          sensations and their notes, the thought patterns, the context tags and
          the journal answers. These are encrypted in your browser with a key
          derived from your password. That key never reaches the server.
        </p>
        <p>
          A twelve-word recovery phrase, shown once at signup, is the only other
          thing that can unlock them. If you lose both your password and that
          phrase, your entries cannot be recovered by anyone, including us.
        </p>
      </Section>

      <Section title="What is not encrypted">
        <p>These are stored in readable form, because the app cannot work otherwise:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Your email address, used to sign you in.</li>
          <li>Your display name and, if you upload one, your profile picture.</li>
          <li>
            The date and time of each check-in, which the database needs in
            order to sort and page through them. A timestamp on its own says
            only that you opened the app.
          </li>
          <li>Your reminder and theme preferences.</li>
          <li>
            Anything you deliberately post in Community. Those posts carry no
            name and no picture, but they are readable by other signed-in
            people, because that is the point of them. Your account id is stored
            with a post so you can delete it later; it is never shown.
          </li>
          <li>
            If you switch on the community pulse, one emotion family per day —
            the word &ldquo;Sad&rdquo;, not the specific feelings or anything
            else from the entry.
          </li>
        </ul>
      </Section>

      <Section title="Who else is involved">
        <p>
          Two companies process data on Aluna&apos;s behalf. Google Firebase
          handles sign-in and stores the database; Vercel hosts the site and
          serves it. Both can see the unencrypted items listed above and the
          ciphertext of your entries. Neither can read your entries.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          Aluna sets no advertising or tracking cookies, so there is no consent
          banner. Firebase keeps a sign-in token in your browser&apos;s storage
          so you are not signed out on every visit, and your theme choice is
          saved locally. Both are strictly necessary for the app to function.
        </p>
        <p>
          Your decryption key is held only in memory and is never written to
          storage. That is why you are asked to unlock after a reload.
        </p>
      </Section>

      <Section title="Keeping and removing it">
        <p>
          Entries stay until you remove them. Settings has an export that
          decrypts everything on your device and saves it as a JSON file, and a
          delete that removes every entry, your profile and the account itself.
          Deletion is immediate and cannot be undone — there is no backup to
          restore from.
        </p>
      </Section>

      <Section title="This is not a medical service">
        <p>
          Aluna is a notebook for noticing how you feel. It is not a medical
          device, it does not diagnose anything, and it is not a substitute for
          a doctor, a therapist or a crisis service.
        </p>
      </Section>

      <Section title="Changes and questions">
        <p>
          If what Aluna stores ever changes, this page changes with it. Aluna is
          a personal project with no support desk; questions and corrections are
          best raised on the project&apos;s repository.
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
