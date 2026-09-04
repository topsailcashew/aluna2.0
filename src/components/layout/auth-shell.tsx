import Link from "next/link";
import type { ReactNode } from "react";

/** Shared chrome for sign-in and sign-up: mark, headline, form, footer link. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="space-y-7">
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-grid size-12 place-items-center rounded-2xl bg-deep-700 text-xl font-black text-white"
          aria-label="Aluna home"
        >
          A
        </Link>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">{subtitle}</p>
        </div>
      </div>

      <div className="card p-6">{children}</div>

      <p className="text-center text-sm text-ink-muted">{footer}</p>
    </div>
  );
}
