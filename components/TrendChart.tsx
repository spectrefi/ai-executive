"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { type AITool } from "@/lib/data/tools";

interface Props {
  data: Record<string, string | number>[];
  tools: AITool[];
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TrendChart({ data, tools }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(v) => fmtDate(String(v))}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e5e7eb",
          }}
          labelFormatter={(v) => fmtDate(String(v))}
        />
        <Legend
          wrapperStyle={{ color: "#9ca3af", fontSize: "11px", paddingTop: "12px" }}
        />
        {tools.map((tool) => (
          <Line
            key={tool.id}
            type="monotone"
            dataKey={tool.name}
            stroke={tool.logoColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: tool.logoColor }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
