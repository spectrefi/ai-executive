import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const SCORES_KEY = "ai_executive:scores_overrides";

export interface ScoreOverride {
  overall: number;
  reasoning?: number;
  coding?: number;
  writing?: number;
  speed?: number;
  costEfficiency?: number;
  accuracy?: number;
  creativity?: number;
  contextWindow?: number;
  multimodal?: number;
  updatedAt: string;
  source?: string;
}

export interface ScoresOverrides {
  updatedAt: string;
  tools: Record<string, ScoreOverride>; // keyed by tool id
}

export async function getScoresOverrides(): Promise<ScoresOverrides | null> {
  if (!redis) return null;
  try {
    return await redis.get<ScoresOverrides>(SCORES_KEY);
  } catch {
    return null;
  }
}

export async function saveScoresOverrides(overrides: ScoresOverrides): Promise<void> {
  if (!redis) return;
  await redis.set(SCORES_KEY, overrides);
}
