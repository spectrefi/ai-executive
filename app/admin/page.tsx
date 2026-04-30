import { getArchive, getArchiveStats } from "@/lib/news-archive";
import { getSourceScores } from "@/lib/vote-store";
import { AI_TOOLS } from "@/lib/data/tools";
import { RSS_FEEDS_META } from "@/lib/rss-meta";
import Link from "next/link";
import { Database, Rss, ThumbsUp, ThumbsDown, Archive, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic"; // always fresh in admin

function ScoreBar({ up, down }: { up: number; down: number }) {
  const total = up + down;
  if (total === 0) return <span className="text-xs text-gray-600">No votes</span>;
  const pct = Math.round((up / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#1e2640]">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{pct}%</span>
    </div>
  );
}

function Weight({ w }: { w: number }) {
  if (w >= 1.5) return <span className="flex items-center gap-1 text-xs text-emerald-400"><TrendingUp className="h-3 w-3" /> Boosted ({w.toFixed(1)}×)</span>;
  if (w <= 0.4) return <span className="flex items-center gap-1 text-xs text-red-400"><TrendingDown className="h-3 w-3" /> Suppressed ({w.toFixed(1)}×)</span>;
  return <span className="flex items-center gap-1 text-xs text-gray-500"><Minus className="h-3 w-3" /> Neutral</span>;
}

export default async function AdminPage() {
  const [archiveStats, archive, sourceScores] = await Promise.all([
    getArchiveStats(),
    getArchive(),
    getSourceScores(),
  ]);
  const recentArchive = archive.slice(0, 50);

  // Build source table: all known feeds + any that have votes
  const allSources = Array.from(
    new Set([...RSS_FEEDS_META.map((f) => f.source), ...Object.keys(sourceScores)])
  ).sort();

  const toolCount = AI_TOOLS.length;
  const toolsWithRising = AI_TOOLS.filter((t) => t.trending === "up").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Internal view — not linked from the public site</p>
        </div>
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">← Back to site</Link>
      </div>

      {/* Top stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Tools tracked", value: String(toolCount), icon: TrendingUp, color: "text-blue-400" },
          { label: "Rising tools", value: String(toolsWithRising), icon: TrendingUp, color: "text-emerald-400" },
          { label: "Archived articles", value: String(archiveStats.total || 0), icon: Archive, color: "text-amber-400" },
          { label: "Active feeds", value: String(RSS_FEEDS_META.length), icon: Rss, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4">
            <s.icon className={`mb-2 h-4 w-4 ${s.color}`} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Archive summary */}
      {archiveStats.total > 0 && (
        <div className="mb-8 rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
            <Database className="h-4 w-4 text-amber-400" /> News Archive
          </h2>
          <p className="text-xs text-gray-500">
            {archiveStats.total} articles saved · oldest: {archiveStats.oldest || "—"} · newest: {archiveStats.newest || "—"}
          </p>
        </div>
      )}

      {/* Source quality table */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Rss className="h-4 w-4 text-blue-400" /> Feed Sources & Vote Quality
        </h2>
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#0e1117]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Filter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-emerald-400" /> Up</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3 text-red-400" /> Down</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Feed weight</th>
              </tr>
            </thead>
            <tbody>
              {allSources.map((source, i) => {
                const meta = RSS_FEEDS_META.find((f) => f.source === source);
                const scores = sourceScores[source];
                const up = scores?.up ?? 0;
                const down = scores?.down ?? 0;
                const total = up + down;
                const weight = total === 0 ? 1.0 : 0.2 + 1.8 * (up / total);
                return (
                  <tr
                    key={source}
                    className={`border-b border-white/[0.04] ${i % 2 === 0 ? "bg-[#161c28]" : "bg-[#131821]"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{source}</span>
                        {meta && (
                          <a href={meta.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {meta ? (meta.filterByAI ? "AI keywords" : "All posts") : "—"}
                    </td>
                    <td className="px-4 py-3 text-emerald-400">{up > 0 ? up : <span className="text-gray-700">0</span>}</td>
                    <td className="px-4 py-3 text-red-400">{down > 0 ? down : <span className="text-gray-700">0</span>}</td>
                    <td className="px-4 py-3"><ScoreBar up={up} down={down} /></td>
                    <td className="px-4 py-3"><Weight w={weight} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent archive */}
      {recentArchive.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Archive className="h-4 w-4 text-amber-400" /> Recent Archive ({archive.length} total)
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/[0.07]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#0e1117]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Archived</th>
                </tr>
              </thead>
              <tbody>
                {recentArchive.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b border-white/[0.04] ${i % 2 === 0 ? "bg-[#161c28]" : "bg-[#131821]"}`}
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 tabular-nums">{item.date}</td>
                    <td className="px-4 py-3 max-w-md">
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-blue-300 line-clamp-1"
                        >
                          {item.title}
                        </a>
                      ) : (
                        <span className="text-white line-clamp-1">{item.title}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{item.source}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#1e2640] px-2 py-0.5 text-xs text-gray-400">{item.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 tabular-nums">
                      {new Date(item.fetchedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {recentArchive.length === 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-8 text-center text-gray-500">
          Archive is empty — articles will appear here after the first RSS fetch cycle.
        </div>
      )}
    </div>
  );
}
