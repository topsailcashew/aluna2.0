"use client";

import { useId } from "react";

interface AlunaMarkProps {
  size?: number;
  className?: string;
  /** When set, the mark is exposed to assistive tech with this label. */
  title?: string;
}

/**
 * The Aluna mark: concentric ripples radiating from a still centre — a calm
 * pulse. Echoes the mood aura and the timeline rails elsewhere in the app.
 * Warm apricot at the core resolving to the deep teal that anchors the palette.
 */
export function AlunaMark({ size = 40, className, title }: AlunaMarkProps) {
  const id = useId();
  const gid = `aluna-mark-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
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
      <g stroke={`url(#${gid})`} fill="none">
        <circle cx="50" cy="50" r="45" strokeWidth="3.5" opacity="0.26" />
        <circle cx="50" cy="50" r="32" strokeWidth="4" opacity="0.5" />
        <circle cx="50" cy="50" r="20" strokeWidth="5" opacity="0.82" />
      </g>
      <circle cx="50" cy="50" r="7.5" fill={`url(#${gid})`} />
    </svg>
  );
}
