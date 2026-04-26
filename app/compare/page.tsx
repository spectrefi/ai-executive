import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = buildMetadata({
  title: "Compare AI Tools — Side-by-Side Benchmarks",
  description:
    "Compare any two AI tools head-to-head across performance, cost, speed, and use cases. Find the best AI for your specific needs.",
  path: "/compare",
});

const FEATURED_COMPARISONS = [
  { a: "chatgpt", b: "claude" },
  { a: "claude", b: "gemini" },
  { a: "chatgpt", b: "gemini" },
  { a: "grok", b: "chatgpt" },
  { a: "copilot", b: "github-copilot" },
  { a: "perplexity", b: "chatgpt" },
  { a: "claude", b: "grok" },
  { a: "gemini", b: "copilot" },
  { a: "meta-ai", b: "chatgpt" },
  { a: "elevenlabs", b: "chatgpt" },
];

export default function ComparePage() {
  const toolMap = Object.fromEntries(AI_TOOLS.map((t) => [t.id, t]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white">Compare AI Tools</h1>
        <p className="text-gray-400">
          Select any two tools for a detailed head-to-head benchmark across all performance
          dimensions.
        </p>
      </div>

      {/* Quick pick grid */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Comparisons</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {FEATURED_COMPARISONS.map(({ a, b }) => {
            const toolA = toolMap[a];
            const toolB = toolMap[b];
            if (!toolA || !toolB) return null;
            return (
              <Link
                key={`${a}-${b}`}
                href={`/compare/${a}-vs-${b}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-violet-500/40 hover:bg-white/8"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{toolA.logo}</span>
                  <span className="font-medium text-white">{toolA.name}</span>
                  <span className="text-xs text-gray-500">vs</span>
                  <span className="font-medium text-white">{toolB.name}</span>
                  <span className="text-xl">{toolB.logo}</span>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-600" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Full matrix */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">All Tool Comparisons</h2>
        <p className="mb-6 text-sm text-gray-500">
          Click any cell to see the full head-to-head comparison.
        </p>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs text-gray-500" />
                {AI_TOOLS.map((t) => (
                  <th key={t.id} className="px-3 py-3 text-center text-xs text-gray-400">
                    <span title={t.name}>{t.logo}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AI_TOOLS.map((rowTool) => (
                <tr key={rowTool.id} className="border-b border-white/5">
                  <td className="px-4 py-2 text-sm font-medium text-gray-300">
                    {rowTool.logo} {rowTool.name}
                  </td>
                  {AI_TOOLS.map((colTool) => (
                    <td key={colTool.id} className="px-3 py-2 text-center">
                      {rowTool.id === colTool.id ? (
                        <span className="text-gray-700">—</span>
                      ) : (
                        <Link
                          href={`/compare/${rowTool.id}-vs-${colTool.id}`}
                          className="inline-block rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400 hover:bg-violet-500/30 hover:text-violet-300"
                        >
                          vs
                        </Link>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
