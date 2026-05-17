import { notFound } from "next/navigation";
import { AI_TOOLS, getToolById } from "@/lib/data/tools";
import { getEnrichedToolById } from "@/lib/rank-history";
import { buildMetadata, toolJsonLd } from "@/lib/seo";
import { getToolScoreHistory } from "@/lib/score-history-store";
import ScoreBadge from "@/components/ScoreBadge";
import TrendBadge from "@/components/TrendBadge";
import ComparisonBar from "@/components/ComparisonBar";
import ScoreHistoryChart from "@/components/ScoreHistoryChart";
import Link from "next/link";
import { ExternalLink, ArrowLeft, CheckCircle2, XCircle, Users, ShieldCheck } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { getOutboundUrl, getAffiliateBadge } from "@/lib/affiliates";
import ToolAlertSubscribe from "@/components/ToolAlertSubscribe";
export const revalidate = 14400;


export async function generateStaticParams() {
  return AI_TOOLS.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolById(slug);
  if (!tool) return {};
  return buildMetadata({
    title: `${tool.name} Review & Benchmarks 2026`,
    description: `${tool.name} by ${tool.company} — performance scores, pricing, pros & cons, and how it compares to the competition. Refreshed every 4 hours.`,
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
  const tool = await getEnrichedToolById(slug);
  if (!tool) notFound();
  const history = await getToolScoreHistory(slug);

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
                <span className="rounded-full bg-[#1e2640] px-2 py-0.5 text-xs text-gray-400">
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
            <div className="flex flex-col items-end gap-1.5">
              <a
                href={getOutboundUrl(tool.id, tool.website)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Try {tool.name} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {getAffiliateBadge(tool.id) && (
                <span className="text-xs text-gray-600">
                  Affiliate link — we may earn a commission
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: scores + description */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            <section className="rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
              <h2 className="mb-3 text-lg font-bold text-white">About {tool.name}</h2>
              <p className="leading-relaxed text-gray-400">{tool.description}</p>
            </section>

            {/* Benchmark scores */}
            <section className="rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
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

            {/* Bottom CTA — high intent after reading pros/cons */}
            <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Ready to try {tool.name}?
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {tool.pricing.free
                      ? `Free tier available — no credit card required. Paid plans from ${tool.pricing.startingAt}.`
                      : `Plans start from ${tool.pricing.startingAt}.`}
                  </p>
                </div>
                <a
                  href={getOutboundUrl(tool.id, tool.website)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500"
                >
                  Get Started Free <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              {getAffiliateBadge(tool.id) && (
                <p className="mt-3 text-xs text-gray-600">
                  Affiliate link — we earn a commission if you sign up, at no extra cost to you.
                </p>
              )}
            </section>

            {/* Comparisons — all tools for dense internal linking */}
            <section className="rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
              <h2 className="mb-4 text-lg font-bold text-white">
                Compare {tool.name} with Other AI Tools
              </h2>
              <div className="flex flex-wrap gap-2">
                {AI_TOOLS.filter((t) => t.id !== tool.id).map((c) => (
                  <Link
                    key={c.id}
                    href={`/compare/${tool.id}-vs-${c.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#161c28] px-3 py-2 text-sm text-gray-300 hover:border-blue-500/40 hover:text-white"
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
            <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
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
            <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <h3 className="mb-4 font-semibold text-white">Usage</h3>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-lg font-bold text-white">
                    {formatNumber(tool.weeklyUsers)}
                  </div>
                  <div className="text-xs text-gray-500">Weekly active users</div>
                </div>
              </div>
            </div>

            {/* Score history */}
            {history.length >= 2 && (
              <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
                <h3 className="mb-3 font-semibold text-white">Score Trend</h3>
                <ScoreHistoryChart
                  data={history}
                  color={tool.logoColor}
                  toolName={tool.name}
                />
              </div>
            )}

            {/* Best for */}
            <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <h3 className="mb-3 font-semibold text-white">Best For</h3>
              <div className="flex flex-wrap gap-2">
                {tool.bestFor.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-300"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <h3 className="mb-3 font-semibold text-white">Industries</h3>
              <div className="flex flex-wrap gap-2">
                {tool.industries.map((ind) => (
                  <Link
                    key={ind}
                    href={`/best-ai-for/${ind}`}
                    className="rounded-full bg-[#1e2640] px-2.5 py-1 text-xs text-gray-300 hover:text-white"
                  >
                    {ind}
                  </Link>
                ))}
              </div>
            </div>

            {/* Enterprise Readiness */}
            {tool.enterprise && (
              <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  Enterprise Readiness
                </h3>
                <dl className="space-y-2.5 text-sm">
                  {([
                    { label: "SOC 2", value: tool.enterprise.soc2 },
                    { label: "GDPR", value: tool.enterprise.gdpr },
                    { label: "HIPAA", value: tool.enterprise.hipaa },
                    { label: "Data Residency", value: tool.enterprise.dataResidency },
                    { label: "SLA", value: tool.enterprise.sla },
                    { label: "Support", value: tool.enterprise.support },
                  ] as { label: string; value: boolean | string | null | undefined }[]).map(({ label, value }) => {
                    if (value === null || value === undefined) return null;
                    let display: React.ReactNode;
                    if (value === true) {
                      display = <span className="font-medium text-emerald-400">✓ Yes</span>;
                    } else if (value === false) {
                      display = <span className="font-medium text-red-400">✗ No</span>;
                    } else {
                      display = <span className="font-medium text-amber-300">{value}</span>;
                    }
                    return (
                      <div key={label} className="flex justify-between gap-3">
                        <dt className="text-gray-500">{label}</dt>
                        <dd>{display}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}
            {/* Rank alert */}
            <ToolAlertSubscribe toolId={tool.id} toolName={tool.name} />
          </div>
        </div>
      </div>
    </>
  );
}
