"use client";

import { useState } from "react";
import { NotebookPen, Pencil, Plus, Trash2, X } from "lucide-react";
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
            className="block text-xs font-semibold tracking-wide text-ink-muted uppercase"
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
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/85 backdrop-blur-xl">
          <div className="mx-auto max-w-lg px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+4.5rem)]">
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
            <h1 className="text-2xl font-extrabold tracking-tight text-balance text-ink">
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
                <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
                  {note.undecryptable
                    ? "This note could not be opened with your current key."
                    : note.body}
                </p>
                <p className="text-[11px] text-ink-subtle">
                  {relativeTime(note.createdAt)}
                  {note.updatedAt && " · edited"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
