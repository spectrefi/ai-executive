import { NextRequest, NextResponse } from "next/server";
import { recordVote } from "@/lib/vote-store";

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

    await recordVote(articleId, vote, source);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
