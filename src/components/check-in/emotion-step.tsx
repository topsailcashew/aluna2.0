"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { EmotionWheel } from "@/components/check-in/emotion-wheel";
import {
  EMOTIONS,
  labelOf,
  primaryOf,
  subOf,
  TOTAL_EMOTIONS,
} from "@/lib/data/emotions";

interface EmotionStepProps {
  emotions: string[];
  onChange: (next: string[]) => void;
}

export function EmotionStep({ emotions, onChange }: EmotionStepProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Step 2 · Emotion map
        </p>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">
          Name what you are feeling
        </h2>
        <p className="text-sm text-ink-muted">
          Start broad, then narrow. {TOTAL_EMOTIONS} words across three levels —
          the precise one often lands differently than the obvious one. Pick as
          many as you need; feeling two contradictory things at once is normal.
        </p>
      </header>

      <EmotionWheel value={emotions} onChange={onChange} />

      {/* A running tally beside the wheel, so the fact that this is a
          multi-select never depends on scrolling down to notice it. */}
      <div className="flex items-center justify-center gap-2">
        {emotions.length === 0 ? (
          <p className="text-xs font-semibold text-ink-subtle">
            Nothing chosen yet
          </p>
        ) : (
          <>
            <span className="flex -space-x-1.5">
              {EMOTIONS.filter((primary) =>
                emotions.some((id) => id.startsWith(`${primary.id}.`)),
              ).map((primary) => (
                <span
                  key={primary.id}
                  aria-hidden
                  className="size-4 rounded-full ring-2 ring-[var(--canvas)]"
                  style={{ backgroundColor: primary.color }}
                />
              ))}
            </span>
            <p className="text-xs font-bold text-ink">
              {emotions.length} chosen
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-ink-subtle underline-offset-2 hover:underline"
            >
              Clear
            </button>
          </>
        )}
      </div>

      <section aria-labelledby="chosen-heading" className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <h3 id="chosen-heading" className="text-sm font-bold text-ink">
            Chosen feelings
          </h3>
          <span className="text-xs font-semibold text-ink-subtle">
            {emotions.length === 0
              ? "pick at least one"
              : `${emotions.length} selected`}
          </span>
        </div>

        {emotions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong px-4 py-4 text-center text-xs text-ink-subtle">
            Nothing chosen yet. Tap a family in the wheel to begin.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {emotions.map((id) => {
                const primary = primaryOf(id);
                const sub = subOf(id);
                return (
                  <motion.li
                    key={id}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  >
                    <span
                      className="tone-surface inline-flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3.5 text-sm font-bold"
                      style={{ "--tone": primary?.color } as CSSProperties}
                    >
                      <span className="flex flex-col items-start leading-tight">
                        {labelOf(id)}
                        <span className="text-[10px] font-semibold opacity-65">
                          {primary?.label} · {sub?.label}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onChange(emotions.filter((value) => value !== id))
                        }
                        aria-label={`Remove ${labelOf(id)}`}
                        className="grid size-5 place-items-center rounded-full bg-surface/60 transition-colors hover:bg-surface"
                      >
                        <X className="size-3" strokeWidth={3} aria-hidden />
                      </button>
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}
