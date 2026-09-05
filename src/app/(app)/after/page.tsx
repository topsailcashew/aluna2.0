"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowRight, Check, Wind } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRIMARY_BY_ID, SUB_BY_ID, type PrimaryEmotionId } from "@/lib/data/emotions";
import { GUIDANCE } from "@/lib/data/guidance";

export default function AfterCheckInPage() {
  return (
    <Suspense fallback={null}>
      <AfterCheckIn />
    </Suspense>
  );
}

/**
 * Shown once, straight after saving a check-in.
 *
 * The sub-categories come through the URL rather than by re-reading the entry:
 * it avoids a decrypt round-trip for something the previous screen already
 * knew, and these ids are the same words the person just tapped.
 */
function AfterCheckIn() {
  const params = useSearchParams();
  const router = useRouter();

  const subs = useMemo(() => {
    const requested = (params.get("subs") ?? "").split(",").filter(Boolean);
    // At most two. A wall of advice after naming a feeling is its own burden.
    return requested
      .filter((id) => SUB_BY_ID.has(id) && GUIDANCE[id])
      .slice(0, 2);
  }, [params]);

  if (subs.length === 0) {
    // Nothing to say about what was logged — do not manufacture something.
    return (
      <div className="space-y-5">
        <Header />
        <Card className="space-y-2">
          <p className="text-sm leading-relaxed text-ink-muted">
            Your check-in is saved. Nothing further from us — noticing it was
            the useful part.
          </p>
        </Card>
        <Done onDone={() => router.replace("/dashboard")} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header />

      {subs.map((id) => {
        const guidance = GUIDANCE[id];
        const family = PRIMARY_BY_ID.get(id.split(".")[0] as PrimaryEmotionId);

        return (
          <section
            key={id}
            className="card-hero space-y-4 p-5"
            style={{ "--tone": family?.color } as CSSProperties}
          >
            <div className="space-y-2">
              <p className="text-xs font-bold opacity-70">
                {family?.label} · {SUB_BY_ID.get(id)?.label}
              </p>
              <h2 className="font-display text-2xl text-balance">
                {guidance.heading}
              </h2>
              <p className="text-sm leading-relaxed opacity-90">
                {guidance.description}
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-bold opacity-70">
                Things that can help
              </p>
              <ol className="space-y-2.5">
                {guidance.strategies.map((strategy, index) => (
                  <li
                    key={strategy.title}
                    className="flex gap-3 rounded-2xl bg-surface/45 p-3.5"
                  >
                    <span
                      aria-hidden
                      className="grid size-6 shrink-0 place-items-center rounded-full bg-surface/70 text-xs font-black"
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
                        {strategy.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed opacity-85">
                        {strategy.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })}

      <Link
        href="/breathe"
        className="card flex items-center gap-3 p-4 transition-colors hover:border-line-strong"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <Wind className="size-4.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">
            Or take a few minutes to breathe
          </span>
          <span className="block text-[11px] text-ink-muted">
            Guided, with a grounding exercise after
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
      </Link>

      <p className="px-2 text-center text-[11px] leading-relaxed text-ink-subtle">
        These are ordinary suggestions, not treatment. Aluna is not a
        substitute for a doctor or a therapist — see Help for support lines.
      </p>

      <Done onDone={() => router.replace("/dashboard")} />
    </div>
  );
}

function Header() {
  return (
    <header className="space-y-1 pt-2">
      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-deep-500 dark:text-deep-300">
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
        Saved
      </p>
      <h1 className="text-2xl font-display text-ink">
        Thank you for noticing
      </h1>
    </header>
  );
}

function Done({ onDone }: { onDone: () => void }) {
  return (
    <Button onClick={onDone} size="lg" fullWidth variant="secondary">
      Done
    </Button>
  );
}
