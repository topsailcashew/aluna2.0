"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * The mark, breathing. Three rings expand outward from the centre on a loop —
 * a calm pulse for load and unlock states. Falls back to the static mark under
 * reduced-motion (handled in globals.css).
 */
export function RippleLoader({
  size = 76,
  label,
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  const id = useId();
  const gid = `ripple-${id}`;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={gid}
            x1="16"
            y1="12"
            x2="86"
            y2="92"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#EBA45C" />
            <stop offset="0.52" stopColor="#D9776C" />
            <stop offset="1" stopColor="#1E6B78" />
          </linearGradient>
        </defs>
        <g className="aluna-ripple" stroke={`url(#${gid})`} fill="none">
          <circle cx="50" cy="50" r="44" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="44"
            strokeWidth="4"
            style={{ animationDelay: "0.55s" }}
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            strokeWidth="4"
            style={{ animationDelay: "1.1s" }}
          />
        </g>
        <circle cx="50" cy="50" r="7.5" fill={`url(#${gid})`}>
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="1.65s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      {label && (
        <p className="text-sm font-semibold text-ink-subtle">{label}</p>
      )}
    </div>
  );
}
