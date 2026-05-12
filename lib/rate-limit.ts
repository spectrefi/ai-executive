let redis: import("@upstash/redis").Redis | null = null;
const redisConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

async function getRedis() {
  if (redis) return redis;
  if (!redisConfigured) return null;
  const { Redis } = await import("@upstash/redis");
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return redis;
}

/**
 * Returns true if the action is allowed, false if rate-limited.
 * Uses a fixed window counter in Redis.
 * If Redis is not configured: allows (dev/no-Redis mode).
 * If Redis is configured but unavailable: fails closed (denies) to prevent DoS bypass.
 */
export async function rateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const r = await getRedis();
  if (!r) return !redisConfigured; // not configured → allow; configured but null → deny

  try {
    const redisKey = `rl:${key}`;
    const count = await r.incr(redisKey);
    if (count === 1) {
      await r.expire(redisKey, windowSeconds);
    }
    return count <= maxRequests;
  } catch {
    console.error("Rate limiter Redis error — failing closed");
    return false;
  }
}
