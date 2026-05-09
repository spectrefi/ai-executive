"use client";

import { useState } from "react";
import { AI_TOOLS } from "@/lib/data/tools";
import { API_MODELS } from "@/lib/data/api-pricing";
import Link from "next/link";
import { Lock, FileText, CheckCircle, ExternalLink, TrendingUp, Shield, DollarSign, Cpu } from "lucide-react";

const REPORT_SECTIONS = [
  { icon: TrendingUp, title: "2026 AI Tool Landscape", desc: "Rankings, momentum, and which tools are gaining ground" },
  { icon: DollarSign, title: "Pricing Benchmark", desc: "API costs, subscription tiers, and TCO for a 50-seat team" },
  { icon: Shield, title: "Enterprise Readiness Matrix", desc: "SOC 2, GDPR, HIPAA, data residency, and SLA across all major tools" },
  { icon: Cpu, title: "Context Window & Capability Guide", desc: "Token limits, multimodal support, and tool-use benchmarks" },
  { icon: FileText, title: "Use-Case Fit Analysis", desc: "Which tools win for coding, writing, research, agents, and vision" },
  { icon: CheckCircle, title: "Vendor Selection Framework", desc: "A decision matrix for choosing AI vendors at enterprise scale" },
];

const TOP_TOOLS = AI_TOOLS.slice(0, 6);

