import { notFound } from "next/navigation";
import { AI_TOOLS, getToolById } from "@/lib/data/tools";
import { buildMetadata, toolJsonLd } from "@/lib/seo";
import ScoreBadge from "@/components/ScoreBadge";
import TrendBadge from "@/components/TrendBadge";
import ComparisonBar from "@/components/ComparisonBar";
import Link from "next/link";
import { ExternalLink, ArrowLeft, CheckCircle2, XCircle, Users } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export async function generateStaticParams() {
  return AI_TOOLS.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolById(slug);
  if (!tool) return {};
  return buildMetadata({
    title: `${tool.name} Review & Benchmarks 2026`,
    description: `${tool.name} by ${tool.company} — performance scores, pricing, pros & cons, and how it compares to the competition. Updated daily.`,
    path: `/tools/${tool.id}`,
  });
}

const SCORE_LABELS: { key: string; label: string }[] = [
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

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolById(slug);
  if (!tool) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd(tool)) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Back */}
        <Link
          href="/tools"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All Tools
        </Link>

        {/* Hero */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: `${tool.logoColor}22` }}
            >
              {tool.logo}
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white">{tool.name}</h1>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                  #{tool.currentRank} Global
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                by {tool.company} · {tool.specs.latestModel}
              </div>
              <p className="mt-2 text-gray-300">{tool.tagline}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex items-center gap-2">
              <ScoreBadge score={tool.scores.overall} size="lg" showLabel />
            </div>
            <TrendBadge direction={tool.trending} percent={tool.trendPercent} />
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Visit {tool.name} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: scores + description */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-bold text-white">About {tool.name}</h2>
              <p className="leading-relaxed text-gray-400">{tool.description}</p>
            </section>

            {/* Benchmark scores */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-6 text-lg font-bold text-white">Performance Benchmarks</h2>
              <div className="space-y-1">
                {SCORE_LABELS.map((s) => {
                  const val = tool.scores[s.key as keyof typeof tool.scores];
                  return (
                    <ComparisonBar
                      key={s.key}
                      label={s.label}
                      scores={[{ name: tool.name, value: val, color: tool.logoColor }]}
                    />
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-gray-600">
                Sources: {tool.sources.join(" · ")}
              </p>
            </section>

            {/* Pros & Cons */}
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <h3 className="mb-3 font-semibold text-emerald-400">Strengths</h3>
                <ul className="space-y-2">
                  {tool.pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                <h3 className="mb-3 font-semibold text-red-400">Limitations</h3>
                <ul className="space-y-2">
                  {tool.cons.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-gray-300">
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Comparisons — all tools for dense internal linking */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                Compare {tool.name} with Other AI Tools
              </h2>
              <div className="flex flex-wrap gap-2">
                {AI_TOOLS.filter((t) => t.id !== tool.id).map((c) => (
                  <Link
                    key={c.id}
                    href={`/compare/${tool.id}-vs-${c.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:border-violet-500/40 hover:text-white"
                  >
                    {c.logo} {tool.name} vs {c.name}
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            {/* Quick facts */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-4 font-semibold text-white">Quick Facts</h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: "Company", value: tool.company },
                  { label: "Latest Model", value: tool.specs.latestModel },
                  { label: "Context Window", value: tool.specs.contextWindow },
                  { label: "Free Tier", value: tool.pricing.free ? "Yes" : "No" },
                  { label: "Starting Price", value: tool.pricing.startingAt },
                  { label: "API Available", value: tool.specs.apiAvailable ? "Yes" : "No" },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between gap-3">
                    <dt className="text-gray-500">{f.label}</dt>
                    <dd className="font-medium text-gray-200">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Usage stats */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-4 font-semibold text-white">Usage</h3>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-violet-400" />
                <div>
                  <div className="text-lg font-bold text-white">
                    {formatNumber(tool.weeklyUsers)}
                  </div>
                  <div className="text-xs text-gray-500">Weekly active users</div>
                </div>
              </div>
            </div>

            {/* Best for */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-3 font-semibold text-white">Best For</h3>
              <div className="flex flex-wrap gap-2">
                {tool.bestFor.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-3 font-semibold text-white">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {tool.industries.map((ind) => (
                  <Link
                    key={ind}
                    href={`/best-ai-for/${ind}`}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-gray-300 hover:text-white"
                  >
                    {ind}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
