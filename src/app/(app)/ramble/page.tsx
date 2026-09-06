"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Mic, Save, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useAuth } from "@/lib/firebase/auth-context";
import { useVault } from "@/lib/crypto/vault";
import { createNote } from "@/lib/firebase/journal";

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RamblePage() {
  const { user } = useAuth();
  const { dataKey } = useVault();
  const router = useRouter();
  const { supported, listening, finalText, error, start, stop, reset, setText } =
    useSpeechRecognition();
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const hasText = finalText.trim().length > 0;

  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [listening]);

  const begin = () => {
    setElapsed(0);
    start();
  };

  const save = async () => {
    if (!user || !dataKey) {
      toast.error("Your journal is locked. Unlock it and try again.");
      return;
    }
    if (!hasText) {
      toast.error("Nothing to save yet.");
      return;
    }
    setSaving(true);
    try {
      const title = `Ramble · ${new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`;
      await createNote(user.uid, dataKey, { title, body: finalText.trim() });
      toast.success("Saved to your journal");
      router.push("/journal");
    } catch {
      toast.error("Could not save that. Your words are still on screen.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-32">
      <BackHeader
        eyebrow="Tools"
        title="Ramble"
        subtitle="Say it out loud — we write it down"
      />

      {error && (
        <p className="rounded-2xl bg-surface-sunken px-4 py-3 text-center text-xs font-semibold text-[#d75046]">
          {error}
        </p>
      )}

      {!hasText ? (
        /* Idle — just the invitation to start. */
        <div className="flex flex-col items-center gap-4 py-10">
          <button
            type="button"
            onClick={begin}
            disabled={!supported}
            aria-label="Start talking"
            className="grid size-28 place-items-center rounded-full bg-[var(--color-deep-600)] text-white shadow-lift transition-transform active:scale-95 disabled:opacity-40"
          >
            <Mic className="size-10" aria-hidden />
          </button>
          <p className="max-w-[26ch] text-center text-sm font-semibold text-ink-muted">
            {supported
              ? "Tap and start talking. Nothing appears until you finish."
              : "Speech isn't available on this browser — you can still type below."}
          </p>
          {!supported && (
            <textarea
              value={finalText}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type whatever's on your mind…"
              className="min-h-[14rem] w-full resize-none rounded-3xl border border-line bg-surface px-4 py-4 text-sm leading-relaxed text-ink placeholder:text-ink-subtle focus:border-deep-400 focus:ring-2 focus:ring-deep-400/25 focus:outline-none"
            />
          )}
        </div>
      ) : (
        /* Review — the transcript, revealed only once you're done talking. */
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="px-1 text-xs font-semibold text-ink-muted">
              Here&apos;s what you said — edit anything before saving
            </p>
            <textarea
              value={finalText}
              onChange={(event) => setText(event.target.value)}
              className="min-h-[18rem] w-full resize-none rounded-3xl border border-line bg-surface px-4 py-4 text-sm leading-relaxed text-ink focus:border-deep-400 focus:ring-2 focus:ring-deep-400/25 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} loading={saving} size="lg" className="flex-1">
              <Save className="size-4" aria-hidden />
              Add to journal
            </Button>
            {supported && (
              <Button onClick={begin} size="lg" variant="secondary">
                <Mic className="size-4" aria-hidden />
                Say more
              </Button>
            )}
            <Button
              onClick={reset}
              size="lg"
              variant="secondary"
              aria-label="Clear"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}

      <p className="px-1 text-xs leading-relaxed text-ink-subtle">
        Transcription is handled by your browser or phone, so those words pass
        through its speech service — it isn&apos;t part of Aluna&apos;s
        encryption. The note you save is encrypted like everything else, and the
        audio is never stored.
      </p>

      {/* Recording — a full-screen focus with no words on screen. */}
      {listening && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-[var(--canvas)]/95 px-6 backdrop-blur-xl">
          <div className="relative grid size-52 place-items-center">
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-[#d75046]/20"
            />
            <span
              aria-hidden
              className="absolute inset-8 animate-ping rounded-full bg-[#d75046]/25"
              style={{ animationDelay: "0.4s" }}
            />
            <span className="relative grid size-28 place-items-center rounded-full bg-[#d75046] text-white shadow-lift">
              <Mic className="size-12" aria-hidden />
            </span>
          </div>

          <div className="space-y-1 text-center">
            <p className="stat text-4xl text-ink">{clock(elapsed)}</p>
            <p className="text-sm text-ink-muted">
              Listening… say what&apos;s on your mind.
            </p>
          </div>

          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--marker)] px-8 py-4 text-base font-bold text-[var(--marker-ink)] shadow-lift transition-transform active:scale-95"
          >
            <Square className="size-4" fill="currentColor" aria-hidden />
            Done
          </button>
          <p className="text-xs text-ink-subtle">
            <Check className="mr-1 inline size-3" aria-hidden />
            Your words appear when you finish
          </p>
        </div>
      )}
    </div>
  );
}
