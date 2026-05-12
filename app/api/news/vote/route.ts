import { NextRequest, NextResponse } from "next/server";
import { recordVote } from "@/lib/vote-store";
import { RSS_FEEDS_META } from "@/lib/rss-meta";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_SOURCES = new Set([
  ...RSS_FEEDS_META.map((f) => f.source),
  "Hacker News",
  "r/MachineLearning",
  "r/LocalLLaMA",
  "AI Industry",
  "AI Community",
]);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const allowed = await rateLimit(`news-vote:${ip}`, 30, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { articleId, vote, source } = await req.json();

    if (
      typeof articleId !== "string" ||
      (vote !== "up" && vote !== "down") ||
      typeof source !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!ALLOWED_SOURCES.has(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    await recordVote(articleId, vote, source);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
