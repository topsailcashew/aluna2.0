"use client";

import { useState } from "react";
import { Check, Play } from "lucide-react";

import { BreathSession } from "@/components/breathe/breath-session";
import {
  BREATH_PATTERNS,
  cadenceLabel,
  cycleSeconds,
  SESSION_MINUTES,
  type BreathPattern,
  type SessionMinutes,
} from "@/lib/data/breath-patterns";
import { cn } from "@/lib/utils";

/**
 * Pattern list scrolls; length and Begin do not.
 *
 * The previous layout put the duration and the start button below four tall
 * cards, so choosing a practice and starting it were never on screen at the
 * same time. They are the two decisions this page exists for, so they now sit
 * in a fixed bar. The cards lost their paragraphs to earn the room — the
 * description only unfolds for whichever pattern is selected.
 */
export default function BreathePage() {
  const [selected, setSelected] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [minutes, setMinutes] = useState<SessionMinutes>(3);
  const [running, setRunning] = useState(false);

  const breaths = Math.round((minutes * 60) / cycleSeconds(selected));

  return (
    <div className="space-y-4 pb-40">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Breathing tools
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Somewhere to put your attention
        </h1>
      </header>

      <section aria-label="Choose a pattern" className="space-y-2.5">
        {BREATH_PATTERNS.map((pattern) => {
          const active = pattern.id === selected.id;
          return (
            <button
              key={pattern.id}
              type="button"
              onClick={() => setSelected(pattern)}
              aria-pressed={active}
              className={cn(
                "w-full rounded-3xl border p-3.5 text-left transition-all",
                active
                  ? "border-transparent shadow-lift"
                  : "border-line bg-surface hover:border-line-strong",
              )}
              style={active ? { backgroundColor: `${pattern.accent}1a` } : undefined}
            >
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-xl text-white"
                  style={{
                    backgroundColor: active ? pattern.accent : `${pattern.accent}40`,
                  }}
                >
                  {active && <Check className="size-4" strokeWidth={3} />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-base font-extrabold text-ink">
                      {pattern.name}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: pattern.accent }}
                    >
                      {pattern.tagline}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-ink-subtle">
                    <span className="rounded-full bg-surface-sunken px-2 py-0.5 tabular-nums">
                      {cadenceLabel(pattern)}
                    </span>
                    <span>{cycleSeconds(pattern)}s per breath</span>
                  </span>
                </span>
              </span>

              {/* Only the chosen pattern explains itself. */}
              <span
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300",
                  active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <span className="overflow-hidden">
                  <span className="block pt-2.5 text-xs leading-relaxed text-ink-muted">
                    {pattern.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </section>

      <p className="px-1 text-center text-xs text-ink-subtle">
        Sound plays through your device — headphones are nicer.
      </p>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto max-w-lg space-y-2.5 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+4.5rem)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
              How long
            </p>
            <p className="text-xs text-ink-subtle">about {breaths} breaths</p>
          </div>

          <div
            role="radiogroup"
            aria-label="Session length"
            className="grid grid-cols-4 gap-2"
          >
            {SESSION_MINUTES.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={minutes === value}
                onClick={() => setMinutes(value)}
                className={cn(
                  "rounded-xl border py-2 text-sm font-bold transition-colors",
                  minutes === value
                    ? "border-deep-600 bg-deep-600 text-white"
                    : "border-line bg-surface text-ink hover:border-deep-300",
                )}
              >
                {value} min
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRunning(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-white transition-transform active:scale-[0.99]"
            style={{
              backgroundColor: selected.accent,
              boxShadow: `0 14px 30px -16px ${selected.accent}`,
            }}
          >
            <Play className="size-5" fill="currentColor" aria-hidden />
            Begin {selected.name.toLowerCase()}
          </button>
        </div>
      </div>

      {running && (
        <BreathSession
          pattern={selected}
          minutes={minutes}
          onClose={() => setRunning(false)}
        />
      )}
    </div>
  );
}
