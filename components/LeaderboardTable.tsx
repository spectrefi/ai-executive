"use client";

import Link from "next/link";
import { useState } from "react";
import { type BenchmarkScores } from "@/lib/data/tools";
import { type ToolBuzz } from "@/lib/sentiment";
import ScoreBadge from "./ScoreBadge";
import TrendBadge from "./TrendBadge";
import { formatNumber, rankDelta } from "@/lib/utils";
import { ArrowUpDown, Flame, Activity, Minus } from "lucide-react";

// Minimal shape — only what the table renders. Internal fields (sources, pros, cons,
// enterprise, specs, weeklyUsers estimates) stay server-side and never ship to the client.
export interface LeaderboardRow {
  id: string;
  name: string;
  company: string;
  logo: string;
  logoColor: string;
  currentRank: number;
  previousRank: number;
  scores: BenchmarkScores;
  weeklyUsers: number;
  trending: "up" | "down" | "stable";
  trendPercent: number;
}

type SortKey = keyof BenchmarkScores | "weeklyUsers" | "currentRank";

const BUZZ_CONFIG = {
  hot:    { icon: Flame,    color: "text-orange-400", bg: "bg-orange-500/10", label: "Hot" },
  active: { icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Active" },
  quiet:  { icon: Minus,    color: "text-gray-600",   bg: "bg-[#161c28]",       label: "Quiet" },
};

interface Props {
  tools: LeaderboardRow[];
  sentiment?: Record<string, ToolBuzz>;
}

export default function LeaderboardTable({ tools, sentiment }: Props) {
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

  const sorted = [...tools].sort((a, b) => {
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
    <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.07] bg-[#161c28]">
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
            <th
              className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
              title="Community buzz from HackerNews & Reddit — last 7 days"
            >
              Community Buzz
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
                className="border-b border-white/5 transition-colors hover:bg-[#161c28]"
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        tool.currentRank <= 3
                          ? "text-lg font-bold text-blue-400"
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
                      <div className="font-semibold text-white group-hover:text-blue-400">
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

                {/* Community Buzz */}
                <td className="px-4 py-4 text-center">
                  {(() => {
                    const buzz = sentiment?.[tool.id];
                    if (!buzz) return <span className="text-xs text-gray-700">—</span>;
                    const cfg = BUZZ_CONFIG[buzz.level];
                    const Icon = cfg.icon;
                    return (
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        {buzz.buzzScore > 0 && (
                          <span className="text-xs text-gray-600">{buzz.buzzScore.toLocaleString()} pts</span>
                        )}
                        {buzz.topStory && (
                          <a
                            href={buzz.topStory.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={buzz.topStory.title}
                            className="max-w-[140px] truncate text-xs text-gray-600 hover:text-blue-400"
                          >
                            {buzz.topStory.source === "hn" ? "HN" : "Reddit"}: {buzz.topStory.title.slice(0, 40)}…
                          </a>
                        )}
                      </div>
                    );
                  })()}
                </td>

                {/* CTA */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tools/${tool.id}`}
                      className="rounded-md bg-[#161c28] px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-[#1e2640] hover:text-white"
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
