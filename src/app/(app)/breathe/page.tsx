"use client";

import { useState } from "react";
import { Check, Play, Sparkles } from "lucide-react";

import { BreathSession } from "@/components/breathe/breath-session";
import { Card } from "@/components/ui/card";
import {
  BREATH_PATTERNS,
  cadenceLabel,
  cycleSeconds,
  SESSION_MINUTES,
  type BreathPattern,
  type SessionMinutes,
} from "@/lib/data/breath-patterns";
import { cn } from "@/lib/utils";

export default function BreathePage() {
  const [selected, setSelected] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [minutes, setMinutes] = useState<SessionMinutes>(3);
  const [running, setRunning] = useState(false);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Breathing tools
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Somewhere to put your attention
        </h1>
        <p className="text-sm text-ink-muted">
          Pick a rhythm and a length. The session runs full screen with a tone
          on every turn — nothing is recorded.
        </p>
      </header>

      <section aria-labelledby="patterns-heading" className="space-y-3">
        <h2 id="patterns-heading" className="sr-only">
          Choose a pattern
        </h2>

        {BREATH_PATTERNS.map((pattern) => {
          const active = pattern.id === selected.id;
          return (
            <button
              key={pattern.id}
              type="button"
              onClick={() => setSelected(pattern)}
              aria-pressed={active}
              className={cn(
                "w-full rounded-4xl border p-4 text-left transition-all",
                active
                  ? "border-transparent shadow-lift"
                  : "border-line bg-surface hover:border-line-strong",
              )}
              style={
                active
                  ? { backgroundColor: `${pattern.accent}1a` }
                  : undefined
              }
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-black text-white"
                  style={{ backgroundColor: pattern.accent }}
                >
                  {active ? <Check className="size-4" strokeWidth={3} /> : null}
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
                  <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                    {pattern.description}
                  </span>
                  <span className="mt-2 flex items-center gap-2 text-[11px] font-bold text-ink-subtle">
                    <span className="rounded-full bg-surface-sunken px-2 py-0.5 tabular-nums">
                      {cadenceLabel(pattern)}
                    </span>
                    <span>{cycleSeconds(pattern)}s per breath</span>
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </section>

      <Card className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-ink">How long?</p>
          <p className="text-xs text-ink-muted">
            About{" "}
            {Math.round((minutes * 60) / cycleSeconds(selected))} breaths at this
            pace.
          </p>
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
                "rounded-2xl border py-2.5 text-sm font-bold transition-colors",
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white transition-transform active:scale-[0.99]"
          style={{
            backgroundColor: selected.accent,
            boxShadow: `0 14px 30px -16px ${selected.accent}`,
          }}
        >
          <Play className="size-5" fill="currentColor" aria-hidden />
          Begin {selected.name.toLowerCase()}
        </button>
      </Card>

      <p className="flex items-center justify-center gap-2 pb-2 text-xs text-ink-subtle">
        <Sparkles className="size-3.5" aria-hidden />
        Sound plays through your device — headphones are nicer.
      </p>

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
