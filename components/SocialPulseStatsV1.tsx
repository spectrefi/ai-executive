"use client";

import { type PulseSummary, insightText } from "@/lib/post-analytics";
import { type SocialPost } from "@/lib/social-post-archive";
import { type TweetMetrics } from "@/lib/twitter-client";
import { type IgMetrics } from "@/lib/instagram-client";
import { type TikTokMetrics } from "@/lib/tiktok-client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Eye, Heart, Repeat2, MousePointerClick, TrendingUp } from "lucide-react";

const THEME_COLORS: Record<string, string> = {
  pulse: "#a855f7", glitch: "#00ff88", neon: "#00d4ff", matrix: "#00ff41",
  fire: "#ff6b00", cosmic: "#818cf8", viral: "#ff4466", breaking: "#ffd700",
};

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function StatCard({ icon, label, value, sub, color = "text-white" }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0e1117] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
        {icon}{label}
      </div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-600">{sub}</div>}
    </div>
  );
}

interface Props {
  summary: PulseSummary;
  posts: SocialPost[];
  tweetMetrics: Record<string, TweetMetrics>;
  igMetrics: Record<string, IgMetrics>;
  tiktokMetrics: Record<string, TikTokMetrics>;
}

export default function SocialPulseStats({ summary, posts, tweetMetrics: _tw, igMetrics: _ig, tiktokMetrics: _tt }: Props) {
  const hasData = summary.postsWithData > 0;

  const impressionData = summary.byTheme.map((t) => ({
    name: `${t.emoji} ${t.theme}`,
    value: t.avgImpressions,
    color: THEME_COLORS[t.theme] ?? "#6366f1",
  }));

  const engData = summary.byTheme.map((t) => ({
    name: `${t.emoji} ${t.theme}`,
    value: t.engagementRate,
    color: THEME_COLORS[t.theme] ?? "#6366f1",
  }));

  const topPost = summary.topPostId ? posts.find((p) => p.id === summary.topPostId) : null;

  return (
    <div className="mb-10 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#110a1f] to-[#0e1117] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Performance & Strategy
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {posts.length} posts · live data from X
            {hasData ? ` · ${summary.postsWithData} with metrics` : ""}
          </p>
        </div>
        {!hasData && (
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
            Awaiting X data
          </span>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Eye className="h-3.5 w-3.5" />}
          label="Total Impressions"
          value={hasData ? fmt(summary.totalImpressions) : "—"}
          color="text-purple-300"
        />
        <StatCard
          icon={<Heart className="h-3.5 w-3.5 text-pink-400" />}
          label="Total Likes"
          value={hasData ? fmt(summary.totalLikes) : "—"}
          color="text-pink-300"
        />
        <StatCard
          icon={<Repeat2 className="h-3.5 w-3.5 text-emerald-400" />}
          label="Retweets"
          value={hasData ? fmt(summary.totalRetweets) : "—"}
          color="text-emerald-300"
        />
        <StatCard
          icon={<MousePointerClick className="h-3.5 w-3.5 text-blue-400" />}
          label="Link Clicks"
          value={hasData ? fmt(summary.totalUrlClicks) : "—"}
          sub="from X posts"
          color="text-blue-300"
        />
      </div>

      {/* IG + TikTok totals */}
      {hasData && (summary.totalIgReach > 0 || summary.totalTikTokViews > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {summary.totalIgReach > 0 && (
            <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-pink-400">📸 Instagram</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><div className="text-lg font-bold text-white">{fmt(summary.totalIgReach)}</div><div className="text-xs text-gray-500">Reach</div></div>
                <div><div className="text-lg font-bold text-white">{fmt(summary.totalIgLikes)}</div><div className="text-xs text-gray-500">Likes</div></div>
                <div><div className="text-lg font-bold text-white">{fmt(summary.totalIgSaved)}</div><div className="text-xs text-gray-500">Saved</div></div>
              </div>
            </div>
          )}
          {summary.totalTikTokViews > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">🎵 TikTok</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><div className="text-lg font-bold text-white">{fmt(summary.totalTikTokViews)}</div><div className="text-xs text-gray-500">Views</div></div>
                <div><div className="text-lg font-bold text-white">{fmt(summary.totalTikTokLikes)}</div><div className="text-xs text-gray-500">Likes</div></div>
                <div><div className="text-lg font-bold text-white">{fmt(summary.totalTikTokShares)}</div><div className="text-xs text-gray-500">Shares</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Secondary metrics */}
      {hasData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.07] bg-[#0e1117] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg impressions / post</div>
            <div className="text-xl font-bold text-white">{fmt(summary.avgImpressionsPerPost)}</div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#0e1117] p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg engagement rate</div>
            <div className="text-xl font-bold text-yellow-300">{summary.avgEngagementRate}%</div>
          </div>
        </div>
      )}

      {/* Charts */}
      {hasData && impressionData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Avg impressions by theme
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={impressionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#161c28", border: "1px solid #ffffff11", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#9ca3af" }}
                />
                <Bar dataKey="value" name="Impressions" radius={[4, 4, 0, 0]}>
                  {impressionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Engagement rate by theme (%)
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={engData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#161c28", border: "1px solid #ffffff11", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#9ca3af" }}
                  formatter={(v) => [`${v}%`, "Engagement"]}
                />
                <Bar dataKey="value" name="Engagement %" radius={[4, 4, 0, 0]}>
                  {engData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Theme leaderboard */}
      {hasData && summary.byTheme.length > 0 && (
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Theme ranking · by avg impressions
          </div>
          <div className="space-y-2">
            {summary.byTheme.map((t, i) => {
              const maxAvg = summary.byTheme[0].avgImpressions || 1;
              const pct = Math.round((t.avgImpressions / maxAvg) * 100);
              const color = THEME_COLORS[t.theme] ?? "#6366f1";
              return (
                <div key={t.theme} className="flex items-center gap-3">
                  <span className="w-4 text-xs text-gray-600 text-right">{i + 1}</span>
                  <span className="w-24 text-xs text-gray-300 flex items-center gap-1 flex-shrink-0">
                    {t.emoji} {t.theme}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="w-36 text-right text-xs text-gray-400 flex-shrink-0">
                    {fmt(t.avgImpressions)} avg · {t.engagementRate}% eng
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategy insight */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0e1117] p-4">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-purple-400">
          Strategy insight
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{insightText(summary)}</p>
        {topPost && hasData && (
          <p className="mt-2 text-xs text-gray-500">
            Top post: &ldquo;{topPost.caption.slice(0, 80)}…&rdquo; —{" "}
            <span className="text-white">{fmt(summary.topPostImpressions)} impressions</span>
          </p>
        )}
      </div>
    </div>
  );
}
