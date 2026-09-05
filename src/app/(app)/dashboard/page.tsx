"use client";

import Link from "next/link";
import { CalendarDays, LineChart, Wind } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { HeroCard } from "@/components/dashboard/hero-card";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { StatCards } from "@/components/dashboard/stat-cards";
import { NudgeCard } from "@/components/dashboard/nudge-card";
import { ReflectionCard } from "@/components/dashboard/reflection-card";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { ErrorState, OfflineNote } from "@/components/ui/error-state";
import { useOnline } from "@/hooks/use-online";
import { useProfile } from "@/hooks/use-profile";
import { ChartSkeleton, StatCardSkeleton } from "@/components/ui/skeleton";
import { currentStreak, hasCheckedInToday, weekStrip } from "@/lib/analytics";
import { primaryIdsFrom, type PrimaryEmotionId } from "@/lib/data/emotions";
import { dayKey } from "@/lib/data/prompts";
import { useEntries } from "@/hooks/use-entries";

export default function DashboardPage() {
  const { entries, loading, error } = useEntries();
  const { profile } = useProfile();
  const online = useOnline();

  const streak = currentStreak(entries);
  const checkedInToday = hasCheckedInToday(entries);
  const days = weekStrip(entries);

  // The family behind today's most recent check-in, if there is one.
  const todaysFamily: PrimaryEmotionId | null = (() => {
    const today = dayKey();
    const entry = entries.find((item) => dayKey(item.createdAt) === today);
    return entry ? (primaryIdsFrom(entry.emotions)[0] ?? null) : null;
  })();

  return (
    <div className="space-y-5">
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
          <ChartSkeleton height={92} />
          <StatCardSkeleton />
        </>
      ) : (
        <>
          <HeroCard
            entries={entries}
            streak={streak}
            checkedInToday={checkedInToday}
          />
          <ReflectionCard family={todaysFamily} />
          {!checkedInToday && profile.reminderHour !== null && (
            <NudgeCard hour={profile.reminderHour} />
          )}
          <WeekStrip days={days} />
          <StatCards entries={entries} />
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
          icon={LineChart}
          title="Insights"
          detail="What stands out"
        />
      </div>

      <section aria-label="Recent entries">
        {loading ? (
          <ChartSkeleton height={200} />
        ) : (
          <RecentEntries entries={entries} />
        )}
      </section>

      <Link
        href="/history"
        className="card flex items-center gap-3 p-4 transition-colors hover:border-line-strong"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <CalendarDays className="size-4.5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-ink">
            All your check-ins
          </span>
          <span className="block text-[11px] text-ink-muted">
            Browse by day, filter by feeling
          </span>
        </span>
      </Link>
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
  icon: typeof Wind;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="card flex flex-col gap-2 p-4 transition-colors hover:border-line-strong"
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
