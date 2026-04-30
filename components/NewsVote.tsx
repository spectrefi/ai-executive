"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Props {
  articleId: string;
  source: string;
}

type VoteState = "up" | "down" | null;

export default function NewsVote({ articleId, source }: Props) {
  const storageKey = `vote:${articleId}`;
  const [vote, setVote] = useState<VoteState>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as VoteState;
    if (saved) setVote(saved);
  }, [storageKey]);

  async function cast(v: "up" | "down") {
    if (busy) return;
    const next: VoteState = vote === v ? null : v; // toggle off
    setBusy(true);

    // Optimistic update
    setVote(next);
    if (next) localStorage.setItem(storageKey, next);
    else localStorage.removeItem(storageKey);

    try {
      await fetch("/api/news/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, vote: next ?? v, source }),
      });
    } catch {
      // silent — vote lost but UI stays updated
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => { e.preventDefault(); cast("up"); }}
        title="Good source"
        className={`rounded p-1 transition-colors ${
          vote === "up"
            ? "text-emerald-400"
            : "text-gray-600 hover:text-emerald-400"
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); cast("down"); }}
        title="Poor quality"
        className={`rounded p-1 transition-colors ${
          vote === "down"
            ? "text-red-400"
            : "text-gray-600 hover:text-red-400"
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
