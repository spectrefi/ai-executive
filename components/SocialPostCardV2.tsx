"use client";

import { type SocialPost } from "@/lib/social-post-archive";
import { type TweetMetrics } from "@/lib/twitter-client";
import { type IgMetrics } from "@/lib/instagram-client";
import { type TikTokMetrics } from "@/lib/tiktok-client";
import { ExternalLink, X, Eye, Heart, Repeat2, MousePointerClick, Mic, Music, ImageIcon } from "lucide-react";
import Image from "next/image";

const THEME_STYLES: Record<string, { border: string; glow: string; accent: string; bg: string; emoji: string }> = {
  pulse:    { border: "#a855f7", glow: "#a855f722", accent: "#a855f7", bg: "#a855f711", emoji: "⚡" },
  glitch:   { border: "#00ff88", glow: "#00ff8822", accent: "#00ff88", bg: "#00ff8811", emoji: "🔥" },
  neon:     { border: "#00d4ff", glow: "#00d4ff22", accent: "#00d4ff", bg: "#00d4ff11", emoji: "🚀" },
  matrix:   { border: "#00ff41", glow: "#00ff4122", accent: "#00ff41", bg: "#00ff4111", emoji: "🤖" },
  fire:     { border: "#ff6b00", glow: "#ff6b0022", accent: "#ff6b00", bg: "#ff6b0011", emoji: "💥" },
  cosmic:   { border: "#818cf8", glow: "#818cf822", accent: "#818cf8", bg: "#818cf811", emoji: "🌌" },
  viral:    { border: "#ff4466", glow: "#ff446622", accent: "#ff4466", bg: "#ff446611", emoji: "📢" },
  breaking: { border: "#ffd700", glow: "#ffd70022", accent: "#ffd700", bg: "#ffd70011", emoji: "🔔" },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function FallbackVisual({ post }: { post: SocialPost }) {
  const t = THEME_STYLES[post.visualTheme] ?? THEME_STYLES.pulse;
  const body = post.caption.replace(/#\w+/g, "").trim();
  const tags = (post.caption.match(/#\w+/g) ?? []).join(" ");
  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, #0e1117 0%, ${t.bg} 100%)`, border: `1px solid ${t.border}44`, boxShadow: `0 0 32px ${t.glow}`, minHeight: 200, padding: "32px 28px" }}>
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${t.glow} 0%, transparent 70%)` }} />
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${t.border}, transparent)` }} />
      <div className="relative z-10 text-center space-y-3">
        <div className="text-5xl leading-none">{t.emoji}</div>
        <p className="text-white font-extrabold text-lg leading-snug tracking-tight">{body}</p>
        {tags && <p className="text-sm font-semibold" style={{ color: t.accent }}>{tags}</p>}
      </div>
    </div>
  );
}

interface Props {
  post: SocialPost;
  tweetMetrics?: TweetMetrics;
  igMetrics?: IgMetrics;
  tiktokMetrics?: TikTokMetrics;
}

