import Link from "next/link";
import type { ReactNode } from "react";

import { AlunaMark } from "@/components/brand/aluna-mark";

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
          className="inline-grid size-14 place-items-center rounded-2xl bg-surface shadow-card"
          aria-label="Aluna home"
        >
          <AlunaMark size={38} />
        </Link>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-display text-ink">
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
