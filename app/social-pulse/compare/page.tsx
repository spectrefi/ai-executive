import { buildMetadata } from "@/lib/seo";
import { getSocialPosts } from "@/lib/social-post-archive";
import { getBatchTweetMetrics } from "@/lib/twitter-client";
import { getBatchIgMetrics } from "@/lib/instagram-client";
import { getBatchTikTokMetrics } from "@/lib/tiktok-client";
import { computeSummary } from "@/lib/post-analytics";
import SocialPulseCompare from "@/components/SocialPulseCompare";
import Link from "next/link";
import { GitCompare } from "lucide-react";

// 60-second revalidation for near-real-time comparison
export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Social Pulse Compare — v1 vs v2 Live",
  description: "Minute-level side-by-side comparison of Social Pulse v1 (template) vs v2 (AI-enhanced) post performance.",
  path: "/social-pulse/compare",
});

export default async function SocialPulseComparePage() {
  const allPosts = await getSocialPosts();

  const v1Posts = allPosts.filter((p) => !p.version || p.version === "v1");
  const v2Posts = allPosts.filter((p) => p.version === "v2");

  const allTweetIds = allPosts.map((p) => p.tweetId).filter(Boolean) as string[];
  const allIgIds    = allPosts.map((p) => p.igMediaId).filter(Boolean) as string[];
  const allTtIds    = allPosts.map((p) => p.tiktokVideoId).filter(Boolean) as string[];

  const [tweetMetrics, igMetrics, tiktokMetrics] = await Promise.all([
    getBatchTweetMetrics(allTweetIds),
    getBatchIgMetrics(allIgIds),
    getBatchTikTokMetrics(allTtIds),
  ]);

  const v1Summary = computeSummary(v1Posts, tweetMetrics, igMetrics, tiktokMetrics);
  const v2Summary = computeSummary(v2Posts, tweetMetrics, igMetrics, tiktokMetrics);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
            Live · refreshes every 60s
          </div>
          <div className="flex gap-2">
            <Link href="/social-pulse/v1" className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">v1 dashboard</Link>
            <Link href="/social-pulse/v2" className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">v2 dashboard</Link>
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-extrabold text-white flex items-center gap-3">
          <GitCompare className="h-8 w-8 text-purple-400" />
          v1{" "}
          <span className="text-gray-600">vs</span>{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">v2</span>
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Minute-level comparison of template posts (v1) against AI-enhanced posts (v2).
          {v1Posts.length} v1 posts · {v2Posts.length} v2 posts.
        </p>
      </div>

      <SocialPulseCompare
        v1Posts={v1Posts}
        v2Posts={v2Posts}
        v1Summary={v1Summary}
        v2Summary={v2Summary}
        tweetMetrics={tweetMetrics}
        igMetrics={igMetrics}
        tiktokMetrics={tiktokMetrics}
      />
    </div>
  );
}
