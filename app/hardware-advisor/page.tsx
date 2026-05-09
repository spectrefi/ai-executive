"use client";

import { useState, useMemo } from "react";
import {
  GPU_PRESETS,
  LOCAL_MODELS,
  CLOUD_RECOMMENDATIONS,
  SPEED_META,
  QUANT_META,
  getCompatibleModels,
  getHardwareTier,
  type UseCase,
  type LocalModel,
} from "@/lib/data/hardware";
import Link from "next/link";
import { Cpu, Monitor, Zap, ExternalLink, ChevronDown, ChevronUp, Info } from "lucide-react";

const USE_CASES: { id: UseCase; label: string; emoji: string; desc: string }[] = [
  { id: "chat",      label: "Chat & Q&A",      emoji: "💬", desc: "General assistant use" },
  { id: "coding",    label: "Coding",          emoji: "💻", desc: "Code generation & review" },
  { id: "writing",   label: "Writing",         emoji: "✍️", desc: "Long-form content" },
  { id: "reasoning", label: "Reasoning",       emoji: "🧩", desc: "Math, logic, analysis" },
  { id: "vision",    label: "Vision",          emoji: "👁️", desc: "Image & video tasks" },
  { id: "agents",    label: "Agents",          emoji: "🤖", desc: "Multi-step automation" },
];

const TIER_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  "cpu-only":    { label: "CPU Only",      color: "text-gray-400",   desc: "Very limited — cloud AI strongly recommended" },
  entry:         { label: "Entry GPU",     color: "text-amber-400",  desc: "Can run smaller models. Good starting point" },
  mid:           { label: "Mid-range GPU", color: "text-blue-400",   desc: "Solid local AI. Most 7-14B models run well" },
  high:          { label: "High-end GPU",  color: "text-purple-400", desc: "Excellent. Runs 27B+ models comfortably" },
  enthusiast:    { label: "Enthusiast",    color: "text-emerald-400",desc: "Near-frontier quality locally. 70B possible" },
  workstation:   { label: "Workstation",   color: "text-pink-400",   desc: "Full open-weights frontier locally" },
};

function QualityBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" :
    score >= 65 ? "bg-blue-500" :
    score >= 50 ? "bg-amber-500" : "bg-gray-600";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-500">{score}</span>
    </div>
  );
}

