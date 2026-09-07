"use client";

import { Landing } from "@/components/marketing/landing";
import { useAuth } from "@/lib/firebase/auth-context";
import { SetupNotice } from "@/components/layout/setup-notice";

/**
 * The front door, for everybody.
 *
 * This used to bounce anyone with a session straight to /dashboard, which made
 * the landing page unreachable for every existing user — including whoever
 * wanted to check how it looked. The redirect only existed because the PWA
 * launched here; the manifest now starts at /dashboard instead, so "/" is free
 * to be what it says it is. Signed-in visitors get the same page with its
 * calls to action pointed at the app rather than at signing up.
 */
export default function RootPage() {
  const { configured } = useAuth();

  if (!configured) return <SetupNotice />;

  return <Landing />;
}
