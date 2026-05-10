import { NextRequest, NextResponse } from "next/server";
import { recordVote } from "@/lib/vote-store";

const MAX_SOURCE_LENGTH = 100;
const SOURCE_RE = /^[\w\s.,'"-]{1,100}$/;

export async function POST(req: NextRequest) {
  try {
    const { articleId, vote, source } = await req.json();

    if (
      typeof articleId !== "string" ||
      (vote !== "up" && vote !== "down") ||
      typeof source !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (source.length > MAX_SOURCE_LENGTH || !SOURCE_RE.test(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    await recordVote(articleId, vote, source);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
