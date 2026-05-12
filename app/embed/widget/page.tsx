import { AI_TOOLS } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 14400;

const TOP_10 = [...AI_TOOLS].sort((a, b) => a.currentRank - b.currentRank).slice(0, 10);

const SCORE_COLOR = (s: number) =>
  s >= 88 ? "#34d399" : s >= 75 ? "#60a5fa" : s >= 60 ? "#fbbf24" : "#f87171";

export default function WidgetPage() {
  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#0d0d18",
      borderRadius: 12,
      padding: 16,
      width: "100%",
      boxSizing: "border-box" as const,
      minHeight: "100vh",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>AI Tool Rankings</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Updated daily · Top 10</div>
        </div>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}
        >
          AI Executive ↗
        </a>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {TOP_10.map((tool) => (
          <a
            key={tool.id}
            href={`${SITE_URL}/tools/${tool.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 10px", borderRadius: 8, textDecoration: "none",
              background: "transparent",
            }}
          >
            <span style={{ width: 18, textAlign: "center", fontSize: 11, color: "#64748b", fontFamily: "monospace", flexShrink: 0 }}>
              {tool.currentRank}
            </span>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{tool.logo}</span>
            <span style={{ flex: 1, fontSize: 12, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tool.name}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: SCORE_COLOR(tool.scores.overall), flexShrink: 0 }}>
              {tool.scores.overall}
            </span>
            <div style={{ width: 52, height: 4, background: "#1e2640", borderRadius: 99, flexShrink: 0, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                width: `${tool.scores.overall}%`,
                background: SCORE_COLOR(tool.scores.overall),
              }} />
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 12, paddingTop: 10,
        borderTop: "1px solid #ffffff08",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 10, color: "#334155" }}>Powered by</span>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", textDecoration: "none" }}
        >
          AI Executive
        </a>
      </div>
    </div>
  );
}
