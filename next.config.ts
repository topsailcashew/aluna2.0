import type { NextConfig } from "next";

/**
 * Headers that do not need a per-request value. The Content-Security-Policy
 * lives in src/middleware.ts instead, because it carries a fresh nonce.
 */
const securityHeaders = [
  // Aluna is never meant to be framed; clickjacking a check-in form would be
  // a way to harvest what someone is feeling.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // The avatar picker uses a file input, not getUserMedia, so nothing here
    // is needed by the app.
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
  // Isolates the browsing context from anything it opens or that opens it.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
