"use client";

import { useState } from "react";
import { AI_HACKS, HACK_CATEGORY_META, getTodaysFeaturedHack, type AIHack, type HackCategory } from "@/lib/data/hacks";
import { ChevronDown, ChevronUp, Copy, Check, Zap, ArrowUp, ExternalLink } from "lucide-react";
import Link from "next/link";

const CATEGORIES: { id: HackCategory | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "productivity", label: "Productivity", emoji: "⚡" },
  { id: "coding", label: "Coding", emoji: "💻" },
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "cost-saving", label: "Cost Saving", emoji: "💰" },
  { id: "research", label: "Research", emoji: "🔍" },
  { id: "image", label: "Image", emoji: "🎨" },
  { id: "audio", label: "Audio", emoji: "🎙️" },
];

function HackCard({ hack }: { hack: AIHack }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [votes, setVotes] = useState(hack.upvotes);
  const [voted, setVoted] = useState(false);
  const catMeta = HACK_CATEGORY_META[hack.category];

  function copyPrompt() {
    navigator.clipboard.writeText(hack.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function upvote() {
    if (voted) return;
    setVoted(true);
    setVotes(v => v + 1);
  }

  return (
    <article className="rounded-xl border border-white/[0.07] bg-[#161c28] overflow-hidden transition-colors hover:border-white/20">
      {/* Header */}
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${catMeta.color}`}>
            {catMeta.emoji} {catMeta.label}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-500">
            {hack.difficulty}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-500">
            {hack.model}
          </span>
          {hack.verified && (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              ✓ Verified
            </span>
          )}
        </div>

        <h2 className="mb-2 font-bold leading-snug text-white">{hack.title}</h2>
        <p className="mb-4 text-sm text-gray-400">{hack.tldr}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={upvote}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
              voted
                ? "border-blue-500/40 bg-blue-500/20 text-blue-300"
                : "border-white/10 bg-white/5 text-gray-400 hover:border-blue-500/30 hover:text-blue-400"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            {votes.toLocaleString()}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Hide" : "Show prompt + explanation"}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/[0.07] px-5 pb-5 pt-4 space-y-4">
          {/* Prompt block */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Prompt</span>
              <button
                onClick={copyPrompt}
                className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-[#0e1117] p-4 text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">
              {hack.prompt}
            </pre>
          </div>

          {/* Explanation */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Why it works</p>
            <p className="text-sm leading-relaxed text-gray-400">{hack.explanation}</p>
          </div>

          {/* Works on */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Works on</p>
            <div className="flex flex-wrap gap-1.5">
              {hack.works_on.map((m) => (
                <span key={m} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400">{m}</span>
              ))}
            </div>
          </div>

          {hack.source && (
            <p className="text-xs text-gray-600">Source: {hack.source}</p>
          )}
        </div>
      )}
    </article>
  );
}

export default function HacksPage() {
  const [activeCategory, setActiveCategory] = useState<HackCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"votes" | "recent">("votes");
  const featured = getTodaysFeaturedHack();

  const filtered = AI_HACKS
    .filter((h) => activeCategory === "all" || h.category === activeCategory)
    .filter((h) => h.id !== featured.id)
    .sort((a, b) => sortBy === "votes" ? b.upvotes - a.upvotes : new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-400">
          <Zap className="h-4 w-4" />
          AI Hacks
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          Hacks & Shortcuts
        </h1>
        <p className="text-gray-400">
          Prompt tricks, hidden features, and workflow hacks that make AI actually useful. Voted on by the community.
        </p>
      </div>

      {/* Today's featured hack */}
      <section className="mb-10 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-orange-950/20 p-1">
        <div className="rounded-lg bg-[#161c28] p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-black">🔥 Hack of the Day</span>
            <span className="text-xs text-gray-600">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>
          <HackCard hack={featured} />
        </div>
      </section>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "border-blue-500/40 bg-blue-500/20 text-blue-300"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "votes" | "recent")}
          className="rounded-lg border border-white/10 bg-[#161c28] px-3 py-1.5 text-sm text-gray-300"
        >
          <option value="votes">Most upvoted</option>
          <option value="recent">Most recent</option>
        </select>
      </div>

      {/* Hack list */}
      <div className="space-y-4">
        {filtered.map((hack) => (
          <HackCard key={hack.id} hack={hack} />
        ))}
      </div>

      {/* Submit CTA */}
      <section className="mt-10 rounded-xl border border-white/[0.07] bg-[#161c28] p-6 text-center">
        <p className="mb-2 text-lg font-bold text-white">Know a hack we're missing?</p>
        <p className="mb-4 text-sm text-gray-400">Submit a prompt trick, workflow shortcut, or hidden feature and get credited.</p>
        <a
          href="mailto:hello@aiexecutive.io?subject=AI Hack submission"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <ExternalLink className="h-4 w-4" /> Submit a hack
        </a>
      </section>
    </div>
  );
}
