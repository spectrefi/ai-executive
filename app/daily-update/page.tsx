import { buildMetadata } from "@/lib/seo";
import { DAILY_NEWS } from "@/lib/data/news";
import { AI_TOOLS } from "@/lib/data/tools";
import NewsCard from "@/components/NewsCard";
import TrendBadge from "@/components/TrendBadge";
import Link from "next/link";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

export const metadata = buildMetadata({
  title: "Daily AI Updates — Latest Benchmarks & News",
  description:
    "Today's AI tool updates: new model releases, pricing changes, benchmark results, and performance shifts. The daily intelligence feed for AI professionals.",
  path: "/daily-update",
});

export default function DailyUpdatePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const movers = AI_TOOLS.filter((t) => t.trending !== "stable").sort(
    (a, b) => b.trendPercent - a.trendPercent
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Live Feed
        </div>
        <h1 className="mb-2 text-3xl font-extrabold text-white">Daily AI Updates</h1>
        <p className="text-gray-400">{today}</p>
      </div>

      {/* Movers */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <TrendingUp className="h-5 w-5 text-violet-400" />
          Today&apos;s Movers
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {movers.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 hover:border-violet-500/30"
            >
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ backgroundColor: `${tool.logoColor}22` }}
              >
                {tool.logo}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-white">{tool.name}</div>
                <div className="text-xs text-gray-500">#{tool.currentRank} overall</div>
              </div>
              <TrendBadge direction={tool.trending} percent={tool.trendPercent} />
            </Link>
          ))}
        </div>
      </section>

      {/* All news */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-white">All Updates</h2>
        <div className="space-y-3">
          {DAILY_NEWS.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Subscribe */}
      <section className="mt-16 rounded-xl border border-violet-500/20 bg-violet-500/5 p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-white">
          Get the Daily AI Intelligence Briefing
        </h2>
        <p className="mb-6 text-gray-400">
          Every morning: benchmark shifts, new releases, pricing changes, and the one AI tool worth
          watching today.
        </p>
        <form className="mx-auto flex max-w-md gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
