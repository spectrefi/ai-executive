import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Resend integration — active when RESEND_API_KEY env var is set
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          audience_id: process.env.RESEND_AUDIENCE_ID ?? "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Resend error", err);
      }
    } catch (e) {
      console.error("Resend fetch failed", e);
    }
  }

  return NextResponse.json({ ok: true });
}
