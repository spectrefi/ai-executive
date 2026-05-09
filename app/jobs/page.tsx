import { buildMetadata } from "@/lib/seo";
import {
  JOBS,
  JOB_CATEGORY_META,
  LEVEL_META,
  LOCATION_META,
  formatSalary,
  type Job,
} from "@/lib/data/jobs";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, ExternalLink, Mail } from "lucide-react";
export const revalidate = 14400;

export const metadata = buildMetadata({
  title: "AI Jobs Board 2026 — Engineering, Research & Product Roles at AI Companies",
  description:
    "Hand-picked jobs at Anthropic, OpenAI, Mistral, ElevenLabs, Cursor and more. The best AI roles in engineering, research, product, and go-to-market.",
  path: "/jobs",
});

function JobCard({ job }: { job: Job }) {
  const catMeta = JOB_CATEGORY_META[job.category];
  const locMeta = LOCATION_META[job.location];
  const daysAgo = Math.floor(
    (Date.now() - new Date(job.posted).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <article className={`rounded-xl border bg-[#161c28] p-5 transition-colors hover:border-white/20 ${job.featured ? "border-blue-500/30" : "border-white/[0.07]"}`}>
      {job.featured && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
          ⭐ Featured
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-start gap-3">
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${job.logoColor}22` }}
        >
          {job.logo}
        </span>
        <div className="flex-1">
          <h2 className="font-bold text-white">{job.title}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-300">{job.company}</span>
            <span>·</span>
            <span className={locMeta.color}>{locMeta.label}</span>
            <span>·</span>
            <span>{job.locationDetail}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-emerald-400">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
          </div>
          <div className="text-xs text-gray-600">{job.currency}/yr</div>
        </div>
      </div>

      {/* Tags row */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${catMeta.color}`}>
          {catMeta.label}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400">
          {LEVEL_META[job.level]}
        </span>
        {job.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-500">
            {tag}
          </span>
        ))}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-400">{job.description}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {daysAgo === 0 ? "Posted today" : daysAgo === 1 ? "Posted yesterday" : `Posted ${daysAgo}d ago`}
        </span>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Apply <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

export default function JobsPage() {
  const featured = JOBS.filter((j) => j.featured);
  const regular = JOBS.filter((j) => !j.featured);

  const totalSalaryMin = Math.round(
    JOBS.filter((j) => j.currency === "USD").reduce((s, j) => s + j.salaryMin, 0) /
    JOBS.filter((j) => j.currency === "USD").length / 1000
  );
  const totalSalaryMax = Math.round(
    JOBS.filter((j) => j.currency === "USD").reduce((s, j) => s + j.salaryMax, 0) /
    JOBS.filter((j) => j.currency === "USD").length / 1000
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
          <Briefcase className="h-4 w-4" />
          AI Jobs
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          Jobs at AI Companies
        </h1>
        <p className="text-gray-400">
          Hand-picked roles at the companies building the tools on this leaderboard. Updated as new positions open.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        {[
          { label: "Open roles", value: JOBS.length, color: "text-white" },
          { label: "Avg salary (USD)", value: `$${totalSalaryMin}k–$${totalSalaryMax}k`, color: "text-emerald-400" },
          { label: "Remote friendly", value: `${JOBS.filter((j) => j.location === "remote").length} roles`, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">Featured roles</h2>
          <div className="space-y-4">
            {featured.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        </section>
      )}

      {/* All roles */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">All open roles</h2>
        <div className="space-y-4">
          {regular.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </section>

      {/* Post a job CTA */}
      <section className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 p-6 text-center">
        <Briefcase className="mx-auto mb-3 h-8 w-8 text-blue-400" />
        <h2 className="mb-2 text-lg font-bold text-white">Hiring AI talent?</h2>
        <p className="mb-4 text-sm text-gray-400">
          Post your role to reach thousands of engineers, researchers, and product managers who follow AI tools closely.
          Featured listings start at $299.
        </p>
        <a
          href="mailto:hello@aiexecutive.io?subject=Post a job listing"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Post a job — hello@aiexecutive.io
        </a>
      </section>
    </div>
  );
}
