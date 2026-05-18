import { AI_TOOLS, type AITool } from "@/lib/data/tools";
import { getLastRankingsSnapshot } from "@/lib/rankings-store";
import { getScoresOverrides } from "@/lib/scores-override-store";
import { getWeeklyUsersOverrides } from "@/lib/weekly-users-store";

export type EnrichedTool = AITool;

/**
 * Returns a copy of AI_TOOLS with:
 * - previousRank/trending/trendPercent from Redis rankings snapshot
 * - scores merged with any live Redis score overrides
 *
 * Falls back to static data if no snapshots exist.
 */
export async function getEnrichedTools(): Promise<EnrichedTool[]> {
  const [snapshot, scoreOverrides, userOverrides] = await Promise.all([
    getLastRankingsSnapshot(),
    getScoresOverrides(),
    getWeeklyUsersOverrides(),
  ]);

  return AI_TOOLS.map((tool) => {
    // Merge live score overrides
    const override = scoreOverrides?.tools[tool.id];
    const scores = override
      ? {
          ...tool.scores,
          ...(override.overall !== undefined && { overall: override.overall }),
          ...(override.reasoning !== undefined && { reasoning: override.reasoning }),
          ...(override.coding !== undefined && { coding: override.coding }),
          ...(override.writing !== undefined && { writing: override.writing }),
          ...(override.speed !== undefined && { speed: override.speed }),
          ...(override.costEfficiency !== undefined && { costEfficiency: override.costEfficiency }),
          ...(override.accuracy !== undefined && { accuracy: override.accuracy }),
          ...(override.creativity !== undefined && { creativity: override.creativity }),
          ...(override.contextWindow !== undefined && { contextWindow: override.contextWindow }),
          ...(override.multimodal !== undefined && { multimodal: override.multimodal }),
        }
      : tool.scores;

    const weeklyUsers = userOverrides?.tools[tool.id]?.weeklyUsers ?? tool.weeklyUsers;

    if (!snapshot) return { ...tool, scores, weeklyUsers };

    const prev = snapshot.ranks[tool.id];
    if (!prev) return { ...tool, scores, weeklyUsers };

    const delta = prev.rank - tool.currentRank;
    return {
      ...tool,
      scores,
      weeklyUsers,
      previousRank: prev.rank,
      trending: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
      trendPercent: Math.min(100, Math.round((Math.abs(delta) / prev.rank) * 100)),
    };
  });
}

/** Convenience: enriched tools sorted by currentRank ascending */
export async function getEnrichedToolsSorted(): Promise<EnrichedTool[]> {
  const tools = await getEnrichedTools();
  return tools.sort((a, b) => a.currentRank - b.currentRank);
}

/** Single tool enriched with snapshot data, or null if not found */
export async function getEnrichedToolById(id: string): Promise<EnrichedTool | null> {
  const tools = await getEnrichedTools();
  return tools.find((t) => t.id === id) ?? null;
}
