import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSocialPosts } from "@/lib/social-post-archive";
import { AI_TOOLS } from "@/lib/data/tools";
import { POST_THEMES } from "@/lib/social-post-themes";
import { SITE_URL } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const EMAIL_SUBJECT_TITLE_MAX = 60;

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildEmailHtml(post: {
  caption: string;
  newsTitle: string;
  newsSource: string;
  newsLink?: string;
  date: string;
  visualTheme: string;
  tweetUrl?: string;
}): string {
  const top3 = AI_TOOLS.slice(0, 3);
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const theme = POST_THEMES[post.visualTheme as keyof typeof POST_THEMES] ?? POST_THEMES.pulse;

  const safeNewsLink = post.newsLink && isSafeUrl(post.newsLink) ? escapeHtmlAttr(post.newsLink) : null;
  const safeTweetUrl = post.tweetUrl && isSafeUrl(post.tweetUrl) ? escapeHtmlAttr(post.tweetUrl) : null;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e1117;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="text-align:center;padding:32px 0 24px">
      <a href="${SITE_URL}" style="text-decoration:none">
        <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px">AI Executive</span>
      </a>
      <p style="color:#475569;font-size:13px;margin:6px 0 0">${formattedDate} · Daily Intelligence Briefing</p>
    </div>

    <!-- Today's story -->
    <div style="background:${theme.bg};border:1px solid ${theme.accent}30;border-radius:16px;padding:28px;margin-bottom:24px">
      <div style="display:inline-block;background:${theme.accent}20;border:1px solid ${theme.accent}40;border-radius:20px;padding:4px 12px;margin-bottom:16px">
        <span style="color:${theme.accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Today's Story</span>
      </div>
      <h2 style="color:#f1f5f9;font-size:18px;font-weight:800;line-height:1.4;margin:0 0 12px">${post.newsTitle}</h2>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 20px">Source: ${post.newsSource}</p>
      <div style="background:#0e1117;border-left:3px solid ${theme.accent};border-radius:4px;padding:16px;margin-bottom:20px">
        <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;font-style:italic">${post.caption}</p>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        ${safeNewsLink ? `<a href="${safeNewsLink}" style="display:inline-block;background:${theme.accent};color:#000;font-weight:700;font-size:13px;padding:10px 20px;border-radius:8px;text-decoration:none">Read Full Story →</a>` : ""}
        ${safeTweetUrl ? `<a href="${safeTweetUrl}" style="display:inline-block;background:#1d9bf0;color:#fff;font-weight:700;font-size:13px;padding:10px 20px;border-radius:8px;text-decoration:none">View on X →</a>` : ""}
      </div>
    </div>

    <!-- Live Rankings -->
    <div style="background:#161c28;border:1px solid #ffffff0e;border-radius:16px;padding:24px;margin-bottom:24px">
      <h3 style="color:#fff;font-size:16px;font-weight:700;margin:0 0 16px">🏆 Today's Top 3 AI Tools</h3>
      ${top3.map((tool, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #ffffff08">
        <span style="color:#3b82f6;font-weight:800;font-size:14px;min-width:28px">#${i + 1}</span>
        <span style="font-size:20px">${tool.logo}</span>
        <div style="flex:1">
          <div style="color:#fff;font-weight:600;font-size:14px">${tool.name}</div>
          <div style="color:#64748b;font-size:12px">${tool.company}</div>
        </div>
        <div style="text-align:right">
          <div style="color:#3b82f6;font-weight:800;font-size:16px">${tool.scores.overall}</div>
          <div style="color:#475569;font-size:11px">overall</div>
        </div>
      </div>`).join("")}
      <div style="margin-top:16px;text-align:center">
        <a href="${SITE_URL}" style="color:#3b82f6;font-size:13px;text-decoration:none;font-weight:600">View full live leaderboard →</a>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#1e3a5f,#1e1b4b);border-radius:16px;margin-bottom:24px">
      <p style="color:#94a3b8;font-size:13px;margin:0 0 16px">Compare any two AI tools head-to-head — performance, pricing, and real-world fit.</p>
      <a href="${SITE_URL}/compare" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">Compare AI Tools →</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0 8px">
      <p style="color:#334155;font-size:12px;margin:0 0 8px">
        AI Executive · <a href="${SITE_URL}" style="color:#475569;text-decoration:none">aiexecutive.io</a>
      </p>
      <p style="color:#1e293b;font-size:11px;margin:0">
        You're receiving this because you subscribed at AI Executive.
        <a href="${SITE_URL}/unsubscribe" style="color:#334155;text-decoration:none"> Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const providedBuf = Buffer.from(provided);
  const secretBuf = Buffer.from(cronSecret ?? "");
  const authorized = !!cronSecret && providedBuf.length === secretBuf.length && timingSafeEqual(providedBuf, secretBuf);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 503 });
  }

  const posts = await getSocialPosts();
  const latest = posts[0];
  if (!latest) {
    return NextResponse.json({ error: "No posts available" }, { status: 404 });
  }

  const formattedDate = new Date(latest.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  const html = buildEmailHtml(latest);
  const titlePreview = latest.newsTitle.slice(0, EMAIL_SUBJECT_TITLE_MAX);
  const subjectSuffix = latest.newsTitle.length > EMAIL_SUBJECT_TITLE_MAX ? "…" : "";

  const createRes = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      audience_id: audienceId,
      from: "AI Executive <hello@aiexecutive.io>",
      subject: `AI Briefing ${formattedDate}: ${titlePreview}${subjectSuffix}`,
      html,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    console.error("Resend broadcast create failed:", err);
    return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
  }

  const { id: broadcastId } = await createRes.json() as { id: string };

  const sendRes = await fetch(`https://api.resend.com/broadcasts/${broadcastId}/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });

  if (!sendRes.ok) {
    const err = await sendRes.json().catch(() => ({}));
    console.error("Resend broadcast send failed:", err);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, broadcastId, post: latest.id });
}
