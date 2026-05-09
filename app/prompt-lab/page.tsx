"use client";

import { useState, useEffect } from "react";
import { getTodaysPrompt, DAILY_PROMPTS, type ModelResponse } from "@/lib/data/prompts";
import { Beaker, ThumbsUp, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";

function useVotes(promptId: string) {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/prompt-vote?promptId=${promptId}`)
      .then((r) => r.json())
      .then((d) => setVotes(d.votes ?? {}))
      .catch(() => {});
    const stored = localStorage.getItem(`voted:${promptId}`);
    if (stored) setVoted(stored);
  }, [promptId]);

  async function vote(modelId: string) {
    if (voted || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prompt-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, modelId }),
      });
      const data = await res.json();
      setVotes(data.votes ?? {});
      setVoted(modelId);
      localStorage.setItem(`voted:${promptId}`, modelId);
    } catch {
      setVotes((prev) => ({ ...prev, [modelId]: (prev[modelId] ?? 0) + 1 }));
      setVoted(modelId);
      localStorage.setItem(`voted:${promptId}`, modelId);
    } finally {
      setLoading(false);
    }
  }

  return { votes, voted, vote };
}

function ResponseCard({
  response,
  rank,
  totalVotes,
  myVotes,
  hasVoted,
  onVote,
  loading,
  isWinner,
}: {
  response: ModelResponse;
  rank: number;
  totalVotes: number;
  myVotes: number;
  hasVoted: boolean;
  onVote: () => void;
  loading: boolean;
  isWinner: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const pct = totalVotes > 0 ? Math.round((myVotes / totalVotes) * 100) : 0;
  const isMyVote = hasVoted;

  function copyText() {
    navigator.clipboard.writeText(response.response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-5 transition-colors ${
        isWinner && hasVoted
          ? "border-amber-500/40 bg-amber-500/5"
          : isMyVote
          ? "border-blue-500/40 bg-blue-500/5"
          : "border-white/[0.07] bg-[#161c28]"
      }`}
    >
      {isWinner && hasVoted && (
        <div className="absolute -top-2.5 right-4 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
          👑 Top pick
        </div>
      )}

      {/* Model header */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-base"
          style={{ backgroundColor: `${response.color}22` }}
        >
          {response.logo}
        </span>
        <div>
          <div className="font-semibold text-white">{response.model}</div>
          <div className="text-xs text-gray-500">{response.company}</div>
        </div>
        <div className="ml-auto flex gap-1">
          {response.strengths.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-gray-500"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Response text */}
      <div className="prose-invert mb-4 flex-1 text-sm leading-relaxed text-gray-300">
        {response.response.split("\n\n").map((paragraph, i) => {
          if (paragraph.startsWith("**") || paragraph.startsWith("#")) {
            return (
              <p key={i} className="mb-2">
                {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                  part.startsWith("**") ? (
                    <strong key={j} className="font-semibold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            );
          }
          return (
            <p key={i} className="mb-2 text-gray-300">
              {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                part.startsWith("**") ? (
                  <strong key={j} className="font-semibold text-white">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>

      {/* Word count */}
      <div className="mb-3 text-xs text-gray-600">{response.wordCount} words</div>

      {/* Vote bar (shown after voting) */}
      {hasVoted && totalVotes > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{myVotes} votes</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!hasVoted ? (
          <button
            onClick={onVote}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-medium text-gray-300 hover:border-blue-500/40 hover:text-blue-400 transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="h-4 w-4" />
            Vote best
          </button>
        ) : (
          <div
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold ${
              isMyVote ? "border border-blue-500/40 bg-blue-500/10 text-blue-400" : "border border-white/5 text-gray-600"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            {pct}%
          </div>
        )}
        <button
          onClick={copyText}
          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function PromptLabPage() {
  const [promptIndex, setPromptIndex] = useState(() => {
    const today = DAILY_PROMPTS.find((p) => p.dayIndex === new Date().getDay());
    return today ? DAILY_PROMPTS.indexOf(today) : 0;
  });

  const prompt = DAILY_PROMPTS[promptIndex];
  const { votes, voted, vote } = useVotes(prompt.id);

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const winnerModelId = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];

  function prev() {
    setPromptIndex((i) => (i - 1 + DAILY_PROMPTS.length) % DAILY_PROMPTS.length);
  }
  function next() {
    setPromptIndex((i) => (i + 1) % DAILY_PROMPTS.length);
  }

  const isToday = prompt.dayIndex === new Date().getDay();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-purple-400">
          <Beaker className="h-4 w-4" />
          Daily Prompt Lab
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">
          One prompt. Five models. You decide.
        </h1>
        <p className="text-gray-400">
          Every day a new prompt is tested across five leading AI models. Read the responses, vote for
          the best, and see what the community thinks. New prompt each day.
        </p>
      </div>

      {/* Prompt card */}
      <section className="mb-8">
        {/* Navigation */}
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={prev}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#161c28] px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-gray-500">
            {promptIndex + 1} / {DAILY_PROMPTS.length}
          </span>
          <button
            onClick={next}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#161c28] px-3 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
          {isToday && (
            <span className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Today&apos;s prompt
            </span>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${prompt.categoryColor}`}>
              {prompt.category}
            </span>
            {totalVotes > 0 && (
              <span className="text-xs text-gray-500">{totalVotes.toLocaleString()} votes cast</span>
            )}
          </div>
          <h2 className="mb-3 text-xl font-bold text-white">{prompt.title}</h2>
          <div className="rounded-lg border border-white/[0.07] bg-[#0e1117] px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{prompt.prompt}</p>
          </div>
          {prompt.context && (
            <p className="mt-2 text-xs text-gray-600">Context: {prompt.context}</p>
          )}
        </div>
      </section>

      {/* Call to vote */}
      {!voted && (
        <div className="mb-6 rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-sm text-purple-300">
          Read all five responses below, then vote for the best one. Voting reveals the community results.
        </div>
      )}

      {/* Responses grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {prompt.responses.map((response) => {
          const modelVotes = votes[response.model] ?? 0;
          const isWinner = response.model === winnerModelId;
          const isMyVote = voted === response.model;
          return (
            <ResponseCard
              key={response.model}
              response={response}
              rank={0}
              totalVotes={totalVotes}
              myVotes={modelVotes}
              hasVoted={!!voted}
              onVote={() => vote(response.model)}
              loading={false}
              isWinner={isWinner}
            />
          );
        })}
      </div>

      {/* After vote results */}
      {voted && totalVotes > 0 && (
        <div className="mt-8 rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
          <h3 className="mb-3 font-semibold text-white">Community verdict</h3>
          <div className="space-y-2">
            {[...prompt.responses]
              .sort((a, b) => (votes[b.model] ?? 0) - (votes[a.model] ?? 0))
              .map((r, i) => {
                const v = votes[r.model] ?? 0;
                const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
                return (
                  <div key={r.model} className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-bold text-gray-500">#{i + 1}</span>
                    <span className="text-sm text-gray-300">{r.model}</span>
                    <div className="flex-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: i === 0 ? "#f59e0b" : "#3b82f6",
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-xs font-mono text-gray-400">{pct}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Browse other prompts */}
      <section className="mt-10">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">All prompt topics</h3>
        <div className="flex flex-wrap gap-2">
          {DAILY_PROMPTS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPromptIndex(i)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                i === promptIndex
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                  : "border-white/10 text-gray-500 hover:text-gray-300"
              }`}
            >
              {p.dayIndex === new Date().getDay() && "📅 "}{p.title}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
