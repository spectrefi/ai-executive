import { buildMetadata } from "@/lib/seo";
import { CHANGELOG, CHANGE_TYPE_META, IMPACT_META } from "@/lib/data/changelog";
import { AI_TOOLS } from "@/lib/data/tools";
import Link from "next/link";
import { Radio } from "lucide-react";

export const revalidate = 14400;

export const metadata = buildMetadata({
  title: "AI Model Changelog — What Dropped Today",
  description:
    "Every model release, price cut, API change, and deprecation across ChatGPT, Claude, Gemini and 20+ AI services. The changelog you actually need.",
  path: "/changelog",
});

export default function ChangelogPage() {
  const sorted = [...CHANGELOG].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const majors = sorted.filter((e) => e.impact === "major").length;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // Group by month
  const grouped = sorted.reduce<Record<string, typeof sorted>>((acc, entry) => {
    const key = new Date(entry.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
          <Radio className="h-4 w-4" />
          Model Changelog
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          What Dropped
        </h1>
        <p className="text-gray-400">
          Every model release, price cut, API change, and deprecation. So you don't have to monitor 20 company blogs.
          Refreshed as announcements happen.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        {[
          { label: "Total changes", value: sorted.length, color: "text-white" },
          { label: "Major releases", value: majors, color: "text-red-400" },
          {
            label: "Companies tracked",
            value: [...new Set(sorted.map((e) => e.company))].length,
            color: "text-blue-400",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips (visual only — server component) */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["model-release", "price-change", "feature", "deprecation", "api-change"] as const).map((type) => {
          const meta = CHANGE_TYPE_META[type];
          const count = sorted.filter((e) => e.type === type).length;
          return (
            <span
              key={type}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.color}`}
            >
              {meta.label} ({count})
            </span>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-10">
        {Object.entries(grouped).map(([month, entries]) => (
          <section key={month}>
            <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-gray-500">
              <span>{month}</span>
              <span className="h-px flex-1 bg-white/[0.07]" />
              <span className="text-gray-700">{entries.length} updates</span>
            </h2>
            <div className="space-y-3">
              {entries.map((entry) => {
                const typeMeta = CHANGE_TYPE_META[entry.type];
                const impactMeta = IMPACT_META[entry.impact];
                const tool = AI_TOOLS.find((t) => t.id === entry.toolId);
                return (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 transition-colors hover:border-white/[0.12]"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {/* Logo */}
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ backgroundColor: `${entry.logoColor}22` }}
                      >
                        {entry.logo}
                      </span>

                      {/* Company + model */}
                      <span className="font-semibold text-white">{entry.company}</span>
                      <span className="text-sm text-gray-500">·</span>
                      <span className="text-sm text-gray-400">{entry.model}</span>

                      {/* Badges */}
                      <span className={`ml-auto rounded-full border px-2 py-0.5 text-xs font-semibold ${typeMeta.color}`}>
                        {typeMeta.label}
                      </span>
                      <span className={`text-xs font-semibold ${impactMeta.color}`}>
                        {impactMeta.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-1.5 font-semibold text-gray-100">{entry.title}</h3>

                    {/* Summary */}
                    <p className="mb-2 text-sm leading-relaxed text-gray-400">{entry.summary}</p>

                    {/* Details */}
                    {entry.details && (
                      <p className="mb-2 text-xs text-gray-600">{entry.details}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-700">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                      {entry.source && (
                        <span className="text-xs text-gray-700">· {entry.source}</span>
                      )}
                      {tool && (
                        <Link
                          href={`/tools/${tool.id}`}
                          className="ml-auto text-xs text-blue-400 hover:text-blue-300"
                        >
                          View tool →
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Subscribe CTA */}
      <section className="mt-12 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-white">Get changelog updates by email</h2>
        <p className="mb-4 text-sm text-gray-400">
          Major model releases, price cuts, and deprecations delivered to your inbox — once a day, not 20 newsletters.
        </p>
        <Link
          href="/#subscribe"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Subscribe Free
        </Link>
      </section>
    </div>
  );
}
