"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/firebase/auth-context";
import { SetupNotice } from "@/components/layout/setup-notice";

/**
 * Blocks the signed-in shell until Firebase reports an auth state, then either
 * renders the app or bounces to sign-in.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (configured && !loading && !user) router.replace("/sign-in");
  }, [configured, loading, user, router]);

  if (!configured) return <SetupNotice />;

  if (loading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3 text-ink-subtle">
          <Loader2 className="size-6 animate-spin" aria-hidden />
          <p className="text-sm font-semibold">Opening your space…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
