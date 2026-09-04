"use client";

import Link from "next/link";
import { TriangleAlert, Users, Wind } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { EmotionDistribution } from "@/components/dashboard/emotion-distribution";
import { HeroCard } from "@/components/dashboard/hero-card";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { SensationTimeline } from "@/components/dashboard/sensation-timeline";
import { StatCards } from "@/components/dashboard/stat-cards";
import { WeekStrip } from "@/components/dashboard/week-strip";
import { ChartSkeleton, StatCardSkeleton } from "@/components/ui/skeleton";
import { currentStreak, hasCheckedInToday, weekStrip } from "@/lib/analytics";
import { useEntries } from "@/hooks/use-entries";

export default function DashboardPage() {
  const { entries, loading, error } = useEntries();

  const streak = currentStreak(entries);
  const checkedInToday = hasCheckedInToday(entries);
  const days = weekStrip(entries);

  return (
    <div className="space-y-5">
      <AppHeader
        subtitle={
          checkedInToday
            ? "Your check-in is done for today"
            : "Welcome back to your mind"
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#f0c2bd] bg-[#fdecea] p-4 text-[#8d3b32] dark:border-[#6b3630] dark:bg-[#3a201d] dark:text-[#f3b8b1]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="text-xs leading-relaxed font-semibold">{error}</p>
        </div>
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
          href="/community"
          icon={Users}
          title="Community"
          detail="How others are doing"
        />
      </div>

      <section aria-label="Wellness charts" className="space-y-4">
        <h2 className="px-1 text-base font-extrabold tracking-tight text-ink">
          Wellness charts
        </h2>
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton height={144} />
          </>
        ) : (
          <>
            <SensationTimeline entries={entries} />
            <EmotionDistribution entries={entries} />
          </>
        )}
      </section>

      <section aria-label="Recent entries">
        {loading ? (
          <ChartSkeleton height={200} />
        ) : (
          <RecentEntries entries={entries} />
        )}
      </section>
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
