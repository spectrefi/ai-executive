"use client";

import { useState } from "react";

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export default function ToolAlertSubscribe({
  toolId,
  toolName,
}: {
  toolId: string;
  toolName: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/tool-alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, toolId }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <p className="text-sm font-medium text-emerald-400">
          ✓ You&apos;ll be notified when {toolName}&apos;s rank changes
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-white">Get rank alerts</h3>
        <p className="mt-1 text-xs text-gray-500">
          We&apos;ll email you when {toolName} moves in the rankings.
        </p>
      </div>
      <form onSubmit={subscribe} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0e1117] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Alert me"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
