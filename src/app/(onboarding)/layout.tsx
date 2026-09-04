import type { ReactNode } from "react";

import { AuthGate } from "@/components/layout/auth-gate";

/**
 * Onboarding needs a signed-in, unlocked session but none of the app's
 * furniture: the bottom nav was overlapping the primary button, and offering
 * tabs out of a welcome flow rather defeats it.
 */
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
