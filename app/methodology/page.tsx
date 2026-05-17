import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
export const revalidate = 14400;


export const metadata = buildMetadata({
  title: "Methodology: How AI Executive Scores Are Calculated",
  description:
    "How AI Executive calculates AI tool scores — data sources, benchmark normalization, score types, update cadence, and limitations. Full transparency on our ranking methodology.",
  path: "/methodology",
});

const DIMENSIONS = [
  {
    name: "Overall Score",
    type: "composite",
    weight: "Weighted composite",
    description:
      "Weighted composite across all eight dimensions. Weights: Reasoning 18%, Coding 15%, Writing 15%, Accuracy 15%, Speed 10%, Cost 10%, Creativity 10%, Multimodal 7%.",
    source: "AI Executive composite",
    sourceUrl: "",
    cadence: "Daily",
  },
  {
    name: "Reasoning",
    type: "objective",
    weight: "18%",
    description:
      "Measures logical reasoning, multi-step problem solving, and comprehension. Primary source: LMSYS Chatbot Arena Elo rating normalised to 0–100. Cross-referenced with MMLU 5-shot accuracy.",
    source: "LMSYS Chatbot Arena + MMLU",
    sourceUrl: "https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard",
    cadence: "Weekly",
  },
  {
    name: "Coding",
    type: "objective",
    weight: "15%",
    description:
      "HumanEval pass@1 and SWE-bench Verified scores, normalised and blended. Reflects real-world code generation, bug-fixing, and explanation quality.",
    source: "HumanEval + SWE-bench",
    sourceUrl: "https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard",
    cadence: "Weekly",
  },
  {
    name: "Writing",
    type: "subjective",
    weight: "15%",
    description:
      "Human preference ratings from MT-Bench writing tasks and AlpacaEval. Measures prose clarity, coherence, tone-following, and instruction adherence.",
    source: "MT-Bench + AlpacaEval",
    sourceUrl: "https://huggingface.co/spaces/lmsys/mt-bench",
    cadence: "Bi-weekly",
  },
  {
    name: "Accuracy",
    type: "objective",
    weight: "15%",
    description:
      "Factual accuracy and hallucination rate. Sources: TruthfulQA accuracy score and HaluEval benchmark, normalised. Lower hallucination rate = higher score.",
    source: "TruthfulQA + HaluEval",
    sourceUrl: "https://github.com/sylinrl/TruthfulQA",
    cadence: "Bi-weekly",
  },
  {
    name: "Speed",
    type: "objective",
    weight: "10%",
    description:
      "Median output tokens per second measured from public API, normalised against the fastest model in the set. Lower latency models score higher.",
    source: "Artificial Analysis Speed Benchmarks",
    sourceUrl: "https://artificialanalysis.ai",
    cadence: "Weekly",
  },
  {
    name: "Cost Efficiency",
    type: "objective",
    weight: "10%",
    description:
      "Inverted cost per million tokens (input+output blended at 3:1 ratio). Higher score = lower cost. Subscription tools calculated at an equivalent per-token rate assuming average professional usage.",
    source: "Official pricing pages",
    sourceUrl: "",
    cadence: "As pricing changes",
  },
  {
    name: "Creativity",
    type: "subjective",
    weight: "10%",
    description:
      "Human-evaluated creative writing, ideation diversity, and originality. Scored via community blind testing on creative tasks (story writing, brainstorming, poetry). Inherently subjective — treat as directional.",
    source: "Community blind evaluations + LLM-as-judge",
    sourceUrl: "",
    cadence: "Monthly",
  },
  {
    name: "Multimodal",
    type: "objective",
    weight: "7%",
    description:
      "Image understanding (MMMU benchmark), image generation quality (ELO from community votes), and audio/video processing capability. Score is 0 for text-only models.",
    source: "MMMU + Community image ELO",
    sourceUrl: "https://mmmu-benchmark.github.io",
    cadence: "Bi-weekly",
  },
];

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  objective: { label: "Objective", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  subjective: { label: "Subjective", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  composite: { label: "Composite", color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
        Scoring Methodology
      </h1>
      <p className="mb-10 text-lg text-gray-400">
        Full transparency on how AI Executive calculates and maintains its rankings.
      </p>

      {/* Principles */}
      <section className="mb-10 rounded-xl border border-white/[0.07] bg-[#161c28] p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Principles</h2>
        <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
          <li>All scores aggregate from <strong>publicly available, independent benchmarks</strong> — we do not use vendor-supplied numbers as primary sources.</li>
          <li>Raw benchmark scores are <strong>min-max normalised to 0–100</strong> across all {AI_TOOLS.length} tracked tools. 100 = best in class within this set.</li>
          <li>Objective scores (benchmarks with defined metrics) and subjective scores (human-preference evaluations) are <strong>clearly distinguished</strong>.</li>
          <li>Update cadences are published and followed. Stale data is flagged.</li>
        </ul>
      </section>

      {/* Score dimensions */}
      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold text-white mb-6">Score Dimensions</h2>
        {DIMENSIONS.map((d) => {
          const badge = TYPE_BADGE[d.type];
          return (
            <div key={d.name} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-semibold text-white">{d.name}</span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
                >
                  {badge.label}
                </span>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-300">
                  Weight: {d.weight}
                </span>
                <span className="ml-auto text-xs text-gray-500">Updated: {d.cadence}</span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{d.description}</p>
              {d.sourceUrl ? (
                <a
                  href={d.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  {d.source} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-xs text-gray-600">{d.source}</span>
              )}
            </div>
          );
        })}
      </section>

      {/* Primary sources */}
      <section className="mb-10 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Primary Data Sources</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "LMSYS Chatbot Arena", desc: "Blind human preference Elo ratings", url: "https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard" },
            { name: "HumanEval / SWE-bench", desc: "Code generation pass rates", url: "https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard" },
            { name: "MMLU", desc: "Multi-task language understanding", url: "https://huggingface.co/datasets/cais/mmlu" },
            { name: "MT-Bench / AlpacaEval", desc: "Instruction-following and writing quality", url: "https://huggingface.co/spaces/lmsys/mt-bench" },
            { name: "TruthfulQA / HaluEval", desc: "Factual accuracy and hallucination rates", url: "https://github.com/sylinrl/TruthfulQA" },
            { name: "Artificial Analysis", desc: "API speed and latency benchmarks", url: "https://artificialanalysis.ai" },
            { name: "MMMU", desc: "Multimodal understanding benchmark", url: "https://mmmu-benchmark.github.io" },
            { name: "Official pricing pages", desc: "Cost calculations — verified monthly", url: "" },
          ].map((s) => (
            <div key={s.name} className="rounded-lg bg-[#161c28] px-4 py-3">
              <div className="font-medium text-sm text-white">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-blue-300">
                    {s.name} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : s.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-10 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Limitations</h2>
        <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside">
          <li>Benchmarks measure narrowly defined tasks, not holistic real-world performance.</li>
          <li>Speed scores reflect median API performance and vary by region and server load.</li>
          <li>Pricing scores are point-in-time snapshots — verify current pricing before purchasing decisions.</li>
          <li>Subjective scores (Writing, Creativity) carry evaluator variance of ±5 points.</li>
          <li>A score of 0 means either not applicable for that tool or the lowest measured in the current set — not that the tool scored zero on the benchmark itself.</li>
        </ul>
      </section>

      {/* Corrections CTA */}
      <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Spot an Inaccuracy?</h2>
        <p className="text-sm text-gray-400 mb-4">
          We review all data submissions within 48 hours. Flag it on any tool profile or email us directly.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/tools"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Browse Tool Profiles
          </Link>
          <a
            href="mailto:data@aiexecutive.io"
            className="rounded-lg border border-white/[0.07] bg-[#161c28] px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white"
          >
            Email data@aiexecutive.io
          </a>
        </div>
      </section>
    </div>
  );
}
