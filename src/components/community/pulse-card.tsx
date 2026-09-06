"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { HatchedBars, type HatchedBar } from "@/components/ui/hatched-bars";
import { EMOTIONS, primaryIdsFrom } from "@/lib/data/emotions";
import { dayKey } from "@/lib/data/prompts";
import {
  contributeToPulse,
  hasContributedToday,
  type PulseCounts,
} from "@/lib/firebase/community";
import { useAuth } from "@/lib/firebase/auth-context";
import type { CheckInEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PulseCardProps {
  pulse: PulseCounts;
  /** Used to offer today's own emotion as the thing to contribute. */
  entries: CheckInEntry[];
  optedIn: boolean;
}

export function PulseCard({ pulse, entries, optedIn }: PulseCardProps) {
  const { user } = useAuth();
  const [contributed, setContributed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void hasContributedToday(user.uid)
      .then((value) => {
        if (!cancelled) setContributed(value);
      })
      .catch(() => {
        if (!cancelled) setContributed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const total = EMOTIONS.reduce(
    (sum, primary) => sum + (pulse[primary.id] ?? 0),
    0,
  );

  const represented = EMOTIONS.filter((p) => pulse[p.id]);
  const peak = Math.max(1, ...represented.map((p) => pulse[p.id] ?? 0));
  const bars: HatchedBar[] = represented.map((p) => ({
    value: (pulse[p.id] ?? 0) / peak,
    color: p.color,
    label: p.label,
    solid: (pulse[p.id] ?? 0) === peak,
  }));

  // The family behind the most recent check-in written today.
  const todaysPrimary = (() => {
    const today = dayKey();
    const entry = entries.find((item) => dayKey(item.createdAt) === today);
    return entry ? (primaryIdsFrom(entry.emotions)[0] ?? null) : null;
  })();

  const contribute = async () => {
    if (!user || !todaysPrimary) return;
    setBusy(true);
    try {
      await contributeToPulse(
        user.uid,
        todaysPrimary as (typeof EMOTIONS)[number]["id"],
      );
      setContributed(true);
      toast.success("Added to today's pulse");
    } catch {
      toast.error("Could not add to the pulse just now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>Today&apos;s pulse</CardTitle>
          <CardSubtitle>
            {total === 0
              ? "Nobody has checked in yet today"
              : `${total === 1 ? "person" : "people"} sharing how they feel`}
          </CardSubtitle>
        </div>
        <p className="flex items-baseline gap-1">
          <span className="stat text-4xl">{total}</span>
          <Users className="size-4 text-ink-subtle" aria-hidden />
        </p>
      </div>

      {total > 0 && (
        <>
          <HatchedBars
            bars={bars}
            height={128}
            legend={{ solid: "most felt today", hatched: "other families" }}
          />
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {represented.map((primary) => (
              <li key={primary.id} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: primary.color }}
                />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">
                  {primary.label}
                </span>
                <span className="text-xs font-bold tabular-nums text-ink-subtle">
                  {pulse[primary.id]}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="rounded-2xl bg-surface-sunken p-3.5">
        {!optedIn ? (
          <p className="text-xs leading-relaxed text-ink-muted">
            You are reading only. Turn on{" "}
            <strong className="font-bold text-ink">Community pulse</strong> in
            your profile to add your own feeling to the count.
          </p>
        ) : contributed ? (
          <p className="text-xs leading-relaxed text-ink-muted">
            Your feeling is in today&apos;s count. Come back tomorrow.
          </p>
        ) : !todaysPrimary ? (
          <p className="text-xs leading-relaxed text-ink-muted">
            Do a check-in today and you can add its emotion family here.
          </p>
        ) : (
          <button
            type="button"
            onClick={contribute}
            disabled={busy || contributed === null}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity",
              busy && "opacity-70",
            )}
            style={{
              backgroundColor: EMOTIONS.find((p) => p.id === todaysPrimary)
                ?.color,
            }}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Add {EMOTIONS.find((p) => p.id === todaysPrimary)?.label} to the
            count
          </button>
        )}
      </div>
    </Card>
  );
}
