"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { AVATAR_COLORS, prepareAvatar } from "@/lib/image";
import { cn } from "@/lib/utils";

interface AvatarEditorProps {
  name: string;
  avatarUrl: string;
  avatarColor: string;
  onChange: (changes: { avatarUrl?: string; avatarColor?: string }) => void;
}

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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar
            url={avatarUrl}
            color={avatarColor}
            name={name}
            className="size-20 rounded-3xl"
            textClassName="text-3xl"
          />
          {busy && (
            <span className="absolute inset-0 grid place-items-center rounded-3xl bg-black/45">
              <Loader2 className="size-5 animate-spin text-white" aria-hidden />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-line-strong disabled:opacity-50"
          >
            <Camera className="size-4" aria-hidden />
            {avatarUrl ? "Change picture" : "Upload a picture"}
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={() => onChange({ avatarUrl: "" })}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold text-ink-muted transition-colors hover:text-ink"
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

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Or pick a colour
        </p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Avatar colour">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={!avatarUrl && avatarColor === color}
              aria-label={`Colour ${color}`}
              onClick={() => onChange({ avatarColor: color, avatarUrl: "" })}
              className={cn(
                "size-9 rounded-full transition-transform",
                !avatarUrl && avatarColor === color
                  ? "ring-2 ring-deep-500 ring-offset-2 ring-offset-[var(--surface)]"
                  : "hover:scale-110",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-subtle">
        Your picture is resized on this device and stored with your own account.
        It is never shown to anyone else — not even in Community.
      </p>
    </div>
  );
}
