import { type TweetMetrics } from "@/lib/twitter-client";
import { type IgMetrics } from "@/lib/instagram-client";
import { type TikTokMetrics } from "@/lib/tiktok-client";
import { type SocialPost } from "@/lib/social-post-archive";

export interface ThemeStat {
  theme: string;
  emoji: string;
  impressions: number;
  likes: number;
  retweets: number;
  urlClicks: number;
  posts: number;
  avgImpressions: number;
  avgLikes: number;
  engagementRate: number;
}

export interface DayOfWeekStat {
  day: string;       // "Mon", "Tue", etc.
  dayIndex: number;  // 0=Sun … 6=Sat
  posts: number;
  avgImpressions: number;
  avgEngagementRate: number;
}

export interface PulseSummary {
  // X
  totalImpressions: number;
  totalLikes: number;
  totalRetweets: number;
  totalUrlClicks: number;
  // Instagram
  totalIgReach: number;
  totalIgLikes: number;
  totalIgSaved: number;
  // TikTok
  totalTikTokViews: number;
  totalTikTokLikes: number;
  totalTikTokShares: number;
  // Combined
  avgImpressionsPerPost: number;
  avgEngagementRate: number;
  byTheme: ThemeStat[];
  byDayOfWeek: DayOfWeekStat[];
  bestDay: string | null;
  recommendation: string;
  topPostId: string | null;
  topPostImpressions: number;
  postsWithData: number;
}

