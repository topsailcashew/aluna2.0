"use client";

import {
  ACTIVITY_TAGS,
  SCALE_ORDER,
  SCALE_TAGS,
  type TagScale,
} from "@/lib/data/context-tags";
import type { ContextTags } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TagsStepProps {
  tags: ContextTags;
  onChange: (next: ContextTags) => void;
}

/**
 * The only step that exists for the sake of later screens: these are what let
 * Insights compare feelings against sleep, energy and what a day contained.
 * Every control is one tap and every one can be left alone.
 */
export function TagsStep({ tags, onChange }: TagsStepProps) {
  const setScale = (id: "sleep" | "energy" | "stress", value: TagScale) => {
    // Tapping the current answer clears it, so a mis-tap is one tap to undo.
    onChange({ ...tags, [id]: tags[id] === value ? undefined : value });
  };

  const toggleActivity = (id: string) => {
    onChange({
      ...tags,
      activities: tags.activities.includes(id)
        ? tags.activities.filter((value) => value !== id)
        : [...tags.activities, id],
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Context
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">
          What kind of day was around it?
        </h2>
        <p className="text-sm text-ink-muted">
          Skip anything you would rather not answer. This is only here so that
          later on Aluna can show you what your feelings tend to travel with.
        </p>
      </header>

      <div className="space-y-4">
        {SCALE_TAGS.map((tag) => (
          <div key={tag.id} className="space-y-2">
            <p className="text-sm font-bold text-ink">{tag.question}</p>
            <div
              role="radiogroup"
              aria-label={tag.label}
              className="grid grid-cols-3 gap-2"
            >
              {SCALE_ORDER.map((step) => {
                const active = tags[tag.id] === step;
                return (
                  <button
                    key={step}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setScale(tag.id, step)}
                    className={cn(
                      "rounded-2xl border py-2.5 text-sm font-bold transition-colors",
                      active
                        ? "border-deep-600 bg-deep-600 text-white"
                        : "border-line bg-surface text-ink hover:border-deep-300",
                    )}
                  >
                    {tag.steps[step]}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-2.5">
        <p className="text-sm font-bold text-ink">Any of these in the day?</p>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_TAGS.map((tag) => {
            const active = tags.activities.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleActivity(tag.id)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-deep-600 bg-deep-600 text-white"
                    : "border-line bg-surface text-ink hover:border-deep-300",
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
