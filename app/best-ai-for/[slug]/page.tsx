import { AI_TOOLS, INDUSTRIES, USE_CASES, type Industry, type BenchmarkScores } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import ToolCard from "@/components/ToolCard";
import ScoreBadge from "@/components/ScoreBadge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export const revalidate = 14400;


const ALL_SLUGS = [
  ...INDUSTRIES.map((i) => i.value),
  ...USE_CASES.map((u) => u.slug),
  "startups",
];

export async function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = getLabel(slug);
  return buildMetadata({
    title: `Best AI Tools for ${label} 2026`,
    description: `Top-ranked AI tools for ${label}. Benchmarked by performance, cost, and real-world effectiveness. Updated daily.`,
    path: `/best-ai-for/${slug}`,
  });
}

function getLabel(slug: string): string {
  const ind = INDUSTRIES.find((i) => i.value === slug);
  if (ind) return ind.label;
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (uc) return uc.label;
  return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
}

function getIcon(slug: string): string {
  const ind = INDUSTRIES.find((i) => i.value === slug);
  if (ind) return ind.icon;
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (uc) return uc.icon;
  return "🚀";
}

function getRankedTools(slug: string) {
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (uc) {
    return [...AI_TOOLS]
      .filter((t) => t.scores[uc.scoreKey] > 0)
      .sort((a, b) => b.scores[uc.scoreKey] - a.scores[uc.scoreKey]);
  }

  const ind = slug as Industry;
  const filtered = AI_TOOLS.filter(
    (t) => t.industries.includes(ind) || t.industries.includes("general")
  );

  if (slug === "startups") {
    return [...AI_TOOLS]
      .filter((t) => t.companySizes.includes("startup") || t.companySizes.includes("all"))
      .sort((a, b) => b.scores.costEfficiency - a.scores.costEfficiency);
  }

  return filtered.sort((a, b) => b.scores.overall - a.scores.overall);
}

function getScoreKey(slug: string): keyof BenchmarkScores {
  const uc = USE_CASES.find((u) => u.slug === slug);
  if (uc) return uc.scoreKey;
  if (slug === "startups") return "costEfficiency";
  return "overall";
}

export default async function BestAiForSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = getLabel(slug);
  const icon = getIcon(slug);
  const tools = getRankedTools(slug);
  const scoreKey = getScoreKey(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link
        href="/best-ai-for"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> All Use Cases
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <h1 className="text-3xl font-extrabold text-white">Best AI for {label}</h1>
        </div>
        <p className="text-gray-400">
          Top AI tools ranked by real-world performance in {label} contexts. Updated daily from
          aggregated benchmarks.
        </p>
      </div>

      {/* Ranked list */}
      <div className="mb-12 space-y-3">
        {tools.map((tool, i) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#161c28] p-4 transition-all hover:border-blue-500/40 hover:bg-[#1a2235]"
          >
            <span className="w-6 text-center text-sm font-bold text-blue-400">
              #{i + 1}
            </span>
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${tool.logoColor}22` }}
            >
              {tool.logo}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{tool.name}</span>
                <span className="text-xs text-gray-500">{tool.company}</span>
              </div>
              <p className="truncate text-xs text-gray-500">{tool.tagline}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <ScoreBadge score={tool.scores[scoreKey]} size="sm" />
                <div className="text-xs text-gray-600 mt-0.5">
                  {scoreKey === "overall" ? "overall" : scoreKey}
                </div>
              </div>
              {tool.pricing.free && (
                <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 sm:inline">
                  Free
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Card grid */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-white">Tool Profiles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.slice(0, 6).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12">
        <h2 className="mb-4 text-base font-semibold text-gray-400">Related Categories</h2>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.filter((i) => i.value !== slug)
            .slice(0, 6)
            .map((ind) => (
              <Link
                key={ind.value}
                href={`/best-ai-for/${ind.value}`}
                className="rounded-full border border-white/[0.07] bg-[#161c28] px-3 py-1.5 text-xs text-gray-400 hover:border-blue-500/40 hover:text-white"
              >
                {ind.icon} {ind.label}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
