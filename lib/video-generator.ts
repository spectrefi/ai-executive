import RunwayML from "@runwayml/sdk";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs";
import os from "os";
import path from "path";
import { randomBytes } from "crypto";

if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);

const THEME_PROMPTS: Record<string, string> = {
  pulse:    "Electric energy pulses and glowing purple particle streams surge through a dark tech background, light waves expanding outward, cinematic motion",
  glitch:   "Digital glitch effects with static interference and scanlines ripple across a dark screen, neon green distortions flicker, cyberpunk aesthetic",
  neon:     "Glowing cyan light trails streak through a futuristic dark environment, holographic elements shimmer and drift, smooth camera motion",
  matrix:   "Green binary code rain cascades downward through darkness, digital number streams flowing at speed, deep green atmospheric glow",
  fire:     "Dramatic flames and heat waves rise upward in slow motion, glowing embers drift sideways, intense orange and red light pulses, cinematic",
  cosmic:   "Stars drift and nebula clouds swirl slowly in deep space, galaxies rotating, indigo and purple cosmic hues, serene infinite depth",
  viral:    "Dynamic energy ripples spread outward like shockwaves, glowing red sparks pulse, bold high-contrast motion, viral momentum building",
  breaking: "Urgent spotlight beams sweep across a dark stage, golden light flashes in waves, high-drama cinematic reveal, breaking news energy",
};

const FALLBACK_PROMPT =
  "Cinematic motion graphics with glowing particles on a dark background, smooth camera movement, professional tech aesthetic";

/**
 * Generate a TikTok-ready video from a public image URL.
 * Chain: Runway gen4_turbo → Kling (fallback) → ffmpeg static loop
 */
