import { buildMetadata } from "@/lib/seo";
import { MOVER_SIGNALS, SIGNAL_META } from "@/lib/data/market-movers";
import { getEnrichedTools } from "@/lib/rank-history";
import { fetchLiveStocks } from "@/lib/stocks-store";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, BarChart2, ExternalLink, Radio, Clock } from "lucide-react";
export const dynamic = "force-dynamic"; // live stocks via Redis-cached Yahoo Finance fetch

export const metadata = buildMetadata({
  title: "AI Market Movers 2026 — Stocks, Funding & Tool Momentum",
  description: "Track AI company stocks, funding rounds, and which AI tools are gaining or losing ground. Real signals for founders, investors, and power users.",
  path: "/movers",
});

function ChangeChip({ pct }: { pct: number }) {
  if (pct > 0) return (
    <span className="flex items-center gap-0.5 text-emerald-400 font-semibold text-sm">
      <TrendingUp className="h-3.5 w-3.5" /> +{pct.toFixed(1)}%
    </span>
  );
  if (pct < 0) return (
    <span className="flex items-center gap-0.5 text-red-400 font-semibold text-sm">
      <TrendingDown className="h-3.5 w-3.5" /> {pct.toFixed(1)}%
    </span>
  );
  return <span className="flex items-center gap-0.5 text-gray-500 text-sm"><Minus className="h-3.5 w-3.5" /> 0%</span>;
}

export default async function MoversPage() {
  const [allTools, { stocks, fetchedAt, isLive }] = await Promise.all([
    getEnrichedTools(),
    fetchLiveStocks(),
  ]);
  const risingTools = allTools.filter((t) => t.trending === "up")
    .sort((a, b) => b.trendPercent - a.trendPercent)
    .slice(0, 8);
  const fallingTools = allTools.filter((t) => t.trending === "down")
    .sort((a, b) => b.trendPercent - a.trendPercent)
    .slice(0, 5);

  const topGainer = [...stocks].sort((a, b) => b.change1w - a.change1w)[0];
  const topLoser = [...stocks].sort((a, b) => a.change1w - b.change1w)[0];
  const priceAge = fetchedAt !== "hardcoded"
    ? new Date(fetchedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
          <BarChart2 className="h-4 w-4" />
          Market Movers
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          AI Market Movers
        </h1>
        <p className="text-gray-400">
          Which AI stocks are moving, which tools are gaining momentum, and the market signals that matter.
        </p>
      </div>

      {/* Quick stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <div className="text-lg font-bold text-emerald-400">📈 {topGainer.ticker}</div>
          <div className="text-xs text-gray-400">Top gainer this week</div>
          <div className="mt-1 text-sm font-semibold text-emerald-400">+{topGainer.change1w}%</div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <div className="text-lg font-bold text-red-400">📉 {topLoser.ticker}</div>
          <div className="text-xs text-gray-400">Biggest dip this week</div>
          <div className="mt-1 text-sm font-semibold text-red-400">{topLoser.change1w}%</div>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
          <div className="text-lg font-bold text-white">{risingTools.length}</div>
          <div className="text-xs text-gray-400">Tools gaining momentum</div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center">
          <div className="text-lg font-bold text-white">{MOVER_SIGNALS.length}</div>
          <div className="text-xs text-gray-400">Market signals this month</div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left: AI Stocks */}
        <div className="lg:col-span-2 space-y-10">
          {/* Stock table */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">AI Company Stocks</h2>
              {isLive && priceAge ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Radio className="h-3 w-3 animate-pulse" /> Live · as of {priceAge}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="h-3 w-3" /> Indicative prices
                </span>
              )}
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-[#0e1117] text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">1D</th>
                    <th className="hidden px-4 py-3 text-right sm:table-cell">1W</th>
                    <th className="hidden px-4 py-3 text-right sm:table-cell">1M</th>
                    <th className="hidden px-4 py-3 text-right md:table-cell">Mkt Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] bg-[#161c28]">
                  {stocks.map((stock) => (
                    <tr key={stock.ticker} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{stock.logo}</span>
                          <div>
                            <div className="font-semibold text-white">{stock.ticker}</div>
                            <div className="text-xs text-gray-500">{stock.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-white">${stock.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right"><ChangeChip pct={stock.change1d} /></td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell"><ChangeChip pct={stock.change1w} /></td>
                      <td className="hidden px-4 py-3 text-right sm:table-cell"><ChangeChip pct={stock.change1m} /></td>
                      <td className="hidden px-4 py-3 text-right text-gray-400 md:table-cell">${stock.marketCapB}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-600">* {isLive ? "Live prices via Yahoo Finance, cached 15 min." : "Indicative prices."} Not financial advice.</p>
          </section>

          {/* Market signals */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Market Signals</h2>
            <div className="space-y-4">
              {MOVER_SIGNALS.map((signal) => {
                const meta = SIGNAL_META[signal.type];
                return (
                  <article key={signal.id} className={`rounded-xl border p-5 ${meta.bg}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                      {signal.impact === "high" && (
                        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">High impact</span>
                      )}
                      <span className="text-xs text-gray-600">{new Date(signal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-white">{signal.title}</h3>
                    <p className="text-sm text-gray-400">{signal.body}</p>
                    {signal.toolId && (
                      <Link href={`/tools/${signal.toolId}`} className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                        {signal.toolLogo} View {signal.toolId} profile <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Tool momentum */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">🚀 Rising Tools</h2>
            <div className="space-y-2">
              {risingTools.map((tool, i) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-3 hover:border-emerald-500/20 transition-colors">
                  <span className="w-5 text-center text-xs font-bold text-gray-600">#{i + 1}</span>
                  <span className="text-lg">{tool.logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.company}</div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">+{tool.trendPercent}%</span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">📉 Losing Ground</h2>
            <div className="space-y-2">
              {fallingTools.map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-3 hover:border-red-500/20 transition-colors">
                  <span className="text-lg">{tool.logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.company}</div>
                  </div>
                  <span className="text-xs font-semibold text-red-400">-{tool.trendPercent}%</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Why AI stocks section */}
          <section className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Why these stocks matter</h3>
            <div className="space-y-2">
              {stocks.slice(0, 4).map((s) => (
                <div key={s.ticker} className="text-xs text-gray-500">
                  <span className="font-semibold" style={{ color: s.color }}>{s.ticker}</span>
                  {" — "}{s.relevance}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
