"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EmotionWheel } from "@/components/check-in/emotion-wheel";
import { StepProgress } from "@/components/check-in/step-progress";
import { RippleLoader } from "@/components/brand/ripple-loader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { labelOf, PRIMARY_BY_ID, primaryIdsFrom } from "@/lib/data/emotions";
import { useAuth } from "@/lib/firebase/auth-context";
import { useVault } from "@/lib/crypto/vault";
import { createNote } from "@/lib/firebase/journal";
import { cn } from "@/lib/utils";

/**
 * A guided path from a raw feeling to a values-based response — Notice, Name,
 * Allow, Understand, Choose. Self-contained: it writes nothing unless you save
 * a summary to your journal at the end.
 */
type StepId = "notice" | "name" | "allow" | "understand" | "choose";

const STEPS: StepId[] = ["notice", "name", "allow", "understand", "choose"];
const TITLES: Record<StepId, string> = {
  notice: "Notice",
  name: "Name it",
  allow: "Allow it",
  understand: "What matters",
  choose: "Choose",
};

const VALUES = [
  "Connection",
  "Honesty",
  "Growth",
  "Kindness",
  "Courage",
  "Health",
  "Calm",
  "Presence",
  "Boundaries",
  "Creativity",
  "Freedom",
  "Fairness",
];

