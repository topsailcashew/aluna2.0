import { NextResponse, type NextRequest } from "next/server";

/**
 * Content Security Policy, with a per-request nonce.
 *
 * This matters more here than in most apps. Entries are end-to-end encrypted,
 * which means the decryption key is held in JavaScript memory while the app is
 * open — so a single injected script would read not just a session token but
 * the key and every decrypted entry with it. `script-src 'unsafe-inline'`
 * would leave exactly that door open, so Next's own bootstrap scripts are
 * nonced instead and `strict-dynamic` lets them load their own chunks.
 *
 * Styles keep 'unsafe-inline': Tailwind's injected styles and styled-jsx both
 * need it, and injected CSS cannot exfiltrate a CryptoKey.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // React's development build uses eval() for stack reconstruction. The
  // production build never does, so this is scoped to dev rather than shipped.
  const devEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:${devEval}`,
    `style-src 'self' 'unsafe-inline'`,
    // Avatars are resized on-device and stored as data URLs.
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    // Only the two Google endpoints this app actually talks to.
    `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  // Next reads the nonce back out of the request header to stamp its scripts.
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, which are served straight from the CDN
    // and gain nothing from a per-request nonce.
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
