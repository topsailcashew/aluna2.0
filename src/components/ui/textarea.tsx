"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  optional?: boolean;
  error?: string;
  /** When set, shows a live `used / max` counter under the field. */
  maxLength?: number;
  value?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, label, optional, error, maxLength, value, id, ...props },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const used = typeof value === "string" ? value.length : 0;
    const nearLimit = maxLength ? used > maxLength * 0.9 : false;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-xs font-semibold text-ink-muted"
          >
            {label}
            {optional && (
              <span className="ml-1.5 font-medium normal-case text-ink-subtle">
                (optional)
              </span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-h-24 w-full resize-none rounded-2xl border bg-surface px-4 py-3 text-sm text-ink",
            "placeholder:text-ink-subtle transition-colors",
            "focus:border-deep-400 focus:outline-none focus:ring-2 focus:ring-deep-400/25",
            error ? "border-[#e0685f]" : "border-line",
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-[#d75046]">{error}</p>
          {maxLength && (
            <p
              className={cn(
                "shrink-0 text-xs tabular-nums",
                nearLimit ? "text-[#d75046]" : "text-ink-subtle",
              )}
            >
              {used}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);
