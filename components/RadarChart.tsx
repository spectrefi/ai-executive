"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { type BenchmarkScores } from "@/lib/data/tools";

interface ToolData {
  name: string;
  scores: BenchmarkScores;
  color: string;
}

interface Props {
  tools: ToolData[];
}

const DIMENSIONS = [
  { key: "reasoning", label: "Reasoning" },
  { key: "coding", label: "Coding" },
  { key: "writing", label: "Writing" },
  { key: "speed", label: "Speed" },
  { key: "costEfficiency", label: "Cost" },
  { key: "accuracy", label: "Accuracy" },
  { key: "creativity", label: "Creativity" },
  { key: "multimodal", label: "Multimodal" },
];

export default function CompareRadar({ tools }: Props) {
  const data = DIMENSIONS.map((d) => {
    const point: Record<string, string | number> = { subject: d.label };
    tools.forEach((t) => {
      point[t.name] = t.scores[d.key as keyof BenchmarkScores];
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid stroke="#ffffff15" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
        />
        {tools.map((t) => (
          <Radar
            key={t.name}
            name={t.name}
            dataKey={t.name}
            stroke={t.color}
            fill={t.color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
        <Legend
          wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
