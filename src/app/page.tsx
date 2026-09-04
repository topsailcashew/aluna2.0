"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/firebase/auth-context";
import { SetupNotice } from "@/components/layout/setup-notice";

/** Entry point — routes to the dashboard or sign-in once auth settles. */
export default function RootPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!configured || loading) return;
    router.replace(user ? "/dashboard" : "/sign-in");
  }, [configured, loading, user, router]);

  if (!configured) return <SetupNotice />;

  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="grid size-14 place-items-center rounded-3xl bg-deep-700 text-2xl font-black text-white">
          A
        </span>
        <Loader2 className="size-5 animate-spin text-ink-subtle" aria-hidden />
        <span className="sr-only">Loading Aluna</span>
      </div>
    </div>
  );
}
