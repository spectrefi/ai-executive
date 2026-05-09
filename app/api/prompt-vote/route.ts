import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Use the same Redis pattern as vote-store.ts
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

const VOTE_KEY_PREFIX = "prompt-vote:";

export async function GET(req: NextRequest) {
  const promptId = req.nextUrl.searchParams.get("promptId");
  if (!promptId) return NextResponse.json({ error: "Missing promptId" }, { status: 400 });

  const r = await getRedis();
  if (!r) return NextResponse.json({ votes: {} });

  const key = `${VOTE_KEY_PREFIX}${promptId}`;
  const votes = await r.hgetall<Record<string, number>>(key);
  return NextResponse.json({ votes: votes ?? {} });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { promptId, modelId } = body ?? {};
  if (!promptId || !modelId) {
    return NextResponse.json({ error: "Missing promptId or modelId" }, { status: 400 });
  }

  const r = await getRedis();
  if (!r) {
    // In-memory fallback: just acknowledge
    return NextResponse.json({ ok: true, votes: { [modelId]: 1 } });
  }

  const key = `${VOTE_KEY_PREFIX}${promptId}`;
  await r.hincrby(key, modelId, 1);
  const votes = await r.hgetall<Record<string, number>>(key);
  return NextResponse.json({ ok: true, votes: votes ?? {} });
}
