import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getBreakingLog } from "@/lib/breaking-store";

export const revalidate = 300; // refresh every 5 min

export const metadata = buildMetadata({
  title: `Breaking AI News | ${SITE_NAME}`,
  description:
    "Real-time breaking AI news alerts — new model launches, benchmark results, and rank jumps, posted automatically as they happen.",
  path: "/breaking",
});

const TYPE_LABEL: Record<string, string> = {
  launch: "🚀 Launch",
  benchmark: "📊 Benchmark",
  rank_jump: "📈 Rank Jump",
};

const TYPE_COLOR: Record<string, string> = {
  launch: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  benchmark: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  rank_jump: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function BreakingPage() {
  const log = await getBreakingLog(20);
  const siteUrl = SITE_URL;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
        <h1 className="text-3xl font-extrabold text-white">Breaking AI News</h1>
      </div>
      <p className="mb-10 text-gray-400">
        Auto-posted alerts for high-impact AI launches, benchmark results, and significant ranking changes.
        Runs every 6 hours.
      </p>

      {/* Alert log */}
      {log.length === 0 ? (
        <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-8 text-center text-gray-500 text-sm">
          No breaking alerts yet. The system checks for news every 6 hours.
        </div>
      ) : (
        <div className="space-y-4">
          {log.map((alert, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${TYPE_COLOR[alert.type] ?? "text-gray-400 bg-white/5 border-white/10"}`}
                >
                  {TYPE_LABEL[alert.type] ?? alert.type}
                </span>
                <span className="text-xs text-gray-600 shrink-0">{timeAgo(alert.postedAt)}</span>
              </div>

              <p className="text-sm font-semibold text-white mb-1">{alert.caption}</p>
              <p className="text-xs text-gray-500 mb-3">Triggered by: {alert.triggeredBy}</p>

              <div className="flex items-center gap-3 flex-wrap">
                {alert.tweetUrl ? (
                  <a
                    href={alert.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View tweet ↗
                  </a>
                ) : (
                  <span className="text-xs text-gray-600">Tweet not posted</span>
                )}
                {alert.toolsTagged.length > 0 && (
                  <span className="text-xs text-gray-600">
                    Tagged: {alert.toolsTagged.join(", ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual trigger instructions */}
      <div className="mt-12 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="font-semibold text-white mb-3">Manual trigger</h2>
        <p className="text-sm text-gray-400 mb-4">
          Run either endpoint manually when you spot breaking news. Both require your <code className="text-violet-400">CRON_SECRET</code>.
        </p>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Launch / benchmark detection (scans RSS)</div>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 whitespace-pre-wrap break-all">
              {`curl -X POST ${siteUrl}/api/breaking/news \\
  -H "x-cron-secret: YOUR_CRON_SECRET"`}
            </pre>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Rank jump alert (compares to last snapshot)</div>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 whitespace-pre-wrap break-all">
              {`curl -X POST ${siteUrl}/api/breaking/rank-jump \\
  -H "x-cron-secret: YOUR_CRON_SECRET"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
