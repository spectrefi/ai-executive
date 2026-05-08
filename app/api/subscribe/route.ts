import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiexecutive.io";

const WELCOME_HTML = `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0e1117;padding:32px;border-radius:12px">
  <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">Welcome to AI Executive 👋</h1>
  <p style="color:#94a3b8;margin-bottom:24px">You're now getting weekly AI tool rankings, benchmark updates, and what's actually moving in the market.</p>
  <a href="${SITE_URL}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin-bottom:24px">View Live Rankings →</a>
  <hr style="border:none;border-top:1px solid #1e2640;margin:24px 0"/>
  <p style="font-size:13px;color:#475569">Every week: which AI tools are rising, which are falling, and why it matters. Unsubscribe any time.</p>
</div>
`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    await Promise.allSettled([
      // Add to audience list
      fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email, unsubscribed: false, audience_id: process.env.RESEND_AUDIENCE_ID ?? "" }),
      }),
      // Send welcome email
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "AI Executive <hello@aiexecutive.io>",
          to: [email],
          subject: "You're in — weekly AI rankings incoming",
          html: WELCOME_HTML,
        }),
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
