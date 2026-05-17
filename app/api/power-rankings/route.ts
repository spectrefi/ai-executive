import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { AI_TOOLS } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/constants";
import { postThread } from "@/lib/twitter-client";
import {
  getLastRankingsSnapshot,
  saveRankingsSnapshot,
  buildCurrentSnapshot,
  calcMovers,
} from "@/lib/rankings-store";
import { saveScoreSnapshot } from "@/lib/score-history-store";

export const runtime = "nodejs";
export const maxDuration = 60;

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(secret ?? "");
  const b = Buffer.from(provided);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}

function rankArrow(change: number): string {
  if (change > 0) return `↑${change}`;
  if (change < 0) return `↓${Math.abs(change)}`;
  return "→";
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sorted = [...AI_TOOLS].sort((a, b) => a.currentRank - b.currentRank);
  const last = await getLastRankingsSnapshot();
  const movers = calcMovers(sorted, last);

  const now = new Date();
  const weekLabel = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Tweet 1 — header
  const top5Lines = sorted.slice(0, 5).map((t) => {
    const prev = last?.ranks[t.id];
    const arrow = prev ? rankArrow(prev.rank - t.currentRank) : "";
    return `${t.currentRank}. ${t.logo} ${t.name} — ${t.scores.overall} ${arrow}`.trim();
  });

  const tweet1 = [
    `🏆 AI Power Rankings — ${weekLabel}`,
    "",
    ...top5Lines,
    "",
    `Full leaderboard → ${SITE_URL}`,
  ].join("\n");

  const tweets = [tweet1];

  // Tweet 2 — movers (only if we have last week's data)
  if (movers.length > 0) {
    const risers = movers.filter((m) => m.rankChange > 0).slice(0, 3);
    const fallers = movers.filter((m) => m.rankChange < 0).slice(0, 3);
    const lines: string[] = ["📊 This week's movers:", ""];
    if (risers.length) lines.push(...risers.map((m) => `📈 ${m.logo} ${m.name} +${m.rankChange} spots`));
    if (fallers.length) lines.push(...fallers.map((m) => `📉 ${m.logo} ${m.name} ${m.rankChange} spots`));
    if (lines.length > 2) tweets.push(lines.join("\n"));
  }

  // Tweet 3 — CTA
  tweets.push(
    [
      "Compare any two AI tools head-to-head:",
      `${SITE_URL}/compare`,
      "",
      "Build your AI stack:",
      `${SITE_URL}/my-stack`,
    ].join("\n")
  );

  // Post thread
  let threadUrl: string | null = null;
  if (process.env.TWITTER_APP_KEY && process.env.TWITTER_ACCESS_TOKEN) {
    try {
      const result = await postThread(tweets);
      threadUrl = result.firstUrl;
    } catch (e) {
      console.error("Power rankings thread failed:", e);
    }
  }

  // Send email to audience
  let emailSent = false;
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (apiKey && audienceId) {
    try {
      const html = buildPowerRankingsEmail(sorted.slice(0, 10), movers, weekLabel);
      const createRes = await fetch("https://api.resend.com/broadcasts", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          audience_id: audienceId,
          from: "AI Executive <hello@aiexecutive.io>",
          subject: `AI Power Rankings — ${weekLabel}`,
          html,
        }),
      });
      if (createRes.ok) {
        const { id } = await createRes.json() as { id: string };
        const sendRes = await fetch(`https://api.resend.com/broadcasts/${id}/send`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        });
        emailSent = sendRes.ok;
      }
    } catch (e) {
      console.error("Power rankings email failed:", e);
    }
  }

  // Save snapshot for next week's comparison + daily score history
  await Promise.all([
    saveRankingsSnapshot(buildCurrentSnapshot(sorted)),
    saveScoreSnapshot(sorted),
  ]);

  return NextResponse.json({ ok: true, threadUrl, emailSent, moversCount: movers.length });
}

function buildPowerRankingsEmail(
  top10: typeof AI_TOOLS,
  movers: Awaited<ReturnType<typeof calcMovers>>,
  weekLabel: string
): string {
  const scoreColor = (s: number) =>
    s >= 88 ? "#34d399" : s >= 75 ? "#60a5fa" : s >= 60 ? "#fbbf24" : "#f87171";

  const moverRows = movers.slice(0, 6).map((m) => {
    const dir = m.rankChange > 0 ? "↑" : "↓";
    const col = m.rankChange > 0 ? "#34d399" : "#f87171";
    return `<tr>
      <td style="padding:8px 0;font-size:20px;width:36px">${m.logo}</td>
      <td style="padding:8px 0;color:#e2e8f0;font-size:14px;font-weight:600">${m.name}</td>
      <td style="padding:8px 0;text-align:right;color:${col};font-weight:700;font-size:14px">${dir}${Math.abs(m.rankChange)}</td>
    </tr>`;
  }).join("");

  const rankRows = top10.map((t, i) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #ffffff08">
      <span style="color:#3b82f6;font-weight:800;font-size:13px;min-width:24px">#${i + 1}</span>
      <span style="font-size:18px">${t.logo}</span>
      <div style="flex:1">
        <div style="color:#fff;font-weight:600;font-size:14px">${t.name}</div>
        <div style="color:#64748b;font-size:11px">${t.company}</div>
      </div>
      <span style="color:${scoreColor(t.scores.overall)};font-weight:800;font-size:16px">${t.scores.overall}</span>
    </div>`).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e1117;font-family:system-ui,-apple-system,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:28px 0 20px">
    <span style="font-size:22px;font-weight:900;color:#fff">AI Executive</span>
    <p style="color:#475569;font-size:13px;margin:6px 0 0">Power Rankings · ${weekLabel}</p>
  </div>
  <div style="background:#161c28;border:1px solid #ffffff0e;border-radius:16px;padding:24px;margin-bottom:20px">
    <h2 style="color:#fff;font-size:18px;font-weight:800;margin:0 0 16px">🏆 This Week's Top 10</h2>
    ${rankRows}
    <div style="margin-top:16px;text-align:center">
      <a href="${SITE_URL}" style="color:#3b82f6;font-size:13px;text-decoration:none;font-weight:600">View full live leaderboard →</a>
    </div>
  </div>
  ${movers.length > 0 ? `
  <div style="background:#161c28;border:1px solid #ffffff0e;border-radius:16px;padding:24px;margin-bottom:20px">
    <h2 style="color:#fff;font-size:18px;font-weight:800;margin:0 0 16px">📊 Biggest Movers</h2>
    <table style="width:100%;border-collapse:collapse">${moverRows}</table>
  </div>` : ""}
  <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#1e3a5f,#1e1b4b);border-radius:16px;margin-bottom:20px">
    <p style="color:#94a3b8;font-size:13px;margin:0 0 14px">Show the world your AI stack</p>
    <a href="${SITE_URL}/my-stack" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">Build My Stack →</a>
  </div>
  <div style="text-align:center;padding:12px 0">
    <p style="color:#334155;font-size:12px;margin:0">AI Executive ·
      <a href="${SITE_URL}/unsubscribe" style="color:#334155;text-decoration:none">Unsubscribe</a>
    </p>
  </div>
</div></body></html>`;
}
