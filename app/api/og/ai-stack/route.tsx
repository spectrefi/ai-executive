import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { AI_TOOLS } from "@/lib/data/tools";

export const runtime = "edge";

const SCORE_COLOR = (s: number) =>
  s >= 88 ? "#34d399" : s >= 75 ? "#60a5fa" : s >= 60 ? "#fbbf24" : "#f87171";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawIds = (searchParams.get("tools") ?? "").split(",").filter(Boolean).slice(0, 5);
  const tools = rawIds
    .map((id) => AI_TOOLS.find((t) => t.id === id))
    .filter(Boolean) as typeof AI_TOOLS;

  if (tools.length === 0) {
    return new Response("No tools", { status: 400 });
  }

  const response = new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 628,
          background: "linear-gradient(135deg, #0e1117 0%, #111827 50%, #0e1117 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "56px 80px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 50% 50%, #3b82f620 0%, transparent 70%)",
        }} />

        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent)",
        }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              My AI Stack
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1 }}>
              The tools I use daily
            </div>
          </div>
          <div style={{
            background: "#3b82f615",
            border: "1px solid #3b82f630",
            borderRadius: 12,
            padding: "8px 18px",
            fontSize: 16,
            fontWeight: 700,
            color: "#60a5fa",
          }}>
            2026
          </div>
        </div>

        {/* Tool rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
          {tools.map((tool) => (
            <div
              key={tool.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: "#161c2880",
                border: "1px solid #ffffff0e",
                borderRadius: 14,
                padding: "16px 24px",
              }}
            >
              {/* Logo */}
              <div style={{
                width: 48, height: 48, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${tool.logoColor}22`,
                borderRadius: 12,
                fontSize: 26,
              }}>
                {tool.logo}
              </div>

              {/* Name + company */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>{tool.name}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{tool.company}</div>
              </div>

              {/* Score bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 160, height: 6, background: "#1e2640", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    width: `${tool.scores.overall}%`, height: "100%",
                    background: SCORE_COLOR(tool.scores.overall),
                    borderRadius: 99,
                  }} />
                </div>
                <div style={{
                  fontSize: 26, fontWeight: 900,
                  color: SCORE_COLOR(tool.scores.overall),
                  minWidth: 40, textAlign: "right",
                }}>
                  {tool.scores.overall}
                </div>
              </div>

              {/* Rank */}
              <div style={{
                background: "#3b82f615", border: "1px solid #3b82f630",
                borderRadius: 8, padding: "4px 10px",
                fontSize: 13, fontWeight: 700, color: "#60a5fa",
                flexShrink: 0,
              }}>
                #{tool.currentRank}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 28, paddingTop: 20,
          borderTop: "1px solid #ffffff0a",
        }}>
          <div style={{ fontSize: 14, color: "#475569" }}>
            Build yours at aiexecutive.io/my-stack
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>
            ⚡ AI Executive
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 628 }
  );

  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
  return response;
}
