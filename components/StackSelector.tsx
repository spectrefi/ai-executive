"use client";

import { useState, useEffect } from "react";
import { AI_TOOLS } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/constants";

const MAX_TOOLS = 5;

export default function StackSelector({ initialIds }: { initialIds: string[] }) {
  const [selected, setSelected] = useState<string[]>(
    initialIds.filter((id) => AI_TOOLS.some((t) => t.id === id)).slice(0, MAX_TOOLS)
  );
  const [copied, setCopied] = useState(false);

  const shareUrl =
    selected.length > 0
      ? `${SITE_URL}/my-stack?tools=${selected.join(",")}`
      : null;

  const ogImageUrl =
    selected.length > 0
      ? `${SITE_URL}/api/og/ai-stack?tools=${selected.join(",")}`
      : null;

  const xText =
    selected.length > 0
      ? `My AI stack in 2026: ${selected.map((id) => AI_TOOLS.find((t) => t.id === id)?.name).filter(Boolean).join(", ")} — see how they rank 👇\n${shareUrl}`
      : "";

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_TOOLS
        ? [...prev, id]
        : prev
    );
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const orderedTools = [...AI_TOOLS].sort((a, b) => a.currentRank - b.currentRank);

  return (
    <div className="space-y-10">
      {/* Tool picker */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Pick your tools</h2>
          <span className="text-sm text-gray-500">
            {selected.length}/{MAX_TOOLS} selected
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {orderedTools.map((tool) => {
            const active = selected.includes(tool.id);
            const disabled = !active && selected.length >= MAX_TOOLS;
            return (
              <button
                key={tool.id}
                onClick={() => toggle(tool.id)}
                disabled={disabled}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-blue-500/60 bg-blue-500/10"
                    : disabled
                    ? "cursor-not-allowed border-white/[0.04] bg-[#0e1117] opacity-40"
                    : "border-white/[0.07] bg-[#161c28] hover:border-blue-500/30 hover:bg-[#1a2235]"
                }`}
              >
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: `${tool.logoColor}22` }}
                >
                  {tool.logo}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{tool.name}</div>
                  <div className="text-xs text-gray-500">#{tool.currentRank} · {tool.scores.overall}</div>
                </div>
                {active && (
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Preview + share */}
      {selected.length > 0 && (
        <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-indigo-950/30 p-6">
          <h2 className="mb-5 text-lg font-bold text-white">Your stack</h2>

          {/* Card preview */}
          {ogImageUrl && (
            <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ogImageUrl}
                alt="Your AI stack card"
                className="w-full"
                style={{ aspectRatio: "1200/628" }}
              />
            </div>
          )}

          {/* Selected tools list */}
          <div className="mb-6 flex flex-wrap gap-2">
            {selected.map((id) => {
              const tool = AI_TOOLS.find((t) => t.id === id);
              if (!tool) return null;
              return (
                <button
                  key={id}
                  onClick={() => toggle(id)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#161c28] px-3 py-1 text-sm text-white hover:border-red-500/40 hover:text-red-400"
                >
                  {tool.logo} {tool.name}
                  <span className="ml-1 text-gray-500">×</span>
                </button>
              );
            })}
          </div>

          {/* Share buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(xText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-900 border border-white/10"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </a>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#161c28] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a2235]"
            >
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
