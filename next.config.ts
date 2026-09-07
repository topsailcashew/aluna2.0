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
    // `microphone=(self)`, not `()`: Ramble transcribes speech through the Web
    // Speech API, which this header gates. An empty allowlist denies the app
    // its own microphone, and the failure surfaces as a browser permission
    // error telling people to allow access they were never asked for.
    //
    // Everything else stays denied — the avatar picker uses a file input
    // rather than getUserMedia, and nothing else here has a caller.
    value:
      "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
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
