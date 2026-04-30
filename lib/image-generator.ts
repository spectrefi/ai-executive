/**
 * AI image generation for Social Pulse post visuals.
 *
 * Primary:  Flux 1.1 Pro via Replicate — creative, fast, free tier available
 * Fallback: Ideogram v2 — best for text/typography accuracy in images
 *
 * Env vars:
 *  REPLICATE_API_KEY  — replicate.com → Account → API Tokens
 *  IDEOGRAM_API_KEY   — ideogram.ai → Settings → API
 */

const THEME_PROMPTS: Record<string, string> = {
  pulse:    "Dark futuristic tech background with electric purple energy streams and glowing particle trails, abstract digital art, cinematic, high contrast, 16:9",
  glitch:   "Dark cyberpunk scene with neon green glitch distortions and digital static effects, scanlines, edgy tech aesthetic, high contrast, 16:9",
  neon:     "Deep black background with glowing cyan and blue neon light trails, holographic elements, futuristic minimal tech, cinematic, 16:9",
  matrix:   "Dark void filled with cascading green digital code rain, matrix aesthetic, deep shadows, luminous green glow, cinematic atmosphere, 16:9",
  fire:     "Dark dramatic scene with intense orange and red flames rising, glowing embers, cinematic fire photography style, high contrast, 16:9",
  cosmic:   "Deep space scene with swirling purple and indigo nebulae, distant stars, galaxies, ethereal cosmic atmosphere, cinematic, 16:9",
  viral:    "Bold dark background with explosive red and white light bursts radiating outward, dynamic energy, social media aesthetic, 16:9",
  breaking: "Dark dramatic stage with golden spotlight beams, cinematic reveal lighting, high-contrast shadows, breaking news energy, 16:9",
};

const FALLBACK_PROMPT =
  "Dark futuristic tech background with glowing particles and abstract digital art, cinematic, high contrast, 16:9";

export function isImageGenerationConfigured() {
  return Boolean(process.env.REPLICATE_API_KEY || process.env.IDEOGRAM_API_KEY);
}

/**
 * Generate a 1200×628 PNG for the given theme.
 * Returns a public URL to the generated image, or null on failure.
 */
export async function generatePostImage(theme: string, caption: string): Promise<string | null> {
  if (process.env.REPLICATE_API_KEY) {
    return fluxGenerate(theme, caption);
  }
  if (process.env.IDEOGRAM_API_KEY) {
    return ideogramGenerate(theme, caption);
  }
  return null;
}

// ─── Flux 1.1 Pro via Replicate ───────────────────────────────────────────────

async function fluxGenerate(theme: string, caption: string): Promise<string | null> {
  const basePrompt = THEME_PROMPTS[theme] ?? FALLBACK_PROMPT;
  const prompt = `${basePrompt}. Context: ${caption.replace(/#\w+/g, "").slice(0, 120)}`;

  const createRes = await fetch(
    "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({
        input: { prompt, width: 1200, height: 628, output_format: "png", output_quality: 90 },
      }),
    }
  );

  if (!createRes.ok) {
    console.error("Flux create failed:", createRes.status);
    return null;
  }

  const prediction = await createRes.json() as {
    id: string; status: string; output?: string[];
    urls?: { get: string };
  };

  // "wait" mode resolves immediately if done; otherwise poll
  if (prediction.status === "succeeded" && prediction.output?.[0]) {
    return prediction.output[0];
  }

  const pollUrl = prediction.urls?.get;
  if (!pollUrl) return null;

  for (let i = 0; i < 30; i++) {
    await sleep(4000);
    const pollRes = await fetch(pollUrl, {
      headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` },
    });
    const polled = await pollRes.json() as { status: string; output?: string[] };
    if (polled.status === "succeeded" && polled.output?.[0]) return polled.output[0];
    if (polled.status === "failed") { console.error("Flux prediction failed"); return null; }
  }

  console.error("Flux timed out");
  return null;
}

// ─── Ideogram v2 (fallback — best for text in images) ────────────────────────

async function ideogramGenerate(theme: string, _caption: string): Promise<string | null> {
  const prompt = THEME_PROMPTS[theme] ?? FALLBACK_PROMPT;

  const res = await fetch("https://api.ideogram.ai/generate", {
    method: "POST",
    headers: {
      "Api-Key": process.env.IDEOGRAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_request: {
        prompt,
        model: "V_2",
        resolution: "RESOLUTION_1344x768",
        style_type: "DESIGN",
        num_images: 1,
      },
    }),
  });

  if (!res.ok) {
    console.error("Ideogram generate failed:", res.status);
    return null;
  }

  const data = await res.json() as { data?: { url: string }[] };
  return data.data?.[0]?.url ?? null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
