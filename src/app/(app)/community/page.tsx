"use client";

import { TriangleAlert } from "lucide-react";

import { PulseCard } from "@/components/community/pulse-card";
import { ReflectionWall } from "@/components/community/reflection-wall";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { useCommunity } from "@/hooks/use-community";
import { useEntries } from "@/hooks/use-entries";
import { useProfile } from "@/hooks/use-profile";

export default function CommunityPage() {
  const { pulse, reflections, loading, error } = useCommunity();
  const { entries } = useEntries();
  const { profile } = useProfile();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Community
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          You are not the only one
        </h1>
        <p className="text-sm text-ink-muted">
          No profiles, no followers, no replies. Just a sense of how everyone
          else is doing, and a wall of things people felt like saying.
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#f0c2bd] bg-[#fdecea] p-4 text-[#8d3b32] dark:border-[#6b3630] dark:bg-[#3a201d] dark:text-[#f3b8b1]">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="text-xs leading-relaxed font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <>
          <ChartSkeleton height={120} />
          <ChartSkeleton height={200} />
        </>
      ) : (
        <>
          <PulseCard
            pulse={pulse}
            entries={entries}
            optedIn={profile.shareToCommunity}
          />
          <ReflectionWall reflections={reflections} entries={entries} />
        </>
      )}
    </div>
  );
}
