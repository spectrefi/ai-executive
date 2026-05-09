import { buildMetadata } from "@/lib/seo";
import {
  FUNDING_ROUNDS,
  STAGE_META,
  formatAmount,
  getTotalFunding,
  type FundingStage,
} from "@/lib/data/funding";
import { AI_TOOLS } from "@/lib/data/tools";
import Link from "next/link";
import { TrendingUp, DollarSign, ExternalLink } from "lucide-react";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "AI Funding Tracker 2024–2026 — VC Rounds, Valuations & What It Means",
  description:
    "Every major AI funding round tracked: OpenAI, Anthropic, Mistral, Cursor, ElevenLabs and more. Amounts, valuations, lead investors, and what each round means for users.",
  path: "/funding",
});

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  llm:            { label: "LLM",            color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  image:          { label: "Image/Video",     color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  voice:          { label: "Voice",           color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  code:           { label: "Coding",          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  search:         { label: "Search",          color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  agent:          { label: "Agents",          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  infrastructure: { label: "Infrastructure",  color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  vertical:       { label: "Vertical AI",     color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
};

const IMPACT_BORDER: Record<string, string> = {
  high:   "border-l-4 border-l-red-500/60",
  medium: "border-l-4 border-l-amber-500/40",
  low:    "border-l-4 border-l-gray-700",
};

export default function FundingPage() {
  const sorted = [...FUNDING_ROUNDS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const totalFunding = getTotalFunding();
  const totalDeals = FUNDING_ROUNDS.length;
  const largestRound = FUNDING_ROUNDS.reduce((max, r) => (r.amountUsd > max.amountUsd ? r : max));
  const avgRound = totalFunding / totalDeals;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-500">
          <TrendingUp className="h-4 w-4" />
          VC & Funding Radar
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          AI Funding Tracker
        </h1>
        <p className="text-gray-400">
          Every major round, tracked with context. What was raised, who led it, what it signals for users and the market.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total tracked", value: formatAmount(totalFunding), detail: "across all rounds", color: "text-white" },
          { label: "Deals tracked", value: totalDeals, detail: "funding rounds", color: "text-blue-400" },
          { label: "Largest round", value: largestRound.amountLabel, detail: largestRound.company, color: "text-amber-400" },
          { label: "Average deal", value: formatAmount(avgRound), detail: "per round", color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-600">{s.detail}</div>
          </div>
        ))}
      </div>

      {/* Rounds */}
      <div className="space-y-4">
        {sorted.map((round) => {
          const stageMeta = STAGE_META[round.stage];
          const catMeta = CATEGORY_META[round.category];
          const tool = AI_TOOLS.find((t) => t.id === round.toolId);
          const impactBorder = IMPACT_BORDER[round.impact];

          return (
            <article
              key={round.id}
              className={`rounded-xl border border-white/[0.07] bg-[#161c28] p-5 ${impactBorder}`}
            >
              {/* Top row */}
              <div className="mb-3 flex flex-wrap items-start gap-3">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${round.logoColor}22` }}
                >
                  {round.logo}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white">{round.company}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${stageMeta.color}`}>
                      {stageMeta.label}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${catMeta.color}`}>
                      {catMeta.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{round.tagline}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-white">{round.amountLabel}</div>
                  {round.valuation && (
                    <div className="text-xs text-gray-500">valuation: {round.valuation}</div>
                  )}
                  <div className="text-xs text-gray-600">
                    {new Date(round.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Headline */}
              <h3 className="mb-2 font-semibold text-gray-100">{round.headline}</h3>

              {/* Analysis */}
              <p className="mb-3 text-sm leading-relaxed text-gray-400">{round.analysis}</p>

              {/* Investors */}
              {round.investors.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <span className="text-xs text-gray-600">Led/backed by:</span>
                  {round.investors.map((inv) => (
                    <span
                      key={inv}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400"
                    >
                      {inv}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">Source: {round.source}</span>
                {tool && (
                  <Link
                    href={`/tools/${tool.id}`}
                    className="ml-auto flex items-center gap-1 rounded-md bg-[#0e1117] px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-white"
                  >
                    View tool profile <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* CTA */}
      <section className="mt-10 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
        <DollarSign className="mx-auto mb-2 h-8 w-8 text-blue-400" />
        <h2 className="mb-2 text-lg font-bold text-white">See how funding translates to performance</h2>
        <p className="mb-4 text-sm text-gray-400">
          More capital doesn't always mean a better product. Check the live leaderboard for benchmark scores across all these tools.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          View Rankings
        </Link>
      </section>
    </div>
  );
}
