"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export default function ShareButton({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const url = `${SITE_URL}${path}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#161c28] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-blue-500/40 hover:text-white"
      aria-label={`Copy link to ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400">Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Share comparison
        </>
      )}
    </button>
  );
}
