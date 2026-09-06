"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { usePathname } from "next/navigation";

import { RippleLoader } from "@/components/brand/ripple-loader";

import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/lib/firebase/auth-context";
import { useVault } from "@/lib/crypto/vault";
import {
  SetUpEncryptionScreen,
  UnlockScreen,
} from "@/components/crypto/unlock-screen";
import { SetupNotice } from "@/components/layout/setup-notice";

/**
 * Blocks the signed-in shell until Firebase reports an auth state, then either
 * renders the app or bounces to sign-in.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const { status } = useVault();
  const { profile, loading: profileLoading } = useProfile();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (configured && !loading && !user) router.replace("/sign-in");
  }, [configured, loading, user, router]);

  const needsWelcome =
    status === "unlocked" &&
    !profileLoading &&
    profile.onboardedAt === null &&
    pathname !== "/welcome";

  useEffect(() => {
    if (needsWelcome) router.replace("/welcome");
  }, [needsWelcome, router]);

  if (!configured) return <SetupNotice />;

  if (loading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <RippleLoader label="Opening your space…" />
      </div>
    );
  }

  // Signed in is not the same as able to read anything: the data key lives
  // only in memory, so a reload lands here.
  if (status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center">
        <RippleLoader label="Unlocking your space…" />
      </div>
    );
  }
  if (status === "absent") return <SetUpEncryptionScreen />;
  if (status === "locked") return <UnlockScreen />;

  return <>{children}</>;
}
