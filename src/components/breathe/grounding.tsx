"use client";

import { useState } from "react";
import { Check, Ear, Eye, Hand, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Sense {
  id: string;
  Icon: LucideIcon;
  prompt: string;
  hint: string;
}

/**
 * Four senses, three things each, after the breathing settles.
 *
 * Breathwork quiets the body; this puts attention somewhere outside the head,
 * which is the half that keeps it there. Nothing is stored — the point is the
 * noticing, and a record of what you could smell in a car park is not worth
 * encrypting.
 */
const SENSES: Sense[] = [
  {
    id: "hear",
    Icon: Ear,
    prompt: "Three things you can hear",
    hint: "Start with the furthest away.",
  },
  {
    id: "feel",
    Icon: Hand,
    prompt: "Three things you can feel",
    hint: "Where your weight is. Fabric. Temperature.",
  },
  {
    id: "see",
    Icon: Eye,
    prompt: "Three things you can see",
    hint: "Something you had not noticed until now.",
  },
  {
    id: "smell",
    Icon: Wind,
    prompt: "Three things you can smell",
    hint: "Faint counts. So does nothing much.",
  },
];

export function Grounding({
  accent,
  onDone,
}: {
  accent: string;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  // Ticks only. The answers stay in the room.
  const [found, setFound] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(SENSES.map((s) => [s.id, [false, false, false]])),
  );

  const sense = SENSES[index];
  const isLast = index === SENSES.length - 1;
  const ticks = found[sense.id];

  const toggle = (slot: number) => {
    setFound((previous) => {
      const next = [...previous[sense.id]];
      next[slot] = !next[slot];
      return { ...previous, [sense.id]: next };
    });
  };

  return (
    <div className="flex flex-1 flex-col justify-center gap-7 px-6">
      <div className="space-y-3 text-center">
        <span
          className="mx-auto grid size-14 place-items-center rounded-3xl text-white"
          style={{ backgroundColor: accent }}
        >
          <sense.Icon className="size-6" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <p className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">
            Grounding · {index + 1} of {SENSES.length}
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-balance text-ink">
            {sense.prompt}
          </h2>
          <p className="text-sm text-ink-muted">{sense.hint}</p>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {ticks.map((ticked, slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => toggle(slot)}
            aria-pressed={ticked}
            aria-label={`Noticed ${slot + 1} of 3`}
            className={cn(
              "grid size-16 place-items-center rounded-3xl border-2 text-xl font-black transition-all",
              ticked
                ? "border-transparent text-white"
                : "border-line-strong text-ink-subtle",
            )}
            style={ticked ? { backgroundColor: accent } : undefined}
          >
            {ticked ? <Check className="size-6" strokeWidth={3} /> : slot + 1}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Button
          onClick={() => (isLast ? onDone() : setIndex(index + 1))}
          size="lg"
          fullWidth
        >
          {isLast ? "Finish" : "Next sense"}
        </Button>
        <button
          type="button"
          onClick={onDone}
          className="w-full py-1 text-xs font-bold text-ink-subtle transition-colors hover:text-ink"
        >
          Skip grounding
        </button>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-ink-subtle">
        Nothing here is saved. Tick what you notice, or just notice it.
      </p>
    </div>
  );
}
