"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Heart, MessageCircleHeart, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PRIMARY_BY_ID, type PrimaryEmotionId } from "@/lib/data/emotions";
import { weeklyPrompt } from "@/lib/data/prompts";
import {
  MAX_REFLECTION_LENGTH,
  deleteReflection,
  postReflection,
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
  const [resonated, setResonated] = useState<Set<string>>(new Set());

  const prompt = useMemo(() => weeklyPrompt(), []);
  const ids = useMemo(() => reflections.map((r) => r.id), [reflections]);

  useEffect(() => {
    if (!user || ids.length === 0) return;
    return subscribeToMyResonances(user.uid, ids, setResonated);
  }, [user, ids]);

  const post = async () => {
    if (!user) return;
    const text = draft.trim();
    if (!text) return;

    setPosting(true);
    try {
      // Tags the post with the family behind the poster's latest check-in, so
      // the card can carry a colour without naming a specific feeling.
      const latest = entries[0]?.primaryEmotions[0];
      const tag = latest && PRIMARY_BY_ID.has(latest as PrimaryEmotionId)
        ? (latest as PrimaryEmotionId)
        : null;
      await postReflection(user.uid, text, tag);
      setDraft("");
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

    // Optimistic: the tap should feel instant, and a failure just flips back.
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
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
            This week&apos;s prompt
          </p>
          <p className="text-base leading-snug font-extrabold text-ink">
            {prompt}
          </p>
        </div>

        <Textarea
          label="Share a line"
          optional
          maxLength={MAX_REFLECTION_LENGTH}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Something true, in as few words as you like…"
        />

        <Button
          onClick={post}
          loading={posting}
          disabled={!draft.trim()}
          fullWidth
        >
          <Send className="size-4" aria-hidden />
          Share anonymously
        </Button>

        <p className="text-xs leading-relaxed text-ink-subtle">
          Posts show no name and no avatar. Your account id is stored with the
          post so you can delete it later — nobody else ever sees it.
        </p>
      </Card>

      <section aria-labelledby="wall-heading" className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="wall-heading" className="text-base font-extrabold text-ink">
            Reflections
          </h2>
          <span className="text-xs font-semibold text-ink-subtle">
            {reflections.length === 0 ? "" : `${reflections.length} shared`}
          </span>
        </div>

        {reflections.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageCircleHeart}
              title="Nothing shared yet"
              description="Be the first. A single honest sentence is plenty — this is not a place for performance."
            />
          </Card>
        ) : (
          <ul className="space-y-3">
            {reflections.map((reflection) => {
              const primary = reflection.primary
                ? PRIMARY_BY_ID.get(reflection.primary)
                : undefined;
              const mine = reflection.authorId === user?.uid;
              const active = resonated.has(reflection.id);

              return (
                <li
                  key={reflection.id}
                  className="tone-surface rounded-3xl p-4"
                  style={
                    {
                      "--tone": primary?.color ?? "var(--ink-subtle)",
                    } as CSSProperties
                  }
                >
                  <p className="text-sm leading-relaxed font-medium break-words">
                    {reflection.text}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
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
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
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
                      {reflection.resonateCount > 0
                        ? reflection.resonateCount
                        : "Resonates"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
