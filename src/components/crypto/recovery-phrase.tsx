"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PHRASE_ENTROPY_BITS } from "@/lib/crypto/keys";

interface RecoveryPhraseProps {
  phrase: string;
  onConfirmed: () => void;
  busy?: boolean;
}

/**
 * Shown once, at signup. This is the only moment the phrase exists anywhere
 * outside the wrapped key, so the screen is deliberately hard to skip past:
 * the continue button stays disabled until the checkbox is ticked.
 */
export function RecoveryPhrase({
  phrase,
  onConfirmed,
  busy,
}: RecoveryPhraseProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const words = phrase.split(" ");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(phrase);
      toast.success("Copied — now put it somewhere safe");
    } catch {
      toast.error("Couldn't copy. Write the words down instead.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-deep-50 text-deep-600 dark:bg-deep-900 dark:text-deep-200">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Your recovery phrase
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            Twelve words that can unlock your entries if you ever forget your
            password. Write them down now — this screen will not come back.
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-3xl border border-line bg-surface p-4">
        {words.map((word, index) => (
          <li
            key={`${word}-${index}`}
            className="flex items-baseline gap-2 text-sm"
          >
            <span className="w-5 shrink-0 text-right text-xs font-bold tabular-nums text-ink-subtle">
              {index + 1}
            </span>
            <span className="font-mono font-semibold tracking-tight text-ink">
              {word}
            </span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 text-sm font-bold text-deep-600 transition-colors hover:text-deep-500 dark:text-deep-300"
      >
        <Copy className="size-4" aria-hidden />
        Copy all twelve words
      </button>

      <div className="flex items-start gap-3 rounded-2xl border border-[#eec39a] bg-[#fbeada] p-4 text-[#8a4a17] dark:border-[#6b452b] dark:bg-[#33231a] dark:text-[#f0a468]">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="text-xs leading-relaxed font-semibold">
          Your entries are encrypted on this device before they are sent. Nobody
          else can read them — not us, not anyone with access to the database.
          That also means <strong>lose both your password and this phrase and
          your entries are gone permanently</strong>. There is no reset.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface p-3.5">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          className="sr-only"
        />
        <span
          aria-hidden
          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
            acknowledged
              ? "border-deep-600 bg-deep-600 text-white"
              : "border-line-strong bg-surface"
          }`}
        >
          {acknowledged && <Check className="size-3.5" strokeWidth={3.5} />}
        </span>
        <span className="text-sm font-semibold text-ink">
          I have saved these twelve words somewhere I can find them.
        </span>
      </label>

      <Button
        onClick={onConfirmed}
        disabled={!acknowledged}
        loading={busy}
        size="lg"
        fullWidth
      >
        Continue to Aluna
      </Button>

      <p className="text-center text-[11px] text-ink-subtle">
        {PHRASE_ENTROPY_BITS} bits of entropy · generated on this device
      </p>
    </div>
  );
}
