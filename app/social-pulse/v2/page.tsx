import { buildMetadata } from "@/lib/seo";
import { getSocialPosts } from "@/lib/social-post-archive";
import { getBatchTweetMetrics } from "@/lib/twitter-client";
import { getBatchIgMetrics } from "@/lib/instagram-client";
import { getBatchTikTokMetrics } from "@/lib/tiktok-client";
import { computeSummary } from "@/lib/post-analytics";
import SocialPostCardV2 from "@/components/SocialPostCardV2";
import SocialPulseStatsV2 from "@/components/SocialPulseStatsV2";
import { Zap, X as XIcon, Mic, ImageIcon } from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Social Pulse v2 — AI-Enhanced Daily Posts",
  description: "Social Pulse v2: AI-generated visuals, ElevenLabs voiceover, and Runway video — side by side with v1 for performance comparison.",
  path: "/social-pulse/v2",
});

export default async function SocialPulseV2Page() {
  const allPosts = await getSocialPosts();
  const posts = allPosts.filter((p) => !p.version || p.version === "v2");

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
        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
            Daily · Auto-posted to X, Instagram & TikTok
          </div>
          <div className="flex gap-2">
            <Link href="/social-pulse/v1"
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">
              View v1
            </Link>
            <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 text-xs text-purple-300 font-semibold">
              v2 — Active
            </span>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-extrabold text-white">
          Social{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Pulse
          </span>
          <span className="ml-3 text-lg font-bold text-purple-400">v2</span>
        </h1>
        <p className="max-w-2xl text-gray-400">
          Every day we surface the most electrifying AI story, wrap it in an AI-generated visual with
          voiceover, and push it live across X, Instagram, and TikTok.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-2.5">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">{posts.length} posts</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#161c28] px-4 py-2.5">
            <XIcon className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-medium text-white">Auto-posts to X</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-2.5">
            <ImageIcon className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">AI-generated visuals</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-2.5">
            <Mic className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">ElevenLabs voiceover</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <SocialPulseStatsV2
        summary={summary}
        posts={posts}
        tweetMetrics={tweetMetrics}
        igMetrics={igMetrics}
        tiktokMetrics={tiktokMetrics}
      />

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#161c28] py-20 text-center">
          <div className="mb-4 text-5xl">⚡</div>
          <h2 className="mb-2 text-lg font-bold text-white">First v2 post coming soon</h2>
          <p className="text-sm text-gray-500">
            Trigger <code className="text-purple-400">/api/generate-post-v2</code> to create the first post.
          </p>
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
              <SocialPostCardV2
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
                  <SocialPostCardV2
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

      {/* How it works — v2 */}
      <section className="mt-16 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8">
        <h2 className="mb-6 text-xl font-bold text-white">How v2 works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "01", title: "Scan 50+ feeds", desc: "Claude picks the most electrifying AI story from the last 24 hours.", color: "text-purple-400" },
            { step: "02", title: "AI visual", desc: "Flux generates a unique 1200×628 image — no two posts share a template.", color: "text-pink-400" },
            { step: "03", title: "Voiced & scored", desc: "ElevenLabs narrates the caption. Runway animates the image into a 10s TikTok video.", color: "text-blue-400" },
            { step: "04", title: "Multi-platform", desc: "AI image → X & Instagram. Video with voiceover → TikTok.", color: "text-emerald-400" },
          ].map((item) => (
            <div key={item.step}>
              <div className={`mb-2 text-xs font-bold tracking-widest ${item.color}`}>{item.step}</div>
              <div className="mb-1 font-semibold text-white">{item.title}</div>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compare link */}
      <div className="mt-8 text-center">
        <Link href="/social-pulse/v1"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#161c28] px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors">
          Compare with v1 →
        </Link>
      </div>
    </div>
  );
}
