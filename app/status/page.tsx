import { buildMetadata } from "@/lib/seo";
import {
  STATUS_SERVICES,
  STATUS_META,
  type ServiceStatus,
  type StatusLevel,
  type LiveStatusResponse,
  indicatorToStatus,
} from "@/lib/data/ai-status";
import { AI_TOOLS } from "@/lib/data/tools";
import Link from "next/link";
import { ExternalLink, RefreshCw, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

export const revalidate = 300; // refresh every 5 minutes

export const metadata = buildMetadata({
  title: "AI Service Status — Live Uptime Dashboard",
  description:
    "Real-time status for ChatGPT, Claude, Gemini, Midjourney, ElevenLabs and 12 other AI services. Know what's up, what's degraded, and what's down before you build.",
  path: "/status",
});

async function fetchServiceStatus(service: ServiceStatus): Promise<ServiceStatus> {
  if (!service.statusApiUrl) return service;
  try {
    const res = await fetch(service.statusApiUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return service;
    const data = (await res.json()) as LiveStatusResponse;
    return {
      ...service,
      status: indicatorToStatus(data.status.indicator),
      description: data.status.description,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return service;
  }
}

function StatusIcon({ level }: { level: StatusLevel }) {
  switch (level) {
    case "operational":    return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    case "degraded":       return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    case "partial_outage": return <AlertTriangle className="h-4 w-4 text-orange-400" />;
    case "major_outage":   return <XCircle className="h-4 w-4 text-red-400" />;
    default:               return <HelpCircle className="h-4 w-4 text-gray-500" />;
  }
}

export default async function StatusPage() {
  const services = await Promise.all(STATUS_SERVICES.map(fetchServiceStatus));

  const operational = services.filter((s) => s.status === "operational").length;
  const issues = services.length - operational;
  const avgUptime = (services.reduce((sum, s) => sum + s.uptimePct, 0) / services.length).toFixed(1);

  const grouped = {
    llm: services.filter((s) => s.category === "llm"),
    code: services.filter((s) => s.category === "code"),
    image: services.filter((s) => s.category === "image"),
    voice: services.filter((s) => s.category === "voice"),
    search: services.filter((s) => s.category === "search"),
  };

  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">AI Service Status</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            LIVE
          </span>
        </div>
        <p className="text-gray-400">
          Real-time uptime for {services.length} AI services — updated every 5 minutes. Last checked:{" "}
          <span className="text-gray-300">{now}</span>
        </p>
      </div>

      {/* Summary bar */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Services monitored",
            value: services.length,
            suffix: "platforms",
            color: "text-white",
          },
          {
            label: "Operational",
            value: operational,
            suffix: `/ ${services.length}`,
            color: issues === 0 ? "text-emerald-400" : "text-yellow-400",
          },
          {
            label: issues === 0 ? "All systems go" : "Active issues",
            value: issues,
            suffix: issues === 0 ? "🎉" : "reported",
            color: issues === 0 ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Avg 30-day uptime",
            value: `${avgUptime}%`,
            suffix: "across all services",
            color: "text-blue-400",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-600">{s.suffix}</div>
          </div>
        ))}
      </div>

      {/* Overall status banner */}
      {issues === 0 ? (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-300">All AI services operational</p>
            <p className="text-sm text-emerald-400/70">No incidents reported across any monitored platform.</p>
          </div>
        </div>
      ) : (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-400" />
          <div>
            <p className="font-semibold text-yellow-300">{issues} service{issues > 1 ? "s" : ""} reporting issues</p>
            <p className="text-sm text-yellow-400/70">See details below. Check individual status pages for incident updates.</p>
          </div>
        </div>
      )}

      {/* Service groups */}
      {([
        { key: "llm", label: "Language Models" },
        { key: "code", label: "Coding Tools" },
        { key: "image", label: "Image & Video" },
        { key: "voice", label: "Voice & Audio" },
        { key: "search", label: "AI Search" },
      ] as const).map(({ key, label }) => {
        const group = grouped[key];
        if (group.length === 0) return null;
        return (
          <section key={key} className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">{label}</h2>
            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
              {group.map((service, i) => {
                const meta = STATUS_META[service.status];
                const tool = AI_TOOLS.find((t) => t.id === service.toolId);
                return (
                  <div
                    key={service.id}
                    className={`flex flex-wrap items-center gap-4 px-5 py-4 ${
                      i > 0 ? "border-t border-white/[0.05]" : ""
                    } hover:bg-[#161c28] transition-colors`}
                  >
                    {/* Logo + name */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                        style={{ backgroundColor: `${service.logoColor}22` }}
                      >
                        {service.logo}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-white">{service.name}</div>
                        <div className="text-xs text-gray-500">{service.company}</div>
                      </div>
                    </div>

                    {/* Uptime */}
                    <div className="hidden text-center sm:block">
                      <div className="text-sm font-semibold text-gray-200">{service.uptimePct}%</div>
                      <div className="text-xs text-gray-600">30-day uptime</div>
                    </div>

                    {/* Incidents */}
                    <div className="hidden text-center sm:block">
                      <div className="text-sm font-semibold text-gray-200">{service.incidentCount30d}</div>
                      <div className="text-xs text-gray-600">incidents / 30d</div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      <StatusIcon level={service.status} />
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-2">
                      {tool && (
                        <Link
                          href={`/tools/${tool.id}`}
                          className="rounded-md bg-[#161c28] px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-white"
                        >
                          Profile
                        </Link>
                      )}
                      <a
                        href={service.statusPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-blue-400"
                      >
                        Status page <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Refresh note */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <RefreshCw className="h-3 w-3" />
        Status data fetched from official status pages where available. Auto-refreshes every 5 minutes.
        Services without a public API show last known state.
      </div>
    </div>
  );
}
