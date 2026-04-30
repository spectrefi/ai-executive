import Link from "next/link";
import { type AITool } from "@/lib/data/tools";
import ScoreBadge from "./ScoreBadge";
import TrendBadge from "./TrendBadge";
import { formatNumber } from "@/lib/utils";

interface Props {
  tool: AITool;
  showRank?: boolean;
}

export default function ToolCard({ tool, showRank = false }: Props) {
  return (
    <Link
      href={`/tools/${tool.id}`}
      className={`group block rounded-xl border bg-[#161c28] p-5 transition-all hover:bg-[#1a2235] ${
        showRank && tool.currentRank === 1
          ? "border-amber-500/30 hover:border-amber-500/50"
          : showRank && tool.currentRank === 2
          ? "border-slate-400/20 hover:border-slate-400/40"
          : showRank && tool.currentRank === 3
          ? "border-amber-800/30 hover:border-amber-700/40"
          : "border-white/[0.07] hover:border-blue-500/40"
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {showRank && (
            <span className={`text-sm font-bold ${
              tool.currentRank === 1 ? "text-amber-400" :
              tool.currentRank === 2 ? "text-slate-300" :
              tool.currentRank === 3 ? "text-amber-700" :
              "text-blue-400"
            }`}>#{tool.currentRank}</span>
          )}
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${tool.logoColor}22` }}
          >
            {tool.logo}
          </span>
          <div>
            <div className="font-semibold text-white group-hover:text-blue-300">{tool.name}</div>
            <div className="text-xs text-gray-500">{tool.company}</div>
          </div>
        </div>
        <ScoreBadge score={tool.scores.overall} size="md" />
      </div>

      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">
        {tool.tagline}
      </p>

      <div className="flex items-center justify-between">
        <TrendBadge
          direction={tool.trending}
          percent={tool.trendPercent}
        />
        <span className="text-xs text-gray-600">{formatNumber(tool.weeklyUsers)} users/wk</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {tool.category.slice(0, 3).map((c) => (
          <span
            key={c}
            className="rounded-full bg-[#1e2640] px-2 py-0.5 text-xs text-gray-400"
          >
            {c}
          </span>
        ))}
        {tool.pricing.free && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
            Free tier
          </span>
        )}
      </div>
    </Link>
  );
}
