import { Redis } from "@upstash/redis";
import { SCORE_HISTORY } from "@/lib/data/history";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const HISTORY_KEY = "ai_executive:score_history";
const MAX_SNAPSHOTS = 90;

interface SnapshotEntry {
  date: string;
  scores: Record<string, { rank: number; overall: number }>;
}

export async function saveScoreSnapshot(
  tools: Array<{ id: string; currentRank: number; scores: { overall: number } }>
): Promise<void> {
  if (!redis) return;
  const entry: SnapshotEntry = {
    date: new Date().toISOString().split("T")[0],
    scores: Object.fromEntries(
      tools.map((t) => [t.id, { rank: t.currentRank, overall: t.scores.overall }])
    ),
  };
  await redis.lpush(HISTORY_KEY, JSON.stringify(entry));
  await redis.ltrim(HISTORY_KEY, 0, MAX_SNAPSHOTS - 1);
}

export async function getToolScoreHistory(
  toolId: string,
  limit = 12
): Promise<Array<{ date: string; rank: number; overall: number }>> {
  if (redis) {
    try {
      const raw = await redis.lrange(HISTORY_KEY, 0, limit - 1);
      if (raw && raw.length >= 2) {
        const parsed = raw
          .map((entry) => {
            try {
              const snap: SnapshotEntry =
                typeof entry === "string" ? JSON.parse(entry) : (entry as SnapshotEntry);
              const data = snap.scores?.[toolId];
              if (!data) return null;
              return { date: snap.date, rank: data.rank, overall: data.overall };
            } catch {
              return null;
            }
          })
          .filter((e): e is NonNullable<typeof e> => e !== null)
          .reverse(); // oldest first for chart rendering

        if (parsed.length >= 2) return parsed;
      }
    } catch {
      // fall through to static
    }
  }

  return SCORE_HISTORY.slice(-limit)
    .map((snap) => {
      const data = snap.scores[toolId];
      if (!data) return null;
      return { date: snap.date, rank: data.rank, overall: data.overall };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
}
