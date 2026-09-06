"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LifeBuoy,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { BackHeader } from "@/components/layout/back-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { useJournal } from "@/hooks/use-journal";
import { useVault } from "@/lib/crypto/vault";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  createNote,
  deleteNote,
  updateNote,
  type JournalNote,
} from "@/lib/firebase/journal";
import { formatDateTime, relativeTime } from "@/lib/utils";

type Editing = { id: string | null; title: string; body: string } | null;

export default function JournalPage() {
  const { user } = useAuth();
  const { dataKey } = useVault();
  const { notes, loading, error } = useJournal();

  const [editing, setEditing] = useState<Editing>(null);
  const [saving, setSaving] = useState(false);
  const [reading, setReading] = useState<JournalNote | null>(null);

  /**
   * Previews stay off until asked for. A journal invites the kind of writing
   * you would not want legible to someone glancing over your shoulder, and the
   * list is the one screen where several entries are on show at once.
   *
   * Read through useSyncExternalStore rather than an effect: this route is
   * server-rendered, so the first client render has to agree with the server's
   * (previews off) before localStorage gets a say.
   */
  const showPreviews = useSyncExternalStore(
    subscribePreviews,
    readPreviews,
    () => false,
  );

  const save = async () => {
    if (!user || !dataKey || !editing) return;
    if (!editing.body.trim() && !editing.title.trim()) {
      toast.error("Nothing to save yet.");
      return;
    }

    setSaving(true);
    try {
      const content = { title: editing.title, body: editing.body };
      if (editing.id) {
        await updateNote(user.uid, dataKey, editing.id, content);
        toast.success("Saved");
      } else {
        await createNote(user.uid, dataKey, content);
        toast.success("Written down");
      }
      setEditing(null);
      setReading(null);
    } catch {
      toast.error("Could not save that. Your writing is still on screen.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (note: JournalNote) => {
    if (!user) return;
    try {
      await deleteNote(user.uid, note.id);
      setReading(null);
      toast.success("Deleted");
    } catch {
      toast.error("Could not delete that.");
    }
  };

  /* ---------------------------------------------------------------- */
  /* Composer                                                          */
  /* ---------------------------------------------------------------- */

  if (editing) {
    return (
      <div className="space-y-4 pb-28">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(null)}
            aria-label="Close without saving"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card"
          >
            <X className="size-4" aria-hidden />
          </button>
          <h1 className="flex-1 text-center text-lg font-extrabold tracking-tight text-ink">
            {editing.id ? "Edit note" : "New note"}
          </h1>
          <span className="size-10 shrink-0" aria-hidden />
        </div>

        <Input
          label="Title"
          placeholder="Optional"
          value={editing.title}
          maxLength={120}
          onChange={(event) =>
            setEditing({ ...editing, title: event.target.value })
          }
        />

        <div className="space-y-1.5">
          <label
            htmlFor="journal-body"
            className="block text-xs font-semibold text-ink-muted"
          >
            Whatever you like
          </label>
          <textarea
            id="journal-body"
            value={editing.body}
            autoFocus
            onChange={(event) =>
              setEditing({ ...editing, body: event.target.value })
            }
            placeholder="No prompt, no structure. Nobody reads this but you — it is encrypted before it leaves the device."
            className="min-h-[22rem] w-full resize-none rounded-3xl border border-line bg-surface px-4 py-4 text-sm leading-relaxed text-ink placeholder:text-ink-subtle focus:border-deep-400 focus:ring-2 focus:ring-deep-400/25 focus:outline-none"
          />
          <p className="text-right text-xs text-ink-subtle tabular-nums">
            {editing.body.length} characters
          </p>

          <SupportLink />
        </div>

        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.9rem)] z-30 px-4">
          <div className="mx-auto max-w-lg rounded-4xl border border-line bg-surface/90 p-3.5 shadow-lift backdrop-blur-xl">
            <Button onClick={save} loading={saving} size="lg" fullWidth>
              {editing.id ? "Save changes" : "Save note"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Reader                                                            */
  /* ---------------------------------------------------------------- */

  if (reading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReading(null)}
            aria-label="Back to journal"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card"
          >
            <X className="size-4" aria-hidden />
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() =>
              setEditing({
                id: reading.id,
                title: reading.title,
                body: reading.body,
              })
            }
            aria-label="Edit this note"
            className="grid size-10 place-items-center rounded-full bg-surface text-ink-muted shadow-card hover:text-ink"
          >
            <Pencil className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => void remove(reading)}
            aria-label="Delete this note"
            className="grid size-10 place-items-center rounded-full bg-surface text-ink-muted shadow-card hover:text-[#d75046]"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>

        <article className="space-y-3">
          <header className="space-y-1">
            <h1 className="text-2xl font-display text-balance text-ink">
              {reading.title || "Untitled"}
            </h1>
            <p className="text-xs text-ink-subtle">
              {formatDateTime(reading.createdAt)}
              {reading.updatedAt && " · edited"}
            </p>
          </header>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
            {reading.body}
          </p>
        </article>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* List                                                              */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-5">
      <BackHeader
        eyebrow="Profile"
        title="Journal"
        subtitle="A blank page, encrypted like everything else"
      />

      {error && <ErrorState message={error} />}

      <Button
        onClick={() => setEditing({ id: null, title: "", body: "" })}
        size="lg"
        fullWidth
      >
        <Plus className="size-4" aria-hidden />
        New note
      </Button>

      {!loading && notes.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-xs font-semibold text-ink-subtle">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
          <button
            type="button"
            onClick={() => writePreviews(!showPreviews)}
            aria-pressed={showPreviews}
            className="flex items-center gap-1.5 text-xs font-bold text-ink-muted transition-colors hover:text-ink"
          >
            {showPreviews ? (
              <EyeOff className="size-3.5" aria-hidden />
            ) : (
              <Eye className="size-3.5" aria-hidden />
            )}
            {showPreviews ? "Hide previews" : "Show previews"}
          </button>
        </div>
      )}

      {loading ? (
        <ChartSkeleton height={160} />
      ) : notes.length === 0 ? (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title="Nothing written yet"
            description="This is separate from your check-ins — no prompts, no structure, no length anyone expects of you."
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => !note.undecryptable && setReading(note)}
                disabled={note.undecryptable}
                className="card w-full space-y-1 p-4 text-left transition-colors hover:border-line-strong disabled:opacity-60"
              >
                <p className="truncate text-sm font-extrabold text-ink">
                  {note.undecryptable
                    ? "Locked note"
                    : note.title || "Untitled"}
                </p>
                {note.undecryptable ? (
                  <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    This note could not be opened with your current key.
                  </p>
                ) : showPreviews ? (
                  <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
                    {note.body}
                  </p>
                ) : (
                  // Length keeps untitled notes tellable apart without putting
                  // a word of their contents on screen.
                  <p className="text-xs text-ink-subtle">
                    {wordCount(note.body)}{" "}
                    {wordCount(note.body) === 1 ? "word" : "words"}
                  </p>
                )}
                <p className="text-[11px] text-ink-subtle">
                  {relativeTime(note.createdAt)}
                  {note.updatedAt && " · edited"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <SupportLink />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Per-device preference, kept outside React because the `storage` event does
 * not fire in the tab that wrote the value — so the toggle has to notify its
 * own subscribers to re-render.
 */
const PREVIEW_KEY = "aluna.journal.previews";
const previewListeners = new Set<() => void>();

function readPreviews() {
  try {
    return localStorage.getItem(PREVIEW_KEY) === "on";
  } catch {
    // Private windows and blocked site data both land here; off is the safer
    // default anyway.
    return false;
  }
}

function subscribePreviews(onChange: () => void) {
  previewListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    previewListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writePreviews(on: boolean) {
  try {
    localStorage.setItem(PREVIEW_KEY, on ? "on" : "off");
  } catch {
    // Not worth surfacing — the list still updates for this session.
  }
  for (const notify of previewListeners) notify();
}

const wordCount = (body: string) =>
  body.trim() ? body.trim().split(/\s+/).length : 0;

/**
 * Writing freely is exactly when someone is most likely to need this, and it
 * was two taps away under Profile → Help & Safety. Quiet on purpose: present
 * without implying anything about what has just been written.
 */
function SupportLink() {
  return (
    <Link
      href="/help#support"
      className="flex items-center justify-center gap-2 py-1 text-xs font-semibold text-ink-subtle transition-colors hover:text-ink-muted"
    >
      <LifeBuoy className="size-3.5" aria-hidden />
      If things are hard right now, there is help
    </Link>
  );
}
