"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

/**
 * Three explicit choices rather than a two-state switch: "follow my device" is
 * a real preference, and a toggle cannot express it.
 */
export function ThemeChoice() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const hydrated = useHydrated();

  // The server cannot know the visitor's preference, so the first client
  // render matches its neutral output; the selection lands on the pass after.
  const current = hydrated ? (theme ?? "system") : undefined;

  return (
    <div className="space-y-2">
      <div
        role="radiogroup"
        aria-label="Colour theme"
        className="grid grid-cols-3 gap-2"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = current === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-bold transition-colors",
                active
                  ? "border-transparent bg-[var(--marker)] text-[var(--marker-ink)]"
                  : "border-line bg-surface text-ink-muted hover:border-deep-300 hover:text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
      {hydrated && current === "system" && (
        <p className="text-xs text-ink-subtle">
          Following your device — currently {resolvedTheme ?? "light"}.
        </p>
      )}
    </div>
  );
}
