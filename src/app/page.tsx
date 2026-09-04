"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/firebase/auth-context";
import { SetupNotice } from "@/components/layout/setup-notice";

/**
 * Splash and router in one. It holds for as long as Firebase takes to report
 * an auth state and no longer — a deliberate minimum delay would only be
 * theatre, and the mark reads as a pause rather than a spinner regardless.
 */
export default function RootPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!configured || loading) return;
    router.replace(user ? "/dashboard" : "/sign-in");
  }, [configured, loading, user, router]);

  if (!configured) return <SetupNotice />;

  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="splash-in flex flex-col items-center gap-5 text-center">
        <span className="grid size-20 place-items-center rounded-[1.75rem] bg-deep-700 text-4xl font-black text-white shadow-lift">
          A
        </span>
        <div className="space-y-1">
          <p className="text-2xl font-extrabold tracking-tight text-ink">
            Aluna
          </p>
          <p className="text-sm text-ink-muted">
            Notice, name, and track how you feel
          </p>
        </div>
        <span className="sr-only" role="status">
          Loading Aluna
        </span>
      </div>
    </main>
  );
}
