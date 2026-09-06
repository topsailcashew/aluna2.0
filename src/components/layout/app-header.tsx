"use client";

import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/lib/firebase/auth-context";

/** Greeting rail at the top of the dashboard, mirroring the app's warm tone. */
export function AppHeader({ subtitle }: { subtitle: string }) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const fullName = profile.displayName || user?.displayName || "";
  const name = fullName.split(" ")[0] || "there";

  return (
    <header className="flex items-center gap-3">
      <Link href="/profile" aria-label="Open profile" className="shrink-0">
        <Avatar
          url={profile.avatarUrl}
          color={profile.avatarColor}
          name={fullName || user?.email}
          className="size-11"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-display text-ink">
          {greeting()}, {name}
        </p>
        <p className="truncate text-xs text-ink-muted">{subtitle}</p>
      </div>
    </header>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
