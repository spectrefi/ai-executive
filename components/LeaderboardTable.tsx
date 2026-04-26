"use client";

import Link from "next/link";
import { useState } from "react";
import { AI_TOOLS, type AITool, type BenchmarkScores } from "@/lib/data/tools";
import ScoreBadge from "./ScoreBadge";
import TrendBadge from "./TrendBadge";
import { formatNumber, rankDelta } from "@/lib/utils";
import { ArrowUpDown, ExternalLink } from "lucide-react";

type SortKey = keyof BenchmarkScores | "weeklyUsers" | "currentRank";

export default function LeaderboardTable() {
  const [sortKey, setSortKey] = useState<SortKey>("currentRank");
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "currentRank" ? true : false);
    }
  }

  const sorted = [...AI_TOOLS].sort((a, b) => {
    let aVal: number;
    let bVal: number;

    if (sortKey === "weeklyUsers") {
      aVal = a.weeklyUsers;
      bVal = b.weeklyUsers;
    } else if (sortKey === "currentRank") {
      aVal = a.currentRank;
      bVal = b.currentRank;
    } else {
      aVal = a.scores[sortKey];
      bVal = b.scores[sortKey];
    }

    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const cols: { key: SortKey; label: string; tip: string }[] = [
    { key: "overall", label: "Overall", tip: "Composite score across all dimensions" },
    { key: "reasoning", label: "Reasoning", tip: "Logic and problem solving" },
    { key: "coding", label: "Coding", tip: "Code generation and review quality" },
    { key: "writing", label: "Writing", tip: "Prose quality and coherence" },
    { key: "speed", label: "Speed", tip: "Tokens per second, normalized" },
    { key: "costEfficiency", label: "Cost", tip: "Value per dollar" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tool
            </th>
            {cols.map((c) => (
              <th key={c.key} className="px-3 py-3 text-center">
                <button
                  onClick={() => handleSort(c.key)}
                  title={c.tip}
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300"
                >
                  {c.label}
                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                </button>
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
              Weekly Users
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
              Trend
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((tool, i) => {
            const delta = rankDelta(tool.currentRank, tool.previousRank);
            return (
              <tr
                key={tool.id}
                className="border-b border-white/5 transition-colors hover:bg-white/5"
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        tool.currentRank <= 3
                          ? "text-lg font-bold text-violet-400"
                          : "text-sm font-semibold text-gray-400"
                      }
                    >
                      #{tool.currentRank}
                    </span>
                    {delta !== 0 && (
                      <span
                        className={`text-xs ${delta > 0 ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                      </span>
                    )}
                  </div>
                </td>

                {/* Tool name */}
                <td className="px-4 py-4">
                  <Link href={`/tools/${tool.id}`} className="group flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: `${tool.logoColor}22` }}
                    >
                      {tool.logo}
                    </span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-violet-400">
                        {tool.name}
                      </div>
                      <div className="text-xs text-gray-500">{tool.company}</div>
                    </div>
                  </Link>
                </td>

                {/* Scores */}
                {cols.map((c) => (
                  <td key={c.key} className="px-3 py-4 text-center">
                    <ScoreBadge
                      score={
                        c.key === "weeklyUsers" || c.key === "currentRank"
                          ? 0
                          : tool.scores[c.key as keyof BenchmarkScores]
                      }
                      size="sm"
                    />
                  </td>
                ))}

                {/* Weekly users */}
                <td className="px-4 py-4 text-center text-sm text-gray-400">
                  {formatNumber(tool.weeklyUsers)}
                </td>

                {/* Trend */}
                <td className="px-4 py-4 text-center">
                  <TrendBadge
                    direction={tool.trending}
                    percent={tool.trendPercent}
                  />
                </td>

                {/* CTA */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tools/${tool.id}`}
                      className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                      Profile
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
