"use client";

import { useState } from "react";
import { HOT_TAKES, SOURCE_META, getFeaturedTakes, type HotTake } from "@/lib/data/hot-takes";
import { Flame, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";

function AgreeBar({ pct, total }: { pct: number; total: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span className="text-emerald-400 font-medium">Agree {pct}%</span>
        <span>{total.toLocaleString()} votes</span>
        <span className="text-red-400 font-medium">Disagree {100 - pct}%</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-red-500/30">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TakeCard({ take }: { take: HotTake }) {
  const [agree, setAgree] = useState(take.agreeBaseline);
  const [total, setTotal] = useState(take.totalVotes);
  const [voted, setVoted] = useState<"agree" | "disagree" | null>(null);
  const src = SOURCE_META[take.source];

  function vote(choice: "agree" | "disagree") {
    if (voted) return;
    setVoted(choice);
    const newTotal = total + 1;
    const currentAgreeCount = Math.round((agree / 100) * total);
    const newAgreeCount = currentAgreeCount + (choice === "agree" ? 1 : 0);
    setAgree(Math.round((newAgreeCount / newTotal) * 100));
    setTotal(newTotal);
  }

  const isControversial = Math.abs(agree - 50) < 15;

  return (
    <article className={`rounded-xl border bg-[#161c28] p-5 transition-colors hover:border-white/20 ${isControversial ? "border-amber-500/20" : "border-white/[0.07]"}`}>
      {isControversial && (
        <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
          🔥 Controversial
        </div>
      )}

      {/* Quote */}
      <blockquote className="mb-4 text-base leading-relaxed text-white font-medium">
        "{take.take}"
      </blockquote>

      {/* Author */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
          {take.author.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{take.author}</span>
            {take.authorHandle && (
              <span className="text-xs text-gray-500">{take.authorHandle}</span>
            )}
          </div>
          <div className="text-xs text-gray-500">{take.authorRole}</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className={src.color + " font-bold"}>{src.icon}</span>
          <span>{src.label}</span>
          {take.url && (
            <a href={take.url} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Vote bar */}
      <div className="mb-4">
        <AgreeBar pct={agree} total={total} />
      </div>

      {/* Vote buttons */}
      {!voted ? (
        <div className="flex gap-2">
          <button
            onClick={() => vote("agree")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <ThumbsUp className="h-4 w-4" /> Agree
          </button>
          <button
            onClick={() => vote("disagree")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <ThumbsDown className="h-4 w-4" /> Disagree
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">
          You voted: <span className={voted === "agree" ? "text-emerald-400" : "text-red-400"}>{voted}</span>
        </p>
      )}

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {take.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-500">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function HotTakesPage() {
  const [filter, setFilter] = useState<"all" | "controversial" | "featured">("featured");
  const featured = getFeaturedTakes();

  const displayed = filter === "featured"
    ? featured
    : filter === "controversial"
    ? HOT_TAKES.filter((t) => t.controversial)
    : HOT_TAKES;

  const totalVotes = HOT_TAKES.reduce((s, t) => s + t.totalVotes, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
          <Flame className="h-4 w-4" />
          Hot Takes
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          AI's Most Controversial Opinions
        </h1>
        <p className="text-gray-400">
          The takes everyone's arguing about — from researchers, engineers, and founders. Vote where you stand.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: "Total takes", value: HOT_TAKES.length },
          { label: "Community votes cast", value: totalVotes.toLocaleString() },
          { label: "Controversial (near 50/50)", value: HOT_TAKES.filter((t) => Math.abs(t.agreeBaseline - 50) < 15).length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-center">
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(["featured", "controversial", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "border-blue-500/40 bg-blue-500/20 text-blue-300"
                : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {f === "featured" ? "🔥 Featured" : f === "controversial" ? "⚡ Most Controversial" : "All Takes"}
          </button>
        ))}
      </div>

      {/* Takes */}
      <div className="space-y-5">
        {displayed.map((take) => (
          <TakeCard key={take.id} take={take} />
        ))}
      </div>

      {/* Submit CTA */}
      <section className="mt-10 rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-red-950/20 p-6 text-center">
        <Flame className="mx-auto mb-3 h-8 w-8 text-orange-400" />
        <p className="mb-2 text-lg font-bold text-white">Have a hot take?</p>
        <p className="mb-4 text-sm text-gray-400">Send us the AI opinion you think will cause the most arguments.</p>
        <a
          href="mailto:hello@aiexecutive.io?subject=Hot take submission"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
        >
          Submit a take
        </a>
      </section>
    </div>
  );
}
