let redis: import("@upstash/redis").Redis | null = null;

async function getRedis() {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const { Redis } = await import("@upstash/redis");
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
}

/**
 * Returns true if the action is allowed, false if rate-limited.
 * Uses a fixed window counter in Redis. Falls back to allowing the request if Redis is unavailable.
 */
export async function rateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const r = await getRedis();
  if (!r) return true;

  const redisKey = `rl:${key}`;
  const count = await r.incr(redisKey);
  if (count === 1) {
    await r.expire(redisKey, windowSeconds);
  }
  return count <= maxRequests;
}
