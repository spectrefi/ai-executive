import { notFound } from "next/navigation";
import { AI_TOOLS, getToolById } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { getOutboundUrl } from "@/lib/affiliates";
import ScoreBadge from "@/components/ScoreBadge";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
export const revalidate = 14400;

export async function generateStaticParams() {
  return AI_TOOLS.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = getToolById(slug);
  if (!tool) return {};
  return buildMetadata({
    title: `Best ${tool.name} Alternatives in 2026 — Ranked & Compared`,
    description: `The top ${tool.name} alternatives ranked by benchmark score, pricing, and real-world use case. Find the best AI tool to replace or complement ${tool.name}.`,
    path: `/alternatives/${slug}`,
  });
}

export default async function AlternativesPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = await params;
  const tool = getToolById(slug);
  if (!tool) notFound();

  // Find alternatives: same category, different tool, sorted by overall score desc
  const alternatives = AI_TOOLS.filter(
    (t) => t.id !== tool.id && t.category.some((c) => tool.category.includes(c))
  ).sort((a, b) => b.scores.overall - a.scores.overall).slice(0, 8);

  const winner = alternatives[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/alternatives" className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> All alternatives
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${tool.logoColor}22` }}
          >
            {tool.logo}
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Best {tool.name} Alternatives
            </h1>
            <p className="text-gray-500">{tool.company} · {tool.tagline}</p>
          </div>
        </div>
        <p className="text-gray-400">
          {alternatives.length} alternatives ranked by benchmark scores, pricing, and fit. Updated daily.
          {winner && (
            <> Our top pick: <span className="font-semibold text-white">{winner.name}</span> with an overall score of {winner.scores.overall}.</>
          )}
        </p>
      </div>

      {/* Why people switch */}
      <section className="mb-10 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="mb-3 font-semibold text-white">Why look for a {tool.name} alternative?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tool.cons.map((con) => (
            <div key={con} className="flex items-start gap-2 text-sm text-gray-400">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500/60" />
              {con}
            </div>
          ))}
        </div>
      </section>

      {/* Alternatives list */}
      <div className="space-y-4">
        {alternatives.map((alt, i) => (
          <article
            key={alt.id}
            className={`rounded-xl border bg-[#161c28] p-5 transition-colors hover:border-white/20 ${
              i === 0 ? "border-blue-500/30" : "border-white/[0.07]"
            }`}
          >
            {i === 0 && (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                ⭐ Top Pick
              </div>
            )}

            <div className="mb-4 flex flex-wrap items-start gap-4">
              {/* Tool info */}
              <div className="flex flex-1 items-center gap-3">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${alt.logoColor}22` }}
                >
                  {alt.logo}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">#{i + 1} {alt.name}</span>
                    <span className="text-sm text-gray-500">{alt.company}</span>
                  </div>
                  <p className="text-sm text-gray-400">{alt.tagline}</p>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-extrabold text-blue-400">{alt.scores.overall}</div>
                <div className="text-xs text-gray-600">overall score</div>
              </div>
            </div>

            {/* Score comparison row */}
            <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {(["reasoning", "coding", "writing", "speed", "costEfficiency", "multimodal"] as const).map((key) => {
                const altScore = alt.scores[key];
                const toolScore = tool.scores[key];
                const better = altScore > toolScore;
                return (
                  <div key={key} className="text-center">
                    <ScoreBadge score={altScore} size="sm" />
                    <div className="mt-0.5 text-xs capitalize text-gray-600">{key === "costEfficiency" ? "Cost" : key === "multimodal" ? "Multimodal" : key}</div>
                    {altScore !== toolScore && (
                      <div className={`text-xs font-semibold ${better ? "text-emerald-400" : "text-red-400"}`}>
                        {better ? `+${altScore - toolScore}` : `${altScore - toolScore}`} vs {tool.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Why switch */}
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Pros</div>
                {alt.pros.slice(0, 3).map((p) => (
                  <div key={p} className="flex items-start gap-1.5 text-sm text-gray-400">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" /> {p}
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-400">Cons</div>
                {alt.cons.slice(0, 2).map((c) => (
                  <div key={c} className="flex items-start gap-1.5 text-sm text-gray-400">
                    <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500/60" /> {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing + CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-400">
                {alt.pricing.free ? "✓ Free tier" : "No free tier"} · Starting {alt.pricing.startingAt}
              </span>
              <div className="ml-auto flex gap-2">
                <Link
                  href={`/compare/${[tool.id, alt.id].sort().join("-vs-")}`}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white"
                >
                  Compare →
                </Link>
                <Link
                  href={`/tools/${alt.id}`}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white"
                >
                  Full review
                </Link>
                <a
                  href={getOutboundUrl(alt.id, alt.website)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
                >
                  Try {alt.name} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="mb-6 text-xl font-bold text-white">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            {
              q: `What is the best free alternative to ${tool.name}?`,
              a: alternatives.filter((a) => a.pricing.free)[0]
                ? `${alternatives.filter((a) => a.pricing.free)[0].name} is the top-rated free alternative to ${tool.name}, scoring ${alternatives.filter((a) => a.pricing.free)[0].scores.overall}/100 overall.`
                : `Most top alternatives to ${tool.name} require a paid plan, but free trials are widely available.`,
            },
            {
              q: `How does ${winner?.name ?? alternatives[0]?.name} compare to ${tool.name}?`,
              a: winner
                ? `${winner.name} scores ${winner.scores.overall} overall vs ${tool.name}'s ${tool.scores.overall}. ${winner.scores.overall > tool.scores.overall ? `${winner.name} outperforms ${tool.name} on most benchmarks.` : `${tool.name} still leads on overall score but ${winner.name} may win on specific dimensions.`}`
                : `Check our head-to-head comparison for a full breakdown.`,
            },
            {
              q: `Which ${tool.name} alternative is best for coding?`,
              a: (() => {
                const bestCoding = [...alternatives].sort((a, b) => b.scores.coding - a.scores.coding)[0];
                return bestCoding
                  ? `${bestCoding.name} leads on coding with a score of ${bestCoding.scores.coding}/100 — the highest among ${tool.name} alternatives.`
                  : `See the full comparison table above for coding scores across all alternatives.`;
              })(),
            },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <h3 className="mb-2 font-semibold text-white">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-white">Compare {tool.name} head-to-head</h2>
        <p className="mb-4 text-sm text-gray-400">See full benchmarks, pricing, and pros/cons side by side.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {alternatives.slice(0, 3).map((alt) => (
            <Link
              key={alt.id}
              href={`/compare/${[tool.id, alt.id].sort().join("-vs-")}`}
              className="rounded-lg border border-white/10 bg-[#161c28] px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              {tool.name} vs {alt.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
