"use client";

import { useState } from "react";

export default function LeaderboardCardShare({
  imageUrl,
  shareUrl,
}: {
  imageUrl: string;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-power-rankings.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tweetText = encodeURIComponent(
    `📊 AI Power Rankings — see this week's top AI tools ranked by performance:\n\n${shareUrl}`
  );
  const linkedInUrl = encodeURIComponent(shareUrl);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        ↓ Download PNG
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-white text-sm font-semibold transition-colors border border-white/[0.1]"
      >
        {copied ? "✓ Copied!" : "Copy link"}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 text-[#1d9bf0] text-sm font-semibold transition-colors border border-[#1d9bf0]/20"
      >
        Share on X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${linkedInUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] text-sm font-semibold transition-colors border border-[#0077b5]/20"
      >
        Share on LinkedIn
      </a>
    </div>
  );
}
