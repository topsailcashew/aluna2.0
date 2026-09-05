"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  HelpCircle,
  LineChart,
  LogOut,
  Pencil,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { AvatarEditor } from "@/components/profile/avatar-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEntries } from "@/hooks/use-entries";
import { useProfile } from "@/hooks/use-profile";
import { changeDisplayName } from "@/lib/firebase/account";
import { authErrorMessage, useAuth } from "@/lib/firebase/auth-context";
import { saveProfile } from "@/lib/firebase/user-profile";
import { relativeTime } from "@/lib/utils";

/**
 * A hub rather than a settings dump: the account at the top, then one row out
 * to each area. Everything that used to be stacked here as cards now lives on
 * its own route, which keeps this page short enough to take in at a glance.
 */
const LINKS: { href: string; label: string; detail: string; Icon: LucideIcon }[] =
  [
    {
      href: "/insights",
      label: "Insights",
      detail: "Trends, distribution and what stands out",
      Icon: LineChart,
    },
    {
      href: "/history",
      label: "History",
      detail: "Every check-in, by day",
      Icon: CalendarDays,
    },
    {
      href: "/settings",
      label: "Settings",
      detail: "Appearance, nudges, export, password",
      Icon: Settings,
    },
    {
      href: "/help",
      label: "Help & safety",
      detail: "How it works, FAQ, crisis resources",
      Icon: HelpCircle,
    },
  ];

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
        <AvatarEditor
          name={name || user.email || "A"}
          avatarUrl={profile.avatarUrl}
          avatarColor={profile.avatarColor}
          onChange={(changes) => {
            void saveProfile(user.uid, changes).catch((error) =>
              toast.error(authErrorMessage(error)),
            );
          }}
        />

        <div className="flex items-start gap-3 border-t border-line pt-4">
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
                <p className="mt-0.5 text-[11px] text-ink-subtle">
                  {loading
                    ? "Counting your entries…"
                    : entries.length === 0
                      ? "No check-ins yet"
                      : `${entries.length} check-in${entries.length === 1 ? "" : "s"} · last ${relativeTime(entries[0].createdAt)}`}
                </p>
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

      <nav aria-label="Profile sections">
        <Card className="divide-y divide-line p-0">
          {LINKS.map(({ href, label, detail, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-muted"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-surface-sunken text-ink-muted">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-ink">
                  {label}
                </span>
                <span className="block text-xs text-ink-muted">{detail}</span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-ink-subtle"
                aria-hidden
              />
            </Link>
          ))}
        </Card>
      </nav>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        loading={signingOut}
        onClick={async () => {
          setSigningOut(true);
          try {
            await signOut();
            router.replace("/sign-in");
          } catch (error) {
            toast.error(authErrorMessage(error));
            setSigningOut(false);
          }
        }}
      >
        <LogOut className="size-4" aria-hidden />
        Log out
      </Button>
    </div>
  );
}
