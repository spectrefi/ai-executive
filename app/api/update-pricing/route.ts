import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { API_MODELS } from "@/lib/data/api-pricing";
import { savePricingOverrides, type PricingOverrides } from "@/lib/pricing-store";

export const runtime = "nodejs";
export const maxDuration = 120;

function auth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(secret ?? "");
  const b = Buffer.from(provided);
  return !!secret && a.length === b.length && timingSafeEqual(a, b);
}

const PRICING_PAGES: Record<string, string> = {
  anthropic: "https://www.anthropic.com/pricing",
  openai: "https://openai.com/api/pricing/",
  google: "https://ai.google.dev/pricing",
  mistral: "https://mistral.ai/technology/#pricing",
  groq: "https://groq.com/pricing/",
  cohere: "https://cohere.com/pricing",
};

async function fetchPricingPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AIExecutive/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();
  // Strip tags, keep text content — Claude handles the structure
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 8000); // limit to 8k chars per page
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const today = new Date().toISOString().split("T")[0];

  // Fetch all pricing pages in parallel
  const pageResults = await Promise.allSettled(
    Object.entries(PRICING_PAGES).map(async ([provider, url]) => ({
      provider,
      text: await fetchPricingPage(url),
    }))
  );

  const pagesText = pageResults
    .filter((r): r is PromiseFulfilledResult<{ provider: string; text: string }> => r.status === "fulfilled")
    .map(({ value }) => `=== ${value.provider.toUpperCase()} ===\n${value.text}`)
    .join("\n\n");

  const modelList = API_MODELS.map((m) => `${m.id}: ${m.name} (${m.company})`).join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are updating AI API pricing data. Today is ${today}.

Here are the current models we track:
${modelList}

Here is pricing page content scraped from official sources:
${pagesText}

Return a JSON object mapping model IDs to their current pricing. Only include models where you found clear pricing data. Use this exact format:

{
  "model-id": {
    "inputPer1M": 3.00,
    "outputPer1M": 15.00,
    "cachedInputPer1M": 0.30,
    "contextK": 200,
    "lastVerified": "${today}",
    "source": "anthropic.com/pricing"
  }
}

Return ONLY the JSON object, no other text. If you cannot find pricing for a model, omit it.`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  let models: PricingOverrides["models"] = {};
  try {
    const jsonMatch = responseText.match(/\{[\s\S]+\}/);
    if (jsonMatch) {
      models = JSON.parse(jsonMatch[0]);
    }
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response" }, { status: 500 });
  }

  const overrides: PricingOverrides = { updatedAt: new Date().toISOString(), models };
  await savePricingOverrides(overrides);

  return NextResponse.json({ ok: true, updatedAt: overrides.updatedAt, modelsUpdated: Object.keys(models).length });
}
