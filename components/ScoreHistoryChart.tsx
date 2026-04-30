"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  date: string;
  overall: number;
  rank: number;
}

interface Props {
  data: DataPoint[];
  color: string;
  toolName: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ScoreHistoryChart({ data, color, toolName }: Props) {
  if (data.length < 2) return null;

  const first = data[0].overall;
  const last = data[data.length - 1].overall;
  const delta = last - first;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span>6-week overall score</span>
        <span className={delta >= 0 ? "text-emerald-400" : "text-red-400"}>
          {delta >= 0 ? "+" : ""}
          {delta} pts
        </span>
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "#6b7280", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#6b7280", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#e5e7eb",
            }}
            labelFormatter={(label) => formatDate(String(label))}
            formatter={(val) => [`${val}`, "Score"]}
          />
          <ReferenceLine y={first} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="overall"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 4, fill: color }}
            name={toolName}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
