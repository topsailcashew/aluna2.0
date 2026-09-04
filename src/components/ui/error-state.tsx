"use client";

import { CloudOff, RotateCw, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Two shapes of bad news, worded differently on purpose.
 *
 * Offline is not an error — Firestore holds the write locally and sends it
 * when the connection returns — so it gets a calm note rather than a warning
 * colour. A genuine failure gets the warmer treatment and a retry.
 */
export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-[#f0c2bd] bg-[#fdecea] p-4 text-[#8d3b32] dark:border-[#6b3630] dark:bg-[#3a201d] dark:text-[#f3b8b1]",
        className,
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-xs leading-relaxed font-semibold">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-white dark:bg-black/25 dark:hover:bg-black/40"
          >
            <RotateCw className="size-3" aria-hidden />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function OfflineNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl bg-surface-sunken p-3.5 text-ink-muted",
        className,
      )}
    >
      <CloudOff className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="text-xs leading-relaxed font-semibold">
        You are offline. Anything you write is kept on this device and sent as
        soon as you are back — nothing is lost.
      </p>
    </div>
  );
}
