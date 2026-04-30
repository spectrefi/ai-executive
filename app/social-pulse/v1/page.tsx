import { buildMetadata } from "@/lib/seo";
import { getSocialPosts } from "@/lib/social-post-archive";
import { getBatchTweetMetrics } from "@/lib/twitter-client";
import { getBatchIgMetrics } from "@/lib/instagram-client";
import { getBatchTikTokMetrics } from "@/lib/tiktok-client";
import { computeSummary } from "@/lib/post-analytics";
import SocialPostCard from "@/components/SocialPostCard";
import SocialPulseStats from "@/components/SocialPulseStats";
import { Zap, X as XIcon } from "lucide-react";

// V1 — frozen snapshot of the original Social Pulse dashboard

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Social Pulse — Daily AI Viral Posts",
  description:
    "Every day AI Executive surfaces the most electrifying AI story of the moment — viral, visual, and straight to X.",
  path: "/social-pulse",
});

export default async function SocialPulsePage() {
  const posts = await getSocialPosts();

  // Fetch metrics from all platforms in parallel
  const tweetIds  = posts.map((p) => p.tweetId).filter(Boolean) as string[];
  const igIds     = posts.map((p) => p.igMediaId).filter(Boolean) as string[];
  const tiktokIds = posts.map((p) => p.tiktokVideoId).filter(Boolean) as string[];

  const [tweetMetrics, igMetrics, tiktokMetrics] = await Promise.all([
    getBatchTweetMetrics(tweetIds),
    getBatchIgMetrics(igIds),
    getBatchTikTokMetrics(tiktokIds),
  ]);

  const summary = computeSummary(posts, tweetMetrics, igMetrics, tiktokMetrics);

  const latestPost = posts[0];
  const archivePosts = posts.slice(1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-purple-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
          Daily · Auto-posted to X
        </div>
        <h1 className="mb-3 text-3xl font-extrabold text-white">
          Social{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Pulse
          </span>
        </h1>
        <p className="max-w-2xl text-gray-400">
          Every day we surface the most electrifying AI story of the past 24 hours, wrap it in a
          viral post, and push it live to X.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-2.5">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">{posts.length} posts published</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-2.5">
            <XIcon className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-medium text-white">Auto-posts to X</span>
          </div>
        </div>
      </div>

      {/* Stats infographic — all platforms */}
      <SocialPulseStats summary={summary} posts={posts} tweetMetrics={tweetMetrics} igMetrics={igMetrics} tiktokMetrics={tiktokMetrics} />

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#161c28] py-20 text-center">
          <div className="mb-4 text-5xl">⚡</div>
          <h2 className="mb-2 text-lg font-bold text-white">First post coming soon</h2>
          <p className="text-sm text-gray-500">Check back later.</p>
        </div>
      ) : (
        <>
          {latestPost && (
            <section className="mb-12">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Latest Post
                </span>
              </div>
              <SocialPostCard
                post={latestPost}
                tweetMetrics={latestPost.tweetId ? tweetMetrics[latestPost.tweetId] : undefined}
                igMetrics={latestPost.igMediaId ? igMetrics[latestPost.igMediaId] : undefined}
                tiktokMetrics={latestPost.tiktokVideoId ? tiktokMetrics[latestPost.tiktokVideoId] : undefined}
              />
            </section>
          )}

          {archivePosts.length > 0 && (
            <section>
              <h2 className="mb-5 text-lg font-bold text-white">Archive</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {archivePosts.map((post) => (
                  <SocialPostCard
                    key={post.id}
                    post={post}
                    tweetMetrics={post.tweetId ? tweetMetrics[post.tweetId] : undefined}
                    igMetrics={post.igMediaId ? igMetrics[post.igMediaId] : undefined}
                    tiktokMetrics={post.tiktokVideoId ? tiktokMetrics[post.tiktokVideoId] : undefined}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* How it works */}
      <section className="mt-16 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8">
        <h2 className="mb-6 text-xl font-bold text-white">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Scan 50+ feeds",
              desc: "Every day we ingest live news from OpenAI, Anthropic, Google, HN, Reddit and 45+ other sources.",
              color: "text-purple-400",
            },
            {
              step: "02",
              title: "AI picks the fire",
              desc: "Claude reads the last 24 hours of headlines and picks the single most electrifying story.",
              color: "text-pink-400",
            },
            {
              step: "03",
              title: "Post goes live",
              desc: "A viral 1-2 line caption + custom visual goes straight to X.",
              color: "text-blue-400",
            },
          ].map((item) => (
            <div key={item.step}>
              <div className={`mb-2 text-xs font-bold tracking-widest ${item.color}`}>{item.step}</div>
              <div className="mb-1 font-semibold text-white">{item.title}</div>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
