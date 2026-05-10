import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { POST_THEMES, VALID_THEMES } from "@/lib/social-post-themes";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const caption = searchParams.get("caption") ?? "AI is changing everything.";
  const themeKey = searchParams.get("theme") ?? "pulse";
  const source = searchParams.get("source") ?? "AI Executive";
  const theme = POST_THEMES[VALID_THEMES.includes(themeKey as any) ? themeKey as keyof typeof POST_THEMES : "pulse"];

  const bodyText = caption.replace(/#\w+/g, "").trim();
  const tags = (caption.match(/#\w+/g) ?? []).join("  ");

  const OG_LONG_TEXT_THRESHOLD = 120;
  const OG_MAX_WIDTH = 960;

  const response = new ImageResponse(
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
            fontSize: bodyText.length > OG_LONG_TEXT_THRESHOLD ? 34 : 40,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: OG_MAX_WIDTH,
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

  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return response;
}
