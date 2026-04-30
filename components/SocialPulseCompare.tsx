"use client";

import { type PulseSummary } from "@/lib/post-analytics";
import { type SocialPost } from "@/lib/social-post-archive";
import { type TweetMetrics } from "@/lib/twitter-client";
import { type IgMetrics } from "@/lib/instagram-client";
import { type TikTokMetrics } from "@/lib/tiktok-client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Trophy, ImageIcon, Mic, Music } from "lucide-react";

// Cost per post (approximate)
const V1_COST = 0.11;
const V2_COST = 0.22;

const THEME_COLORS = {
  pulse: "#a855f7", glitch: "#00ff88", neon: "#00d4ff", matrix: "#00ff41",
  fire: "#ff6b00", cosmic: "#818cf8", viral: "#ff4466", breaking: "#ffd700",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function delta(v1: number, v2: number): { pct: number; label: string; up: boolean } {
  if (v1 === 0) return { pct: 0, label: "—", up: false };
  const pct = Math.round(((v2 - v1) / v1) * 100);
  return { pct, label: `${pct >= 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

function DeltaBadge({ v1, v2 }: { v1: number; v2: number }) {
  const d = delta(v1, v2);
  if (d.label === "—") return <span className="text-xs text-gray-600">—</span>;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${d.up ? "text-emerald-400" : "text-red-400"}`}>
      {d.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {d.label}
    </span>
  );
}

function WinnerBadge({ v1Val, v2Val, lowerIsBetter = false }: { v1Val: number; v2Val: number; lowerIsBetter?: boolean }) {
  if (v1Val === 0 && v2Val === 0) return null;
  const v2Wins = lowerIsBetter ? v2Val < v1Val : v2Val > v1Val;
  const tied = v1Val === v2Val;
  if (tied) return <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400 flex items-center gap-1"><Minus className="h-2.5 w-2.5" /> Tied</span>;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold flex items-center gap-1 ${v2Wins ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-white/10 text-gray-300 border border-white/10"}`}>
      <Trophy className="h-2.5 w-2.5" /> {v2Wins ? "v2 wins" : "v1 wins"}
    </span>
  );
}

interface MetricRowProps {
  label: string;
  v1Val: number;
  v2Val: number;
  format?: (n: number) => string;
  lowerIsBetter?: boolean;
}

function MetricRow({ label, v1Val, v2Val, format = fmt, lowerIsBetter = false }: MetricRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-300 tabular-nums w-20 text-right">{v1Val > 0 ? format(v1Val) : "—"}</span>
      <span className="text-sm font-bold text-white tabular-nums w-20 text-right">{v2Val > 0 ? format(v2Val) : "—"}</span>
      <div className="flex items-center gap-2 w-36 justify-end">
        <DeltaBadge v1={v1Val} v2={v2Val} />
        <WinnerBadge v1Val={v1Val} v2Val={v2Val} lowerIsBetter={lowerIsBetter} />
      </div>
    </div>
  );
}

interface Props {
  v1Posts: SocialPost[];
  v2Posts: SocialPost[];
  v1Summary: PulseSummary;
  v2Summary: PulseSummary;
  tweetMetrics: Record<string, TweetMetrics>;
  igMetrics: Record<string, IgMetrics>;
  tiktokMetrics: Record<string, TikTokMetrics>;
}

export default function SocialPulseCompare({ v1Posts, v2Posts, v1Summary, v2Summary, tweetMetrics, igMetrics, tiktokMetrics }: Props) {
  const hasV1 = v1Summary.postsWithData > 0;
  const hasV2 = v2Summary.postsWithData > 0;
  const hasAny = hasV1 || hasV2;

  // CPM (cost per 1000 impressions)
  const v1Cpm = v1Summary.totalImpressions > 0
    ? (V1_COST * v1Posts.length / (v1Summary.totalImpressions / 1000)) : 0;
  const v2Cpm = v2Summary.totalImpressions > 0
    ? (V2_COST * v2Posts.length / (v2Summary.totalImpressions / 1000)) : 0;

  // v2 adoption stats
  const v2WithAiImage = v2Posts.filter((p) => p.aiImageUrl).length;
  const v2WithVoiceover = v2Posts.filter((p) => p.hasVoiceover).length;
  const v2WithMusic = v2Posts.filter((p) => p.hasMusic).length;

  // Side-by-side bar chart: avg impressions by theme (both versions)
  const allThemes = Array.from(new Set([
    ...v1Summary.byTheme.map((t) => t.theme),
    ...v2Summary.byTheme.map((t) => t.theme),
  ]));

  const themeCompareData = allThemes.map((theme) => {
    const v1T = v1Summary.byTheme.find((t) => t.theme === theme);
    const v2T = v2Summary.byTheme.find((t) => t.theme === theme);
    return {
      name: theme,
      v1: v1T?.avgImpressions ?? 0,
      v2: v2T?.avgImpressions ?? 0,
    };
  });

  // Day-of-week comparison
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dowCompareData = allDays.map((day) => {
    const v1D = v1Summary.byDayOfWeek.find((d) => d.day === day);
    const v2D = v2Summary.byDayOfWeek.find((d) => d.day === day);
    return { name: day, v1: v1D?.avgImpressions ?? 0, v2: v2D?.avgImpressions ?? 0 };
  });

  // Radar chart — normalise each metric 0–100
  const radarMetrics = [
    { label: "Impressions", v1: v1Summary.totalImpressions, v2: v2Summary.totalImpressions },
    { label: "Engagement", v1: v1Summary.avgEngagementRate, v2: v2Summary.avgEngagementRate },
    { label: "IG Reach", v1: v1Summary.totalIgReach, v2: v2Summary.totalIgReach },
    { label: "TikTok Views", v1: v1Summary.totalTikTokViews, v2: v2Summary.totalTikTokViews },
    { label: "Link Clicks", v1: v1Summary.totalUrlClicks, v2: v2Summary.totalUrlClicks },
  ];
  const radarData = radarMetrics.map(({ label, v1, v2 }) => {
    const max = Math.max(v1, v2, 1);
    return { label, v1: Math.round((v1 / max) * 100), v2: Math.round((v2 / max) * 100) };
  });

  // Per-post date comparison table (match by date)
  const dateMap: Record<string, { v1?: SocialPost; v2?: SocialPost }> = {};
  for (const p of v1Posts) {
    if (!dateMap[p.date]) dateMap[p.date] = {};
    dateMap[p.date].v1 = p;
  }
  for (const p of v2Posts) {
    if (!dateMap[p.date]) dateMap[p.date] = {};
    dateMap[p.date].v2 = p;
  }
  const dateRows = Object.entries(dateMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 20);

  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.1] bg-[#161c28] py-20 text-center">
        <div className="mb-4 text-5xl">📊</div>
        <h2 className="text-lg font-bold text-white mb-2">No data yet</h2>
        <p className="text-sm text-gray-500">Run both pipelines to populate this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Headline scoreboard */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#161c28] p-6">
        <div className="grid grid-cols-3 gap-0 text-center mb-6">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">v1 — Template</div>
            <div className="text-3xl font-extrabold text-gray-300">{fmt(v1Summary.avgImpressionsPerPost)}</div>
            <div className="text-xs text-gray-600 mt-1">avg impressions/post</div>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-gray-500">vs</div>
          </div>
          <div>
            <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">v2 — AI Enhanced</div>
            <div className="text-3xl font-extrabold text-white">{fmt(v2Summary.avgImpressionsPerPost)}</div>
            <div className="text-xs text-gray-600 mt-1">avg impressions/post</div>
          </div>
        </div>
        <div className="flex justify-center">
          <DeltaBadge v1={v1Summary.avgImpressionsPerPost} v2={v2Summary.avgImpressionsPerPost} />
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-1">
        <span className="text-xs text-gray-600 uppercase tracking-wider">Metric</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider w-20 text-right">v1</span>
        <span className="text-xs text-purple-400 uppercase tracking-wider w-20 text-right">v2</span>
        <span className="text-xs text-gray-600 uppercase tracking-wider w-36 text-right">Delta</span>
      </div>

      {/* X metrics */}
      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-sky-400">X / Twitter</div>
        <MetricRow label="Total impressions" v1Val={v1Summary.totalImpressions} v2Val={v2Summary.totalImpressions} />
        <MetricRow label="Avg impressions / post" v1Val={v1Summary.avgImpressionsPerPost} v2Val={v2Summary.avgImpressionsPerPost} />
        <MetricRow label="Total likes" v1Val={v1Summary.totalLikes} v2Val={v2Summary.totalLikes} />
        <MetricRow label="Total retweets" v1Val={v1Summary.totalRetweets} v2Val={v2Summary.totalRetweets} />
        <MetricRow label="Link clicks" v1Val={v1Summary.totalUrlClicks} v2Val={v2Summary.totalUrlClicks} />
        <MetricRow label="Avg engagement rate" v1Val={v1Summary.avgEngagementRate} v2Val={v2Summary.avgEngagementRate}
          format={(n) => `${n}%`} />
      </div>

      {/* Instagram metrics */}
      {(v1Summary.totalIgReach > 0 || v2Summary.totalIgReach > 0) && (
        <div className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-pink-400">📸 Instagram</div>
          <MetricRow label="Total reach" v1Val={v1Summary.totalIgReach} v2Val={v2Summary.totalIgReach} />
          <MetricRow label="Total likes" v1Val={v1Summary.totalIgLikes} v2Val={v2Summary.totalIgLikes} />
          <MetricRow label="Total saves" v1Val={v1Summary.totalIgSaved} v2Val={v2Summary.totalIgSaved} />
        </div>
      )}

      {/* TikTok metrics */}
      {(v1Summary.totalTikTokViews > 0 || v2Summary.totalTikTokViews > 0) && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">🎵 TikTok</div>
          <MetricRow label="Total views" v1Val={v1Summary.totalTikTokViews} v2Val={v2Summary.totalTikTokViews} />
          <MetricRow label="Total likes" v1Val={v1Summary.totalTikTokLikes} v2Val={v2Summary.totalTikTokLikes} />
          <MetricRow label="Total shares" v1Val={v1Summary.totalTikTokShares} v2Val={v2Summary.totalTikTokShares} />
        </div>
      )}

      {/* Cost efficiency */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-yellow-400">Cost efficiency</div>
        <MetricRow label="Cost per post" v1Val={V1_COST * 100} v2Val={V2_COST * 100}
          format={(n) => `$${(n / 100).toFixed(2)}`} lowerIsBetter />
        <MetricRow label="CPM (cost / 1K impressions)" v1Val={Math.round(v1Cpm * 1000)} v2Val={Math.round(v2Cpm * 1000)}
          format={(n) => `$${(n / 1000).toFixed(3)}`} lowerIsBetter />
        <MetricRow label="Posts published" v1Val={v1Posts.length} v2Val={v2Posts.length}
          format={(n) => n.toString()} />
      </div>

      {/* v2 feature adoption */}
      {v2Posts.length > 0 && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-purple-400">v2 feature adoption</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: <ImageIcon className="h-4 w-4" />, label: "AI Image", count: v2WithAiImage, color: "text-purple-300" },
              { icon: <Mic className="h-4 w-4" />, label: "Voiceover", count: v2WithVoiceover, color: "text-blue-300" },
              { icon: <Music className="h-4 w-4" />, label: "Music", count: v2WithMusic, color: "text-emerald-300" },
            ].map(({ icon, label, count, color }) => (
              <div key={label} className="rounded-xl border border-white/[0.07] bg-[#0e1117] p-4">
                <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
                <div className="text-xl font-bold text-white">{count}<span className="text-sm text-gray-600">/{v2Posts.length}</span></div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500/60"
                    style={{ width: `${v2Posts.length > 0 ? (count / v2Posts.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts: theme and day-of-week side by side */}
      {themeCompareData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-[#161c28] p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Avg impressions by theme</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={themeCompareData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0e1117", border: "1px solid #ffffff11", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#fff" }} itemStyle={{ color: "#9ca3af" }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                <Bar dataKey="v1" name="v1" fill="#4b5563" radius={[3, 3, 0, 0]} />
                <Bar dataKey="v2" name="v2" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#161c28] p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Avg impressions by day</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dowCompareData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0e1117", border: "1px solid #ffffff11", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#fff" }} itemStyle={{ color: "#9ca3af" }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                <Bar dataKey="v1" name="v1" fill="#4b5563" radius={[3, 3, 0, 0]} />
                <Bar dataKey="v2" name="v2" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Radar chart — multi-dimension comparison */}
      {hasV1 && hasV2 && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#161c28] p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Multi-dimension profile (normalised 0–100)
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff11" />
              <PolarAngleAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Radar name="v1" dataKey="v1" stroke="#4b5563" fill="#4b5563" fillOpacity={0.3} />
              <Radar name="v2" dataKey="v2" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
              <Tooltip contentStyle={{ background: "#0e1117", border: "1px solid #ffffff11", borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-post date table */}
      {dateRows.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#161c28] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Per-day post comparison</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-medium">v1 Impr.</th>
                  <th className="px-4 py-3 text-right text-gray-500 font-medium">v1 Eng%</th>
                  <th className="px-4 py-3 text-right text-purple-400 font-medium">v2 Impr.</th>
                  <th className="px-4 py-3 text-right text-purple-400 font-medium">v2 Eng%</th>
                  <th className="px-4 py-3 text-right text-gray-600 font-medium">Delta</th>
                  <th className="px-4 py-3 text-right text-gray-600 font-medium">Winner</th>
                </tr>
              </thead>
              <tbody>
                {dateRows.map(([date, { v1, v2 }]) => {
                  const v1TwM = v1?.tweetId ? tweetMetrics[v1.tweetId] : undefined;
                  const v2TwM = v2?.tweetId ? tweetMetrics[v2.tweetId] : undefined;
                  const v1Imp = v1TwM?.impressions ?? 0;
                  const v2Imp = v2TwM?.impressions ?? 0;
                  const v1Eng = v1TwM && v1TwM.impressions > 0
                    ? Math.round(((v1TwM.likes + v1TwM.retweets + v1TwM.replies) / v1TwM.impressions) * 1000) / 10 : 0;
                  const v2Eng = v2TwM && v2TwM.impressions > 0
                    ? Math.round(((v2TwM.likes + v2TwM.retweets + v2TwM.replies) / v2TwM.impressions) * 1000) / 10 : 0;
                  const d = delta(v1Imp, v2Imp);
                  return (
                    <tr key={date} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-gray-400 font-medium">{date}</td>
                      <td className="px-4 py-3 text-right text-gray-400 tabular-nums">{v1Imp > 0 ? fmt(v1Imp) : "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{v1Eng > 0 ? `${v1Eng}%` : "—"}</td>
                      <td className="px-4 py-3 text-right text-white font-semibold tabular-nums">{v2Imp > 0 ? fmt(v2Imp) : "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{v2Eng > 0 ? `${v2Eng}%` : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {d.label !== "—" && (
                          <span className={`font-semibold ${d.up ? "text-emerald-400" : "text-red-400"}`}>{d.label}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {v1Imp > 0 && v2Imp > 0 && (
                          <span className={`rounded-full px-2 py-0.5 font-semibold ${v2Imp >= v1Imp ? "bg-purple-500/20 text-purple-300" : "bg-white/10 text-gray-400"}`}>
                            {v2Imp >= v1Imp ? "v2" : "v1"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Last updated note */}
      <p className="text-center text-xs text-gray-700">
        Page refreshes every 60 seconds · data pulled live from X, Instagram, and TikTok APIs
      </p>
    </div>
  );
}
