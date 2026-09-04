"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface StepProgressProps {
  current: number;
  total: number;
  onStepSelect?: (step: number) => void;
  /** Steps the user has already completed or visited. */
  reachable: number;
}

export function StepProgress({
  current,
  total,
  onStepSelect,
  reachable,
}: StepProgressProps) {
  return (
    <div className="space-y-2">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Step ${current} of ${total}`}
      >
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const filled = step <= current;
          const canJump = Boolean(onStepSelect) && step <= reachable;
          return (
            <button
              key={step}
              type="button"
              disabled={!canJump}
              onClick={() => onStepSelect?.(step)}
              aria-label={`Go to step ${step}`}
              className={cn(
                "h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken",
                canJump ? "cursor-pointer" : "cursor-default",
              )}
            >
              <motion.span
                className="block h-full rounded-full bg-deep-600"
                initial={false}
                animate={{ scaleX: filled ? 1 : 0 }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs font-bold text-ink-subtle">
        Step {current} of {total}
      </p>
    </div>
  );
}
