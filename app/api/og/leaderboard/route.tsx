import { ImageResponse } from "next/og";
import { AI_TOOLS } from "@/lib/data/tools";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 14400;

const TOP_10 = [...AI_TOOLS].sort((a, b) => a.currentRank - b.currentRank).slice(0, 10);

function scoreColor(s: number): string {
  if (s >= 88) return "#34d399";
  if (s >= 75) return "#60a5fa";
  if (s >= 60) return "#fbbf24";
  return "#f87171";
}

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 60%, #0a0a0f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "44px 56px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              borderRadius: 10, width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>
              ⚡
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "white", fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>AI Power Rankings</span>
              <span style={{ color: "#6b7280", fontSize: 12, marginTop: 3 }}>Updated daily · aiexecutive.io</span>
            </div>
          </div>
          <span style={{ color: "#6b7280", fontSize: 13, border: "1px solid #1f2937", borderRadius: 6, padding: "4px 12px" }}>
            Top 10 AI Tools
          </span>
        </div>

        {/* Two columns */}
        <div style={{ display: "flex", gap: 20, flex: 1 }}>
          {/* Ranks 1–5 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {TOP_10.slice(0, 5).map((tool) => (
              <div
                key={tool.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: tool.currentRank === 1 ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.035)",
                  borderRadius: 10, padding: "11px 16px",
                  border: tool.currentRank === 1 ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span style={{
                  color: tool.currentRank === 1 ? "#f59e0b" : "#4b5563",
                  fontWeight: 800, fontSize: 13, width: 24,
                }}>
                  #{tool.currentRank}
                </span>
                <span style={{ fontSize: 22 }}>{tool.logo}</span>
                <span style={{ flex: 1, color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{tool.name}</span>
                <span style={{ color: scoreColor(tool.scores.overall), fontSize: 17, fontWeight: 800 }}>
                  {tool.scores.overall}
                </span>
              </div>
            ))}
          </div>

          {/* Ranks 6–10 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {TOP_10.slice(5, 10).map((tool) => (
              <div
                key={tool.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: "rgba(255,255,255,0.035)",
                  borderRadius: 10, padding: "11px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span style={{ color: "#4b5563", fontWeight: 800, fontSize: 13, width: 24 }}>
                  #{tool.currentRank}
                </span>
                <span style={{ fontSize: 22 }}>{tool.logo}</span>
                <span style={{ flex: 1, color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{tool.name}</span>
                <span style={{ color: scoreColor(tool.scores.overall), fontSize: 17, fontWeight: 800 }}>
                  {tool.scores.overall}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <span style={{ color: "#374151", fontSize: 12 }}>
            Share this leaderboard · aiexecutive.io/leaderboard-card
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
