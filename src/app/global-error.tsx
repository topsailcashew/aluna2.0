"use client";

import { useEffect } from "react";

/**
 * Last resort: a failure in the root layout itself, where none of the app's
 * styling or providers are available. Everything here is inline for that
 * reason.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Aluna failed to start:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          background: "#eef3f0",
          color: "#12262c",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "26rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 .75rem" }}>
            Aluna could not start
          </h1>
          <p style={{ fontSize: ".875rem", lineHeight: 1.6, color: "#5b7278" }}>
            Your entries are safe — they are encrypted and stored separately
            from anything that failed here. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.25rem",
              padding: ".75rem 1.5rem",
              borderRadius: "1rem",
              border: 0,
              background: "#164452",
              color: "#fff",
              fontSize: ".875rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
