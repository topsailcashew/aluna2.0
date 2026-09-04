import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

import { AuthProvider } from "@/lib/firebase/auth-context";
import { VaultProvider } from "@/lib/crypto/vault";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <VaultProvider>{children}</VaultProvider>
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: {
                  borderRadius: "1rem",
                  fontFamily: "var(--font-plus-jakarta)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
