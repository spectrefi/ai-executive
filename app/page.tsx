import { buildMetadata, JSON_LD_SITE } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import { DAILY_NEWS } from "@/lib/data/news";
import LeaderboardTable from "@/components/LeaderboardTable";
import NewsCard from "@/components/NewsCard";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import { TrendingUp, RefreshCw, BarChart3, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "AI Tool Rankings & Live Benchmarks 2026",
  description:
    "Live leaderboard of the top 10 AI tools globally. Daily performance benchmarks, side-by-side comparisons, and industry-specific rankings. Updated every 24 hours.",
  path: "/",
});

export default function HomePage() {
  const top3 = AI_TOOLS.slice(0, 3);
  const recentNews = DAILY_NEWS.slice(0, 4);
  const totalUsers = AI_TOOLS.reduce((sum, t) => sum + t.weeklyUsers, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SITE) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-violet-950/30 to-transparent pb-16 pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              Live benchmarks · Updated daily ·{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              The World&apos;s AI Tools,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Ranked Live
              </span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-gray-400">
              Daily performance benchmarks across the top 10 AI platforms. Compare tools by
              industry, use case, or company size — and always know which AI is winning today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
              >
                <BarChart3 className="h-4 w-4" /> Compare Tools
              </Link>
              <Link
                href="/daily-update"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" /> Today&apos;s Updates
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Tools Tracked", value: "10", unit: "platforms" },
              { label: "Weekly Users", value: formatNumber(totalUsers), unit: "combined" },
              { label: "Data Sources", value: "12+", unit: "aggregated" },
              { label: "Updated", value: "Daily", unit: "at midnight UTC" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center"
              >
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs font-semibold text-gray-400">{s.label}</div>
                <div className="text-xs text-gray-600">{s.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Top 3 spotlight */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">🏆 Today&apos;s Top 3</h2>
            <Link
              href="/tools"
              className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {top3.map((tool) => (
              <ToolCard key={tool.id} tool={tool} showRank />
            ))}
          </div>
        </section>

        {/* Full leaderboard + news */}
        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <TrendingUp className="h-5 w-5 text-violet-400" />
                Full Rankings
              </h2>
              <div className="text-xs text-gray-500">Click column headers to sort</div>
            </div>
            <LeaderboardTable />
          </section>

          {/* News feed */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <RefreshCw className="h-4 w-4 text-violet-400" />
                Latest Updates
              </h2>
              <Link
                href="/daily-update"
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {recentNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>

        {/* Industry quick links */}
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-white">Best AI by Industry</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              { label: "Healthcare", icon: "🏥", slug: "healthcare" },
              { label: "Finance", icon: "📈", slug: "finance" },
              { label: "Legal", icon: "⚖️", slug: "legal" },
              { label: "Marketing", icon: "📣", slug: "marketing" },
              { label: "Education", icon: "🎓", slug: "education" },
              { label: "Technology", icon: "💻", slug: "technology" },
              { label: "HR", icon: "👥", slug: "hr" },
              { label: "Retail", icon: "🛍️", slug: "retail" },
              { label: "Media", icon: "🎬", slug: "media" },
              { label: "Startups", icon: "🚀", slug: "startups" },
            ].map((ind) => (
              <Link
                key={ind.slug}
                href={`/best-ai-for/${ind.slug}`}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-violet-500/40 hover:bg-white/8 hover:text-white"
              >
                <span>{ind.icon}</span>
                {ind.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Popular comparisons */}
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-white">Popular Comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              { a: "chatgpt", b: "claude", labelA: "ChatGPT", labelB: "Claude" },
              { a: "claude", b: "gemini", labelA: "Claude", labelB: "Gemini" },
              { a: "chatgpt", b: "gemini", labelA: "ChatGPT", labelB: "Gemini" },
              { a: "grok", b: "chatgpt", labelA: "Grok", labelB: "ChatGPT" },
              {
                a: "copilot",
                b: "github-copilot",
                labelA: "MS Copilot",
                labelB: "GitHub Copilot",
              },
              { a: "perplexity", b: "chatgpt", labelA: "Perplexity", labelB: "ChatGPT" },
            ].map((c) => (
              <Link
                key={`${c.a}-${c.b}`}
                href={`/compare/${c.a}-vs-${c.b}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors hover:border-violet-500/40 hover:bg-white/8"
              >
                <span className="font-medium text-white">
                  {c.labelA} <span className="text-gray-500">vs</span> {c.labelB}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-600" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
