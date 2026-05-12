import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { subscribeToTool } from "@/lib/tool-alerts-store";
import { AI_TOOLS } from "@/lib/data/tools";

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const VALID_TOOL_IDS = new Set(AI_TOOLS.map((t) => t.id));

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const allowed = await rateLimit(`tool-alert:${ip}`, 10, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const toolId = typeof body?.toolId === "string" ? body.toolId.trim() : "";

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!VALID_TOOL_IDS.has(toolId)) return NextResponse.json({ error: "Invalid tool" }, { status: 400 });

  await subscribeToTool(toolId, email);
  return NextResponse.json({ ok: true });
}
