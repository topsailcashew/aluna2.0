"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { EMOTIONS } from "@/lib/data/emotions";
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

  // The family behind the most recent check-in written today.
  const todaysPrimary = (() => {
    const today = dayKey();
    const entry = entries.find((item) => dayKey(item.createdAt) === today);
    return entry?.primaryEmotions[0] ?? null;
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
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <Users className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle>Today&apos;s pulse</CardTitle>
          <CardSubtitle>
            {total === 0
              ? "Nobody has checked in yet today"
              : `${total} ${total === 1 ? "person has" : "people have"} shared how they feel`}
          </CardSubtitle>
        </div>
      </div>

      {total > 0 && (
        <>
          <div
            className="flex h-3 overflow-hidden rounded-full bg-surface-sunken"
            role="img"
            aria-label={EMOTIONS.filter((p) => pulse[p.id])
              .map((p) => `${p.label} ${Math.round(((pulse[p.id] ?? 0) / total) * 100)}%`)
              .join(", ")}
          >
            {EMOTIONS.map((primary) => {
              const count = pulse[primary.id] ?? 0;
              if (!count) return null;
              return (
                <span
                  key={primary.id}
                  style={{
                    width: `${(count / total) * 100}%`,
                    backgroundColor: primary.color,
                  }}
                />
              );
            })}
          </div>

          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {EMOTIONS.filter((primary) => pulse[primary.id]).map((primary) => (
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
            Add today&apos;s{" "}
            {EMOTIONS.find((p) => p.id === todaysPrimary)?.label.toLowerCase()}
          </button>
        )}
      </div>
    </Card>
  );
}