export async function imageToVideo(imageUrl: string, theme: string): Promise<Buffer> {
  if (process.env.RUNWAY_API_KEY) {
    try {
      return await runwayGenerate(imageUrl, theme);
    } catch (e) {
      console.error("Runway failed, trying Kling:", e);
    }
  }
  if (process.env.KLING_API_KEY) {
    try {
      return await klingGenerate(imageUrl, theme);
    } catch (e) {
      console.error("Kling failed, falling back to ffmpeg:", e);
    }
  }
  let parsedUrl: URL;
  try { parsedUrl = new URL(imageUrl); } catch { throw new Error("Invalid image URL"); }
  if (parsedUrl.protocol !== "https:") throw new Error("Image URL must use HTTPS");
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch source image: ${imgRes.status}`);
  return ffmpegStaticLoop(Buffer.from(await imgRes.arrayBuffer()));
}

/**
 * Mix a voiceover (and optional background music) into a video buffer.
 * All inputs are in-memory buffers; output is an MP4 buffer.
 */
export async function mixAudioIntoVideo(
  videoBuffer: Buffer,
  voiceoverBuffer: Buffer | null,
  musicUrl: string | null
): Promise<Buffer> {
  if (!voiceoverBuffer && !musicUrl) return videoBuffer;

  const tmpDir = os.tmpdir();
  const rnd = randomBytes(8).toString("hex");
  const videoFile = path.join(tmpDir, `aie-vid-${rnd}.mp4`);
  const voiceFile = voiceoverBuffer ? path.join(tmpDir, `aie-vo-${rnd}.mp3`) : null;
  const outFile = path.join(tmpDir, `aie-mixed-${rnd}.mp4`);

  fs.writeFileSync(videoFile, videoBuffer);
  if (voiceoverBuffer && voiceFile) fs.writeFileSync(voiceFile, voiceoverBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpeg().input(videoFile);

      if (voiceFile) cmd.input(voiceFile);
      if (musicUrl) cmd.input(musicUrl);

      const audioInputCount = (voiceFile ? 1 : 0) + (musicUrl ? 1 : 0);

      if (audioInputCount === 2) {
        // Mix voiceover (louder) with background music (quieter)
        cmd.complexFilter([
          "[1:a]volume=1.0[vo]",
          "[2:a]volume=0.25[bg]",
          "[vo][bg]amix=inputs=2:duration=shortest[aout]",
        ], "aout");
      } else if (audioInputCount === 1) {
        cmd.outputOptions(["-c:a aac"]);
      }

      cmd
        .outputOptions(["-c:v copy", "-shortest", "-map 0:v"])
        .on("error", (err: Error) => reject(err))
        .on("end", () => resolve())
        .save(outFile);
    });

    return fs.readFileSync(outFile);
  } finally {
    [videoFile, voiceFile, outFile].forEach((f) => { try { if (f) fs.unlinkSync(f); } catch { /* ignore */ } });
  }
}

/**
 * Convert the first 4 seconds of a video buffer to an animated GIF (480px wide).
 */
export async function videoToGif(videoBuffer: Buffer): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const rnd = randomBytes(8).toString("hex");
  const videoFile = path.join(tmpDir, `aie-gif-in-${rnd}.mp4`);
  const outFile = path.join(tmpDir, `aie-gif-out-${rnd}.gif`);

  fs.writeFileSync(videoFile, videoBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(videoFile)
        .outputOptions([
          "-t 4",
          "-vf", "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        ])
        .on("error", (err: Error) => reject(err))
        .on("end", () => resolve())
        .save(outFile);
    });

    return fs.readFileSync(outFile);
  } finally {
    try { fs.unlinkSync(videoFile); } catch { /* ignore */ }
    try { fs.unlinkSync(outFile); } catch { /* ignore */ }
  }
}

// ─── Runway gen4_turbo ────────────────────────────────────────────────────────

async function runwayGenerate(imageUrl: string, theme: string): Promise<Buffer> {
  const client = new RunwayML({ apiKey: process.env.RUNWAY_API_KEY! });
  const prompt = THEME_PROMPTS[theme] ?? FALLBACK_PROMPT;

  const task = await client.imageToVideo
    .create({ model: "gen4_turbo", promptImage: imageUrl, promptText: prompt, ratio: "720:1280", duration: 10 })
    .waitForTaskOutput({ timeout: 5 * 60 * 1000 });

  const videoUrl = task.output[0];
  if (!videoUrl) throw new Error("Runway returned no output URL");

  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`Failed to download Runway video: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ─── Kling AI (fallback) ──────────────────────────────────────────────────────

async function klingGenerate(imageUrl: string, theme: string): Promise<Buffer> {
  const prompt = THEME_PROMPTS[theme] ?? FALLBACK_PROMPT;
  const token = process.env.KLING_API_KEY!;

  const createRes = await fetch("https://api.klingai.com/v1/videos/image2video", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_name: "kling-v1-6",
      image: imageUrl,
      prompt,
      duration: "10",
      aspect_ratio: "9:16",
      mode: "std",
    }),
  });

  if (!createRes.ok) throw new Error(`Kling create failed: ${createRes.status}`);
  const created = await createRes.json() as { data?: { task_id: string } };
  const taskId = created.data?.task_id;
  if (!taskId) throw new Error("Kling returned no task_id");

  // Poll up to 5 minutes
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    const pollRes = await fetch(`https://api.klingai.com/v1/videos/image2video/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const polled = await pollRes.json() as {
      data?: { task_status: string; task_result?: { videos?: { url: string }[] } };
    };
    const status = polled.data?.task_status;
    if (status === "succeed") {
      const url = polled.data?.task_result?.videos?.[0]?.url;
      if (!url) throw new Error("Kling succeeded but no video URL");
      const vidRes = await fetch(url);
      if (!vidRes.ok) throw new Error(`Failed to download Kling video: ${vidRes.status}`);
      return Buffer.from(await vidRes.arrayBuffer());
    }
    if (status === "failed") throw new Error("Kling task failed");
  }
  throw new Error("Kling timed out");
}

// ─── ffmpeg static loop (last resort) ────────────────────────────────────────

async function ffmpegStaticLoop(imageBuffer: Buffer): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const rnd = randomBytes(8).toString("hex");
  const inFile = path.join(tmpDir, `aie-in-${rnd}.png`);
  const outFile = path.join(tmpDir, `aie-out-${rnd}.mp4`);

  fs.writeFileSync(inFile, imageBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(inFile)
        .inputOptions(["-loop 1"])
        .outputOptions([
          "-t 10", "-r 30", "-c:v libx264", "-preset fast", "-crf 23", "-pix_fmt yuv420p",
          "-vf", "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0e1117,setsar=1,fade=in:st=0:d=0.5,fade=out:st=9.5:d=0.5",
        ])
        .on("error", (err: Error) => reject(err))
        .on("end", () => resolve())
        .save(outFile);
    });
    return fs.readFileSync(outFile);
  } finally {
    try { fs.unlinkSync(inFile); } catch { /* ignore */ }
    try { fs.unlinkSync(outFile); } catch { /* ignore */ }
  }
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
