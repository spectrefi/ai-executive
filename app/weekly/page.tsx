import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import { getEnrichedToolsSorted } from "@/lib/rank-history";
import { CHANGELOG } from "@/lib/data/changelog";
import { FUNDING_ROUNDS } from "@/lib/data/funding";
import { getTopHacks } from "@/lib/data/hacks";
import { HOT_TAKES } from "@/lib/data/hot-takes";
import { MOVER_SIGNALS } from "@/lib/data/market-movers";
import Link from "next/link";
import { Share2, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "AI Weekly Digest — Top Stories, Movers & Hacks This Week",
  description: "Everything that mattered in AI this week: model releases, ranking changes, funding rounds, and the top prompt hacks. Shareable and scannable.",
  path: "/weekly",
});

function WeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return <>{fmt(monday)} – {fmt(sunday)}, {now.getFullYear()}</>;
}

export default async function WeeklyPage() {
  const allTools = await getEnrichedToolsSorted();
  const topTools = allTools.slice(0, 5);
  const risingTools = allTools.filter((t) => t.trending === "up").sort((a, b) => b.trendPercent - a.trendPercent).slice(0, 3);
  const fallingTools = allTools.filter((t) => t.trending === "down").slice(0, 3);
  const recentChangelog = CHANGELOG.slice(0, 5);
  const recentFunding = FUNDING_ROUNDS.slice(0, 3);
  const topHacks = getTopHacks(3);
  const featuredTake = HOT_TAKES.find((t) => t.featured) ?? HOT_TAKES[0];
  const highSignals = MOVER_SIGNALS.filter((s) => s.impact === "high").slice(0, 3);

  const weekNumber = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
          📅 Week {weekNumber} · <WeekRange />
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          AI Weekly Digest
        </h1>
        <p className="text-gray-400">Everything that mattered in AI this week — rankings, releases, money, and the best hacks.</p>
      </div>

      {/* Share bar */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span className="text-sm text-gray-500">Share this digest:</span>
        <a
          href={`https://twitter.com/intent/tweet?text=This week in AI 🧵%0A%0ATop model: ${topTools[0]?.name} (${topTools[0]?.scores.overall} score)%0ARising: ${risingTools[0]?.name} (+${risingTools[0]?.trendPercent}%25)%0A%0AFull digest: https://aiexecutive.io/weekly`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#161c28] px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" /> Share on X
        </a>
        <Link
          href="/newsletter"
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Get this weekly
        </Link>
      </div>

      {/* Section: Leaderboard snapshot */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">🏆 This Week's Top 5</h2>
          <Link href="/" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">Full leaderboard <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          {topTools.map((tool, i) => (
            <Link key={tool.id} href={`/tools/${tool.id}`}
              className="flex items-center gap-4 border-b border-white/[0.04] bg-[#161c28] px-4 py-3 last:border-0 hover:bg-[#1e2640] transition-colors">
              <span className="w-6 text-center font-mono text-sm font-bold text-gray-600">#{i + 1}</span>
              <span className="text-xl">{tool.logo}</span>
              <div className="flex-1">
                <div className="font-semibold text-white">{tool.name}</div>
                <div className="text-xs text-gray-500">{tool.company} · {tool.pricing.startingAt}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-blue-400">{tool.scores.overall}</div>
                {tool.trending !== "stable" && (
                  <div className={`text-xs font-semibold ${tool.trending === "up" ? "text-emerald-400" : "text-red-400"}`}>
                    {tool.trending === "up" ? "↑" : "↓"} {tool.trendPercent}%
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section: Movers */}
      <section className="mb-10">
        <h2 className="mb-4 font-bold text-white">📊 Biggest Movers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">Rising</p>
            <div className="space-y-2">
              {risingTools.map((t) => (
                <Link key={t.id} href={`/tools/${t.id}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="flex-1 text-gray-300">{t.name}</span>
                  <span className="font-semibold text-emerald-400">+{t.trendPercent}%</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-400">Losing Ground</p>
            <div className="space-y-2">
              {fallingTools.map((t) => (
                <Link key={t.id} href={`/tools/${t.id}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                  <span className="flex-1 text-gray-300">{t.name}</span>
                  <span className="font-semibold text-red-400">-{t.trendPercent}%</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section: Releases & Changes */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">🆕 Model Releases & Updates</h2>
          <Link href="/changelog" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">Full changelog <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="space-y-3">
          {recentChangelog.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#161c28] p-4">
              <span className="mt-0.5 text-xl">{entry.logo}</span>
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">{entry.title}</span>
                  {entry.impact === "major" && (
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-xs font-bold text-red-400">Major</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{entry.summary}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-600">
                {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Funding */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">💰 Funding This Month</h2>
          <Link href="/funding" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">All rounds <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="space-y-3">
          {recentFunding.map((round) => (
            <div key={round.id} className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-3">
              <span className="text-xl">{round.logo}</span>
              <div className="flex-1">
                <span className="text-sm font-semibold text-white">{round.company}</span>
                <span className="ml-2 text-xs text-gray-500">{round.stage} round</span>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">{round.amountLabel}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Market signals */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">📡 Key Market Signals</h2>
          <Link href="/movers" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">All signals <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="space-y-3">
          {highSignals.map((signal) => (
            <div key={signal.id} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4">
              <p className="mb-1 text-sm font-semibold text-white">{signal.title}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{signal.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Top hacks */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">⚡ Top Hacks This Week</h2>
          <Link href="/hacks" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">All hacks <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="space-y-3">
          {topHacks.map((hack) => (
            <Link key={hack.id} href="/hacks"
              className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#161c28] p-4 hover:border-amber-500/20 transition-colors">
              <span className="text-xl">{hack.modelLogo}</span>
              <div>
                <p className="mb-1 text-sm font-semibold text-white">{hack.title}</p>
                <p className="text-xs text-gray-500">{hack.tldr}</p>
              </div>
              <span className="ml-auto shrink-0 text-xs text-amber-400">↑ {hack.upvotes.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Section: Hot take of the week */}
      <section className="mb-10 rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-red-950/10 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-white">🔥 Hot Take of the Week</h2>
          <Link href="/hot-takes" className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300">All takes <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <blockquote className="mb-3 text-base font-medium italic text-white">"{featuredTake.take}"</blockquote>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-300">{featuredTake.author}</p>
            <p className="text-xs text-gray-500">{featuredTake.authorRole}</p>
          </div>
          <Link href="/hot-takes" className="rounded-lg bg-orange-600/20 border border-orange-500/30 px-3 py-1.5 text-sm text-orange-400 hover:bg-orange-600/30 transition-colors">
            Vote →
          </Link>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 p-6 text-center">
        <p className="mb-2 text-lg font-bold text-white">Get this every week in your inbox</p>
        <p className="mb-4 text-sm text-gray-400">One email. Rankings, releases, hacks, and signals — everything above, delivered Sunday morning.</p>
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
          Subscribe free
        </Link>
      </section>
    </div>
  );
}
