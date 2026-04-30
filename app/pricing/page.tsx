import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
export const revalidate = 14400;


export const metadata = buildMetadata({
  title: "AI Tool Pricing Comparison 2026 — All 25 Platforms",
  description:
    "Side-by-side pricing for the top 25 AI tools. Compare free tiers, subscription plans, API costs, and per-seat pricing for ChatGPT, Claude, Gemini, and more.",
  path: "/pricing",
});

const MODEL_LABELS: Record<string, string> = {
  freemium: "Freemium",
  subscription: "Subscription",
  usage: "Usage-based",
};

const MODEL_COLORS: Record<string, string> = {
  freemium: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  subscription: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  usage: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function PricingPage() {
  const byModel = {
    freemium: AI_TOOLS.filter((t) => t.pricing.model === "freemium"),
    subscription: AI_TOOLS.filter((t) => t.pricing.model === "subscription"),
    usage: AI_TOOLS.filter((t) => t.pricing.model === "usage"),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to rankings
      </Link>

      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          AI Tool Pricing Comparison
        </h1>
        <p className="text-gray-400">
          All 25 platforms. Free tiers, subscription costs, API pricing, and per-seat plans —
          updated{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          .
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Have Free Tier",
            value: AI_TOOLS.filter((t) => t.pricing.free).length,
            suffix: `/ ${AI_TOOLS.length}`,
            color: "text-emerald-400",
          },
          {
            label: "Freemium",
            value: byModel.freemium.length,
            suffix: "tools",
            color: "text-emerald-400",
          },
          {
            label: "Subscription",
            value: byModel.subscription.length,
            suffix: "tools",
            color: "text-blue-400",
          },
          {
            label: "Usage-based",
            value: byModel.usage.length,
            suffix: "tools",
            color: "text-amber-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-600">{s.suffix}</div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <section className="mb-12 overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-[#161c28]">
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Tool</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Model</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Free Tier</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Starting Price</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">API</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-400">Compare</th>
            </tr>
          </thead>
          <tbody>
            {AI_TOOLS.map((tool, i) => (
              <tr
                key={tool.id}
                className={`border-b border-white/5 transition-colors hover:bg-white/3 ${
                  i % 2 === 0 ? "" : "bg-white/[0.02]"
                }`}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/tools/${tool.id}`}
                    className="flex items-center gap-2.5 hover:text-white"
                  >
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base"
                      style={{ backgroundColor: `${tool.logoColor}22` }}
                    >
                      {tool.logo}
                    </span>
                    <div>
                      <div className="font-medium text-white">{tool.name}</div>
                      <div className="text-xs text-gray-500">{tool.company}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      MODEL_COLORS[tool.pricing.model] ?? "text-gray-400"
                    }`}
                  >
                    {MODEL_LABELS[tool.pricing.model] ?? tool.pricing.model}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {tool.pricing.free ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-200">
                  {tool.pricing.startingAt}
                </td>
                <td className="px-4 py-3">
                  {tool.specs.apiAvailable ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Grouped sections */}
      {(["freemium", "subscription", "usage"] as const).map((model) => (
        <section key={model} className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${MODEL_COLORS[model]}`}
            >
              {MODEL_LABELS[model]}
            </span>
            tools ({byModel[model].length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byModel[model].map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-3 hover:border-blue-500/30 hover:bg-[#1a2235]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
                    style={{ backgroundColor: `${tool.logoColor}22` }}
                  >
                    {tool.logo}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.pricing.startingAt}</div>
                  </div>
                </div>
                {tool.pricing.free && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    Free tier
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-white">Not sure which to choose?</h2>
        <p className="mb-4 text-sm text-gray-400">
          Compare any two tools side-by-side — benchmarks, pricing, pros & cons.
        </p>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Compare Tools
        </Link>
      </section>
    </div>
  );
}
