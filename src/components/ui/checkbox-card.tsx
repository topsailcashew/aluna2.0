"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface CheckboxCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}

/** A full-width tappable row with a custom check — used for thought patterns. */
export function CheckboxCard({
  checked,
  onChange,
  label,
  hint,
}: CheckboxCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors",
        checked
          ? "border-deep-300 bg-deep-50 dark:bg-deep-900/50"
          : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
          checked
            ? "border-deep-600 bg-deep-600 text-white"
            : "border-line-strong bg-surface",
        )}
      >
        {checked && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
          >
            <Check className="size-3.5" strokeWidth={3.5} />
          </motion.span>
        )}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-sm leading-snug font-semibold",
            checked ? "text-deep-800 dark:text-deep-100" : "text-ink",
          )}
        >
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>
        )}
      </span>
    </label>
  );
}
