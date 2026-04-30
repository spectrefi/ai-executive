import { notFound } from "next/navigation";
import { AI_TOOLS, getToolById } from "@/lib/data/tools";
import { buildMetadata, comparisonJsonLd, faqJsonLd } from "@/lib/seo";
import ScoreBadge from "@/components/ScoreBadge";
import ComparisonBar from "@/components/ComparisonBar";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, Share2 } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import { getOutboundUrl, getAffiliateBadge } from "@/lib/affiliates";
export const revalidate = 14400;


export async function generateStaticParams() {
  const pairs: { slug: string }[] = [];
  AI_TOOLS.forEach((a) => {
    AI_TOOLS.forEach((b) => {
      if (a.id !== b.id) pairs.push({ slug: `${a.id}-vs-${b.id}` });
    });
  });
  return pairs;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [idA, idB] = slug.split("-vs-");
  const toolA = getToolById(idA);
  const toolB = getToolById(idB);
  if (!toolA || !toolB) return {};
  return buildMetadata({
    title: `${toolA.name} vs ${toolB.name}: Head-to-Head Comparison 2026`,
    description: `${toolA.name} vs ${toolB.name} — benchmark scores, pricing, pros & cons, and which AI tool wins for your use case. Updated daily.`,
    path: `/compare/${slug}`,
  });
}

const SCORE_DIMENSIONS = [
  { key: "overall", label: "Overall Score" },
  { key: "reasoning", label: "Reasoning" },
  { key: "coding", label: "Coding" },
  { key: "writing", label: "Writing" },
  { key: "speed", label: "Speed" },
  { key: "costEfficiency", label: "Cost Efficiency" },
  { key: "accuracy", label: "Accuracy" },
  { key: "creativity", label: "Creativity" },
  { key: "contextWindow", label: "Context Window" },
  { key: "multimodal", label: "Multimodal" },
];

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parts = slug.split("-vs-");
  if (parts.length !== 2) notFound();
  const [idA, idB] = parts;
  const toolA = getToolById(idA);
  const toolB = getToolById(idB);
  if (!toolA || !toolB) notFound();

  const winner = toolA.scores.overall >= toolB.scores.overall ? toolA : toolB;
  const loser = winner.id === toolA.id ? toolB : toolA;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(comparisonJsonLd(toolA.name, toolB.name)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(toolA, toolB)),
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          href="/compare"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All Comparisons
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-white sm:text-4xl">
            {toolA.name}{" "}
            <span className="text-gray-500">vs</span>{" "}
            {toolB.name}
          </h1>
          <p className="mb-4 text-gray-400">
            Head-to-head benchmark comparison · Updated{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <ShareButton path={`/compare/${idA}-vs-${idB}`} label={`${toolA.name} vs ${toolB.name}`} />
        </div>

        {/* Winner banner */}
        <div className="mb-8 rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 text-center">
          <div className="text-2xl mb-1">{winner.logo}</div>
          <div className="text-lg font-bold text-white">
            {winner.name} leads overall
          </div>
          <div className="text-sm text-gray-400">
            {winner.scores.overall} vs {loser.scores.overall} overall score
          </div>
        </div>

        {/* Tool headers */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {[toolA, toolB].map((tool) => (
            <div
              key={tool.id}
              className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5 text-center"
            >
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${tool.logoColor}22` }}
              >
                {tool.logo}
              </div>
              <h2 className="font-bold text-white">{tool.name}</h2>
              <p className="mb-3 text-xs text-gray-500">{tool.company}</p>
              <ScoreBadge score={tool.scores.overall} size="lg" showLabel />
              <div className="mt-3 text-xs text-gray-500">{tool.specs.latestModel}</div>
              <a
                href={getOutboundUrl(tool.id, tool.website)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Try {tool.name} <ExternalLink className="h-3 w-3" />
              </a>
              {getAffiliateBadge(tool.id) && (
                <p className="mt-1 text-xs text-gray-600">Affiliate link</p>
              )}
            </div>
          ))}
        </div>

        {/* Score bars */}
        <section className="mb-8 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
          <h2 className="mb-6 text-lg font-bold text-white">Benchmark Comparison</h2>
          {SCORE_DIMENSIONS.map((d) => (
            <ComparisonBar
              key={d.key}
              label={d.label}
              scores={[
                {
                  name: toolA.name,
                  value: toolA.scores[d.key as keyof typeof toolA.scores],
                  color: toolA.logoColor,
                },
                {
                  name: toolB.name,
                  value: toolB.scores[d.key as keyof typeof toolB.scores],
                  color: toolB.logoColor,
                },
              ]}
            />
          ))}
        </section>

        {/* Pros/cons side by side */}
        <section className="mb-8 grid grid-cols-2 gap-6">
          {[toolA, toolB].map((tool) => (
            <div key={tool.id} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <h3 className="mb-3 font-bold text-white">
                {tool.logo} {tool.name}
              </h3>
              <div className="space-y-1.5">
                {tool.pros.slice(0, 4).map((p) => (
                  <div key={p} className="flex items-start gap-1.5 text-xs text-gray-300">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                    {p}
                  </div>
                ))}
                {tool.cons.slice(0, 3).map((c) => (
                  <div key={c} className="flex items-start gap-1.5 text-xs text-gray-400">
                    <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Quick verdict */}
        <section className="mb-8 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Quick Verdict</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 font-semibold text-white">Choose {toolA.name} if…</div>
              <ul className="space-y-1 text-sm text-gray-400">
                {toolA.bestFor.map((b) => (
                  <li key={b} className="flex items-start gap-1.5">
                    <span className="text-blue-400">→</span> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 font-semibold text-white">Choose {toolB.name} if…</div>
              <ul className="space-y-1 text-sm text-gray-400">
                {toolB.bestFor.map((b) => (
                  <li key={b} className="flex items-start gap-1.5">
                    <span className="text-blue-400">→</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Affiliate CTA */}
        <section className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="mb-1 text-lg font-bold text-white">Ready to get started?</h2>
          <p className="mb-5 text-sm text-gray-400">
            Try either tool free — no credit card required for free tiers.
          </p>
          <div className="flex flex-wrap gap-3">
            {[toolA, toolB].map((tool) => (
              <div key={tool.id} className="flex flex-col gap-1">
                <a
                  href={getOutboundUrl(tool.id, tool.website)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  <span>{tool.logo}</span>
                  Try {tool.name}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {getAffiliateBadge(tool.id) && (
                  <span className="text-xs text-gray-600 pl-1">Affiliate link</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* More comparisons */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-white">More {toolA.name} Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.filter((t) => t.id !== toolA.id && t.id !== toolB.id).map((t) => (
              <Link
                key={t.id}
                href={`/compare/${toolA.id}-vs-${t.id}`}
                className="rounded-lg border border-white/[0.07] bg-[#161c28] px-3 py-1.5 text-xs text-gray-400 hover:border-blue-500/40 hover:text-white"
              >
                {toolA.name} vs {t.name}
              </Link>
            ))}
          </div>
          <h2 className="text-base font-semibold text-white">More {toolB.name} Comparisons</h2>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.filter((t) => t.id !== toolA.id && t.id !== toolB.id).map((t) => (
              <Link
                key={t.id}
                href={`/compare/${toolB.id}-vs-${t.id}`}
                className="rounded-lg border border-white/[0.07] bg-[#161c28] px-3 py-1.5 text-xs text-gray-400 hover:border-blue-500/40 hover:text-white"
              >
                {toolB.name} vs {t.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
