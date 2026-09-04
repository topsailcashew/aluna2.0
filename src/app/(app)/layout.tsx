import type { ReactNode } from "react";

import { AuthGate } from "@/components/layout/auth-gate";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      {/* pb clears the fixed nav plus the home indicator on iOS. */}
      <div className="mx-auto w-full max-w-lg px-4 pt-6 pb-28">{children}</div>
      <BottomNav />
    </AuthGate>
  );
}
