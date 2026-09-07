import type { ReactNode } from "react";
import Image from "next/image";

import { AlunaMark } from "@/components/brand/aluna-mark";

/**
 * A phone shell for the live app previews.
 *
 * What sits inside is the real component with demo data — the actual product,
 * not an image of it — so these previews stay correct through every redesign
 * without anyone remembering to retake a screenshot.
 */
export function PhoneFrame({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    // Column layout with a growing shell, so three previews of different
    // content heights still line their captions up along one baseline.
    <figure className={`flex flex-col ${className ?? ""}`}>
      <div className="flex-1 rounded-[2rem] border border-line bg-[#12262c] p-2 shadow-lift dark:bg-[#1a2c33]">
        <div className="relative h-full overflow-hidden rounded-[1.6rem] bg-canvas">
          {/* Status strip, so the panel reads as a phone without a fake clock. */}
          <div className="flex items-center justify-center pt-2.5 pb-1">
            <span className="h-1 w-14 rounded-full bg-ink-subtle/25" />
          </div>
          <div className="px-3.5 pt-1 pb-5" aria-hidden>
            {children}
          </div>
        </div>
      </div>
      <figcaption className="mt-3.5 text-center text-sm font-semibold text-ink-muted">
        {label}
      </figcaption>
    </figure>
  );
}

/**
 * A photograph slot.
 *
 * `src` is null until real photography exists. Rather than render a broken
 * image or an obvious hole, it falls back to a soft wash built from the seven
 * emotion family colours — brand texture that looks deliberate on its own and
 * is simply replaced when a photograph is dropped in.
 */
export function Photo({
  src,
  alt,
  className,
  aspect = "aspect-[4/5]",
}: {
  src: string | null;
  alt: string;
  className?: string;
  aspect?: string;
}) {
  if (src) {
    return (
      <div
        className={`${aspect} relative w-full overflow-hidden rounded-[1.75rem] ${className ?? ""}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 640px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${aspect} relative w-full overflow-hidden rounded-[1.75rem] border border-line ${className ?? ""}`}
      style={{
        background:
          "radial-gradient(70% 60% at 20% 15%, color-mix(in oklab, var(--color-happy) 34%, transparent), transparent 70%)," +
          "radial-gradient(65% 55% at 85% 25%, color-mix(in oklab, var(--color-fearful) 30%, transparent), transparent 70%)," +
          "radial-gradient(75% 70% at 55% 95%, color-mix(in oklab, var(--color-sad) 32%, transparent), transparent 72%)," +
          "linear-gradient(160deg, var(--surface) 0%, var(--surface-sunken) 100%)",
      }}
    >
      <span className="absolute inset-0 grid place-items-center opacity-25">
        <AlunaMark size={64} />
      </span>
    </div>
  );
}
