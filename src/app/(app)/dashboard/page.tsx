"use client";

import Link from "next/link";
import { ChevronRight, Lightbulb, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { Aura } from "@/components/dashboard/aura";
import { JourneyTimeline } from "@/components/dashboard/journey-timeline";
import { NudgeCard } from "@/components/dashboard/nudge-card";
import { OrbCta } from "@/components/dashboard/orb-cta";
import { PatternCard } from "@/components/dashboard/pattern-card";
import { WeekWave } from "@/components/dashboard/week-wave";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { ErrorState, OfflineNote } from "@/components/ui/error-state";
import { currentStreak, hasCheckedInToday, weekStrip } from "@/lib/analytics";
import { dayKey } from "@/lib/data/prompts";
import {
  PRIMARY_BY_ID,
  primaryIdsFrom,
  type PrimaryEmotionId,
} from "@/lib/data/emotions";
import { reflectionFor } from "@/lib/data/reflections";
import { useEntries } from "@/hooks/use-entries";
import { useOnline } from "@/hooks/use-online";
import { useProfile } from "@/hooks/use-profile";

export default function DashboardPage() {
  const { entries, loading, error } = useEntries();
  const { profile } = useProfile();
  const online = useOnline();

  const streak = currentStreak(entries);
  const checkedInToday = hasCheckedInToday(entries);
  const days = weekStrip(entries);

  // The family behind today's most recent check-in. It tints the whole screen,
  // so the app looks like whatever the day has been rather than always the same.
  const todaysFamily: PrimaryEmotionId | null = (() => {
    const today = dayKey();
    const entry = entries.find((item) => dayKey(item.createdAt) === today);
    return entry ? (primaryIdsFrom(entry.emotions)[0] ?? null) : null;
  })();

  const family = todaysFamily ? PRIMARY_BY_ID.get(todaysFamily) : undefined;
  const reflection = reflectionFor(todaysFamily, dayKey());

  return (
    <div className="space-y-5">
      <Aura accent={family?.color ?? null} />

      <AppHeader
        subtitle={
          checkedInToday
            ? "Your check-in is done for today"
            : "Welcome back to your mind"
        }
      />

      {!online && <OfflineNote />}
      {error && online && (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      )}

      {loading ? (
        <>
          <ChartSkeleton height={176} />
          <ChartSkeleton height={92} />
        </>
      ) : (
        <>
          <OrbCta
            accent={family?.color ?? null}
            checkedInToday={checkedInToday}
            familyLabel={family?.label ?? null}
            streak={streak}
          />

          <div className="space-y-1.5 px-2 pt-1 pb-1 text-center">
            <p className="font-display text-lg leading-snug text-balance text-ink italic">
              {reflection.text}
            </p>
            {reflection.action && (
              <Link
                href={reflection.action.href}
                className="inline-flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-75"
                style={{ color: family?.color ?? "var(--color-deep-600)" }}
              >
                {reflection.action.label}
                <ChevronRight className="size-3.5" aria-hidden />
              </Link>
            )}
          </div>

          {!checkedInToday && profile.reminderHour !== null && (
            <NudgeCard hour={profile.reminderHour} />
          )}

          <WeekWave days={days} entries={entries} />
          <PatternCard entries={entries} />
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <ShortcutCard
          href="/breathe"
          icon={Wind}
          title="Breathe"
          detail="Guided, with sound"
        />
        <ShortcutCard
          href="/insights"
          icon={Lightbulb}
          title="Insights"
          detail="What stands out"
        />
      </div>

      {loading ? (
        <ChartSkeleton height={200} />
      ) : (
        <JourneyTimeline entries={entries} />
      )}
    </div>
  );
}

function ShortcutCard({
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
      className="card flex flex-col gap-2 bg-surface/70 p-4 backdrop-blur transition-colors hover:border-line-strong"
    >
      <span className="grid size-9 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-extrabold text-ink">{title}</span>
        <span className="block text-[11px] text-ink-muted">{detail}</span>
      </span>
    </Link>
  );
}
