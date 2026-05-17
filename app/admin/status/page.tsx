import { runAllChecks, type CheckStatus, type HealthReport } from "@/lib/health-checks";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ── Helpers ────────────────────────────────────────────────────────────────────

function dot(status: CheckStatus) {
  const cls =
    status === "ok"   ? "bg-emerald-500" :
    status === "warn" ? "bg-amber-400"   :
    status === "error"? "bg-red-500 animate-pulse" :
                        "bg-gray-600";
  return <span className={`inline-block h-2 w-2 rounded-full ${cls} flex-shrink-0`} />;
}

function badge(status: CheckStatus) {
  const map: Record<CheckStatus, string> = {
    ok:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warn:  "bg-amber-400/10 text-amber-400 border border-amber-400/20",
    error: "bg-red-500/10 text-red-400 border border-red-500/20",
    skip:  "bg-gray-700/40 text-gray-500 border border-gray-700",
  };
  const label: Record<CheckStatus, string> = {
    ok: "OK", warn: "WARN", error: "ERROR", skip: "SKIP",
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function formatAge(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function timeAgo(iso?: string): string {
  if (!iso) return "never";
  return formatAge((Date.now() - new Date(iso).getTime()) / 3_600_000);
}

// ── Section card ───────────────────────────────────────────────────────────────

function Card({ title, status, children }: { title: string; status: CheckStatus; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#161c28] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <span className="font-semibold text-white text-sm">{title}</span>
        {badge(status)}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function AdminStatusPage() {
  const r: HealthReport = await runAllChecks();

  const overallBg =
    r.overall === "ok"    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
    r.overall === "warn"  ? "bg-amber-400/10 border-amber-400/20 text-amber-400"       :
    r.overall === "error" ? "bg-red-500/10 border-red-500/20 text-red-400"             :
                            "bg-gray-700/20 border-gray-700 text-gray-400";

  const overallLabel =
    r.overall === "ok"    ? "All systems operational" :
    r.overall === "warn"  ? "Degraded — some checks need attention" :
    r.overall === "error" ? "Critical issues detected" : "Unknown";

  // Group env vars by group
  const groups = [...new Set(r.envVars.checks.map((c) => c.group))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Control Panel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Last checked: {new Date(r.timestamp).toUTCString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/status"
            className="text-sm text-blue-400 hover:text-blue-300 border border-white/[0.08] rounded-lg px-3 py-1.5"
          >
            ↺ Refresh
          </a>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-300">
            ← Admin home
          </Link>
        </div>
      </div>

      {/* Overall status banner */}
      <div className={`mb-8 flex items-center gap-3 rounded-xl border px-5 py-4 ${overallBg}`}>
        <span className="text-lg">{r.overall === "ok" ? "✅" : r.overall === "warn" ? "⚠️" : "🚨"}</span>
        <div>
          <div className="font-bold">{overallLabel}</div>
          <div className="text-xs opacity-70 mt-0.5">
            {r.envVars.missingRequired > 0 && `${r.envVars.missingRequired} required env var${r.envVars.missingRequired > 1 ? "s" : ""} missing · `}
            {r.envVars.missingOptional > 0 && `${r.envVars.missingOptional} optional vars unset · `}
            {r.routes.checks.filter(c => c.status === "error").length > 0 &&
              `${r.routes.checks.filter(c => c.status === "error").length} route${r.routes.checks.filter(c => c.status === "error").length > 1 ? "s" : ""} failing · `}
            {r.navigation.missingFromNav.length > 0 &&
              `${r.navigation.missingFromNav.length} page${r.navigation.missingFromNav.length > 1 ? "s" : ""} missing from nav`}
          </div>
        </div>
      </div>

      {/* Top row: Redis + Snapshot + Social */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {/* Redis */}
        <Card title="Redis" status={r.redis.status}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {dot(r.redis.status)}
              <span className="text-white">
                {r.redis.status === "ok"
                  ? `Connected · ${r.redis.latencyMs}ms`
                  : r.redis.error ?? "Unreachable"}
              </span>
            </div>
          </div>
        </Card>

        {/* Rankings Snapshot */}
        <Card title="Rankings Snapshot" status={r.rankingsSnapshot.status}>
          <div className="space-y-2 text-sm">
            {r.rankingsSnapshot.capturedAt ? (
              <>
                <div className="flex items-center gap-2">
                  {dot(r.rankingsSnapshot.status)}
                  <span className="text-white">Last saved {formatAge(r.rankingsSnapshot.ageHours!)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(r.rankingsSnapshot.capturedAt).toUTCString()}
                </div>
                {r.rankingsSnapshot.ageHours! > 192 && (
                  <div className="text-xs text-amber-400">⚠ Snapshot is stale (&gt;8 days) — run power-rankings</div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                {dot("warn")}
                <span className="text-amber-400 text-xs">No snapshot yet — run POST /api/power-rankings</span>
              </div>
            )}
          </div>
        </Card>

        {/* Social & Breaking */}
        <Card title="Social & Alerts" status={r.socialPosts.status}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {dot(r.socialPosts.status)}
              <span className="text-white">{r.socialPosts.count} social posts</span>
              {r.socialPosts.lastPostedAt && (
                <span className="text-gray-500 text-xs">· last {timeAgo(r.socialPosts.lastPostedAt)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {dot(r.breakingLog.status)}
              <span className="text-white">{r.breakingLog.count} breaking alerts</span>
              {r.breakingLog.lastPostedAt && (
                <span className="text-gray-500 text-xs">· last {timeAgo(r.breakingLog.lastPostedAt)}</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Routes */}
      <div className="mb-6">
        <Card title="Route Health Checks" status={r.routes.status}>
          {!r.routes.checked ? (
            <div className="text-sm text-gray-500">
              Skipped — NEXT_PUBLIC_SITE_URL is not set to a live URL.
              Set it to enable HTTP route checks.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {r.routes.checks.map((check) => (
                <div key={check.path} className="flex items-center gap-3 py-2.5">
                  {dot(check.status)}
                  <span className="flex-1 text-sm text-white">{check.label}</span>
                  <code className="text-xs text-gray-500 hidden sm:block">{check.path}</code>
                  {check.latencyMs !== undefined && (
                    <span className="text-xs text-gray-600 w-14 text-right">{check.latencyMs}ms</span>
                  )}
                  <span className={`text-xs w-8 text-right font-mono ${check.status === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                    {check.actualStatus ?? "—"}
                  </span>
                  {check.note && (
                    <span className="text-xs text-amber-400 ml-2">{check.note}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Env vars */}
      <div className="mb-6">
        <Card title="Environment Variables" status={r.envVars.status}>
          {r.envVars.missingRequired > 0 && (
            <div className="mb-4 text-sm text-red-400 font-medium">
              🚨 {r.envVars.missingRequired} required variable{r.envVars.missingRequired > 1 ? "s" : ""} not set
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const groupChecks = r.envVars.checks.filter((c) => c.group === group);
              const groupStatus: CheckStatus = groupChecks.some((c) => c.required && !c.set)
                ? "error"
                : groupChecks.every((c) => c.set)
                ? "ok"
                : "warn";
              return (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{group}</span>
                    {badge(groupStatus)}
                  </div>
                  <div className="space-y-1">
                    {groupChecks.map((c) => (
                      <div key={c.key} className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${c.set ? "bg-emerald-500" : c.required ? "bg-red-500" : "bg-gray-600"}`} />
                        <span className={`text-xs ${c.set ? "text-gray-300" : c.required ? "text-red-400 font-medium" : "text-gray-600"}`}>
                          {c.label}
                          {!c.set && c.required && " ← required"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <Card title="Navigation Check" status={r.navigation.status}>
          {r.navigation.missingFromNav.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              {dot("ok")} All new pages linked in navbar
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-amber-400 font-medium mb-3">
                ⚠ These pages exist but are not in the navbar:
              </div>
              {r.navigation.missingFromNav.map((label) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  {dot("warn")}
                  <span className="text-amber-300">{label}</span>
                  <span className="text-gray-600 text-xs">— add to Navbar.tsx</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Manual triggers */}
      <div>
        <Card title="Manual Triggers (curl)" status="ok">
          <div className="space-y-4">
            {[
              {
                label: "Breaking news scan",
                cmd: `curl -X POST $SITE_URL/api/breaking/news -H "x-cron-secret: $CRON_SECRET"`,
              },
              {
                label: "Rank jump alert",
                cmd: `curl -X POST $SITE_URL/api/breaking/rank-jump -H "x-cron-secret: $CRON_SECRET"`,
              },
              {
                label: "Weekly power rankings",
                cmd: `curl -X POST $SITE_URL/api/power-rankings -H "x-cron-secret: $CRON_SECRET"`,
              },
              {
                label: "Daily social post (v2)",
                cmd: `curl -X POST $SITE_URL/api/generate-post-v2 -H "x-cron-secret: $CRON_SECRET"`,
              },
              {
                label: "Health check (JSON)",
                cmd: `curl $SITE_URL/api/admin/health -H "x-admin-secret: $ADMIN_SECRET"`,
              },
            ].map(({ label, cmd }) => (
              <div key={label}>
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <pre className="overflow-x-auto rounded-lg bg-black/40 p-2.5 text-xs text-gray-300 whitespace-pre-wrap break-all">
                  {cmd}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
