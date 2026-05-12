import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

function alertKey(toolId: string) {
  return `ai_executive:tool_alerts:${toolId}`;
}

export async function subscribeToTool(toolId: string, email: string): Promise<void> {
  if (!redis) return;
  await redis.sadd(alertKey(toolId), email);
}

export async function unsubscribeFromTool(toolId: string, email: string): Promise<void> {
  if (!redis) return;
  await redis.srem(alertKey(toolId), email);
}

export async function getToolSubscribers(toolId: string): Promise<string[]> {
  if (!redis) return [];
  try {
    const members = await redis.smembers(alertKey(toolId));
    return members as string[];
  } catch {
    return [];
  }
}
