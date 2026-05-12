import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const SNAPSHOT_KEY = "ai_executive:rankings_snapshot";

export interface RankSnapshot {
  capturedAt: string;
  ranks: Record<string, { rank: number; score: number }>;
}

export interface Mover {
  id: string;
  name: string;
  logo: string;
  currentRank: number;
  prevRank: number;
  rankChange: number; // positive = moved up
  currentScore: number;
  prevScore: number;
}

export async function saveRankingsSnapshot(snapshot: RankSnapshot): Promise<void> {
  if (!redis) return;
  await redis.set(SNAPSHOT_KEY, snapshot);
}

export async function getLastRankingsSnapshot(): Promise<RankSnapshot | null> {
  if (!redis) return null;
  try {
    return await redis.get<RankSnapshot>(SNAPSHOT_KEY);
  } catch {
    return null;
  }
}

export function buildCurrentSnapshot(
  tools: Array<{ id: string; currentRank: number; scores: { overall: number } }>
): RankSnapshot {
  const ranks: RankSnapshot["ranks"] = {};
  for (const t of tools) {
    ranks[t.id] = { rank: t.currentRank, score: t.scores.overall };
  }
  return { capturedAt: new Date().toISOString(), ranks };
}

export function calcMovers(
  tools: Array<{ id: string; name: string; logo: string; currentRank: number; scores: { overall: number } }>,
  last: RankSnapshot | null
): Mover[] {
  if (!last) return [];
  return tools
    .map((tool) => {
      const prev = last.ranks[tool.id];
      if (!prev) return null;
      const rankChange = prev.rank - tool.currentRank; // positive = rose
      return {
        id: tool.id,
        name: tool.name,
        logo: tool.logo,
        currentRank: tool.currentRank,
        prevRank: prev.rank,
        rankChange,
        currentScore: tool.scores.overall,
        prevScore: prev.score,
      };
    })
    .filter((m): m is Mover => m !== null && m.rankChange !== 0)
    .sort((a, b) => Math.abs(b.rankChange) - Math.abs(a.rankChange));
}
