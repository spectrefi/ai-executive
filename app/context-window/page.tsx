import { buildMetadata } from "@/lib/seo";
import { CONTEXT_WINDOW_DATA, formatTokenCount } from "@/lib/data/context-windows";
import Link from "next/link";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "AI Context Window Comparison 2026 — Tokens, Multimodal, Limits",
  description:
    "Compare context windows, max output tokens, and multimodal capabilities across all major AI models. Updated monthly as models change.",
  path: "/context-window",
});

const MODALITY_LABELS: Record<string, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  video: "Video",
  document: "PDF/Doc",
  code: "Code",
};

export default function ContextWindowPage() {
  const sorted = [...CONTEXT_WINDOW_DATA].sort((a, b) => b.contextTokens - a.contextTokens);
  const maxTokens = sorted[0]?.contextTokens ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          Context Window Leaderboard
        </h1>
        <p className="text-gray-400">
          How much can each model read in a single call? Context window, multimodal support, and max
          output — ranked largest first. Updated when models change.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Largest context",
            value: formatTokenCount(maxTokens),
            detail: sorted[0]?.name,
            color: "text-blue-400",
          },
          {
            label: "Models tracked",
            value: sorted.length,
            detail: "across all providers",
            color: "text-white",
          },
          {
            label: "Multimodal input",
            value: sorted.filter((m) => m.inputModalities.length > 1).length,
            detail: "accept images or more",
            color: "text-purple-400",
          },
          {
            label: "Native tool use",
            value: sorted.filter((m) => m.nativeTools).length,
            detail: "support function calling",
            color: "text-emerald-400",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-gray-400">{s.label}</div>
            <div className="text-xs text-gray-600">{s.detail}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mb-10 overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] bg-[#161c28]">
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Model</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Context</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Context bar</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Max Output</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-400">Input modalities</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Tools</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Structured</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-400">Streaming</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-400">Updated</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => {
              const pct = Math.round((m.contextTokens / maxTokens) * 100);
              return (
                <tr
                  key={m.id}
                  className={`border-b border-white/5 transition-colors hover:bg-[#161c28] ${
                    i % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  {/* Model */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base"
                        style={{ backgroundColor: `${m.logoColor}22` }}
                      >
                        {m.logo}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.company}</div>
                        {m.notes && (
                          <div className="mt-0.5 text-xs text-blue-400">{m.notes}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Context */}
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm font-bold text-blue-400">{m.contextLabel}</span>
                    <div className="text-xs text-gray-600">{m.contextTokens.toLocaleString()} tokens</div>
                  </td>

                  {/* Bar */}
                  <td className="px-4 py-4">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600">{pct}% of max</div>
                  </td>

                  {/* Max output */}
                  <td className="px-4 py-4">
                    <span className="font-mono text-sm text-gray-300">
                      {formatTokenCount(m.maxOutputTokens)}
                    </span>
                  </td>

                  {/* Modalities */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {m.inputModalities.map((mod) => (
                        <span
                          key={mod}
                          className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-gray-400"
                        >
                          {MODALITY_LABELS[mod] ?? mod}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Tools */}
                  <td className="px-4 py-4 text-center">
                    {m.nativeTools ? (
                      <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="mx-auto h-4 w-4 text-gray-700" />
                    )}
                  </td>

                  {/* Structured */}
                  <td className="px-4 py-4 text-center">
                    {m.structuredOutput ? (
                      <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="mx-auto h-4 w-4 text-gray-700" />
                    )}
                  </td>

                  {/* Streaming */}
                  <td className="px-4 py-4 text-center">
                    {m.streaming ? (
                      <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="mx-auto h-4 w-4 text-gray-700" />
                    )}
                  </td>

                  {/* Updated */}
                  <td className="px-4 py-4 text-right text-xs text-gray-600">
                    {new Date(m.lastUpdated).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Explainer */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "What is a context window?",
            body: "The maximum amount of text (measured in tokens, roughly ¾ of a word) a model can process in one call — including your input and its output. Larger windows let you feed in entire codebases, long documents, or conversation histories.",
          },
          {
            title: "Why does max output matter?",
            body: "A 200K context window doesn't help if the model can only generate 4K tokens in response. Max output tokens determine how long the model's replies can be — important for generating full documents, large code files, or detailed reports.",
          },
          {
            title: "How often does this change?",
            body: "Frequently. Google expanded Gemini 1.5 Pro from 1M to 2M tokens in 2024. OpenAI added structured output to GPT-4o mid-year. We track updates as they're announced and update this table within 48 hours of changes.",
          },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
            <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
            <p className="text-sm text-gray-400">{card.body}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-white">Compare any two models</h2>
        <p className="mb-4 text-sm text-gray-400">Context window is just one dimension. See full benchmark scores, pricing, and pros/cons.</p>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Compare Models <ExternalLink className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
