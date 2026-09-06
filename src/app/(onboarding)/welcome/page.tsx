"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Lock, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { saveProfile } from "@/lib/firebase/user-profile";
import { TOTAL_EMOTIONS } from "@/lib/data/emotions";
import { cn } from "@/lib/utils";

interface Screen {
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
}

const SCREENS: Screen[] = [
  {
    Icon: Sparkles,
    eyebrow: "Welcome",
    title: "Understand your feelings by naming them",
    body: "A short daily check-in — how your body feels, what emotion fits, what your mind has been doing. Most take under a minute.",
    points: [
      "Spot the patterns and what sets them off",
      "Build a vocabulary more precise than fine",
      "No streak to protect, no pressure to perform",
    ],
  },
  {
    Icon: TrendingUp,
    eyebrow: "The wheel",
    title: `${TOTAL_EMOTIONS} words, three levels deep`,
    body: "Start with a family — happy, sad, angry — then narrow until it fits. The precise word often lands differently from the obvious one, and you can pick several, including contradictory ones.",
  },
  {
    Icon: Lock,
    eyebrow: "Your privacy",
    title: "Encrypted before it leaves your device",
    body: "Every entry is locked with a key derived from your password that never reaches our servers. Nobody else can read your check-ins — not us, not anyone with access to the database.",
    points: [
      "Your recovery phrase is the only other way in",
      "Lose both and your entries cannot be recovered",
      "Export or delete everything, whenever you like",
    ],
  },
];

export default function WelcomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const finish = async () => {
    if (user) {
      // Failing to record this is not worth blocking on: the worst case is
      // seeing the welcome once more.
      await saveProfile(user.uid, {
        onboardedAt: new Date().toISOString(),
      }).catch(() => {});
    }
    router.replace("/dashboard");
  };

  const screen = SCREENS[index];
  const isLast = index === SCREENS.length - 1;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5" aria-hidden>
          {SCREENS.map((_, dot) => (
            <span
              key={dot}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dot === index ? "w-6 bg-deep-600" : "w-1.5 bg-line-strong",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={finish}
          className="text-sm font-bold text-ink-subtle transition-colors hover:text-ink"
        >
          Skip
        </button>
      </div>

      <div key={index} className="step-enter flex flex-1 flex-col justify-center gap-5 py-8">
        <span className="grid size-14 place-items-center rounded-3xl bg-deep-50 text-deep-600 dark:bg-deep-900 dark:text-deep-200">
          <screen.Icon className="size-6" aria-hidden />
        </span>

        <div className="space-y-2">
          <p className="text-xs font-bold text-deep-500 dark:text-deep-300">
            {screen.eyebrow}
          </p>
          <h1 className="text-3xl leading-tight font-display text-balance text-ink">
            {screen.title}
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">{screen.body}</p>
        </div>

        {screen.points && (
          <ul className="space-y-2.5">
            {screen.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-deep-400"
                />
                <span className="text-sm font-medium text-ink">{point}</span>
              </li>
            ))}
          </ul>
        )}

        {isLast && (
          <div className="flex items-start gap-3 rounded-2xl bg-surface-sunken p-3.5">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
            <p className="text-xs leading-relaxed text-ink-muted">
              Keep the twelve words from signup somewhere safe. They are the
              only way back into your entries if you forget your password.
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={() => (isLast ? void finish() : setIndex(index + 1))}
        size="lg"
        fullWidth
      >
        {isLast ? "Get started" : "Next"}
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </main>
  );
}
