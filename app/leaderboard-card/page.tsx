import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import LeaderboardCardShare from "@/components/LeaderboardCardShare";

export const revalidate = 14400;

export const metadata = buildMetadata({
  title: `AI Power Rankings Card | ${SITE_NAME}`,
  description:
    "Download or share this week's AI Power Rankings card. The top 10 AI tools ranked by daily performance benchmarks.",
  path: "/leaderboard-card",
});

export default function LeaderboardCardPage() {
  const imageUrl = `${SITE_URL}/api/og/leaderboard`;
  const shareUrl = `${SITE_URL}/leaderboard-card`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-3 text-3xl font-extrabold text-white">AI Power Rankings Card</h1>
      <p className="mb-8 text-gray-400">
        This week&apos;s top 10 AI tools ranked by performance. Download and share anywhere.
      </p>

      {/* Card preview */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.08] mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="AI Power Rankings"
          className="w-full block"
        />
      </div>

      {/* Share actions */}
      <LeaderboardCardShare imageUrl={imageUrl} shareUrl={shareUrl} />

      {/* Embed info */}
      <div className="mt-10 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="mb-3 font-semibold text-white">Embed this card</h2>
        <p className="text-sm text-gray-400 mb-4">
          Use this URL anywhere that renders Open Graph images — newsletters, Notion pages, social posts, or your own site.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 whitespace-pre-wrap break-all">
          {imageUrl}
        </pre>
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">HTML img tag</div>
          <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 whitespace-pre-wrap break-all">
            {`<img src="${imageUrl}" alt="AI Power Rankings" width="1200" height="630">`}
          </pre>
        </div>
      </div>
    </div>
  );
}
