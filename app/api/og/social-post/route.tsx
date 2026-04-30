import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const THEMES: Record<string, { bg: string; glow: string; accent: string; secondary: string; emoji: string }> = {
  pulse:    { bg: "#0a0014", glow: "#a855f7", accent: "#a855f7", secondary: "#ec4899", emoji: "⚡" },
  glitch:   { bg: "#001409", glow: "#00ff88", accent: "#00ff88", secondary: "#00ccff", emoji: "🔥" },
  neon:     { bg: "#00061a", glow: "#00d4ff", accent: "#00d4ff", secondary: "#ff006e", emoji: "🚀" },
  matrix:   { bg: "#000a00", glow: "#00ff41", accent: "#00ff41", secondary: "#39ff14", emoji: "🤖" },
  fire:     { bg: "#180400", glow: "#ff4d00", accent: "#ff6b00", secondary: "#ffd700", emoji: "💥" },
  cosmic:   { bg: "#04001a", glow: "#7c3aed", accent: "#818cf8", secondary: "#ec4899", emoji: "🌌" },
  viral:    { bg: "#160000", glow: "#ff1744", accent: "#ff4466", secondary: "#ff6d00", emoji: "📢" },
  breaking: { bg: "#0a0a00", glow: "#ffd700", accent: "#ffd700", secondary: "#ff9500", emoji: "🔔" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const caption = searchParams.get("caption") ?? "AI is changing everything.";
  const themeKey = (searchParams.get("theme") ?? "pulse") as keyof typeof THEMES;
  const source = searchParams.get("source") ?? "AI Executive";
  const theme = THEMES[themeKey] ?? THEMES.pulse;

  const bodyText = caption.replace(/#\w+/g, "").trim();
  const tags = (caption.match(/#\w+/g) ?? []).join("  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 628,
          background: theme.bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "64px 80px",
          position: "relative",
          fontFamily: "'Inter', system-ui, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${theme.glow}28 0%, transparent 70%)`,
          }}
        />

        {/* Corner glows */}
        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: `${theme.accent}18`,
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: `${theme.secondary}18`,
        }} />

        {/* Top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 5,
          background: `linear-gradient(90deg, transparent, ${theme.accent}, ${theme.secondary}, transparent)`,
        }} />

        {/* Bottom accent bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${theme.accent}66, transparent)`,
        }} />

        {/* Emoji */}
        <div style={{ fontSize: 80, marginBottom: 28, lineHeight: 1 }}>
          {theme.emoji}
        </div>

        {/* Main text */}
        <div
          style={{
            fontSize: bodyText.length > 120 ? 34 : 40,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 960,
            textShadow: `0 0 60px ${theme.glow}99`,
            letterSpacing: "-0.01em",
          }}
        >
          {bodyText}
        </div>

        {/* Hashtags */}
        {tags && (
          <div style={{
            marginTop: 24,
            fontSize: 22,
            color: theme.accent,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}>
            {tags}
          </div>
        )}

        {/* Footer */}
        <div style={{
          position: "absolute",
          bottom: 28, left: 72, right: 72,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{
            fontSize: 15,
            color: "#ffffff55",
            fontStyle: "italic",
          }}>
            via {source}
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 18,
            fontWeight: 800,
            color: theme.accent,
            letterSpacing: "-0.01em",
          }}>
            ⚡ AI Executive
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 628 }
  );
}
