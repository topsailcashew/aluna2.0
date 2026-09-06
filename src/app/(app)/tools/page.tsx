import Link from "next/link";
import { ChevronRight, Compass, Mic, NotebookPen, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The Tools hub: ways to steady yourself. "Regulate Now" (the guided journey)
 * leads, marked with an accent chip; the rest are single-purpose tools.
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

      <div className="space-y-3">
        <ToolRow
          href="/journey"
          icon={Compass}
          title="Regulate Now"
          detail="A guided path from feeling to action"
          accent
        />
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
  accent,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-3 p-4 transition-colors hover:border-line-strong"
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-2xl",
          accent
            ? "bg-[var(--marker)] text-[var(--marker-ink)]"
            : "bg-surface-sunken text-ink-muted",
        )}
      >
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
