/**
 * ElevenLabs text-to-speech client.
 * Returns an MP3 Buffer from a caption string.
 *
 * Env vars:
 *  ELEVENLABS_API_KEY  — from elevenlabs.io → Profile → API Key
 *  ELEVENLABS_VOICE_ID — defaults to "Rachel" (professional, clear)
 */

const BASE = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // Rachel

export function isElevenLabsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

export async function generateVoiceover(text: string): Promise<Buffer | null> {
  if (!isElevenLabsConfigured()) return null;

  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE;
  const strippedText = text.replace(/#\w+/g, "").trim(); // strip hashtags

  const res = await fetch(`${BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: strippedText,
      model_id: "eleven_turbo_v2_5",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    console.error("ElevenLabs TTS failed:", res.status, await res.text());
    return null;
  }

  return Buffer.from(await res.arrayBuffer());
}
