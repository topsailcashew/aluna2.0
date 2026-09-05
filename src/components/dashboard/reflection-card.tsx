"use client";

import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import { PRIMARY_BY_ID, type PrimaryEmotionId } from "@/lib/data/emotions";
import { dayKey } from "@/lib/data/prompts";
import { reflectionFor } from "@/lib/data/reflections";

/**
 * One line, tuned to whatever family led today's check-in, or a general one
 * before the first. Fixed for the whole day rather than shuffling on every
 * render — a thought you can return to, not a slot machine.
 */
export function ReflectionCard({ family }: { family: PrimaryEmotionId | null }) {
  const today = dayKey();
  const reflection = reflectionFor(family, today);
  const accent = family ? PRIMARY_BY_ID.get(family)?.color : undefined;

  return (
    <section
      aria-label="Today's reflection"
      className="relative overflow-hidden rounded-3xl border border-line bg-surface p-4"
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 h-full w-1"
        style={{ backgroundColor: accent ?? "var(--color-deep-400)" }}
      />

      <div className="space-y-2.5 pl-2.5">
        <Quote
          className="size-4 text-ink-subtle"
          style={accent ? { color: accent } : undefined}
          aria-hidden
        />
        <p className="text-sm leading-relaxed font-medium text-balance text-ink">
          {reflection.text}
        </p>

        {reflection.action && (
          <Link
            href={reflection.action.href}
            className="inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-75"
            style={{ color: accent ?? "var(--color-deep-600)" }}
          >
            {reflection.action.label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
