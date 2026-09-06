"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Heart, MessageCircleHeart, Pencil, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  primaryIdsFrom,
  PRIMARY_BY_ID,
  type PrimaryEmotionId,
} from "@/lib/data/emotions";
import { weeklyPrompt } from "@/lib/data/prompts";
import {
  MAX_REFLECTION_LENGTH,
  deleteReflection,
  postReflection,
  subscribeToMyReflectionIds,
  subscribeToMyResonances,
  toggleResonance,
  type Reflection,
} from "@/lib/firebase/community";
import { useAuth } from "@/lib/firebase/auth-context";
import type { CheckInEntry } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

interface ReflectionWallProps {
  reflections: Reflection[];
  entries: CheckInEntry[];
}

export function ReflectionWall({ reflections, entries }: ReflectionWallProps) {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [resonated, setResonated] = useState<Set<string>>(new Set());
  // Which posts are this person's own — from their private ownership markers,
  // not an author id on the public post (the wall is anonymous at the database).
  const [mineIds, setMineIds] = useState<Set<string>>(new Set());

  const prompt = useMemo(() => weeklyPrompt(), []);
  const ids = useMemo(() => reflections.map((r) => r.id), [reflections]);

  useEffect(() => {
    if (!user || ids.length === 0) return;
    return subscribeToMyResonances(user.uid, ids, setResonated);
  }, [user, ids]);

  useEffect(() => {
    if (!user) return;
    return subscribeToMyReflectionIds(user.uid, setMineIds, () =>
      setMineIds(new Set()),
    );
  }, [user]);

  const post = async () => {
    if (!user) return;
    const text = draft.trim();
    if (!text) return;

    setPosting(true);
    try {
      // Tags the post with the family behind the poster's latest check-in, so
      // the card can carry a colour without naming a specific feeling.
      const latest = entries[0] ? primaryIdsFrom(entries[0].emotions)[0] : undefined;
      const tag =
        latest && PRIMARY_BY_ID.has(latest as PrimaryEmotionId)
          ? (latest as PrimaryEmotionId)
          : null;
      await postReflection(user.uid, text, tag);
      setDraft("");
      setComposerOpen(false);
      toast.success("Shared anonymously");
    } catch {
      toast.error("Could not share that just now.");
    } finally {
      setPosting(false);
    }
  };

  const resonate = async (reflection: Reflection) => {
    if (!user) return;
    const on = !resonated.has(reflection.id);

    setResonated((previous) => {
      const next = new Set(previous);
      if (on) next.add(reflection.id);
      else next.delete(reflection.id);
      return next;
    });

    try {
      await toggleResonance(reflection.id, user.uid, on);
    } catch {
      setResonated((previous) => {
        const next = new Set(previous);
        if (on) next.delete(reflection.id);
        else next.add(reflection.id);
        return next;
      });
      toast.error("Could not save that.");
    }
  };

  const remove = async (reflection: Reflection) => {
    try {
      await deleteReflection(reflection.id);
      toast.success("Removed");
    } catch {
      toast.error("Could not remove that.");
    }
  };

  return (
    <>
      <section aria-labelledby="wall-heading" className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="wall-heading" className="font-display text-lg text-ink">
            What people are sharing
          </h2>
          <span className="text-xs font-semibold text-ink-subtle">
            {reflections.length === 0 ? "" : `${reflections.length} shared`}
          </span>
        </div>

        {reflections.length === 0 ? (
          <div className="card p-6">
            <EmptyState
              icon={MessageCircleHeart}
              title="Nothing shared yet"
              description="Be the first — one honest line is plenty."
            />
          </div>
        ) : (
          <ol className="relative space-y-3">
            <span
              aria-hidden
              className="pointer-events-none absolute top-3 bottom-3 left-[7px] w-px bg-line"
            />
            {reflections.map((reflection, i) => {
              const primary = reflection.primary
                ? PRIMARY_BY_ID.get(reflection.primary)
                : undefined;
              const tone = primary?.color ?? "var(--ink-subtle)";
              const mine = mineIds.has(reflection.id);
              const active = resonated.has(reflection.id);
              const newest = i === 0;

              return (
                <li
                  key={reflection.id}
                  className="relative pl-7"
                  style={{ "--tone": tone } as CSSProperties}
                >
                  <span
                    aria-hidden
                    className="absolute top-3.5 left-0 grid w-[15px] place-items-center"
                  >
                    <span
                      className={cn(
                        "rounded-full ring-4 ring-[var(--surface)]",
                        newest ? "size-3.5" : "size-2.5",
                      )}
                      style={{ backgroundColor: tone }}
                    />
                  </span>

                  <div
                    className={cn(
                      "rounded-3xl p-4",
                      newest && "tone-surface shadow-card",
                    )}
                    style={
                      newest
                        ? undefined
                        : {
                            backgroundColor:
                              "color-mix(in oklab, var(--tone) 12%, var(--surface))",
                            color:
                              "color-mix(in oklab, var(--tone) 60%, var(--ink))",
                          }
                    }
                  >
                    <p className="text-sm leading-relaxed font-medium break-words">
                      {reflection.text}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-semibold opacity-70">
                        {relativeTime(reflection.createdAt)}
                        {primary && ` · felt ${primary.label.toLowerCase()}`}
                      </span>

                      <span className="flex-1" />

                      {mine && (
                        <button
                          type="button"
                          onClick={() => void remove(reflection)}
                          aria-label="Delete your reflection"
                          className="grid size-8 place-items-center rounded-full bg-surface/60 transition-colors hover:bg-surface"
                        >
                          <Trash2 className="size-3.5" aria-hidden />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void resonate(reflection)}
                        aria-pressed={active}
                        aria-label={
                          active
                            ? "Remove your acknowledgement"
                            : "This resonates with me"
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors",
                          active
                            ? "bg-surface text-ink"
                            : "bg-surface/60 hover:bg-surface",
                        )}
                      >
                        <Heart
                          className="size-3.5"
                          fill={active ? "currentColor" : "none"}
                          aria-hidden
                        />
                        {reflection.resonateCount > 0 ? (
                          <span className="tabular-nums">
                            {reflection.resonateCount}
                          </span>
                        ) : (
                          "Resonates"
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Action bubble — the one way to add to the wall. */}
      <button
        type="button"
        onClick={() => setComposerOpen(true)}
        className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5.2rem)] z-30 inline-flex items-center gap-2 rounded-full bg-[var(--marker)] px-5 py-3.5 text-sm font-bold text-[var(--marker-ink)] shadow-lift transition-transform active:scale-95"
      >
        <Pencil className="size-4" aria-hidden />
        Share a line
      </button>

      {composerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Share a reflection"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setComposerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg space-y-3 rounded-t-[2rem] border border-line bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-deep-500 dark:text-deep-300">
                  This week&apos;s prompt
                </p>
                <p className="text-base leading-snug font-extrabold text-ink">
                  {prompt}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                aria-label="Close"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-muted transition-colors hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <Textarea
              label="Share a line"
              optional
              autoFocus
              maxLength={MAX_REFLECTION_LENGTH}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Something true, in as few words as you like…"
            />

            <Button onClick={post} loading={posting} disabled={!draft.trim()} fullWidth>
              <Send className="size-4" aria-hidden />
              Share anonymously
            </Button>

            <p className="text-xs leading-relaxed text-ink-subtle">
              No name, no avatar. Only you can delete it later.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