export default function JourneyPage() {
  const { user } = useAuth();
  const { dataKey } = useVault();
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [summary, setSummary] = useState(false);
  const [saving, setSaving] = useState(false);

  const [emotions, setEmotions] = useState<string[]>([]);
  const [value, setValue] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [action, setAction] = useState("");

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const family = useMemo(() => {
    const id = primaryIdsFrom(emotions)[0];
    return id ? PRIMARY_BY_ID.get(id) : undefined;
  }, [emotions]);

  const goTo = (next: number) => {
    setIndex(next);
    setFurthest((v) => Math.max(v, next));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = () => {
    if (step === "name" && emotions.length === 0) {
      toast.error("Name at least one feeling to go on.");
      return;
    }
    if (isLast) {
      setSummary(true);
      topRef.current?.scrollIntoView({ block: "start" });
      return;
    }
    goTo(index + 1);
  };

  const goBack = () => {
    if (summary) {
      setSummary(false);
      return;
    }
    if (index > 0) goTo(index - 1);
    else router.push("/tools");
  };

  const save = async () => {
    if (!user || !dataKey) {
      toast.error("Your journal is locked. Unlock it and try again.");
      return;
    }
    setSaving(true);
    try {
      const named = emotions.map(labelOf).join(", ") || "—";
      const body = [
        `Named: ${named}`,
        `What matters: ${value ?? "—"}${note.trim() ? ` — ${note.trim()}` : ""}`,
        `Chose to: ${action.trim() || "—"}`,
      ].join("\n\n");
      const title = `Regulation journey · ${new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`;
      await createNote(user.uid, dataKey, { title, body });
      toast.success("Saved to your journal");
      router.push("/journal");
    } catch {
      toast.error("Could not save that just now.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-28" ref={topRef}>
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label={index > 0 || summary ? "Back" : "Back to tools"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-surface-muted"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <h1 className="flex-1 text-center text-lg font-extrabold tracking-tight text-ink">
            {summary ? "Your path" : TITLES[step]}
          </h1>
          <span className="size-10 shrink-0" aria-hidden />
        </div>

        {!summary && (
          <StepProgress
            current={index + 1}
            total={STEPS.length}
            reachable={furthest + 1}
            onStepSelect={(v) => goTo(v - 1)}
          />
        )}
      </header>

      {summary ? (
        <JourneySummary
          tone={family?.color ?? "var(--color-fearful)"}
          named={emotions.map(labelOf)}
          value={value}
          note={note}
          action={action}
        />
      ) : (
        <section key={step} className="step-enter min-h-[22rem]">
          {step === "notice" && (
            <StepShell
              lead="Something's asking for attention."
              body="Before anything else, one slow breath. Nothing to solve yet — just arrive."
            >
              <RippleLoader size={92} />
            </StepShell>
          )}

          {step === "name" && (
            <div className="space-y-3">
              <StepHeading
                lead="What's the feeling?"
                body="Name it as closely as you can — the precise word helps."
              />
              <EmotionWheel value={emotions} onChange={setEmotions} />
            </div>
          )}

          {step === "allow" && (
            <StepShell
              lead="It's here, and that's allowed."
              body="You don't have to fix it or push it away. Feelings move through faster when they're let be."
            >
              <RippleLoader size={92} />
            </StepShell>
          )}

          {step === "understand" && (
            <div className="space-y-4">
              <StepHeading
                lead="What's underneath it?"
                body="Pick what matters most to you here."
              />
              <div className="flex flex-wrap gap-2">
                {VALUES.map((v) => {
                  const active = value === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue(active ? null : v)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-sm font-bold transition-colors",
                        active
                          ? "bg-[var(--marker)] text-[var(--marker-ink)]"
                          : "bg-surface-sunken text-ink-muted hover:text-ink",
                      )}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <Textarea
                label="Anything to add"
                optional
                maxLength={280}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What this feeling might be pointing at…"
              />
            </div>
          )}

          {step === "choose" && (
            <div className="space-y-4">
              <StepHeading
                lead="What will you do?"
                body="One small thing that fits the person you want to be — not a fix, just a next step."
              />
              <Textarea
                label="Your response"
                maxLength={280}
                value={action}
                onChange={(event) => setAction(event.target.value)}
                placeholder="Even something tiny counts."
              />
            </div>
          )}
        </section>
      )}

      {/* Action bar — the flow owns the bottom of the screen (nav is hidden). */}
      {!summary && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/80 backdrop-blur-xl">
          <div className="mx-auto max-w-lg px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <Button onClick={goNext} size="lg" fullWidth>
              {isLast ? "See it together" : "Continue"}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {summary && (
        <div className="space-y-2">
          <Button onClick={save} loading={saving} size="lg" fullWidth>
            <Check className="size-4" aria-hidden />
            Save to journal
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            size="lg"
            variant="secondary"
            fullWidth
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

function StepHeading({ lead, body }: { lead: string; body: string }) {
  return (
    <div className="space-y-1">
      <h2 className="font-display text-2xl text-ink">{lead}</h2>
      <p className="text-sm text-ink-muted">{body}</p>
    </div>
  );
}

function StepShell({
  lead,
  body,
  children,
}: {
  lead: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-6 pt-6 text-center">
      {children}
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl text-balance text-ink">{lead}</h2>
        <p className="mx-auto max-w-[32ch] text-sm leading-relaxed text-ink-muted">
          {body}
        </p>
      </div>
    </div>
  );
}

function JourneySummary({
  tone,
  named,
  value,
  note,
  action,
}: {
  tone: string;
  named: string[];
  value: string | null;
  note: string;
  action: string;
}) {
  return (
    <div className="space-y-4">
      <div
        className="card-hero space-y-1 p-5"
        style={{ "--tone": tone } as CSSProperties}
      >
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-2xl bg-[var(--marker)] text-[var(--marker-ink)]"
        >
          <Sparkles className="size-5" />
        </span>
        <h2 className="font-display mt-3 text-2xl">You moved it through</h2>
        <p className="text-sm opacity-80">
          From noticing a feeling to choosing what to do with it.
        </p>
      </div>

      <dl className="space-y-3">
        <SummaryRow label="You named" value={named.length ? named.join(", ") : "—"} />
        <SummaryRow
          label="What matters"
          value={[value, note.trim()].filter(Boolean).join(" — ") || "—"}
        />
        <SummaryRow label="You chose to" value={action.trim() || "—"} />
      </dl>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="card space-y-1 p-4">
      <dt className="text-xs font-bold text-ink-subtle">{label}</dt>
      <dd className="text-sm leading-relaxed font-semibold text-ink">{value}</dd>
    </div>
  );
}
