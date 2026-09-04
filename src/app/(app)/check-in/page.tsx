"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import { EmotionStep } from "@/components/check-in/emotion-step";
import { SensationStep } from "@/components/check-in/sensation-step";
import { StepProgress } from "@/components/check-in/step-progress";
import { ThoughtStep } from "@/components/check-in/thought-step";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { createEntry } from "@/lib/firebase/entries";
import { checkInSchema, type LoggedSensation } from "@/lib/schemas";

const TOTAL_STEPS = 3;
const STEP_TITLES = ["Body check-in", "Emotion map", "Mind observation"] as const;

export default function CheckInPage() {
  const { user } = useAuth();
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [sensations, setSensations] = useState<LoggedSensation[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [thoughtPatterns, setThoughtPatterns] = useState<string[]>([]);
  const [thoughtNote, setThoughtNote] = useState("");

  const goToStep = useCallback((next: number) => {
    setStep(next);
    setFurthestStep((furthest) => Math.max(furthest, next));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goNext = () => {
    if (step === 2 && emotions.length === 0) {
      toast.error("Choose at least one emotion before moving on");
      return;
    }
    if (step < TOTAL_STEPS) goToStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) goToStep(step - 1);
    else router.push("/dashboard");
  };

  const submit = async () => {
    if (!user) return;

    const parsed = checkInSchema.safeParse({
      sensations: sensations.map(({ bodyPart, intensity, note }) => ({
        bodyPart,
        intensity,
        note,
      })),
      emotions,
      thoughtPatterns,
      thoughtNote,
    });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Please review your check-in";
      toast.error(message);
      // Emotion problems live on step 2 — take the person to the fix.
      if (parsed.error.issues.some((issue) => issue.path[0] === "emotions")) {
        goToStep(2);
      }
      return;
    }

    setSubmitting(true);
    try {
      await createEntry(user.uid, parsed.data);
      toast.success("Check-in saved — thank you for noticing");
      router.push("/dashboard");
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
    // Extra bottom padding clears the fixed action bar as well as the nav.
    <div className="space-y-6 pb-24" ref={topRef}>
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label={step > 1 ? "Previous step" : "Back to dashboard"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-surface-muted"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <h1 className="flex-1 text-center text-lg font-extrabold tracking-tight text-ink">
            {STEP_TITLES[step - 1]}
          </h1>
          <span className="size-10 shrink-0" aria-hidden />
        </div>

        <StepProgress
          current={step}
          total={TOTAL_STEPS}
          reachable={furthestStep}
          onStepSelect={goToStep}
        />
      </header>

      {/* Keyed so the entrance replays per step. The animation is decoration
          only — the step mounts immediately rather than waiting on an exit,
          so the form can never strand someone on the previous step. */}
      <section key={step} className="step-enter">
        {step === 1 && (
          <SensationStep sensations={sensations} onChange={setSensations} />
        )}
        {step === 2 && (
          <EmotionStep emotions={emotions} onChange={setEmotions} />
        )}
        {step === 3 && (
          <ThoughtStep
            patterns={thoughtPatterns}
            note={thoughtNote}
            onPatternsChange={setThoughtPatterns}
            onNoteChange={setThoughtNote}
          />
        )}
      </section>

      {/* Pinned directly above the nav so the primary action is always in
          reach; the blur keeps whatever scrolls beneath it legible. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+4.5rem)]">
          {step < TOTAL_STEPS ? (
            <Button onClick={goNext} size="lg" fullWidth>
              Next: {STEP_TITLES[step]}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              onClick={submit}
              size="lg"
              fullWidth
              loading={submitting}
              disabled={emotions.length === 0}
            >
              <Check className="size-4" aria-hidden />
              Complete daily check-in
            </Button>
          )}

          {step === TOTAL_STEPS && emotions.length === 0 && (
            <p className="mt-2 text-center text-xs font-semibold text-[#d75046]">
              Add at least one emotion in step 2 to save this check-in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
