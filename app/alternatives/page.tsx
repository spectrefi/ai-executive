import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Best AI Tool Alternatives 2026 — Find the Right Replacement",
  description:
    "Looking for an alternative to ChatGPT, Claude, Midjourney or any AI tool? Compare ranked alternatives with benchmark scores, pricing, and real-world fit.",
  path: "/alternatives",
});

export default function AlternativesIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          AI Tool Alternatives
        </h1>
        <p className="text-gray-400">
          Every major AI tool, with ranked alternatives. Find what works best for your use case and budget.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AI_TOOLS.map((tool) => (
          <Link
            key={tool.id}
            href={`/alternatives/${tool.id}`}
            className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-4 transition-colors hover:border-blue-500/30 hover:bg-[#1a2235]"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: `${tool.logoColor}22` }}
              >
                {tool.logo}
              </span>
              <div>
                <div className="font-semibold text-white">{tool.name} alternatives</div>
                <div className="text-xs text-gray-500">{tool.company}</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
