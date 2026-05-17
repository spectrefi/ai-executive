import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
    : null;

const LOG_KEY = "ai_executive:breaking:log";
const POSTED_URL_PREFIX = "ai_executive:breaking:url:";
const POSTED_URL_TTL = 86400; // 24h — prevents reposting the same article

export type BreakingAlertType = "launch" | "rank_jump" | "benchmark";

export interface BreakingAlert {
  type: BreakingAlertType;
  triggeredBy: string;    // news headline or "Tool jumped N spots"
  caption: string;
  tweetUrl: string | null;
  toolsTagged: string[];
  postedAt: string;
}

/** Check if a news article URL has already triggered a breaking post */
export async function isUrlPosted(url: string): Promise<boolean> {
  if (!redis) return false;
  const key = POSTED_URL_PREFIX + createHash("md5").update(url).digest("hex");
  try {
    return (await redis.exists(key)) > 0;
  } catch {
    return false;
  }
}

/** Mark a news article URL as posted (24h TTL) */
export async function markUrlPosted(url: string): Promise<void> {
  if (!redis) return;
  const key = POSTED_URL_PREFIX + createHash("md5").update(url).digest("hex");
  try {
    await redis.set(key, 1, { ex: POSTED_URL_TTL });
  } catch {
    // non-fatal
  }
}

/** Append a breaking alert to the log (keeps last 50) */
export async function logBreakingAlert(alert: BreakingAlert): Promise<void> {
  if (!redis) return;
  try {
    await redis.lpush(LOG_KEY, JSON.stringify(alert));
    await redis.ltrim(LOG_KEY, 0, 49);
  } catch {
    // non-fatal
  }
}

/** Retrieve the last N breaking alerts */
export async function getBreakingLog(limit = 20): Promise<BreakingAlert[]> {
  if (!redis) return [];
  try {
    const raw = await redis.lrange(LOG_KEY, 0, limit - 1);
    return (raw ?? []).map((item) => {
      if (typeof item === "string") return JSON.parse(item) as BreakingAlert;
      return item as BreakingAlert;
    });
  } catch {
    return [];
  }
}
