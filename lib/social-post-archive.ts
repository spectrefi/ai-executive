import { Redis } from "@upstash/redis";
import { SAMPLE_POSTS } from "@/lib/sample-social-posts";

const POSTS_KEY = "ai_executive:social_posts";

function isRedisConfigured() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  return url.length > 0 && !url.includes("YOUR_DB");
}

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export interface SocialPost {
  id: string;
  date: string;
  caption: string;
  newsTitle: string;
  newsSource: string;
  newsLink?: string;
  // X / Twitter
  tweetId?: string;
  tweetUrl?: string;
  // Instagram
  igMediaId?: string;
  igUrl?: string;
  // TikTok
  tiktokVideoId?: string;
  visualTheme: string;
  postedAt: string;
  // v2 enhancements (optional — absent on v1 posts)
  version?: "v1" | "v2";
  aiImageUrl?: string;    // Flux/Ideogram generated image URL
  hasVoiceover?: boolean; // ElevenLabs voiceover mixed into TikTok video
  hasMusic?: boolean;     // Suno background music mixed into TikTok video
  gifUrl?: string;        // Animated GIF exported from video (for X/Instagram)
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  if (!isRedisConfigured()) return SAMPLE_POSTS;
  try {
    const posts = await getRedis().lrange<SocialPost>(POSTS_KEY, 0, 89);
    if (!posts || posts.length === 0) return SAMPLE_POSTS;
    return posts;
  } catch {
    return SAMPLE_POSTS;
  }
}

export async function addSocialPost(post: SocialPost): Promise<void> {
  if (!isRedisConfigured()) return;
  const redis = getRedis();
  await redis.lpush(POSTS_KEY, post);
  await redis.ltrim(POSTS_KEY, 0, 89);
}
