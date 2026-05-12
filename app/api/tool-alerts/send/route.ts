import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { AI_TOOLS } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/constants";
import { getLastRankingsSnapshot } from "@/lib/rankings-store";
import { getToolSubscribers } from "@/lib/tool-alerts-store";

export const runtime = "nodejs";
export const maxDuration = 60;

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(secret ?? "");
  const b = Buffer.from(provided);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Resend not configured" }, { status: 503 });

  const last = await getLastRankingsSnapshot();
  if (!last) return NextResponse.json({ ok: true, sent: 0, reason: "no snapshot yet" });

  let sent = 0;
  const results: string[] = [];

  for (const tool of AI_TOOLS) {
    const prev = last.ranks[tool.id];
    if (!prev) continue;
    const rankChange = prev.rank - tool.currentRank;
    if (rankChange === 0) continue;

    const subscribers = await getToolSubscribers(tool.id);
    if (subscribers.length === 0) continue;

    const dir = rankChange > 0 ? "risen" : "fallen";
    const arrow = rankChange > 0 ? "📈" : "📉";
    const subject = `${arrow} ${tool.name} has ${dir} to #${tool.currentRank}`;
    const html = buildAlertEmail(tool, prev.rank, rankChange);

    await Promise.allSettled(
      subscribers.map((email) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "AI Executive <hello@aiexecutive.io>",
            to: [email],
            subject,
            html,
          }),
        })
      )
    );

    sent += subscribers.length;
    results.push(`${tool.name}: ${rankChange > 0 ? "+" : ""}${rankChange} (${subscribers.length} notified)`);
  }

  return NextResponse.json({ ok: true, sent, results });
}

function buildAlertEmail(
  tool: (typeof AI_TOOLS)[0],
  prevRank: number,
  rankChange: number
): string {
  const up = rankChange > 0;
  const accentColor = up ? "#34d399" : "#f87171";
  const arrow = up ? "📈" : "📉";
  const dir = up ? "risen" : "fallen";
  const changeLabel = up ? `+${rankChange}` : `${rankChange}`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e1117;font-family:system-ui,-apple-system,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="text-align:center;padding:24px 0 20px">
    <span style="font-size:20px;font-weight:900;color:#fff">AI Executive</span>
    <p style="color:#475569;font-size:12px;margin:4px 0 0">Rank Alert</p>
  </div>
  <div style="background:#161c28;border:1px solid ${accentColor}30;border-radius:16px;padding:28px;margin-bottom:20px;text-align:center">
    <div style="font-size:48px;margin-bottom:12px">${tool.logo}</div>
    <h2 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 8px">${tool.name} has ${dir}</h2>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 20px">
      ${arrow} Moved from <strong style="color:#fff">#${prevRank}</strong> to <strong style="color:${accentColor}">#${tool.currentRank}</strong>
      &nbsp;·&nbsp; ${changeLabel} spots this week
    </p>
    <div style="display:inline-flex;gap:12px">
      <a href="${SITE_URL}/tools/${tool.id}"
        style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
        View ${tool.name} →
      </a>
    </div>
  </div>
  <div style="text-align:center;padding:8px 0">
    <a href="${SITE_URL}" style="color:#3b82f6;font-size:13px;text-decoration:none;font-weight:600">
      See full AI rankings →
    </a>
  </div>
  <div style="text-align:center;padding:16px 0 8px">
    <p style="color:#1e293b;font-size:11px;margin:0">
      AI Executive ·
      <a href="${SITE_URL}/unsubscribe" style="color:#334155;text-decoration:none">Unsubscribe from rank alerts</a>
    </p>
  </div>
</div></body></html>`;
}
