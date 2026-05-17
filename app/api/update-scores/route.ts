import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { AI_TOOLS } from "@/lib/data/tools";
import { saveScoresOverrides, type ScoresOverrides } from "@/lib/scores-override-store";

export const runtime = "nodejs";
export const maxDuration = 120;

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(secret ?? "");
  const b = Buffer.from(provided);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}

const BENCHMARK_SOURCES = [
  "https://lmarena.ai/leaderboard",                           // LMSYS Chatbot Arena (formerly lmsys.org)
  "https://artificialanalysis.ai/models",                     // Artificial Analysis speed + quality
  "https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard", // HF Open LLM
];

async function fetchBenchmarkPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AIExecutive/1.0)" },
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 10000);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today = new Date().toISOString().split("T")[0];

  const pageResults = await Promise.allSettled(
    BENCHMARK_SOURCES.map(async (url) => ({ url, text: await fetchBenchmarkPage(url) }))
  );

  const benchmarkText = pageResults
    .filter((r): r is PromiseFulfilledResult<{ url: string; text: string }> => r.status === "fulfilled")
    .filter(({ value }) => value.text.length > 100)
    .map(({ value }) => `=== ${value.url} ===\n${value.text}`)
    .join("\n\n");

  const toolList = AI_TOOLS.map((t) => {
    const s = t.scores;
    return `${t.id}: ${t.name} (${t.company}) — current: overall=${s.overall}, reasoning=${s.reasoning}, coding=${s.coding}, writing=${s.writing}, speed=${s.speed}`;
  }).join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `You are updating AI tool benchmark scores for a rankings site. Today is ${today}.

Scores use a 0–100 scale where 100 = best in class. The scale is normalised — scores are relative to the current set of tracked tools, not absolute benchmarks.

Current tools and their stored scores:
${toolList}

Benchmark data from public sources:
${benchmarkText}

Based on the benchmark data, update scores for any tools where you have strong evidence of a change. Focus on:
- reasoning: LMSYS Arena Elo, MMLU scores
- coding: HumanEval pass@1, SWE-bench
- speed: tokens/sec from Artificial Analysis
- overall: weighted composite — only update if multiple dimensions changed

Return a JSON object. Only include tools with score changes. Use this format:

{
  "tool-id": {
    "overall": 88,
    "reasoning": 91,
    "coding": 87,
    "updatedAt": "${today}",
    "source": "lmarena.ai + artificialanalysis.ai"
  }
}

IMPORTANT:
- Be conservative. Only update scores when benchmark data clearly shows a meaningful change (>2 points).
- Do not fabricate scores. If the benchmark data is insufficient, return an empty object {}.
- Preserve the 0-100 relative scale.
Return ONLY the JSON object.`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  let tools: ScoresOverrides["tools"] = {};
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      tools = JSON.parse(jsonMatch[0]);
    }
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response" }, { status: 500 });
  }

  if (Object.keys(tools).length > 0) {
    const overrides: ScoresOverrides = { updatedAt: new Date().toISOString(), tools };
    await saveScoresOverrides(overrides);
  }

  return NextResponse.json({
    ok: true,
    updatedAt: new Date().toISOString(),
    toolsUpdated: Object.keys(tools).length,
    benchmarkSourcesFetched: pageResults.filter((r) => r.status === "fulfilled").length,
  });
}
