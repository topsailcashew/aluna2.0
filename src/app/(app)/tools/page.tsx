import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Compass,
  Mic,
  NotebookPen,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * The Tools hub: ways to steady yourself. The regulation journey is the
 * featured path; the rest are single-purpose tools you can reach for directly.
 */
export default function ToolsPage() {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="font-display text-2xl text-ink">
          Emotional regulation tools
        </h1>
        <p className="text-sm text-ink-muted">
          Ways to steady yourself — in the moment, or after.
        </p>
      </header>

      {/* Featured: the guided journey. */}
      <Link
        href="/journey"
        className="card-hero block p-5"
        style={{ "--tone": "var(--color-fearful)" } as CSSProperties}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-2xl bg-[var(--marker)] text-[var(--marker-ink)]"
          >
            <Compass className="size-5" />
          </span>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full bg-[var(--marker)] text-[var(--marker-ink)]"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <h2 className="font-display mt-5 text-2xl">Regulation journey</h2>
        <p className="mt-1 max-w-[28ch] text-sm opacity-80">
          Five gentle steps, from noticing a feeling to choosing what to do
          with it.
        </p>
      </Link>

      <div className="space-y-3">
        <ToolRow
          href="/breathe"
          icon={Wind}
          title="Breathe"
          detail="Guided breathing, with sound"
        />
        <ToolRow
          href="/ramble"
          icon={Mic}
          title="Ramble"
          detail="Say it out loud — we write it down"
        />
        <ToolRow
          href="/journal"
          icon={NotebookPen}
          title="Journal"
          detail="A blank page, encrypted"
        />
      </div>
    </div>
  );
}

function ToolRow({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-3 p-4 transition-colors hover:border-line-strong"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-ink">{title}</span>
        <span className="block text-xs text-ink-muted">{detail}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
    </Link>
  );
}
