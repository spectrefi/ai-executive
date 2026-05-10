import { NextRequest, NextResponse } from "next/server";
import { DAILY_PROMPTS } from "@/lib/data/prompts";

export const runtime = "nodejs";

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

const VALID_PROMPT_IDS = new Set(DAILY_PROMPTS.map((p) => p.id));
const VALID_MODEL_IDS = new Set(
  DAILY_PROMPTS.flatMap((p) => p.responses.map((r) => r.model))
);

export async function GET(req: NextRequest) {
  const promptId = req.nextUrl.searchParams.get("promptId");
  if (!promptId) return NextResponse.json({ error: "Missing promptId" }, { status: 400 });
  if (!VALID_PROMPT_IDS.has(promptId)) {
    return NextResponse.json({ error: "Invalid promptId" }, { status: 400 });
  }

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
  if (!VALID_PROMPT_IDS.has(promptId)) {
    return NextResponse.json({ error: "Invalid promptId" }, { status: 400 });
  }
  if (!VALID_MODEL_IDS.has(modelId)) {
    return NextResponse.json({ error: "Invalid modelId" }, { status: 400 });
  }

  const r = await getRedis();
  if (!r) {
    return NextResponse.json({ ok: true, votes: { [modelId]: 1 } });
  }

  const key = `${VOTE_KEY_PREFIX}${promptId}`;
  await r.hincrby(key, modelId, 1);
  const votes = await r.hgetall<Record<string, number>>(key);
  return NextResponse.json({ ok: true, votes: votes ?? {} });
}
