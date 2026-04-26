import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  direction: "up" | "down" | "stable";
  percent: number;
  rankDelta?: number;
}

export default function TrendBadge({ direction, percent, rankDelta }: Props) {
  if (direction === "stable") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <Minus className="h-3 w-3" /> Stable
      </span>
    );
  }

  const up = direction === "up";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        up
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {percent > 0 && `+`}{percent}%
      {rankDelta !== undefined && rankDelta !== 0 && (
        <span className="opacity-70">({rankDelta > 0 ? `+${rankDelta}` : rankDelta} ranks)</span>
      )}
    </span>
  );
}
