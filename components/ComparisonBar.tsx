import { cn } from "@/lib/utils";

interface Props {
  label: string;
  scores: { name: string; value: number; color: string }[];
}

export default function ComparisonBar({ label, scores }: Props) {
  const max = Math.max(...scores.map((s) => s.value), 1);

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center gap-3">
          {scores.map((s) => (
            <span key={s.name} className="text-sm font-bold" style={{ color: s.color }}>
              {s.value === 0 ? "N/A" : s.value}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        {scores.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="w-20 text-right text-xs text-gray-600">{s.name}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-[#161c28]">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: s.value === 0 ? "0%" : `${(s.value / max) * 100}%`,
                  backgroundColor: s.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
