import { ImageResponse } from "next/og";
import { getToolById } from "@/lib/data/tools";

export const runtime = "edge";
export const alt = "AI Tool Comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [idA, idB] = slug.split("-vs-");
  const toolA = getToolById(idA);
  const toolB = getToolById(idB);

  if (!toolA || !toolB) {
    return new ImageResponse(
      <div style={{ background: "#0a0a0f", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "24px", fontFamily: "system-ui" }}>
        Comparison not found
      </div>,
      { ...size }
    );
  }

  const winner = toolA.scores.overall >= toolB.scores.overall ? toolA : toolB;
  const DIMS = ["Reasoning", "Coding", "Writing", "Speed", "Cost"] as const;
  const dimKeys = ["reasoning", "coding", "writing", "speed", "costEfficiency"] as const;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px" }}>
          <div style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: "10px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
            ⚡
          </div>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>
            AI <span style={{ color: "#a78bfa" }}>Executive</span> · Head-to-Head Comparison
          </span>
        </div>

        {/* VS header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "32px", marginBottom: "36px" }}>
          {/* Tool A */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", flex: 1 }}>
            <div style={{ background: `${toolA.logoColor}22`, borderRadius: "20px", width: "88px", height: "88px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
              {toolA.logo}
            </div>
            <span style={{ color: "#ffffff", fontSize: "28px", fontWeight: 800 }}>{toolA.name}</span>
            <div style={{ background: winner.id === toolA.id ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.05)", border: winner.id === toolA.id ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: winner.id === toolA.id ? "#a78bfa" : "#9ca3af", fontSize: "32px", fontWeight: 800 }}>{toolA.scores.overall}</span>
              <span style={{ color: "#6b7280", fontSize: "11px" }}>Overall Score</span>
            </div>
            {winner.id === toolA.id && (
              <span style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: "20px", padding: "4px 14px", color: "#a78bfa", fontSize: "12px", fontWeight: 700 }}>
                WINNER
              </span>
            )}
          </div>

          {/* VS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#374151", fontSize: "40px", fontWeight: 800 }}>VS</span>
          </div>

          {/* Tool B */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", flex: 1 }}>
            <div style={{ background: `${toolB.logoColor}22`, borderRadius: "20px", width: "88px", height: "88px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
              {toolB.logo}
            </div>
            <span style={{ color: "#ffffff", fontSize: "28px", fontWeight: 800 }}>{toolB.name}</span>
            <div style={{ background: winner.id === toolB.id ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.05)", border: winner.id === toolB.id ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: winner.id === toolB.id ? "#a78bfa" : "#9ca3af", fontSize: "32px", fontWeight: 800 }}>{toolB.scores.overall}</span>
              <span style={{ color: "#6b7280", fontSize: "11px" }}>Overall Score</span>
            </div>
            {winner.id === toolB.id && (
              <span style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: "20px", padding: "4px 14px", color: "#a78bfa", fontSize: "12px", fontWeight: 700 }}>
                WINNER
              </span>
            )}
          </div>
        </div>

        {/* Dimension bars */}
        <div style={{ display: "flex", gap: "8px" }}>
          {DIMS.map((dim, i) => {
            const key = dimKeys[i];
            const valA = toolA.scores[key];
            const valB = toolB.scores[key];
            const aWins = valA >= valB;
            return (
              <div key={dim} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{dim}</span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ color: aWins ? toolA.logoColor : "#4b5563", fontSize: "15px", fontWeight: 700 }}>{valA}</span>
                  <span style={{ color: "#374151", fontSize: "11px" }}>·</span>
                  <span style={{ color: !aWins ? toolB.logoColor : "#4b5563", fontSize: "15px", fontWeight: 700 }}>{valB}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <span style={{ color: "#374151", fontSize: "12px" }}>aiexecutive.io · Daily AI benchmarks</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
