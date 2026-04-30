import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const VOTES_KEY = "ai_executive:votes";

interface SourceScore {
  up: number;
  down: number;
}

interface VoteFile {
  articleVotes: Record<string, { vote: "up" | "down"; source: string }>;
  sourceScores: Record<string, SourceScore>;
}

async function readVotes(): Promise<VoteFile> {
  if (!redis) return { articleVotes: {}, sourceScores: {} };
  try {
    const data = await redis.get<VoteFile>(VOTES_KEY);
    return data ?? { articleVotes: {}, sourceScores: {} };
  } catch {
    return { articleVotes: {}, sourceScores: {} };
  }
}

async function writeVotes(data: VoteFile): Promise<void> {
  if (!redis) return;
  await redis.set(VOTES_KEY, data);
}

export async function recordVote(
  articleId: string,
  vote: "up" | "down",
  source: string
): Promise<void> {
  const data = await readVotes();

  if (!data.sourceScores[source]) {
    data.sourceScores[source] = { up: 0, down: 0 };
  }

  const previous = data.articleVotes[articleId];
  if (previous) {
    const prevScore = data.sourceScores[previous.source];
    if (prevScore) {
      prevScore[previous.vote] = Math.max(0, prevScore[previous.vote] - 1);
    }
    if (previous.vote === vote && previous.source === source) {
      delete data.articleVotes[articleId];
      await writeVotes(data);
      return;
    }
  }

  data.articleVotes[articleId] = { vote, source };
  data.sourceScores[source][vote]++;
  await writeVotes(data);
}

export async function getSourceWeights(): Promise<Record<string, number>> {
  const data = await readVotes();
  const weights: Record<string, number> = {};

  for (const [source, scores] of Object.entries(data.sourceScores)) {
    const total = scores.up + scores.down;
    if (total === 0) continue;
    weights[source] = 0.2 + 1.8 * (scores.up / total);
  }

  return weights;
}

export async function getSourceScores(): Promise<Record<string, SourceScore & { score: number }>> {
  const data = await readVotes();
  const result: Record<string, SourceScore & { score: number }> = {};
  for (const [source, scores] of Object.entries(data.sourceScores)) {
    const total = scores.up + scores.down;
    result[source] = {
      ...scores,
      score: total === 0 ? 0 : Math.round((scores.up / total) * 100),
    };
  }
  return result;
}
