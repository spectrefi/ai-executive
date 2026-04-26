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
      className="group block rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-violet-500/40 hover:bg-white/8"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {showRank && (
            <span className="text-sm font-bold text-violet-400">#{tool.currentRank}</span>
          )}
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
            style={{ backgroundColor: `${tool.logoColor}22` }}
          >
            {tool.logo}
          </span>
          <div>
            <div className="font-semibold text-white group-hover:text-violet-300">{tool.name}</div>
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
            className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400"
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
