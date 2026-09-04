"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Check,
  Download,
  LogOut,
  Palette,
  Pencil,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  DangerSection,
  PasswordSection,
} from "@/components/profile/security-section";
import { AvatarEditor } from "@/components/profile/avatar-editor";
import { ThemeChoice } from "@/components/profile/theme-choice";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardSubtitle, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEntries } from "@/hooks/use-entries";
import { useProfile } from "@/hooks/use-profile";
import {
  buildExport,
  changeDisplayName,
  downloadExport,
} from "@/lib/firebase/account";
import { authErrorMessage, useAuth } from "@/lib/firebase/auth-context";
import { saveProfile } from "@/lib/firebase/user-profile";
import { relativeTime } from "@/lib/utils";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { entries, loading } = useEntries();
  const router = useRouter();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const name = profile.displayName || user.displayName || "";

  const persist = async (changes: Parameters<typeof saveProfile>[1]) => {
    try {
      await saveProfile(user.uid, changes);
    } catch (error) {
      toast.error(authErrorMessage(error));
    }
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      toast.error("Names cannot be empty.");
      return;
    }
    setSavingName(true);
    try {
      await changeDisplayName(user, trimmed);
      toast.success("Name updated");
      setEditingName(false);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      toast.error(authErrorMessage(error));
      setSigningOut(false);
    }
  };

  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime)
    : null;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-xs font-bold tracking-[0.14em] text-deep-500 uppercase">
          Profile
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Your account
        </h1>
      </header>

      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            url={profile.avatarUrl}
            color={profile.avatarColor}
            name={name || user.email}
            className="size-14 rounded-3xl"
            textClassName="text-xl"
          />
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="space-y-2">
                <Input
                  label="Display name"
                  value={nameDraft}
                  maxLength={60}
                  autoFocus
                  onChange={(event) => setNameDraft(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveName} loading={savingName}>
                    <Check className="size-3.5" aria-hidden />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="truncate text-lg font-extrabold text-ink">
                  {name || "Your space"}
                </p>
                <p className="truncate text-xs text-ink-muted">{user.email}</p>
                {memberSince && (
                  <p className="mt-0.5 text-[11px] text-ink-subtle">
                    With Aluna since{" "}
                    {memberSince.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </>
            )}
          </div>

          {!editingName && (
            <button
              type="button"
              onClick={() => {
                setNameDraft(name);
                setEditingName(true);
              }}
              aria-label="Edit display name"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-muted transition-colors hover:text-ink"
            >
              <Pencil className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <CardTitle>Picture</CardTitle>
        <AvatarEditor
          name={name || user.email || "A"}
          avatarUrl={profile.avatarUrl}
          avatarColor={profile.avatarColor}
          onChange={(changes) => void persist(changes)}
        />
      </Card>

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
            <Users className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle>Community pulse</CardTitle>
            <CardSubtitle>
              Add today&apos;s feeling to the anonymous count
            </CardSubtitle>
          </div>
          <Switch
            checked={profile.shareToCommunity}
            onChange={(value) => void persist({ shareToCommunity: value })}
            label="Contribute to the community pulse"
          />
        </div>
        <p className="text-xs leading-relaxed text-ink-subtle">
          Only the emotion family is counted — never the specific feelings, the
          sensations, the notes, or your name. You can switch this off at any
          time.
        </p>
      </Card>

      <Card className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
          <CalendarCheck className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle>Your record</CardTitle>
          <CardSubtitle>
            {loading
              ? "Counting your entries…"
              : entries.length === 0
                ? "No check-ins yet"
                : `${entries.length} check-in${entries.length === 1 ? "" : "s"}${
                    entries[0]
                      ? ` · last one ${relativeTime(entries[0].createdAt)}`
                      : ""
                  }`}
          </CardSubtitle>
        </div>
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
              Every check-in as a JSON file, on your device
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
          <CardTitle>Privacy</CardTitle>
          <p className="text-xs leading-relaxed text-ink-muted">
            Every entry is stored under your own user id and readable only by
            you. Nothing you log is shared, published or used to train anything.
          </p>
        </div>
      </Card>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        loading={signingOut}
        onClick={handleSignOut}
      >
        <LogOut className="size-4" aria-hidden />
        Log out
      </Button>

      <Card>
        <DangerSection user={user} />
      </Card>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-deep-600" : "bg-surface-sunken"
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-1 size-5 rounded-full bg-white shadow transition-[left] duration-200 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
