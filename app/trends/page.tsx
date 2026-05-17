import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS, getToolById } from "@/lib/data/tools";
import { SCORE_HISTORY } from "@/lib/data/history";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import TrendChart from "@/components/TrendChart";
export const revalidate = 14400;


export const metadata = buildMetadata({
  title: "AI Tool Ranking Trends — Who's Rising & Falling",
  description:
    "6-week rank and score movement across the top 50 AI tools. See which AI platforms are gaining ground and which are slipping.",
  path: "/trends",
});

function computeMoverStats() {
  const first = SCORE_HISTORY[0];
  const last = SCORE_HISTORY[SCORE_HISTORY.length - 1];

  return AI_TOOLS.map((tool) => {
    const s0 = first.scores[tool.id];
    const s1 = last.scores[tool.id];
    const scoreDelta = s1 && s0 ? s1.overall - s0.overall : 0;
    const rankDelta = s1 && s0 ? s0.rank - s1.rank : 0; // positive = improved rank
    return { tool, scoreDelta, rankDelta, currentScore: s1?.overall ?? tool.scores.overall, currentRank: s1?.rank ?? tool.currentRank };
  }).sort((a, b) => b.scoreDelta - a.scoreDelta);
}

export default function TrendsPage() {
  const stats = computeMoverStats();
  const risers = stats.filter((s) => s.scoreDelta > 0);
  const fallers = stats.filter((s) => s.scoreDelta < 0);
  const stable = stats.filter((s) => s.scoreDelta === 0);

  const firstDate = SCORE_HISTORY[0].date;
  const lastDate = SCORE_HISTORY[SCORE_HISTORY.length - 1].date;

  const chartData = SCORE_HISTORY.map((snap) => {
    const point: Record<string, string | number> = { date: snap.date };
    AI_TOOLS.slice(0, 8).forEach((tool) => {
      if (snap.scores[tool.id]) point[tool.name] = snap.scores[tool.id].overall;
    });
    return point;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Rankings
      </Link>

      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          Ranking Trends
        </h1>
        <p className="text-gray-400">
          Score and rank movement from{" "}
          {new Date(firstDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })} →{" "}
          {new Date(lastDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
          Refreshed every 4 hours.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
          <div className="text-3xl font-bold text-emerald-400">{risers.length}</div>
          <div className="text-sm text-gray-400">Rising tools</div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5 text-center">
          <div className="text-3xl font-bold text-gray-400">{stable.length}</div>
          <div className="text-sm text-gray-400">Stable</div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center">
          <div className="text-3xl font-bold text-red-400">{fallers.length}</div>
          <div className="text-sm text-gray-400">Falling tools</div>
        </div>
      </div>

      {/* Multi-tool chart */}
      <section className="mb-12 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="mb-1 text-lg font-bold text-white">Top 8 Tools — Score Over Time</h2>
        <p className="mb-6 text-xs text-gray-500">Overall score (0–100) across the last 6 weeks</p>
        <TrendChart data={chartData} tools={AI_TOOLS.slice(0, 8)} />
      </section>

      {/* Movers table */}
      <section className="mb-12 overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-[#161c28]">
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Tool</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Current Score</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">6-Week Change</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Rank Change</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-400">Profile</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(({ tool, scoreDelta, rankDelta, currentScore, currentRank }) => (
              <tr key={tool.id} className="border-b border-white/5 hover:bg-white/3">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
                      style={{ backgroundColor: `${tool.logoColor}22` }}
                    >
                      {tool.logo}
                    </span>
                    <div>
                      <div className="font-medium text-white">{tool.name}</div>
                      <div className="text-xs text-gray-500">#{currentRank} overall</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-white">{currentScore}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {scoreDelta > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                      <TrendingUp className="h-3.5 w-3.5" /> +{scoreDelta}
                    </span>
                  ) : scoreDelta < 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                      <TrendingDown className="h-3.5 w-3.5" /> {scoreDelta}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <Minus className="h-3.5 w-3.5" /> 0
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {rankDelta > 0 ? (
                    <span className="text-emerald-400">↑{rankDelta}</span>
                  ) : rankDelta < 0 ? (
                    <span className="text-red-400">↓{Math.abs(rankDelta)}</span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/tools/${tool.id}`}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Biggest movers callout */}
      <div className="grid gap-6 sm:grid-cols-2">
        {risers.length > 0 && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-emerald-400">
              <TrendingUp className="h-4 w-4" /> Biggest Risers
            </h2>
            <div className="space-y-2">
              {risers.slice(0, 5).map(({ tool, scoreDelta }) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/3 px-3 py-2 hover:bg-[#1a2235]"
                >
                  <span className="text-sm text-white">
                    {tool.logo} {tool.name}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">+{scoreDelta} pts</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {fallers.length > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-red-400">
              <TrendingDown className="h-4 w-4" /> Biggest Fallers
            </h2>
            <div className="space-y-2">
              {[...fallers].reverse().slice(0, 5).map(({ tool, scoreDelta }) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/3 px-3 py-2 hover:bg-[#1a2235]"
                >
                  <span className="text-sm text-white">
                    {tool.logo} {tool.name}
                  </span>
                  <span className="text-sm font-bold text-red-400">{scoreDelta} pts</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
