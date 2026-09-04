"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

/**
 * Two explicit buttons rather than one cycling control — the current theme is
 * then legible at a glance instead of inferred from an icon.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  // The server can't know the visitor's theme, so the first client render must
  // match its neutral output; the active state lands on the pass after.
  const current = hydrated ? resolvedTheme : undefined;

  const options = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
  ] as const;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-surface-sunken p-1",
        className,
      )}
      role="group"
      aria-label="Colour theme"
    >
      {options.map(({ value, label, Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-label={`${label} theme`}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors",
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-subtle hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
