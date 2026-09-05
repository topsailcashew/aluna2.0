"use client";

/**
 * The soft light behind the home screen, tinted by whichever emotion family
 * led today.
 *
 * Built from layered radial gradients rather than a blurred element: a large
 * `filter: blur()` forces the compositor to rasterise a full-screen layer on
 * every scroll, which is exactly the sort of thing that makes a phone warm.
 * Gradients are soft to begin with and cost nothing to move.
 */
export function Aura({ accent }: { accent: string | null }) {
  const hue = accent ?? "var(--color-deep-400)";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-80 transition-[background] duration-700 dark:opacity-100"
        style={{
          background: `
            radial-gradient(56% 32% at 50% 10%, color-mix(in oklab, ${hue} 62%, transparent), transparent 70%),
            radial-gradient(64% 38% at 8% 42%, color-mix(in oklab, ${hue} 38%, transparent), transparent 68%),
            radial-gradient(64% 38% at 96% 58%, color-mix(in oklab, ${hue} 40%, transparent), transparent 68%),
            radial-gradient(86% 44% at 50% 94%, color-mix(in oklab, ${hue} 26%, transparent), transparent 74%)
          `,
        }}
      />
    </div>
  );
}
