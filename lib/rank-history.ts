import { AI_TOOLS, type AITool } from "@/lib/data/tools";
import { getLastRankingsSnapshot } from "@/lib/rankings-store";

export type EnrichedTool = AITool;

/**
 * Returns a copy of AI_TOOLS with previousRank, trending, and trendPercent
 * populated from the latest Redis rankings snapshot.
 *
 * Falls back to stable / 0 for all tools if no snapshot exists yet
 * (i.e. power-rankings has never been run).
 */
export async function getEnrichedTools(): Promise<EnrichedTool[]> {
  const snapshot = await getLastRankingsSnapshot();

  return AI_TOOLS.map((tool) => {
    if (!snapshot) return { ...tool };

    const prev = snapshot.ranks[tool.id];
    if (!prev) return { ...tool };

    const delta = prev.rank - tool.currentRank; // positive = moved up
    return {
      ...tool,
      previousRank: prev.rank,
      trending: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
      // spots moved as a % of where they were — capped at 100
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
