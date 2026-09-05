"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { prepareAvatar } from "@/lib/image";

interface AvatarEditorProps {
  name: string;
  avatarUrl: string;
  avatarColor: string;
  onChange: (changes: { avatarUrl?: string }) => void;
}

/**
 * Picture only. The colour swatches went: an avatar nobody else ever sees did
 * not need a palette, and the choice was crowding the one control that matters.
 * Accounts without a picture keep the initial on whatever colour they already
 * had, so nothing regressed for anyone who picked one.
 */
export function AvatarEditor({
  name,
  avatarUrl,
  avatarColor,
  onChange,
}: AvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }

    setBusy(true);
    try {
      onChange({ avatarUrl: await prepareAvatar(file) });
      toast.success("Picture updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not read that image.",
      );
    } finally {
      setBusy(false);
      // Allow re-picking the same file straight after a failure.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <Avatar
          url={avatarUrl}
          color={avatarColor}
          name={name}
          className="size-16 rounded-3xl"
          textClassName="text-2xl"
        />
        {busy && (
          <span className="absolute inset-0 grid place-items-center rounded-3xl bg-black/45">
            <Loader2 className="size-5 animate-spin text-white" aria-hidden />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-3.5 py-2 text-sm font-bold text-ink transition-colors hover:border-line-strong disabled:opacity-50"
        >
          <Camera className="size-4" aria-hidden />
          {avatarUrl ? "Change picture" : "Upload a picture"}
        </button>

        {avatarUrl && (
          <button
            type="button"
            onClick={() => onChange({ avatarUrl: "" })}
            className="inline-flex items-center gap-1.5 px-1 text-xs font-bold text-ink-muted transition-colors hover:text-ink"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Remove
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void pickFile(event.target.files?.[0])}
        />
      </div>
    </div>
  );
}
