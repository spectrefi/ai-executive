import { NextRequest, NextResponse } from "next/server";
import { generateDailyPost } from "@/lib/social-post-generator";
import { addSocialPost, type SocialPost } from "@/lib/social-post-archive";
import { postTweet } from "@/lib/twitter-client";
import { postToInstagram } from "@/lib/instagram-client";
import { postToTikTok } from "@/lib/tiktok-client";
import { imageToVideo, mixAudioIntoVideo, videoToGif } from "@/lib/video-generator";
import { generatePostImage } from "@/lib/image-generator";
import { generateVoiceover } from "@/lib/elevenlabs-client";
import { generateBackgroundMusic } from "@/lib/suno-client";

export const runtime = "nodejs";
export const maxDuration = 3600;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const delayMs = Math.floor(Math.random() * 60 * 60 * 1000);
    await new Promise((r) => setTimeout(r, delayMs));

    const { caption, newsItem, visualTheme } = await generateDailyPost();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiexecutive.io";
    const ogImageUrl = `${siteUrl}/api/og/social-post?caption=${encodeURIComponent(caption)}&theme=${visualTheme}&source=${encodeURIComponent(newsItem.source)}`;

    // ── v2: AI-generated image (Flux/Ideogram) ──────────────────────────────
    let aiImageUrl: string | null = null;
    try {
      aiImageUrl = await generatePostImage(visualTheme, caption);
    } catch (e) {
      console.error("AI image generation failed:", e);
    }

    // Use AI image if available, otherwise fall back to OG template
    const postImageUrl = aiImageUrl ?? ogImageUrl;

    // Fetch image buffer (for X upload)
    let imageBuffer: Buffer | undefined;
    try {
      const imgRes = await fetch(postImageUrl);
      if (imgRes.ok) imageBuffer = Buffer.from(await imgRes.arrayBuffer());
    } catch { /* post without image */ }

    // ── Post to X ──────────────────────────────────────────────────────────
    let tweetId: string | undefined;
    let tweetUrl: string | undefined;
    if (process.env.TWITTER_APP_KEY && process.env.TWITTER_ACCESS_TOKEN) {
      try {
        const tweetText = newsItem.link
          ? `${caption}\n\n${newsItem.link}`.slice(0, 280)
          : caption.slice(0, 280);
        const result = await postTweet(tweetText, imageBuffer);
        tweetId = result.id;
        tweetUrl = result.url;
      } catch (e) { console.error("Twitter post failed:", e); }
    }

    // ── Post to Instagram ──────────────────────────────────────────────────
    let igMediaId: string | undefined;
    let igUrl: string | undefined;
    if (process.env.INSTAGRAM_ACCOUNT_ID && process.env.INSTAGRAM_ACCESS_TOKEN) {
      try {
        const igCaption = newsItem.link ? `${caption}\n\n${newsItem.link}` : caption;
        const result = await postToInstagram(igCaption, postImageUrl);
        if (result) { igMediaId = result.mediaId; igUrl = result.url; }
      } catch (e) { console.error("Instagram post failed:", e); }
    }

    // ── v2: ElevenLabs voiceover ───────────────────────────────────────────
    let voiceoverBuffer: Buffer | null = null;
    let hasVoiceover = false;
    try {
      voiceoverBuffer = await generateVoiceover(caption);
      hasVoiceover = voiceoverBuffer !== null;
    } catch (e) { console.error("Voiceover generation failed:", e); }

    // ── v2: Suno background music ──────────────────────────────────────────
    let musicUrl: string | null = null;
    let hasMusic = false;
    try {
      musicUrl = await generateBackgroundMusic(visualTheme);
      hasMusic = musicUrl !== null;
    } catch (e) { console.error("Music generation failed:", e); }

    // ── Post to TikTok: AI video + audio mix ───────────────────────────────
    let tiktokVideoId: string | undefined;
    let gifUrl: string | undefined;
    if (process.env.TIKTOK_ACCESS_TOKEN) {
      try {
        let videoBuffer = await imageToVideo(postImageUrl, visualTheme);

        // Mix in voiceover and/or music
        if (voiceoverBuffer || musicUrl) {
          videoBuffer = await mixAudioIntoVideo(videoBuffer, voiceoverBuffer, musicUrl);
        }

        // Export GIF for X / Instagram stories
        try {
          const gifBuffer = await videoToGif(videoBuffer);
          // Store GIF — in production upload to Vercel Blob or similar;
          // for now we attach the buffer size as a placeholder flag
          if (gifBuffer.length > 0) gifUrl = "generated"; // replace with upload URL
        } catch (e) { console.error("GIF export failed:", e); }

        const result = await postToTikTok(caption, videoBuffer);
        if (result) tiktokVideoId = result.videoId;
      } catch (e) { console.error("TikTok post failed:", e); }
    }

    const today = new Date().toISOString().slice(0, 10);
    const post: SocialPost = {
      id: `v2-${today}-${Date.now()}`,
      date: today,
      caption,
      newsTitle: newsItem.title,
      newsSource: newsItem.source,
      newsLink: newsItem.link,
      tweetId,
      tweetUrl,
      igMediaId,
      igUrl,
      tiktokVideoId,
      visualTheme,
      postedAt: new Date().toISOString(),
      // v2 fields
      version: "v2",
      aiImageUrl: aiImageUrl ?? undefined,
      hasVoiceover,
      hasMusic,
      gifUrl,
    };

    await addSocialPost(post);
    return NextResponse.json({ success: true, post });
  } catch (e) {
    console.error("generate-post-v2 error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
