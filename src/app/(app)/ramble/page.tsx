"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mic, Save, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useAuth } from "@/lib/firebase/auth-context";
import { useVault } from "@/lib/crypto/vault";
import { createNote } from "@/lib/firebase/journal";
import { cn } from "@/lib/utils";

export default function RamblePage() {
  const { user } = useAuth();
  const { dataKey } = useVault();
  const router = useRouter();
  const { supported, listening, finalText, interim, error, start, stop, reset, setText } =
    useSpeechRecognition();
  const [saving, setSaving] = useState(false);

  const hasText = finalText.trim().length > 0;

  const save = async () => {
    if (!user || !dataKey) {
      toast.error("Your journal is locked. Unlock it and try again.");
      return;
    }
    if (!hasText) {
      toast.error("Nothing to save yet.");
      return;
    }
    if (listening) stop();
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

      {/* Mic */}
      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          onClick={listening ? stop : start}
          disabled={!supported}
          aria-label={listening ? "Stop" : "Start talking"}
          aria-pressed={listening}
          className={cn(
            "relative grid size-24 place-items-center rounded-full text-white shadow-lift transition-transform active:scale-95 disabled:opacity-40",
            listening ? "bg-[#d75046]" : "bg-[var(--color-deep-600)]",
          )}
        >
          {listening && (
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-[#d75046]/40"
            />
          )}
          {listening ? (
            <Square className="size-8" fill="currentColor" aria-hidden />
          ) : (
            <Mic className="size-9" aria-hidden />
          )}
        </button>
        <p className="text-sm font-semibold text-ink-muted">
          {!supported
            ? "Speech isn't available here — you can still type below"
            : listening
              ? "Listening… tap to pause"
              : hasText
                ? "Tap to keep going"
                : "Tap and start talking"}
        </p>
      </div>

      {error && (
        <p className="rounded-2xl bg-surface-sunken px-4 py-3 text-center text-xs font-semibold text-[#d75046]">
          {error}
        </p>
      )}

      {/* Transcript — editable, with the live interim shown beneath. */}
      <div className="space-y-1.5">
        <textarea
          value={finalText}
          onChange={(event) => setText(event.target.value)}
          placeholder="Your words will appear here. You can edit them before saving."
          className="min-h-[16rem] w-full resize-none rounded-3xl border border-line bg-surface px-4 py-4 text-sm leading-relaxed text-ink placeholder:text-ink-subtle focus:border-deep-400 focus:ring-2 focus:ring-deep-400/25 focus:outline-none"
        />
        {interim && (
          <p className="px-1 text-sm leading-relaxed text-ink-subtle italic">
            {interim}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={save} loading={saving} size="lg" fullWidth disabled={!hasText}>
          <Save className="size-4" aria-hidden />
          Add to journal
        </Button>
        {hasText && (
          <Button
            onClick={reset}
            size="lg"
            variant="secondary"
            aria-label="Clear"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        )}
      </div>

      <p className="px-1 text-xs leading-relaxed text-ink-subtle">
        Transcription is handled by your browser or phone, so those words pass
        through its speech service — it isn&apos;t part of Aluna&apos;s
        encryption. The note you save is encrypted like everything else, and the
        audio is never stored.
      </p>
    </div>
  );
}