const THEME_EMOJI: Record<string, string> = {
  pulse: "⚡", glitch: "🔥", neon: "🚀", matrix: "🤖",
  fire: "💥", cosmic: "🌌", viral: "📢", breaking: "🔔",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function computeSummary(
  posts: SocialPost[],
  tweetMetricsMap: Record<string, TweetMetrics>,
  igMetricsMap: Record<string, IgMetrics> = {},
  tiktokMetricsMap: Record<string, TikTokMetrics> = {}
): PulseSummary {
  let totalImpressions = 0;
  let totalLikes = 0;
  let totalRetweets = 0;
  let totalUrlClicks = 0;
  let totalIgReach = 0;
  let totalIgLikes = 0;
  let totalIgSaved = 0;
  let totalTikTokViews = 0;
  let totalTikTokLikes = 0;
  let totalTikTokShares = 0;
  let totalEngagement = 0;
  let topPostId: string | null = null;
  let topPostImpressions = 0;
  let postsWithData = 0;

  const themeAgg: Record<string, {
    impressions: number; likes: number; retweets: number;
    urlClicks: number; replies: number; posts: number;
  }> = {};

  const dowAgg: Record<number, { impressions: number; engagement: number; posts: number }> = {};

  for (const post of posts) {
    const tw = post.tweetId ? tweetMetricsMap[post.tweetId] : undefined;
    const ig = post.igMediaId ? igMetricsMap[post.igMediaId] : undefined;
    const tt = post.tiktokVideoId ? tiktokMetricsMap[post.tiktokVideoId] : undefined;
    if (!tw && !ig && !tt) continue;

    postsWithData++;

    const dayIndex = new Date(post.date + "T12:00:00Z").getDay();
    if (!dowAgg[dayIndex]) dowAgg[dayIndex] = { impressions: 0, engagement: 0, posts: 0 };
    dowAgg[dayIndex].posts += 1;

    if (tw) {
      totalImpressions += tw.impressions;
      totalLikes += tw.likes;
      totalRetweets += tw.retweets;
      totalUrlClicks += tw.urlClicks;
      const eng = tw.impressions > 0
        ? ((tw.likes + tw.retweets + tw.replies) / tw.impressions) * 100 : 0;
      totalEngagement += eng;
      dowAgg[dayIndex].impressions += tw.impressions;
      dowAgg[dayIndex].engagement += eng;

      if (tw.impressions > topPostImpressions) {
        topPostImpressions = tw.impressions;
        topPostId = post.id;
      }
    }

    if (ig) {
      totalIgReach += ig.reach;
      totalIgLikes += ig.likes;
      totalIgSaved += ig.saved;
    }

    if (tt) {
      totalTikTokViews += tt.views;
      totalTikTokLikes += tt.likes;
      totalTikTokShares += tt.shares;
    }

    if (!themeAgg[post.visualTheme]) {
      themeAgg[post.visualTheme] = { impressions: 0, likes: 0, retweets: 0, urlClicks: 0, replies: 0, posts: 0 };
    }
    themeAgg[post.visualTheme].impressions += tw?.impressions ?? 0;
    themeAgg[post.visualTheme].likes += tw?.likes ?? 0;
    themeAgg[post.visualTheme].retweets += tw?.retweets ?? 0;
    themeAgg[post.visualTheme].urlClicks += tw?.urlClicks ?? 0;
    themeAgg[post.visualTheme].replies += tw?.replies ?? 0;
    themeAgg[post.visualTheme].posts += 1;
  }

  const byTheme: ThemeStat[] = Object.entries(themeAgg)
    .map(([theme, agg]) => ({
      theme,
      emoji: THEME_EMOJI[theme] ?? "✨",
      impressions: agg.impressions,
      likes: agg.likes,
      retweets: agg.retweets,
      urlClicks: agg.urlClicks,
      posts: agg.posts,
      avgImpressions: agg.posts > 0 ? Math.round(agg.impressions / agg.posts) : 0,
      avgLikes: agg.posts > 0 ? Math.round(agg.likes / agg.posts) : 0,
      engagementRate: agg.impressions > 0
        ? Math.round(((agg.likes + agg.retweets + agg.replies) / agg.impressions) * 1000) / 10
        : 0,
    }))
    .sort((a, b) => b.avgImpressions - a.avgImpressions);

  const byDayOfWeek: DayOfWeekStat[] = Object.entries(dowAgg)
    .map(([di, agg]) => ({
      day: DAY_NAMES[Number(di)],
      dayIndex: Number(di),
      posts: agg.posts,
      avgImpressions: agg.posts > 0 ? Math.round(agg.impressions / agg.posts) : 0,
      avgEngagementRate: agg.posts > 0
        ? Math.round((agg.engagement / agg.posts) * 10) / 10 : 0,
    }))
    .sort((a, b) => a.dayIndex - b.dayIndex);

  const bestDayStat = [...byDayOfWeek].sort((a, b) => b.avgImpressions - a.avgImpressions)[0] ?? null;
  const bestDay = bestDayStat?.day ?? null;

  return {
    totalImpressions,
    totalLikes,
    totalRetweets,
    totalUrlClicks,
    totalIgReach,
    totalIgLikes,
    totalIgSaved,
    totalTikTokViews,
    totalTikTokLikes,
    totalTikTokShares,
    avgImpressionsPerPost: postsWithData > 0 ? Math.round(totalImpressions / postsWithData) : 0,
    avgEngagementRate: postsWithData > 0
      ? Math.round((totalEngagement / postsWithData) * 10) / 10 : 0,
    byTheme,
    byDayOfWeek,
    bestDay,
    recommendation: buildRecommendation(byTheme, bestDay),
    topPostId,
    topPostImpressions,
    postsWithData,
  };
}

function buildRecommendation(byTheme: ThemeStat[], bestDay: string | null): string {
  if (byTheme.length === 0) return "Post more to unlock recommendations.";
  const best = byTheme[0];
  const parts: string[] = [
    `Double down on ${best.emoji} ${best.theme} — it averages ${best.avgImpressions.toLocaleString()} impressions per post.`,
  ];
  if (bestDay) parts.push(`${bestDay}s are your strongest day for reach.`);
  const highEng = [...byTheme].sort((a, b) => b.engagementRate - a.engagementRate)[0];
  if (highEng.theme !== best.theme && highEng.engagementRate > 0) {
    parts.push(`${highEng.emoji} ${highEng.theme} drives the most engagement at ${highEng.engagementRate}% — good for replies and shares.`);
  }
  return parts.join(" ");
}

export function insightText(summary: PulseSummary): string {
  if (summary.postsWithData === 0) {
    return "No Twitter data yet — metrics appear once posts go live on X.";
  }
  if (summary.byTheme.length === 0) return "Post more to unlock theme insights.";

  const best = summary.byTheme[0];
  const worst = summary.byTheme[summary.byTheme.length - 1];
  const ratio = worst.avgImpressions > 0
    ? (best.avgImpressions / worst.avgImpressions).toFixed(1) : null;

  const lines: string[] = [];
  lines.push(
    `${best.emoji} ${best.theme.charAt(0).toUpperCase() + best.theme.slice(1)} posts average ${best.avgImpressions.toLocaleString()} impressions${ratio ? ` — ${ratio}× more than ${worst.theme}` : ""}.`
  );

  const highEng = [...summary.byTheme].sort((a, b) => b.engagementRate - a.engagementRate)[0];
  if (highEng.engagementRate > 0) {
    lines.push(`Highest engagement: ${highEng.emoji} ${highEng.theme} at ${highEng.engagementRate}%.`);
  }

  const highClicks = [...summary.byTheme].sort((a, b) => b.urlClicks - a.urlClicks)[0];
  if (highClicks.urlClicks > 0) {
    lines.push(`Most link clicks: ${highClicks.emoji} ${highClicks.theme} (${highClicks.urlClicks.toLocaleString()} total).`);
  }

  return lines.join(" ");
}
