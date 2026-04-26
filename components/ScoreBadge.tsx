import { cn } from "@/lib/utils";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getColor(score: number) {
  if (score >= 88) return "text-emerald-400 bg-emerald-400/10 ring-emerald-400/30";
  if (score >= 75) return "text-blue-400 bg-blue-400/10 ring-blue-400/30";
  if (score >= 60) return "text-yellow-400 bg-yellow-400/10 ring-yellow-400/30";
  return "text-red-400 bg-red-400/10 ring-red-400/30";
}

function getLabel(score: number) {
  if (score >= 88) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Limited";
}

export default function ScoreBadge({ score, size = "md", showLabel = false }: Props) {
  if (score === 0) return <span className="text-xs text-gray-600">N/A</span>;

  const sizeClass = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5 font-bold",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md font-semibold ring-1",
        sizeClass,
        getColor(score)
      )}
    >
      {score}
      {showLabel && <span className="font-normal opacity-70">· {getLabel(score)}</span>}
    </span>
  );
}
