"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ListPlus } from "lucide-react";
import { toast } from "sonner";

import { EmotionStep } from "@/components/check-in/emotion-step";
import { JournalStep } from "@/components/check-in/journal-step";
import { SensationStep } from "@/components/check-in/sensation-step";
import { StepProgress } from "@/components/check-in/step-progress";
import { TagsStep } from "@/components/check-in/tags-step";
import { ThoughtStep } from "@/components/check-in/thought-step";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { useVault } from "@/lib/crypto/vault";
import { createEntry } from "@/lib/firebase/entries";
import { subIdsFrom } from "@/lib/data/emotions";
import { checkInSchema, type LoggedSensation } from "@/lib/schemas";
import type { ContextTags, JournalAnswers } from "@/lib/types";

/**
 * Two routes through the same data.
 *
 * `quick` is the wheel and nothing else, for someone checking in on the way
 * to something. `full` adds the body scan, context, thought patterns and the
 * journal. Both write an identical entry — the quick one simply leaves the
 * other fields empty, which is also what happens when you skip them.
 */
type StepId = "sensations" | "emotions" | "tags" | "thoughts" | "journal";

const FLOWS: Record<"quick" | "full", StepId[]> = {
  quick: ["emotions", "tags"],
  full: ["sensations", "emotions", "tags", "thoughts", "journal"],
};

const TITLES: Record<StepId, string> = {
  sensations: "Body check-in",
  emotions: "Emotion map",
  tags: "Context",
  thoughts: "Mind observation",
  journal: "Reflection",
};

export default function CheckInPage() {
  return (
    <Suspense fallback={null}>
      <CheckInFlow />
    </Suspense>
  );
}

function CheckInFlow() {
  const { user } = useAuth();
  const { dataKey } = useVault();
  const router = useRouter();
  const params = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"quick" | "full">(
    params.get("mode") === "full" ? "full" : "quick",
  );
  const steps = FLOWS[mode];

  const [index, setIndex] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [sensations, setSensations] = useState<LoggedSensation[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [tags, setTags] = useState<ContextTags>({ activities: [] });
  const [thoughtPatterns, setThoughtPatterns] = useState<string[]>([]);
  const [thoughtNote, setThoughtNote] = useState("");
  const [journal, setJournal] = useState<JournalAnswers>({});

  const step = steps[index];
  const isLast = index === steps.length - 1;

  const goTo = useCallback((next: number) => {
    setIndex(next);
    setFurthest((value) => Math.max(value, next));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /**
   * Switching to the full flow starts at step one. Anything already chosen on
   * the wheel is kept — it is the same state — but the body scan is the point
   * of asking for more detail, so it should not be skipped past.
   */
  const expand = () => {
    setMode("full");
    setIndex(0);
    setFurthest(FLOWS.full.indexOf("tags"));
  };

  const goNext = () => {
    if (step === "emotions" && emotions.length === 0) {
      toast.error("Choose at least one emotion before moving on");
      return;
    }
    if (!isLast) goTo(index + 1);
  };

  const goBack = () => {
    if (index > 0) goTo(index - 1);
    else router.push("/dashboard");
  };

  const submit = async () => {
    if (!user) return;
    if (!dataKey) {
      toast.error("Your entries are locked. Unlock them and try again.");
      return;
    }

    const parsed = checkInSchema.safeParse({
      sensations: sensations.map(({ bodyPart, intensity, note }) => ({
        bodyPart,
        intensity,
        note,
      })),
      emotions,
      thoughtPatterns,
      thoughtNote,
      tags,
      journal,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please review your check-in");
      if (parsed.error.issues.some((issue) => issue.path[0] === "emotions")) {
        const at = steps.indexOf("emotions");
        if (at >= 0) goTo(at);
      }
      return;
    }

    setSubmitting(true);
    try {
      await createEntry(user.uid, dataKey, parsed.data);
      // Hand the sub-categories forward so the next screen does not have to
      // decrypt the entry it was just given.
      const subs = subIdsFrom(parsed.data.emotions).slice(0, 2).join(",");
      router.push(`/after?subs=${encodeURIComponent(subs)}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `We couldn't save that: ${error.message}`
          : "We couldn't save your check-in. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24" ref={topRef}>
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label={index > 0 ? "Previous step" : "Back to home"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-surface-muted"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <h1 className="flex-1 text-center text-lg font-extrabold tracking-tight text-ink">
            {TITLES[step]}
          </h1>
          <span className="size-10 shrink-0" aria-hidden />
        </div>

        {steps.length > 1 && (
          <StepProgress
            current={index + 1}
            total={steps.length}
            reachable={furthest + 1}
            onStepSelect={(value) => goTo(value - 1)}
          />
        )}
      </header>

      <section key={`${mode}-${step}`} className="step-enter">
        {step === "sensations" && (
          <SensationStep sensations={sensations} onChange={setSensations} />
        )}
        {step === "emotions" && (
          <EmotionStep emotions={emotions} onChange={setEmotions} />
        )}
        {step === "tags" && <TagsStep tags={tags} onChange={setTags} />}
        {step === "thoughts" && (
          <ThoughtStep
            patterns={thoughtPatterns}
            note={thoughtNote}
            onPatternsChange={setThoughtPatterns}
            onNoteChange={setThoughtNote}
          />
        )}
        {step === "journal" && (
          <JournalStep journal={journal} onChange={setJournal} />
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg space-y-2 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+4.5rem)]">
          {isLast ? (
            <Button
              onClick={submit}
              size="lg"
              fullWidth
              loading={submitting}
              disabled={emotions.length === 0}
            >
              <Check className="size-4" aria-hidden />
              Save check-in
            </Button>
          ) : (
            <Button onClick={goNext} size="lg" fullWidth>
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          )}

          {mode === "quick" && (
            <button
              type="button"
              onClick={expand}
              className="flex w-full items-center justify-center gap-2 py-1 text-sm font-bold text-deep-600 transition-colors hover:text-deep-500 dark:text-deep-300"
            >
              <ListPlus className="size-4" aria-hidden />
              Add the body scan and a reflection
            </button>
          )}

          {isLast && emotions.length === 0 && (
            <p className="text-center text-xs font-semibold text-[#d75046]">
              Choose at least one emotion to save this check-in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
