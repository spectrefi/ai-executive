import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { fetchLiveNews } from "@/lib/rss";
import { DAILY_NEWS } from "@/lib/data/news";
import { postTweet } from "@/lib/twitter-client";
import { SITE_URL, TWITTER_CHAR_LIMIT } from "@/lib/constants";
import { isUrlPosted, markUrlPosted, logBreakingAlert, type BreakingAlertType } from "@/lib/breaking-store";
import { detectHandlesInHeadline, getBestCompareSlug } from "@/lib/company-handles";
import { AI_TOOLS } from "@/lib/data/tools";

export const runtime = "nodejs";
export const maxDuration = 120;

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(secret ?? "");
  const b = Buffer.from(provided);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}

function sanitize(str: string): string {
  return str
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\bIGNORE\b|\bFORGET\b|\bSYSTEM\b|\bINSTRUCTION\b/gi, "")
    .trim()
    .slice(0, 200);
}

function detectToolId(title: string): string | null {
  const lower = title.toLowerCase();
  // Check in reverse rank order so higher-ranked tools win ties
  const sorted = [...AI_TOOLS].sort((a, b) => a.currentRank - b.currentRank);
  for (const tool of sorted) {
    if (lower.includes(tool.name.toLowerCase())) return tool.id;
  }
  return null;
}

function buildLinkForTool(toolId: string | null): string {
  if (!toolId) return SITE_URL;
  const compareSlug = getBestCompareSlug(toolId);
  if (compareSlug) return `${SITE_URL}/compare/${compareSlug}`;
  return `${SITE_URL}/tools/${toolId}`;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });

  // Fetch recent news — fall back to hardcoded if RSS fails
  let news = await fetchLiveNews().catch(() => []);
  if (news.length < 5) news = DAILY_NEWS;

  // Filter: high-impact or launch/benchmark type, from last 12 hours
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const candidates = news.filter((item) => {
    if (new Date(item.date) < cutoff) return false;
    return item.impact === "high" || item.type === "launch" || item.type === "benchmark";
  });

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No high-impact news in last 12h" });
  }

  // Filter out already-posted URLs
  const unposted: typeof candidates = [];
  for (const item of candidates) {
    if (item.link && !(await isUrlPosted(item.link))) {
      unposted.push(item);
    }
  }

  if (unposted.length === 0) {
    return NextResponse.json({ ok: true, skipped: true, reason: "All candidates already posted" });
  }

  // Pick best: launches first, then benchmarks, then by recency
  const sorted = unposted.sort((a, b) => {
    const typePriority = (t: string) => t === "launch" ? 0 : t === "benchmark" ? 1 : 2;
    return typePriority(a.type) - typePriority(b.type);
  });
  const item = sorted[0];

  const toolId = detectToolId(item.title);
  const handles = detectHandlesInHeadline(item.title);
  const link = buildLinkForTool(toolId);
  const handleTag = handles.length > 0 ? `\n\n${handles.join(" ")}` : "";

  // Generate tweet text with Claude
  const client = new Anthropic({ apiKey });
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    system:
      "You write breaking-news tweets for AI Executive, an AI tool rankings site. Tweets are urgent, punchy, and factual. Never invent or alter any number, product name, or claim from the headline. Return ONLY the tweet text — no quotes, no explanation.",
    messages: [
      {
        role: "user",
        content: `Write a single breaking-news tweet (max 200 chars) about this AI story. Start with 🚨 or 🔥. Add 1-2 hashtags at the end. Do NOT include a URL.

Headline: ${sanitize(item.title)}
News type: ${item.type}
Source: ${sanitize(item.source)}`,
      },
    ],
  });

  const caption = (msg.content[0] as { type: string; text: string }).text.trim();

  // Build full tweet text (caption + link + handles)
  const tweetText = `${caption}\n\n${link}${handleTag}`.slice(0, TWITTER_CHAR_LIMIT);

  // Fetch OG image with breaking theme
  const imageUrl = `${SITE_URL}/api/og/social-post?caption=${encodeURIComponent(caption)}&theme=breaking&source=${encodeURIComponent(item.source)}`;
  let imageBuffer: Buffer | undefined;
  try {
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (imgRes.ok) imageBuffer = Buffer.from(await imgRes.arrayBuffer());
  } catch {
    // proceed without image
  }

  // Post to X
  let tweetUrl: string | null = null;
  if (process.env.TWITTER_APP_KEY && process.env.TWITTER_ACCESS_TOKEN) {
    try {
      const result = await postTweet(tweetText, imageBuffer);
      tweetUrl = result.url;
    } catch (e) {
      console.error("Breaking news tweet failed:", e);
    }
  }

  // Mark URL as posted and log alert
  if (item.link) await markUrlPosted(item.link);

  const alertType: BreakingAlertType = item.type === "launch" ? "launch" : item.type === "benchmark" ? "benchmark" : "launch";
  await logBreakingAlert({
    type: alertType,
    triggeredBy: item.title,
    caption,
    tweetUrl,
    toolsTagged: handles,
    postedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    caption,
    tweetUrl,
    toolId,
    handles,
    link,
    newsTitle: item.title,
  });
}