function ModelCard({ model, expanded }: { model: LocalModel; expanded: boolean }) {
  const [open, setOpen] = useState(expanded);
  const speedMeta = SPEED_META[model.speed];
  const quantMeta = QUANT_META[model.quant];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#161c28] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base"
          style={{ backgroundColor: `${model.logoColor}22` }}
        >
          {model.logo}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{model.name}</span>
            <span className="rounded border border-white/10 px-1.5 py-0.5 text-xs text-gray-500">
              {quantMeta.label}
            </span>
          </div>
          <div className="text-xs text-gray-500">{model.company} · {model.params}</div>
        </div>
        <div className="flex items-center gap-3 mr-2">
          <QualityBar score={model.quality} />
          <span className={`text-xs font-medium ${speedMeta.color}`}>{speedMeta.label}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </button>

      {open && (
        <div className="border-t border-white/[0.05] px-4 pb-4 pt-3">
          <div className="mb-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-sm font-semibold text-blue-400">{model.vramGb === 0 ? "CPU" : `${model.vramGb}GB`}</div>
              <div className="text-xs text-gray-600">VRAM needed</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-300">{model.ramGb}GB</div>
              <div className="text-xs text-gray-600">RAM needed</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-300">{model.diskGb}GB</div>
              <div className="text-xs text-gray-600">Disk space</div>
            </div>
          </div>

          {model.notes && (
            <p className="mb-3 text-sm text-gray-400">{model.notes}</p>
          )}

          <div className="mb-3 flex flex-wrap gap-1">
            {model.useCases.map((uc) => {
              const meta = USE_CASES.find((u) => u.id === uc);
              return (
                <span key={uc} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400">
                  {meta?.emoji} {meta?.label}
                </span>
              );
            })}
          </div>

          {model.ollamaTag && (
            <div className="rounded-lg border border-white/[0.07] bg-[#0e1117] px-3 py-2">
              <p className="mb-1 text-xs text-gray-600">Run with Ollama:</p>
              <code className="font-mono text-sm text-emerald-400">ollama run {model.ollamaTag}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HardwareAdvisorPage() {
  const [selectedGpu, setSelectedGpu] = useState("rtx-4060");
  const [ramGb, setRamGb] = useState(16);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>("coding");
  const [showAll, setShowAll] = useState(false);

  const gpu = GPU_PRESETS.find((g) => g.id === selectedGpu) ?? GPU_PRESETS[0];
  const tier = getHardwareTier(gpu.vramGb);
  const tierMeta = TIER_LABELS[tier];

  const compatible = useMemo(
    () => getCompatibleModels(gpu.vramGb, ramGb),
    [gpu.vramGb, ramGb]
  );

  const displayed = showAll ? compatible : compatible.slice(0, 5);
  const topPick = compatible[0];
  const cloudRecs = CLOUD_RECOMMENDATIONS[selectedUseCase];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">
          <Cpu className="h-4 w-4" />
          Hardware Advisor
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          Which AI models can your machine run?
        </h1>
        <p className="text-gray-400">
          Select your hardware and use case. We'll tell you exactly which models you can run locally
          — and what cloud API makes sense for tasks beyond your hardware.
        </p>
      </div>

      {/* Config panel */}
      <section className="mb-8 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <Monitor className="h-4 w-4 text-blue-400" />
          Your hardware
        </h2>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">GPU model</label>
            <select
              value={selectedGpu}
              onChange={(e) => setSelectedGpu(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0e1117] px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              {GPU_PRESETS.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">System RAM</label>
            <select
              value={ramGb}
              onChange={(e) => setRamGb(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-[#0e1117] px-3 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
            >
              {[8, 16, 32, 64, 128].map((r) => (
                <option key={r} value={r}>{r}GB RAM</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tier badge */}
        <div className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#0e1117] px-4 py-3">
          <Zap className={`h-4 w-4 ${tierMeta.color}`} />
          <div>
            <span className={`font-semibold ${tierMeta.color}`}>{tierMeta.label}</span>
            <span className="ml-2 text-sm text-gray-400">{tierMeta.desc}</span>
          </div>
          <span className="ml-auto text-sm font-semibold text-white">
            {compatible.length} models compatible
          </span>
        </div>
      </section>

      {/* Use case picker */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-gray-500">What are you building?</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setSelectedUseCase(uc.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-center text-xs font-medium transition-colors ${
                selectedUseCase === uc.id
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.07] bg-[#161c28] text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <span className="text-xl">{uc.emoji}</span>
              <span>{uc.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Top pick highlight */}
      {topPick ? (
        <section className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-400">
            <span>✓</span> Best local model for your setup
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${topPick.logoColor}22` }}
            >
              {topPick.logo}
            </span>
            <div>
              <div className="font-bold text-white">{topPick.name}</div>
              <div className="text-sm text-gray-400">{topPick.notes}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm font-semibold text-emerald-400">Quality score: {topPick.quality}/100</div>
              {topPick.ollamaTag && (
                <code className="text-xs text-gray-500">ollama run {topPick.ollamaTag}</code>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Your hardware can't run local LLMs yet</p>
              <p className="mt-1 text-sm text-amber-400/70">
                Even the smallest models need at least 4GB RAM. Cloud APIs (below) are the right choice for your current setup.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Compatible models list */}
      {compatible.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 flex items-center justify-between text-sm font-semibold uppercase tracking-widest text-gray-500">
            <span>All compatible models ({compatible.length})</span>
            <span className="text-xs text-gray-600 normal-case tracking-normal">sorted by quality</span>
          </h2>
          <div className="space-y-2">
            {displayed.map((model, i) => (
              <ModelCard key={model.id} model={model} expanded={i === 0} />
            ))}
          </div>
          {compatible.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              {showAll ? (
                <><ChevronUp className="h-4 w-4" /> Show fewer</>
              ) : (
                <><ChevronDown className="h-4 w-4" /> Show all {compatible.length} compatible models</>
              )}
            </button>
          )}
        </section>
      )}

      {/* Cloud recommendations */}
      <section className="mb-10">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-gray-500">
          Cloud API recommendations for {USE_CASES.find((u) => u.id === selectedUseCase)?.label}
        </h2>
        <p className="mb-4 text-xs text-gray-600">
          When local hardware isn't enough — or when you need the best results, not just good ones.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {cloudRecs.map((rec) => (
            <div key={rec.name} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4">
              <div className="mb-2 flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
                  style={{ backgroundColor: `${rec.logoColor}22` }}
                >
                  {rec.logo}
                </span>
                <div>
                  <div className="font-semibold text-white">{rec.name}</div>
                  <div className="text-xs text-gray-500">{rec.company}</div>
                </div>
                <span className="ml-auto text-xs font-mono text-emerald-400">{rec.costLabel}</span>
              </div>
              <p className="mb-3 text-sm text-gray-400">{rec.reason}</p>
              <Link
                href={rec.href}
                className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                View full profile <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Getting started */}
      <section className="rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="mb-4 font-semibold text-white">Running models locally — how to start</h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Install Ollama",
              desc: "The easiest way to run local models. One install, pull any model with a single command.",
              code: "# macOS/Linux\ncurl -fsSL https://ollama.ai/install.sh | sh",
              link: "https://ollama.ai",
              linkLabel: "ollama.ai",
            },
            {
              step: "2",
              title: "Pull a model",
              desc: topPick ? `Based on your hardware, we recommend starting with:` : "Pick a model that fits your RAM:",
              code: topPick ? `ollama run ${topPick.ollamaTag ?? "llama3.1:8b"}` : "ollama run llama3.2:3b",
            },
            {
              step: "3",
              title: "Use a UI (optional)",
              desc: "Open WebUI gives you a ChatGPT-style interface over your local models.",
              code: "docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway ghcr.io/open-webui/open-webui:main",
              link: "https://github.com/open-webui/open-webui",
              linkLabel: "open-webui",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-lg border border-white/[0.07] bg-[#0e1117] p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {item.step}
                </span>
                <span className="font-semibold text-white">{item.title}</span>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                    {item.linkLabel} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="mb-2 text-sm text-gray-400">{item.desc}</p>
              <div className="overflow-x-auto rounded-md border border-white/[0.07] bg-[#161c28] px-3 py-2">
                <code className="whitespace-pre font-mono text-xs text-emerald-400">{item.code}</code>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
