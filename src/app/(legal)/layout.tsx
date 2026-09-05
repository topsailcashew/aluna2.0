import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Deliberately outside the auth gate. A privacy policy you have to create an
 * account to read is not a privacy policy.
 */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 py-10">
      <Link
        href="/"
        className="inline-grid size-10 place-items-center rounded-2xl bg-deep-700 text-lg font-black text-white"
        aria-label="Aluna home"
      >
        A
      </Link>
      <div className="mt-6 space-y-6">{children}</div>
      <footer className="mt-12 flex gap-4 border-t border-line pt-6 text-xs font-semibold text-ink-muted">
        <Link href="/privacy" className="hover:text-ink">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-ink">
          Terms
        </Link>
        <Link href="/" className="hover:text-ink">
          Aluna
        </Link>
      </footer>
    </main>
  );
}
