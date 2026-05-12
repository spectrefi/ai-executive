"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#0e1117", margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            AI Executive — Critical Error
          </h1>
          <p style={{ color: "#94a3b8", maxWidth: "40ch", margin: 0 }}>
            Something unexpected happened. Please reload the page.
          </p>
          <button
            onClick={reset}
            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
