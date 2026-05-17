import { getToolById, AI_TOOLS } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/constants";
import { notFound } from "next/navigation";

export const revalidate = 14400;

export async function generateStaticParams() {
  const ids = AI_TOOLS.map((t) => t.id);
  const pairs: { slug: string }[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      pairs.push({ slug: `${ids[i]}-vs-${ids[j]}` });
    }
  }
  return pairs;
}

const SCORE_COLOR = (s: number) =>
  s >= 88 ? "#34d399" : s >= 75 ? "#60a5fa" : s >= 60 ? "#fbbf24" : "#f87171";

const DIMS = [
  { label: "Overall", key: "overall" },
  { label: "Reasoning", key: "reasoning" },
  { label: "Coding", key: "coding" },
  { label: "Writing", key: "writing" },
  { label: "Speed", key: "speed" },
] as const;

export default async function CompareEmbedWidget({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [idA, idB] = slug.split("-vs-");
  const toolA = getToolById(idA);
  const toolB = getToolById(idB);

  if (!toolA || !toolB) notFound();

  const winner = toolA.scores.overall >= toolB.scores.overall ? toolA : toolB;

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#0d0d18",
        borderRadius: 12,
        padding: "16px 18px",
        width: "100%",
        boxSizing: "border-box" as const,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Head-to-Head</div>
        <a
          href={`${SITE_URL}/compare/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}
        >
          Full comparison ↗
        </a>
      </div>

      {/* Tool headers */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[toolA, toolB].map((tool) => (
          <div
            key={tool.id}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              background: winner.id === tool.id ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${winner.id === tool.id ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 8, padding: "10px 6px",
            }}
          >
            <span style={{ fontSize: 22 }}>{tool.logo}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>{tool.name}</span>
            <span style={{ fontSize: 10, color: "#64748b" }}>#{tool.currentRank}</span>
            {winner.id === tool.id && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: "#a78bfa",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                Winner
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Score bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {DIMS.map(({ label, key }) => {
          const a = toolA.scores[key];
          const b = toolB.scores[key];
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Score A */}
              <span style={{ width: 26, fontSize: 10, color: SCORE_COLOR(a), fontWeight: 700, textAlign: "right", flexShrink: 0 }}>
                {a}
              </span>
              {/* Bar A (right-aligned — grows from center) */}
              <div style={{ flex: 1, height: 4, borderRadius: 99, background: "#1e2640", display: "flex", justifyContent: "flex-end", overflow: "hidden" }}>
                <div style={{ width: `${a}%`, height: "100%", borderRadius: 99, background: toolA.logoColor || "#7c3aed" }} />
              </div>
              {/* Label */}
              <span style={{ width: 54, fontSize: 9, color: "#64748b", textAlign: "center", flexShrink: 0 }}>
                {label}
              </span>
              {/* Bar B (left-aligned) */}
              <div style={{ flex: 1, height: 4, borderRadius: 99, background: "#1e2640", overflow: "hidden" }}>
                <div style={{ width: `${b}%`, height: "100%", borderRadius: 99, background: toolB.logoColor || "#4f46e5" }} />
              </div>
              {/* Score B */}
              <span style={{ width: 26, fontSize: 10, color: SCORE_COLOR(b), fontWeight: 700, flexShrink: 0 }}>
                {b}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 14, paddingTop: 10,
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
