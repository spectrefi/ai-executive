import Link from "next/link";
import { type NewsItem } from "@/lib/data/news";
import { cn } from "@/lib/utils";
import { TrendingUp, DollarSign, Zap, AlertTriangle, Microscope, Rocket } from "lucide-react";

const TYPE_CONFIG = {
  update: { icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10", label: "Update" },
  pricing: { icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Pricing" },
  benchmark: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Benchmark" },
  launch: { icon: Rocket, color: "text-violet-400", bg: "bg-violet-400/10", label: "Launch" },
  outage: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", label: "Outage" },
  research: { icon: Microscope, color: "text-teal-400", bg: "bg-teal-400/10", label: "Research" },
};

const IMPACT_COLORS = {
  high: "border-l-violet-500",
  medium: "border-l-blue-500",
  low: "border-l-gray-600",
};

interface Props {
  item: NewsItem;
}

export default function NewsCard({ item }: Props) {
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 p-4 border-l-2",
        IMPACT_COLORS[item.impact]
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-md p-1.5", cfg.bg)}>
            <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
          </span>
          <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
          <span className="text-xs text-gray-600">·</span>
          <Link
            href={`/tools/${item.toolId}`}
            className="text-xs font-medium text-gray-400 hover:text-white"
          >
            {item.tool}
          </Link>
        </div>
        <time className="flex-shrink-0 text-xs text-gray-600">{item.date}</time>
      </div>

      <h3 className="mb-1 text-sm font-semibold leading-snug text-white">{item.title}</h3>
      <p className="text-xs leading-relaxed text-gray-500">{item.summary}</p>

      <div className="mt-2 text-xs text-gray-600">Source: {item.source}</div>
    </div>
  );
}
