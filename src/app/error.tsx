"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

/**
 * Catches a render failure anywhere inside the app shell.
 *
 * The error is logged to the console and nowhere else. Sending it to a
 * third-party service would be the obvious next step, but React error
 * messages routinely carry the props that caused them — which here means
 * decrypted journal text. See SECURITY.md for what safe error reporting on
 * this app would have to look like.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Aluna hit an error while rendering:", error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-display text-ink">
          Something went wrong on this screen
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Your entries are unaffected — they are stored encrypted and nothing
          here touches them. Trying again usually clears it.
        </p>
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-deep-700 px-5 py-3 text-sm font-bold text-white"
          >
            <RotateCw className="size-4" aria-hidden />
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 text-xs font-bold text-ink-muted hover:text-ink"
          >
            Back to home
          </a>
        </div>
        {error.digest && (
          <p className="pt-2 font-mono text-[11px] text-ink-subtle">
            Reference {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
