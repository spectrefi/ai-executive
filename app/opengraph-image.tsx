import { ImageResponse } from "next/og";
import { AI_TOOLS } from "@/lib/data/tools";

export const runtime = "edge";
export const alt = "AI Executive — Live AI Tool Rankings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const top5 = AI_TOOLS.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              borderRadius: "14px",
              width: "52px",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ⚡
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700 }}>
              AI <span style={{ color: "#a78bfa" }}>Executive</span>
            </span>
            <span style={{ color: "#6b7280", fontSize: "13px" }}>Live AI Rankings</span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "20px",
              padding: "6px 14px",
              color: "#34d399",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            ● LIVE
          </div>
        </div>

        {/* Title */}
        <div style={{ color: "#ffffff", fontSize: "52px", fontWeight: 800, lineHeight: 1.1, marginBottom: "12px" }}>
          The World&apos;s AI Tools,
          <br />
          <span style={{ color: "#a78bfa" }}>Ranked Live</span>
        </div>
        <div style={{ color: "#9ca3af", fontSize: "20px", marginBottom: "44px" }}>
          Daily benchmarks across {AI_TOOLS.length} platforms · Updated every 24 hours
        </div>

        {/* Top 5 tools */}
        <div style={{ display: "flex", gap: "12px" }}>
          {top5.map((tool, i) => (
            <div
              key={tool.id}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "10px", color: "#7c3aed", fontWeight: 700 }}>#{i + 1}</span>
              <span style={{ fontSize: "28px" }}>{tool.logo}</span>
              <span style={{ fontSize: "11px", color: "#e5e7eb", fontWeight: 600, textAlign: "center" }}>
                {tool.name}
              </span>
              <span
                style={{
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  borderRadius: "6px",
                  padding: "2px 8px",
                  color: "#a78bfa",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {tool.scores.overall}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