export default function EnterpriseReportPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "enterprise-report" }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-400">
          <FileText className="h-3.5 w-3.5" /> Enterprise Report — 2026
        </div>
        <h1 className="mb-4 text-3xl font-extrabold text-white sm:text-5xl">
          The Enterprise AI Buyer's Guide
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-400">
          Everything a CTO, VP of Engineering, or IT leader needs to evaluate, select, and deploy AI tools at enterprise scale.
          Built from benchmark data, pricing analysis, and enterprise readiness audits across 25 platforms.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span>✓ 25 AI tools assessed</span>
          <span>✓ 6 evaluation dimensions</span>
          <span>✓ Updated May 2026</span>
          <span>✓ Free with email</span>
        </div>
      </div>

      {/* What's inside */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold text-white">What's inside</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_SECTIONS.map((section) => (
            <div key={section.title} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <section.icon className="mb-3 h-5 w-5 text-blue-400" />
              <h3 className="mb-1 font-semibold text-white">{section.title}</h3>
              <p className="text-sm text-gray-500">{section.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Email gate */}
      <section className="mb-12 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-indigo-950/40 p-8 text-center">
        {!submitted ? (
          <>
            <Lock className="mx-auto mb-3 h-8 w-8 text-blue-400" />
            <h2 className="mb-2 text-xl font-bold text-white">Get the full report free</h2>
            <p className="mb-5 text-sm text-gray-400">
              Enter your work email to unlock the complete 2026 Enterprise AI Buyer's Guide.
              No spam — just the report and our daily AI briefing.
            </p>
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 rounded-lg border border-white/10 bg-[#0e1117] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {loading ? "Sending…" : "Get Report →"}
              </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <p className="mt-3 text-xs text-gray-600">Unsubscribe anytime. Your email is never sold.</p>
          </>
        ) : (
          <div className="py-4">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
            <h2 className="mb-2 text-xl font-bold text-white">You're in — scroll down for the report</h2>
            <p className="text-sm text-gray-400">The full report is unlocked below. We've also sent you a copy by email.</p>
          </div>
        )}
      </section>

      {/* Report preview (always visible) + full content (always shown — gating is soft) */}
      <div className={`space-y-10 ${!submitted ? "opacity-40 pointer-events-none select-none blur-sm" : ""}`}>

        {/* Section 1: Rankings */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <TrendingUp className="h-5 w-5 text-blue-400" /> 2026 AI Tool Rankings
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Rankings are computed from a weighted composite of benchmark scores across reasoning, coding, writing, speed, cost efficiency, accuracy, creativity, context window, and multimodal capability. Scores are refreshed daily via automated benchmark pipelines.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#161c28]">
                  <th className="px-4 py-3 text-left font-semibold text-gray-400">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-400">Tool</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-400">Overall</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-400">Reasoning</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-400">Coding</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-400">Writing</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-400">Starting price</th>
                </tr>
              </thead>
              <tbody>
                {TOP_TOOLS.map((tool, i) => (
                  <tr key={tool.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-bold text-blue-400">#{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tool.logo}</span>
                        <div>
                          <div className="font-medium text-white">{tool.name}</div>
                          <div className="text-xs text-gray-500">{tool.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-white">{tool.scores.overall}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{tool.scores.reasoning}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{tool.scores.coding}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{tool.scores.writing}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">{tool.pricing.startingAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-right">
            <Link href="/" className="text-xs text-blue-400 hover:text-blue-300">View full live leaderboard →</Link>
          </div>
        </section>

        {/* Section 2: Pricing benchmark */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <DollarSign className="h-5 w-5 text-emerald-400" /> API Pricing Benchmark
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            API pricing per million input/output tokens as of May 2026. For a 50-person engineering team making 10,000 API calls per day at an average of 2,000 input / 600 output tokens per call, the monthly cost differential between the cheapest and most expensive frontier model is <span className="font-semibold text-white">~$43,000/month</span>.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#161c28]">
                  <th className="px-4 py-3 text-left font-semibold text-gray-400">Model</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-400">Input / 1M</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-400">Output / 1M</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-400">~Monthly (50-seat)</th>
                </tr>
              </thead>
              <tbody>
                {API_MODELS.slice(0, 8).map((model) => {
                  const monthly = ((2000 / 1_000_000) * model.inputPer1M + (600 / 1_000_000) * model.outputPer1M) * 10000 * 30;
                  return (
                    <tr key={model.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.company}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-300">${model.inputPer1M.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-300">${model.outputPer1M.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">${Math.round(monthly).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-right">
            <Link href="/price-index" className="text-xs text-blue-400 hover:text-blue-300">Use the interactive cost calculator →</Link>
          </div>
        </section>

        {/* Section 3: Enterprise readiness */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <Shield className="h-5 w-5 text-purple-400" /> Enterprise Readiness Matrix
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Compliance, data residency, SLA, and support tier availability across the top enterprise AI platforms. Critical for regulated industries including financial services, healthcare, and legal.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#161c28]">
                  <th className="px-4 py-3 text-left font-semibold text-gray-400">Tool</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-400">SOC 2</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-400">GDPR</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-400">HIPAA</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-400">Data residency</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-400">SLA</th>
                </tr>
              </thead>
              <tbody>
                {AI_TOOLS.filter((t) => t.enterprise).slice(0, 8).map((tool) => (
                  <tr key={tool.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{tool.logo}</span>
                        <span className="font-medium text-white">{tool.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{tool.enterprise?.soc2 ? "✅" : "❌"}</td>
                    <td className="px-4 py-3 text-center">{tool.enterprise?.gdpr ? "✅" : "❌"}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-400">
                      {tool.enterprise?.hipaa === true ? "✅" : tool.enterprise?.hipaa === false ? "❌" : tool.enterprise?.hipaa}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{tool.enterprise?.dataResidency ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{tool.enterprise?.sla ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Vendor selection framework */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <CheckCircle className="h-5 w-5 text-amber-400" /> Vendor Selection Framework
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Use this decision matrix to score vendors against your organisation's specific requirements. Assign weights (0–1) to each dimension based on what matters most, then multiply by the vendor's score.
          </p>
          <div className="space-y-3">
            {[
              { dimension: "Output quality (reasoning, writing, coding)", weight: "High for knowledge work", benchmark: "Use overall score + dimension scores from leaderboard" },
              { dimension: "Data privacy & compliance", weight: "Critical for regulated industries", benchmark: "SOC 2 + GDPR + HIPAA + data residency audit" },
              { dimension: "API reliability & uptime", weight: "High for production integrations", benchmark: "30-day uptime from /status page + SLA terms" },
              { dimension: "Total cost of ownership", weight: "High for scale deployments", benchmark: "API pricing × estimated monthly token volume" },
              { dimension: "Vendor stability", weight: "High for multi-year contracts", benchmark: "Funding runway + company size + customer count" },
              { dimension: "Integration ecosystem", weight: "Medium for most teams", benchmark: "SDK availability, webhook support, existing integrations" },
            ].map((row) => (
              <div key={row.dimension} className="rounded-lg border border-white/[0.07] bg-[#161c28] p-4">
                <div className="mb-1 font-semibold text-white">{row.dimension}</div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span><span className="text-gray-600">Weight:</span> {row.weight}</span>
                  <span><span className="text-gray-600">Benchmark:</span> {row.benchmark}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA at end of report */}
        <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
          <h2 className="mb-2 text-lg font-bold text-white">Take the next step</h2>
          <p className="mb-4 text-sm text-gray-400">Compare any two tools head-to-head or see the full live leaderboard.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
              View Live Rankings
            </Link>
            <Link href="/compare" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white">
              Compare Tools <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* Unlock CTA (if not submitted) */}
      {!submitted && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-sm text-gray-500">The full report is blurred above. Unlock it free:</p>
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 rounded-lg border border-white/10 bg-[#0e1117] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Sending…" : "Unlock Free →"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
