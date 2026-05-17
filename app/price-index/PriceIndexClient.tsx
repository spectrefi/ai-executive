"use client";

import { useState, useMemo } from "react";
import { TIER_META, estimateCost, type ApiModel } from "@/lib/data/api-pricing";
import Link from "next/link";
import { Calculator, TrendingDown, ExternalLink, ArrowUpDown, CheckCircle2 } from "lucide-react";

type LiveModel = ApiModel & { lastVerified?: string };

const PRESET_WORKLOADS = [
  { label: "Short chat (avg)", input: 500, output: 300 },
  { label: "Long analysis", input: 8000, output: 2000 },
  { label: "Code review", input: 4000, output: 1500 },
  { label: "Document summary", input: 15000, output: 800 },
  { label: "RAG pipeline (1K calls/day)", input: 2000, output: 600 },
];

const CATEGORY_FILTER = ["all", "frontier", "balanced", "fast", "open"] as const;
type CategoryFilter = (typeof CATEGORY_FILTER)[number];

function PriceHistoryBadge({ model }: { model: ApiModel }) {
  if (model.history.length < 2) return null;
  const first = model.history[model.history.length - 1];
  const latest = model.history[0];
  const pct = Math.round(((latest.inputPer1M - first.inputPer1M) / first.inputPer1M) * 100);
  if (pct === 0) return null;
  return (
    <span className={`text-xs font-semibold ${pct < 0 ? "text-emerald-400" : "text-red-400"}`}>
      {pct < 0 ? `↓${Math.abs(pct)}%` : `↑${pct}%`}
    </span>
  );
}

function VerifiedBadge({ date }: { date: string }) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  const label = days === 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`;
  const color = days < 7 ? "text-emerald-500" : days < 30 ? "text-amber-500" : "text-red-500";
  return (
    <span className={`flex items-center gap-0.5 text-xs ${color}`} title={`Last verified: ${date}`}>
      <CheckCircle2 className="h-3 w-3" /> {label}
    </span>
  );
}

export default function PriceIndexClient({
  models,
  pricingUpdatedAt,
}: {
  models: LiveModel[];
  pricingUpdatedAt: string | null;
}) {
  const [workloadInput, setWorkloadInput] = useState(2000);
  const [workloadOutput, setWorkloadOutput] = useState(600);
  const [monthlyVolume, setMonthlyVolume] = useState(10000);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortKey, setSortKey] = useState<"input" | "output" | "cost">("cost");

  const filtered = useMemo(() => {
    const list = categoryFilter === "all" ? models : models.filter((m) => m.category === categoryFilter);
    return [...list].sort((a, b) => {
      if (sortKey === "input") return a.inputPer1M - b.inputPer1M;
      if (sortKey === "output") return a.outputPer1M - b.outputPer1M;
      return (
        estimateCost(a, workloadInput, workloadOutput) * monthlyVolume -
        estimateCost(b, workloadInput, workloadOutput) * monthlyVolume
      );
    });
  }, [categoryFilter, sortKey, workloadInput, workloadOutput, monthlyVolume, models]);

  const cheapest = filtered[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
          <TrendingDown className="h-4 w-4" />
          API Price Index
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">AI API Pricing — Live</h1>
            <p className="text-gray-400">
              Price per million tokens for every major model. Use the calculator to find the cheapest option for your
              exact workload.
            </p>
          </div>
          {pricingUpdatedAt && (
            <div className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-center text-xs">
              <div className="font-semibold text-emerald-400">Auto-updated</div>
              <div className="text-gray-500">
                {new Date(pricingUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="mb-10 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-4 w-4 text-blue-400" />
          <h2 className="font-semibold text-white">Cost Calculator</h2>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESET_WORKLOADS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setWorkloadInput(p.input); setWorkloadOutput(p.output); }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400 hover:border-blue-500/40 hover:text-blue-400 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Avg input tokens / call", value: workloadInput, set: setWorkloadInput },
            { label: "Avg output tokens / call", value: workloadOutput, set: setWorkloadOutput },
            { label: "Monthly call volume", value: monthlyVolume, set: setMonthlyVolume },
          ].map((f) => (
            <div key={f.label}>
              <label className="mb-1 block text-xs font-medium text-gray-500">{f.label}</label>
              <input
                type="number"
                value={f.value}
                onChange={(e) => f.set(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-[#0e1117] px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
        {cheapest && (
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-sm text-emerald-300">
              <span className="font-bold">Cheapest for your workload:</span>{" "}
              <span className="font-mono font-bold">{cheapest.name}</span> at{" "}
              <span className="font-bold">
                ${(estimateCost(cheapest, workloadInput, workloadOutput) * monthlyVolume).toFixed(2)}/mo
              </span>{" "}
              for {monthlyVolume.toLocaleString()} calls
            </p>
          </div>
        )}
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {CATEGORY_FILTER.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                categoryFilter === cat ? "bg-blue-600 text-white" : "border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "All models" : cat}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <span>Sort by:</span>
          {(["cost", "input", "output"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`flex items-center gap-1 rounded px-2 py-0.5 capitalize transition-colors ${
                sortKey === k ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {k === "cost" ? "monthly cost" : `${k} price`}
              {sortKey === k && <ArrowUpDown className="h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-[#161c28]">
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Model</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Tier</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-400">Input / 1M</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-400">Output / 1M</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-400">Cached input</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-400">Est. monthly cost</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Trend</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Verified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((model, i) => {
              const monthlyCost = estimateCost(model, workloadInput, workloadOutput) * monthlyVolume;
              const tierMeta = TIER_META[model.tier];
              const isFirst = i === 0;
              return (
                <tr
                  key={model.id}
                  className={`border-b border-white/5 transition-colors hover:bg-[#161c28] ${
                    isFirst ? "bg-emerald-500/5" : i % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      {isFirst && <span className="mr-1 text-xs font-bold text-emerald-400">✓ Best</span>}
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ backgroundColor: `${model.logoColor}22` }}
                      >
                        {model.logo}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.company}</div>
                        {model.notes && <div className="text-xs text-gray-600">{model.notes}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${tierMeta.color}`}>
                      {tierMeta.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-gray-200">
                    ${model.inputPer1M.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-gray-200">
                    ${model.outputPer1M.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-gray-400">
                    {model.cachedInputPer1M !== null ? `$${model.cachedInputPer1M.toFixed(4)}` : "—"}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono font-bold ${isFirst ? "text-emerald-400" : "text-white"}`}>
                    ${monthlyCost.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <PriceHistoryBadge model={model} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    {model.lastVerified ? (
                      <VerifiedBadge date={model.lastVerified} />
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        Prices in USD per million tokens. Monthly cost estimated from your calculator settings. Verify with each
        provider before production use.
      </p>

      <section className="mt-10 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-white">Price just one dimension</h2>
        <p className="mb-4 text-sm text-gray-400">
          The cheapest model isn&apos;t always the right model. Compare quality benchmarks, speed, and real-world fit.
        </p>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Compare Models <ExternalLink className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
