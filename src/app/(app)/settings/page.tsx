"use client";

import { useState } from "react";
import { Bell, Download, Palette, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { BackHeader } from "@/components/layout/back-header";
import {
  DangerSection,
  PasswordSection,
} from "@/components/profile/security-section";
import { ThemeChoice } from "@/components/profile/theme-choice";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEntries } from "@/hooks/use-entries";
import { useProfile } from "@/hooks/use-profile";
import { buildExport, downloadExport } from "@/lib/firebase/account";
import { authErrorMessage, useAuth } from "@/lib/firebase/auth-context";
import { saveProfile } from "@/lib/firebase/user-profile";
import { cn } from "@/lib/utils";

/** Whole hours only — a reminder is a nudge, not an appointment. */
const HOURS = [7, 9, 12, 15, 18, 20, 22];

export default function SettingsPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { entries, loading } = useEntries();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const persist = async (changes: Parameters<typeof saveProfile>[1]) => {
    setSaving(true);
    try {
      await saveProfile(user.uid, changes);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <BackHeader eyebrow="Profile" title="Settings" />

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <Palette className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle>Appearance</CardTitle>
            <CardSubtitle>Light, dark, or whatever your device says</CardSubtitle>
          </div>
        </div>
        <ThemeChoice />
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <Bell className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle>Daily nudge</CardTitle>
            <CardSubtitle>
              A quiet prompt on the home screen after this hour
            </CardSubtitle>
          </div>
          <Switch
            checked={profile.reminderHour !== null}
            disabled={saving}
            onChange={(on) => void persist({ reminderHour: on ? 20 : null })}
            label="Show a daily nudge"
          />
        </div>

        {profile.reminderHour !== null && (
          <div
            role="radiogroup"
            aria-label="Nudge from"
            className="grid grid-cols-4 gap-2"
          >
            {HOURS.map((hour) => (
              <button
                key={hour}
                type="button"
                role="radio"
                aria-checked={profile.reminderHour === hour}
                onClick={() => void persist({ reminderHour: hour })}
                className={cn(
                  "rounded-xl border py-2 text-xs font-bold transition-colors",
                  profile.reminderHour === hour
                    ? "border-deep-600 bg-deep-600 text-white"
                    : "border-line bg-surface text-ink hover:border-deep-300",
                )}
              >
                {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "noon" : `${hour}am`}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs leading-relaxed text-ink-subtle">
          This shows up inside Aluna when you open it — there are no push
          notifications, so nothing interrupts you.
        </p>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <Users className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle>Community pulse</CardTitle>
            <CardSubtitle>Add today&apos;s feeling to the anonymous count</CardSubtitle>
          </div>
          <Switch
            checked={profile.shareToCommunity}
            disabled={saving}
            onChange={(on) => void persist({ shareToCommunity: on })}
            label="Contribute to the community pulse"
          />
        </div>
        <p className="text-xs leading-relaxed text-ink-subtle">
          Only the emotion family is counted — never the specific feelings, the
          sensations, the notes, or your name.
        </p>
      </Card>

      <Card>
        <button
          type="button"
          onClick={() => {
            downloadExport(buildExport(user, entries));
            toast.success("Export downloaded");
          }}
          disabled={loading || entries.length === 0}
          className="flex w-full items-center gap-3 text-left disabled:opacity-50"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
            <Download className="size-4.5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold text-ink">
              Export your data
            </span>
            <span className="block text-xs text-ink-muted">
              Decrypted on this device, saved as JSON
            </span>
          </span>
        </button>
      </Card>

      <Card>
        <PasswordSection user={user} />
      </Card>

      <Card className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <ShieldCheck className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle>How your data is held</CardTitle>
          <p className="text-xs leading-relaxed text-ink-muted">
            Every check-in is encrypted on your device before it is sent. The
            key is derived from your password and never leaves the browser, so
            nobody else can read your entries — not us, not anyone with access
            to the database. Your recovery phrase is the only other way in.
          </p>
        </div>
      </Card>

      <Card>
        <DangerSection user={user} />
      </Card>
    </div>
  );
}
