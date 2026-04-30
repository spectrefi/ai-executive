/**
 * Suno AI background music generation.
 *
 * NOTE: Suno does not have an official public API as of the current build.
 * This module is stubbed and ready to wire up when an API key becomes available.
 * Monitor: suno.com/api-access
 *
 * Env vars (future):
 *  SUNO_API_KEY  — when available
 */

const THEME_STYLE: Record<string, string> = {
  pulse:    "electronic, pulse, dark synth, cinematic, 130bpm",
  glitch:   "glitchcore, cyberpunk, intense, digital distortion",
  neon:     "synthwave, neon, 80s retro, futuristic, dreamy",
  matrix:   "ambient electronic, dark, industrial, deep bass",
  fire:     "epic orchestral, dramatic, intense, percussion heavy",
  cosmic:   "ambient space, ethereal, slow build, cosmic atmosphere",
  viral:    "hype, trap, energetic, viral, modern pop beat",
  breaking: "news jingle, dramatic stinger, urgent, brass and percussion",
};

export function isSunoConfigured() {
  return Boolean(process.env.SUNO_API_KEY);
}

/**
 * Generate a short background music track for TikTok video.
 * Returns a URL to an MP3 file, or null if Suno is not configured.
 */
export async function generateBackgroundMusic(theme: string): Promise<string | null> {
  if (!isSunoConfigured()) return null;

  const style = THEME_STYLE[theme] ?? "ambient, cinematic, subtle";

  // TODO: replace with real Suno API call when available
  // Expected shape based on Suno's announced API design:
  // POST https://api.suno.ai/v1/generate
  // Headers: Authorization: Bearer {SUNO_API_KEY}
  // Body: { prompt: style, duration: 10, instrumental: true }
  // Returns: { id, audio_url, status }

  console.log(`[Suno stub] Would generate: ${style}`);
  return null;
}
