import { headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { AuthProvider } from "@/lib/firebase/auth-context";
import { VaultProvider } from "@/lib/crypto/vault";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

// UI and body: a warm humanist grotesque that stays legible at small sizes.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

// The display voice: a heavy, characterful grotesque for headings and big
// numbers. Confident and modern rather than neutral — the app's personality now
// lives here.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aluna — notice, name, and track how you feel",
    template: "%s · Aluna",
  },
  description:
    "A calm daily check-in for your body, your emotions, and your mind. Log sensations, name feelings on a three-level emotion wheel, and watch the patterns emerge.",
  applicationName: "Aluna",
  appleWebApp: { capable: true, title: "Aluna", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1a1f" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Set per request by src/middleware.ts. next-themes injects a script before
  // paint to avoid a flash of the wrong theme, and it needs the nonce to run
  // under the policy.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${hanken.variable} ${bricolage.variable} antialiased`}>
        <ThemeProvider nonce={nonce}>
          <AuthProvider>
            <VaultProvider>{children}</VaultProvider>
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: {
                  borderRadius: "1rem",
                  fontFamily: "var(--font-hanken), sans-serif",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
