import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { AI_TOOLS } from "@/lib/data/tools";
import { SITE_URL, TWITTER_CHAR_LIMIT } from "@/lib/constants";
import { postTweet } from "@/lib/twitter-client";
import { getLastRankingsSnapshot, calcMovers } from "@/lib/rankings-store";
import { logBreakingAlert } from "@/lib/breaking-store";
import { COMPANY_HANDLES, getBestCompareSlug } from "@/lib/company-handles";

export const runtime = "nodejs";
export const maxDuration = 60;

// Only post if a tool jumps this many spots or more
const JUMP_THRESHOLD = 5;

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(secret ?? "");
  const b = Buffer.from(provided);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sorted = [...AI_TOOLS].sort((a, b) => a.currentRank - b.currentRank);
  const last = await getLastRankingsSnapshot();
  const movers = calcMovers(sorted, last);

  // Only care about significant jumps upward
  const bigRisers = movers.filter((m) => m.rankChange >= JUMP_THRESHOLD);

  if (bigRisers.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `No tool jumped ${JUMP_THRESHOLD}+ spots`,
    });
  }

  // Post about the biggest single riser
  const mover = bigRisers[0];
  const handle = COMPANY_HANDLES[mover.id] ?? null;
  const compareSlug = getBestCompareSlug(mover.id);
  const link = compareSlug
    ? `${SITE_URL}/compare/${compareSlug}`
    : `${SITE_URL}/tools/${mover.id}`;

  const lines = [
    `🚨 Breaking: ${mover.logo} ${mover.name} just jumped ${mover.rankChange} spots to #${mover.currentRank} in AI rankings`,
    "",
    `📈 #${mover.prevRank} → #${mover.currentRank} · Score: ${mover.prevScore} → ${mover.currentScore}`,
    "",
    `See the full leaderboard + compare: ${link}`,
    "",
    `#AIRankings #AI`,
  ];

  if (handle) lines.push(handle);

  const tweetText = lines.join("\n").slice(0, TWITTER_CHAR_LIMIT);

  // Fetch OG breaking image
  const caption = `🚨 ${mover.name} just jumped ${mover.rankChange} spots to #${mover.currentRank} in AI rankings #AIRankings`;
  const imageUrl = `${SITE_URL}/api/og/social-post?caption=${encodeURIComponent(caption)}&theme=breaking&source=AI+Executive`;
  let imageBuffer: Buffer | undefined;
  try {
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (imgRes.ok) imageBuffer = Buffer.from(await imgRes.arrayBuffer());
  } catch {
    // proceed without image
  }

  let tweetUrl: string | null = null;
  if (process.env.TWITTER_APP_KEY && process.env.TWITTER_ACCESS_TOKEN) {
    try {
      const result = await postTweet(tweetText, imageBuffer);
      tweetUrl = result.url;
    } catch (e) {
      console.error("Rank-jump tweet failed:", e);
    }
  }

  await logBreakingAlert({
    type: "rank_jump",
    triggeredBy: `${mover.name} jumped ${mover.rankChange} spots (#${mover.prevRank} → #${mover.currentRank})`,
    caption,
    tweetUrl,
    toolsTagged: handle ? [handle] : [],
    postedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    mover: {
      name: mover.name,
      rankChange: mover.rankChange,
      prevRank: mover.prevRank,
      currentRank: mover.currentRank,
    },
    tweetUrl,
    otherRisers: bigRisers.slice(1).map((m) => ({
      name: m.name,
      rankChange: m.rankChange,
    })),
  });
}
