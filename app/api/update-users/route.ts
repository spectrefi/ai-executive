import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { AI_TOOLS } from "@/lib/data/tools";
import { saveWeeklyUsersOverrides, type WeeklyUsersStore } from "@/lib/weekly-users-store";

export const runtime = "nodejs";
export const maxDuration = 120;

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(secret ?? "");
  const b = Buffer.from(provided);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today = new Date().toISOString().split("T")[0];

  const toolList = AI_TOOLS.map(
    (t) => `${t.id}: ${t.name} (${t.company}) — current stored: ${(t.weeklyUsers / 1e6).toFixed(1)}M`
  ).join("\n");

  // Use Claude with web search to research current user counts
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
    messages: [
      {
        role: "user",
        content: `You are updating weekly active user estimates for an AI tool rankings site. Today is ${today}.

Search for the most recent publicly disclosed user counts for each of these AI tools. Focus on:
- Official company announcements, blog posts, earnings calls
- Credible tech journalism (TechCrunch, The Verge, Reuters, Bloomberg)
- Conference presentations and investor disclosures

Tools to research:
${toolList}

For each tool you find data on, return:
- The best weekly active user estimate (convert monthly → weekly by dividing by 4 if needed)
- The source (publication + approximate date)
- Confidence: "high" (official company stat), "medium" (analyst estimate or converted from MAU), "low" (rough estimate)

Return a JSON object in this exact format:
{
  "tool-id": {
    "weeklyUsers": 400000000,
    "source": "OpenAI blog post, Feb 2026",
    "confidence": "high",
    "updatedAt": "${today}"
  }
}

Only include tools where you found credible recent data (within the last 6 months). Return ONLY the JSON object.`,
      },
    ],
  });

  // Extract the final text response (after any tool use)
  const finalText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  let tools: WeeklyUsersStore["tools"] = {};
  try {
    const jsonMatch = finalText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      tools = JSON.parse(jsonMatch[0]);
    }
  } catch {
    return NextResponse.json({ error: "Failed to parse response", raw: finalText.slice(0, 500) }, { status: 500 });
  }

  if (Object.keys(tools).length > 0) {
    await saveWeeklyUsersOverrides({ updatedAt: new Date().toISOString(), tools });
  }

  return NextResponse.json({
    ok: true,
    updatedAt: new Date().toISOString(),
    toolsUpdated: Object.keys(tools).length,
    tools: Object.fromEntries(
      Object.entries(tools).map(([id, v]) => [id, { users: v.weeklyUsers, source: v.source, confidence: v.confidence }])
    ),
  });
}
