"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AlunaMark } from "@/components/brand/aluna-mark";
import { Landing } from "@/components/marketing/landing";
import { useAuth } from "@/lib/firebase/auth-context";
import { SetupNotice } from "@/components/layout/setup-notice";

/**
 * Splash, router and front door.
 *
 * Someone already signed in wants their dashboard, not a sales pitch, so they
 * are sent straight there and never see the landing page. Everyone else gets
 * it — previously this route bounced them to a sign-in form, which asks for a
 * password before saying what the thing is.
 *
 * The splash holds only for as long as Firebase takes to report an auth state.
 * A deliberate minimum delay would be theatre, and it stops the landing page
 * flashing up for half a second before a signed-in person is redirected away.
 */
export default function RootPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!configured || loading || !user) return;
    router.replace("/dashboard");
  }, [configured, loading, user, router]);

  if (!configured) return <SetupNotice />;

  if (loading || user) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="splash-in flex flex-col items-center gap-5 text-center">
          <span className="grid size-20 place-items-center rounded-[1.75rem] bg-surface shadow-lift">
            <AlunaMark size={52} />
          </span>
          <div className="space-y-1">
            <p className="text-2xl font-display text-ink">Aluna</p>
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

  return <Landing />;
}
