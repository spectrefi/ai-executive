export type ThemeKey = "pulse" | "glitch" | "neon" | "matrix" | "fire" | "cosmic" | "viral" | "breaking";

export interface PostTheme {
  bg: string;
  accent: string;
  glow: string;
  secondary: string;
  emoji: string;
}

export const POST_THEMES: Record<ThemeKey, PostTheme> = {
  pulse:    { bg: "#0a0014", glow: "#a855f7", accent: "#a855f7", secondary: "#ec4899", emoji: "⚡" },
  glitch:   { bg: "#001409", glow: "#00ff88", accent: "#00ff88", secondary: "#00ccff", emoji: "🔥" },
  neon:     { bg: "#00061a", glow: "#00d4ff", accent: "#00d4ff", secondary: "#ff006e", emoji: "🚀" },
  matrix:   { bg: "#000a00", glow: "#00ff41", accent: "#00ff41", secondary: "#39ff14", emoji: "🤖" },
  fire:     { bg: "#180400", glow: "#ff4d00", accent: "#ff6b00", secondary: "#ffd700", emoji: "💥" },
  cosmic:   { bg: "#04001a", glow: "#7c3aed", accent: "#818cf8", secondary: "#ec4899", emoji: "🌌" },
  viral:    { bg: "#160000", glow: "#ff1744", accent: "#ff4466", secondary: "#ff6d00", emoji: "📢" },
  breaking: { bg: "#0a0a00", glow: "#ffd700", accent: "#ffd700", secondary: "#ff9500", emoji: "🔔" },
};

export const VALID_THEMES = Object.keys(POST_THEMES) as ThemeKey[];
