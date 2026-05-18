import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const STORE_KEY = "ai_executive:weekly_users";

export interface UserCountEntry {
  weeklyUsers: number;
  source: string;       // e.g. "OpenAI blog, Feb 2026"
  confidence: "high" | "medium" | "low";
  updatedAt: string;    // ISO date
}

export interface WeeklyUsersStore {
  updatedAt: string;
  tools: Record<string, UserCountEntry>; // keyed by tool id
}

export async function getWeeklyUsersOverrides(): Promise<WeeklyUsersStore | null> {
  if (!redis) return null;
  try {
    return await redis.get<WeeklyUsersStore>(STORE_KEY);
  } catch {
    return null;
  }
}

export async function saveWeeklyUsersOverrides(store: WeeklyUsersStore): Promise<void> {
  if (!redis) return;
  await redis.set(STORE_KEY, store);
}
