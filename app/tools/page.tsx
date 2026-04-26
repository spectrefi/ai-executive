import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS, CATEGORIES, INDUSTRIES } from "@/lib/data/tools";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "All AI Tools — Ranked & Reviewed",
  description:
    "Browse all 10 top AI tools ranked by performance. Filter by category, industry, or use case to find the best AI for your needs.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white">All AI Tools</h1>
        <p className="text-gray-400">
          The top 10 AI platforms ranked by real-world performance across speed, accuracy, cost, and
          versatility.
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Browse by Category
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/tools?category=${c.value}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 hover:border-violet-500/40 hover:bg-white/10 hover:text-white"
            >
              {c.icon} {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tool grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AI_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} showRank />
        ))}
      </div>

      {/* Industry section */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-bold text-white">Browse by Industry</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.value}
              href={`/best-ai-for/${ind.value}`}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-violet-500/40 hover:text-white"
            >
              {ind.icon} {ind.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
