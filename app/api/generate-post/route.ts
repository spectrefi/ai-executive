import { NextRequest, NextResponse } from "next/server";
import { generateDailyPost } from "@/lib/social-post-generator";
import { addSocialPost, type SocialPost } from "@/lib/social-post-archive";
import { postTweet } from "@/lib/twitter-client";
import { postToInstagram } from "@/lib/instagram-client";
import { postToTikTok } from "@/lib/tiktok-client";
import { imageToVideo } from "@/lib/video-generator";

export const runtime = "nodejs";
export const maxDuration = 3600;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Random delay — spreads the post across a 60-minute window
    const delayMs = Math.floor(Math.random() * 60 * 60 * 1000);
    await new Promise((r) => setTimeout(r, delayMs));

    const { caption, newsItem, visualTheme } = await generateDailyPost();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiexecutive.io";
    const imageUrl = `${siteUrl}/api/og/social-post?caption=${encodeURIComponent(caption)}&theme=${visualTheme}&source=${encodeURIComponent(newsItem.source)}`;

    let imageBuffer: Buffer | undefined;
    try {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) imageBuffer = Buffer.from(await imgRes.arrayBuffer());
    } catch {
      // proceed without image
    }

    // Post to X
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
      } catch (e) {
        console.error("Twitter post failed:", e);
      }
    }

    // Post to Instagram (image must be publicly accessible)
    let igMediaId: string | undefined;
    let igUrl: string | undefined;
    if (process.env.INSTAGRAM_ACCOUNT_ID && process.env.INSTAGRAM_ACCESS_TOKEN) {
      try {
        const igCaption = newsItem.link
          ? `${caption}\n\n${newsItem.link}`
          : caption;
        const result = await postToInstagram(igCaption, imageUrl);
        if (result) { igMediaId = result.mediaId; igUrl = result.url; }
      } catch (e) {
        console.error("Instagram post failed:", e);
      }
    }

    // Post to TikTok — AI video generation from OG image, then FILE_UPLOAD
    let tiktokVideoId: string | undefined;
    if (process.env.TIKTOK_ACCESS_TOKEN) {
      try {
        const videoBuffer = await imageToVideo(imageUrl, visualTheme);
        const result = await postToTikTok(caption, videoBuffer);
        if (result) tiktokVideoId = result.videoId;
      } catch (e) {
        console.error("TikTok post failed:", e);
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const post: SocialPost = {
      id: `${today}-${Date.now()}`,
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
    };

    await addSocialPost(post);
    return NextResponse.json({ success: true, post });
  } catch (e) {
    console.error("generate-post error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
