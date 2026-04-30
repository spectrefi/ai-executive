import { ImageResponse } from "next/og";
import { getToolById } from "@/lib/data/tools";

export const runtime = "edge";
export const alt = "AI Tool Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    return new ImageResponse(
      <div style={{ background: "#0a0a0f", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "24px", fontFamily: "system-ui" }}>
        Tool not found
      </div>,
      { ...size }
    );
  }

  const scoreColor =
    tool.scores.overall >= 85 ? "#34d399" : tool.scores.overall >= 75 ? "#a78bfa" : "#f59e0b";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 60%, #0a0a0f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}>
          <div style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: "10px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
            ⚡
          </div>
          <span style={{ color: "#9ca3af", fontSize: "16px" }}>
            AI <span style={{ color: "#a78bfa" }}>Executive</span> · Tool Review
          </span>
          <div style={{ marginLeft: "auto", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", padding: "4px 12px", color: "#34d399", fontSize: "11px", fontWeight: 600 }}>
            ● LIVE
          </div>
        </div>

        {/* Tool hero */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "32px", flex: 1 }}>
          {/* Logo */}
          <div
            style={{
              background: `${tool.logoColor}22`,
              borderRadius: "24px",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "64px",
              flexShrink: 0,
            }}
          >
            {tool.logo}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
              <span style={{ color: "#ffffff", fontSize: "52px", fontWeight: 800 }}>{tool.name}</span>
              <span style={{ background: "rgba(255,255,255,0.08)", borderRadius: "20px", padding: "4px 14px", color: "#9ca3af", fontSize: "16px" }}>
                #{tool.currentRank} Global
              </span>
            </div>
            <span style={{ color: "#6b7280", fontSize: "18px", marginBottom: "20px" }}>by {tool.company}</span>
            <span style={{ color: "#d1d5db", fontSize: "20px", lineHeight: 1.4, marginBottom: "32px" }}>
              {tool.tagline}
            </span>

            {/* Score pills */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { label: "Overall", value: tool.scores.overall, color: scoreColor },
                { label: "Reasoning", value: tool.scores.reasoning, color: "#a78bfa" },
                { label: "Coding", value: tool.scores.coding, color: "#60a5fa" },
                { label: "Speed", value: tool.scores.speed, color: "#34d399" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span style={{ color: s.color, fontSize: "22px", fontWeight: 700 }}>{s.value}</span>
                  <span style={{ color: "#6b7280", fontSize: "11px" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "32px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
          <span style={{ color: "#4b5563", fontSize: "13px" }}>aiexecutive.io/tools/{tool.id}</span>
          <span style={{ color: "#4b5563", fontSize: "13px" }}>Updated daily · Scores 0–100</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