export default function SocialPostCardV2({ post, tweetMetrics, igMetrics, tiktokMetrics }: Props) {
  const t = THEME_STYLES[post.visualTheme] ?? THEME_STYLES.pulse;
  const dateLabel = new Date(post.postedAt).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
  const isV2 = post.version === "v2";

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-[#161c28] overflow-hidden">

      {/* Visual — AI image if available, else themed template */}
      <div className="p-4">
        {isV2 && post.aiImageUrl ? (
          <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 200 }}>
            <Image
              src={post.aiImageUrl}
              alt={post.caption}
              width={1200}
              height={628}
              className="w-full h-auto object-cover rounded-2xl"
              style={{ boxShadow: `0 0 32px ${t.glow}` }}
            />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300 flex items-center gap-1 backdrop-blur-sm">
                <ImageIcon className="h-2.5 w-2.5" /> AI Image
              </span>
            </div>
          </div>
        ) : (
          <FallbackVisual post={post} />
        )}
      </div>

      <div className="px-5 pb-5 space-y-3">
        {/* Date + theme + v2 badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-gray-500">{dateLabel}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {isV2 && post.hasVoiceover && (
              <span className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1 text-blue-300 border border-blue-500/30 bg-blue-500/10">
                <Mic className="h-2.5 w-2.5" /> Voiceover
              </span>
            )}
            {isV2 && post.hasMusic && (
              <span className="rounded-full px-2 py-0.5 text-xs flex items-center gap-1 text-emerald-300 border border-emerald-500/30 bg-emerald-500/10">
                <Music className="h-2.5 w-2.5" /> Music
              </span>
            )}
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
              style={{ background: t.bg, color: t.accent, border: `1px solid ${t.border}44` }}>
              {t.emoji} {post.visualTheme}
            </span>
          </div>
        </div>

        {/* Platform metrics */}
        {(tweetMetrics || igMetrics || tiktokMetrics) && (
          <div className="space-y-2">
            {tweetMetrics && tweetMetrics.impressions > 0 && (
              <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                  <X className="h-3 w-3" /> X / Twitter
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: <Eye className="h-3 w-3" />, v: tweetMetrics.impressions },
                    { icon: <Heart className="h-3 w-3 text-pink-400" />, v: tweetMetrics.likes },
                    { icon: <Repeat2 className="h-3 w-3 text-emerald-400" />, v: tweetMetrics.retweets },
                    { icon: <MousePointerClick className="h-3 w-3 text-blue-400" />, v: tweetMetrics.urlClicks },
                  ].map(({ icon, v }, i) => (
                    <div key={i} className="text-center">
                      <div className="flex justify-center mb-0.5 text-gray-500">{icon}</div>
                      <div className="text-sm font-bold text-white">{fmt(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {igMetrics && igMetrics.impressions > 0 && (
              <div className="rounded-lg border border-pink-500/20 bg-pink-500/5 p-2.5">
                <div className="mb-1.5 text-xs font-semibold text-pink-400">📸 Instagram</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Reach", v: igMetrics.reach },
                    { label: "Likes", v: igMetrics.likes },
                    { label: "Comments", v: igMetrics.comments },
                    { label: "Saved", v: igMetrics.saved },
                  ].map(({ label, v }) => (
                    <div key={label} className="text-center">
                      <div className="text-sm font-bold text-white">{fmt(v)}</div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tiktokMetrics && tiktokMetrics.views > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <div className="mb-1.5 text-xs font-semibold text-white">🎵 TikTok</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Views", v: tiktokMetrics.views },
                    { label: "Likes", v: tiktokMetrics.likes },
                    { label: "Comments", v: tiktokMetrics.comments },
                    { label: "Shares", v: tiktokMetrics.shares },
                  ].map(({ label, v }) => (
                    <div key={label} className="text-center">
                      <div className="text-sm font-bold text-white">{fmt(v)}</div>
                      <div className="text-xs text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Source */}
        <div className="rounded-lg border border-white/[0.06] bg-[#0e1117] p-3">
          <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Source</div>
          <p className="text-sm text-gray-300 font-medium leading-snug">{post.newsTitle}</p>
          <p className="text-xs text-gray-600 mt-1">{post.newsSource}</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-2">
          {post.tweetUrl && (
            <a href={post.tweetUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
              style={{ background: t.bg, color: t.accent, border: `1px solid ${t.border}44` }}>
              <X className="h-3.5 w-3.5" /> X
            </a>
          )}
          {post.igUrl && (
            <a href={post.igUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-pink-300 border border-pink-500/30 bg-pink-500/10">
              📸 Instagram
            </a>
          )}
          {post.tiktokVideoId && (
            <a href={`https://www.tiktok.com/@your_handle/video/${post.tiktokVideoId}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white border border-white/10 bg-white/[0.05]">
              🎵 TikTok
            </a>
          )}
          {post.newsLink && (
            <a href={post.newsLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white border border-white/[0.07] hover:border-white/20 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Source
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
