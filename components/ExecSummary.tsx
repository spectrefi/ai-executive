import { type NewsItem } from "@/lib/data/news";
import { type AITool } from "@/lib/data/tools";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Zap, Rocket, DollarSign, BarChart3 } from "lucide-react";

interface Props {
  news: NewsItem[];
  tools: AITool[];
}

function getLast7Days(news: NewsItem[]): NewsItem[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const filtered = news.filter((n) => new Date(n.date) >= cutoff);
  return filtered.length >= 3 ? filtered : news.slice(0, 10);
}

function buildTldr(
  launches: NewsItem[],
  benchmarks: NewsItem[],
  pricing: NewsItem[],
  risers: AITool[],
  fallers: AITool[]
): string {
  const parts: string[] = [];
  if (risers.length > 0) parts.push(`${risers[0].name} leads this week's movers`);
  if (launches.length > 0) parts.push(`${launches.length} new launch${launches.length > 1 ? "es" : ""} including ${launches[0].tool}`);
  if (benchmarks.length > 0) parts.push(`${benchmarks[0].tool} sets new benchmark records`);
  if (pricing.length > 0) parts.push(`${pricing[0].tool} updated pricing`);
  if (fallers.length > 0 && parts.length < 3) parts.push(`${fallers[0].name} slipped in rankings`);
  return parts.slice(0, 3).join(" · ") || "No major changes this week.";
}

export default function ExecSummary({ news, tools }: Props) {
  const week = getLast7Days(news);
  const launches = week.filter((n) => n.type === "launch");
  const benchmarks = week.filter((n) => n.type === "benchmark");
  const pricing = week.filter((n) => n.type === "pricing");
  const updates = week.filter((n) => n.type === "update");
  const highImpact = week.filter((n) => n.impact === "high");

  const risers = tools.filter((t) => t.trending === "up").sort((a, b) => b.trendPercent - a.trendPercent);
  const fallers = tools.filter((t) => t.trending === "down").sort((a, b) => b.trendPercent - a.trendPercent);

  const tldr = buildTldr(launches, benchmarks, pricing, risers, fallers);

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);
  const dateRange = `${fromDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // Pick top callouts: one per category, high-impact first
  const callouts: { icon: typeof Zap; color: string; bg: string; label: string; item: NewsItem }[] = [];
  const leadLaunch = launches.find((n) => n.impact === "high") ?? launches[0];
  const leadBenchmark = benchmarks.find((n) => n.impact === "high") ?? benchmarks[0];
  const leadPricing = pricing[0];
  const leadUpdate = updates.find((n) => n.impact === "high") ?? updates[0];

  if (leadLaunch) callouts.push({ icon: Rocket, color: "text-blue-400", bg: "bg-blue-500/10", label: "Launch", item: leadLaunch });
  if (leadBenchmark) callouts.push({ icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Benchmark", item: leadBenchmark });
  if (leadPricing) callouts.push({ icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10", label: "Pricing", item: leadPricing });
  if (leadUpdate && callouts.length < 4) callouts.push({ icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10", label: "Update", item: leadUpdate });

  return (
    <section className="border-b border-white/[0.07] bg-gradient-to-r from-slate-950/20 via-transparent to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header row */}
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Executive Briefing
              </span>
              <span className="ml-2 text-xs text-gray-600">{dateRange}</span>
            </div>
          </div>
          <Link
            href="/daily-update"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-white"
          >
            Full briefing <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* TL;DR */}
        <p className="mb-5 text-sm font-medium text-gray-300">
          <span className="mr-2 font-bold text-white">TL;DR</span>
          {tldr}
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Callout bullets */}
          <div className="space-y-2.5 lg:col-span-2">
            {callouts.map(({ icon: Icon, color, bg, label, item }) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded ${bg}`}>
                  <Icon className={`h-3 w-3 ${color}`} />
                </span>
                <div className="min-w-0">
                  <span className={`mr-1.5 text-xs font-semibold ${color}`}>{label}</span>
                  <span className="text-sm text-gray-300">{item.title}</span>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-1.5 text-xs text-gray-600 hover:text-blue-400">↗</a>
                  )}
                </div>
              </div>
            ))}

            {/* Movers inline */}
            {(risers.length > 0 || fallers.length > 0) && (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-[#161c28]">
                  <TrendingUp className="h-3 w-3 text-gray-400" />
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="text-xs font-semibold text-gray-500">Movers</span>
                  {risers.slice(0, 3).map((t) => (
                    <Link key={t.id} href={`/tools/${t.id}`} className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                      <TrendingUp className="h-3 w-3" />
                      {t.name} <span className="text-xs">+{t.trendPercent}%</span>
                    </Link>
                  ))}
                  {fallers.slice(0, 2).map((t) => (
                    <Link key={t.id} href={`/tools/${t.id}`} className="inline-flex items-center gap-1 text-red-400 hover:text-red-300">
                      <TrendingDown className="h-3 w-3" />
                      {t.name} <span className="text-xs">-{t.trendPercent}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats sidebar */}
          <div className="flex gap-3 lg:flex-col lg:gap-2">
            {[
              { label: "High-impact events", value: highImpact.length, color: "text-red-400" },
              { label: "Launches this week", value: launches.length, color: "text-blue-400" },
              { label: "Benchmark updates", value: benchmarks.length, color: "text-emerald-400" },
              { label: "Pricing changes", value: pricing.length, color: "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="flex flex-1 flex-col rounded-lg border border-white/8 bg-white/3 px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={`text-lg font-bold lg:text-base ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
