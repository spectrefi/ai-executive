import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS, CATEGORIES, INDUSTRIES } from "@/lib/data/tools";
import ToolsGrid from "@/components/ToolsGrid";
import Link from "next/link";
export const revalidate = 14400;


export const metadata = buildMetadata({
  title: "All 25 AI Tools — Ranked & Reviewed 2026",
  description:
    "Browse all 25 top AI tools ranked by performance. Filter by category, industry, or use case to find the best AI for your needs.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white">All AI Tools</h1>
        <p className="text-gray-400">
          All {AI_TOOLS.length} AI platforms ranked by real-world performance across speed, accuracy, cost, and
          versatility.
        </p>
      </div>

      <ToolsGrid tools={AI_TOOLS} categories={CATEGORIES} />

      {/* Industry section */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-bold text-white">Browse by Industry</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.value}
              href={`/best-ai-for/${ind.value}`}
              className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-blue-500/40 hover:text-white"
            >
              {ind.icon} {ind.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
