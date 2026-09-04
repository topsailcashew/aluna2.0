import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-surface-sunken text-ink-subtle">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-bold text-ink">{title}</p>
        <p className="mx-auto max-w-[34ch] text-xs leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
