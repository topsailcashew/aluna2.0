"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-deep-600" : "bg-surface-sunken",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 size-5 rounded-full bg-white shadow transition-[left] duration-200",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}
