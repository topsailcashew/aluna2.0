"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const MIN = 0;
const MAX = 10;

/**
 * 0-10 intensity control. The track carries a cool→warm gradient so the
 * position reads as a feeling, not just a number, and the current value rides
 * above the thumb.
 */
export function IntensitySlider({
  value,
  onChange,
  label = "Intensity",
  className,
  disabled,
}: IntensitySliderProps) {
  const id = useId();
  const percent = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          {label}
        </label>
      </div>

      <div className="relative pt-7">
        {/* Value bubble tracks the thumb; the 14px correction keeps it centred
            at both ends of the travel. */}
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 transition-[left] duration-150"
          style={{ left: `calc(${percent}% + ${14 - percent * 0.28}px)` }}
        >
          <span className="text-lg font-bold tabular-nums text-ink">
            {value}
          </span>
        </div>

        <input
          id={id}
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={`${label}, 0 to 10`}
          aria-valuetext={`${value} out of 10`}
          className="aluna-range w-full"
          style={{ ["--fill" as string]: `${percent}%` }}
        />

        <div className="mt-1.5 flex justify-between text-[11px] font-medium text-ink-subtle">
          <span>0 · barely there</span>
          <span>10 · overwhelming</span>
        </div>
      </div>

      <style jsx global>{`
        .aluna-range {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          background: transparent;
          cursor: pointer;
        }
        .aluna-range:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .aluna-range::-webkit-slider-runnable-track {
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #bfe0e6 0%,
            #f3d9c4 45%,
            #f3a4a4 75%,
            #e8767b 100%
          );
        }
        .aluna-range::-moz-range-track {
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            #bfe0e6 0%,
            #f3d9c4 45%,
            #f3a4a4 75%,
            #e8767b 100%
          );
        }
        .aluna-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 22px;
          width: 22px;
          margin-top: -6px;
          border-radius: 999px;
          background: #ffffff;
          border: 3px solid var(--color-deep-600);
          box-shadow: 0 2px 8px rgb(16 46 55 / 0.28);
          transition: transform 0.15s ease;
        }
        .aluna-range::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 999px;
          background: #ffffff;
          border: 3px solid var(--color-deep-600);
          box-shadow: 0 2px 8px rgb(16 46 55 / 0.28);
          transition: transform 0.15s ease;
        }
        .aluna-range:active::-webkit-slider-thumb {
          transform: scale(1.12);
        }
        .aluna-range:active::-moz-range-thumb {
          transform: scale(1.12);
        }
      `}</style>
    </div>
  );
}
