/**
 * Seeds 10 sample Social Pulse posts into Upstash Redis.
 * Run once: node scripts/seed_social_posts.mjs
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Parse .env.local manually (no dotenv dependency needed)
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.local may not exist
}

const POSTS_KEY = "ai_executive:social_posts";

const THEMES = ["pulse", "glitch", "neon", "matrix", "fire", "cosmic", "viral", "breaking", "pulse", "neon"];

const SEED_POSTS = [
  {
    caption: "OpenAI just quietly killed GPT-4 for new users. The era of GPT-4o is official — and it's not looking back. 🔥 #OpenAI #GPT4o #AI",
    newsTitle: "OpenAI deprecates GPT-4 access for new API users, moves all traffic to GPT-4o",
    newsSource: "OpenAI Blog",
    newsLink: "https://openai.com/blog",
    daysAgo: 0,
  },
  {
    caption: "Claude just hit 100 million users. Anthropic went from zero to the fastest-growing AI in history. 🚀 #Claude #Anthropic #AI",
    newsTitle: "Anthropic announces Claude crosses 100M monthly active users",
    newsSource: "Anthropic",
    newsLink: "https://anthropic.com",
    daysAgo: 1,
  },
  {
    caption: "Google's Gemini 2.5 Pro now reads 1 MILLION tokens in a single context window. That's every Shakespeare play. Twice. 🤖 #Gemini #Google #LLM",
    newsTitle: "Gemini 2.5 Pro reaches 1M token context window in public release",
    newsSource: "Google DeepMind",
    newsLink: "https://deepmind.google",
    daysAgo: 2,
  },
  {
    caption: "Cursor just hit 5 million users. It took GitHub Copilot 2 years to get there. Cursor did it in 8 months. ⚡ #Cursor #AICode #Developer",
    newsTitle: "Cursor reaches 5M users — fastest-growing developer tool in history",
    newsSource: "TechCrunch",
    newsLink: "https://techcrunch.com",
    daysAgo: 3,
  },
  {
    caption: "Meta AI is now bigger than ChatGPT by user count. 500M people. Hidden in plain sight. 💥 #MetaAI #Llama #AI",
    newsTitle: "Meta AI surpasses 500M monthly users across WhatsApp, Instagram and Facebook",
    newsSource: "The Verge",
    newsLink: "https://theverge.com",
    daysAgo: 4,
  },
  {
    caption: "ElevenLabs v3 can clone any voice in 3 seconds. You can't tell the difference. This is either incredible or terrifying. 🌌 #ElevenLabs #VoiceAI #AI",
    newsTitle: "ElevenLabs launches v3 voice model with 3-second cloning and zero-shot synthesis",
    newsSource: "VentureBeat",
    newsLink: "https://venturebeat.com",
    daysAgo: 5,
  },
  {
    caption: "DeepSeek is now running on a $6M cluster what OpenAI spent $100M to train. The efficiency gap is closing FAST. 📢 #DeepSeek #AI #LLM",
    newsTitle: "DeepSeek R2 training cost analysis reveals 94% efficiency gain over GPT-4",
    newsSource: "Ars Technica",
    newsLink: "https://arstechnica.com",
    daysAgo: 6,
  },
  {
    caption: "Grok 3 just beat GPT-4o on MMLU. Elon's AI is no longer a joke. 🔔 #Grok #xAI #AIBenchmark",
    newsTitle: "xAI releases Grok 3 benchmark results — outperforms GPT-4o on MMLU by 4 points",
    newsSource: "xAI",
    newsLink: "https://x.ai",
    daysAgo: 7,
  },
  {
    caption: "Perplexity just hit 100M users without a single dollar spent on ads. Pure product growth. Rare. ⚡ #Perplexity #AI #SearchAI",
    newsTitle: "Perplexity AI announces 100M monthly active users, zero paid acquisition",
    newsSource: "Wired",
    newsLink: "https://wired.com",
    daysAgo: 8,
  },
  {
    caption: "Runway Gen-4 just made Hollywood-quality video generation a $12/month subscription. The studios are scared. 🔥 #Runway #AIVideo #GenerativeAI",
    newsTitle: "Runway launches Gen-4 — cinematic video generation at consumer pricing",
    newsSource: "MIT Technology Review",
    newsLink: "https://technologyreview.com",
    daysAgo: 9,
  },
];

async function redisRequest(method, path, body) {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

async function seed() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error("❌  Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in .env.local");
    process.exit(1);
  }

  console.log("Seeding 10 Social Pulse posts...\n");

  const now = new Date();

  for (let i = 0; i < SEED_POSTS.length; i++) {
    const p = SEED_POSTS[i];
    const postDate = new Date(now);
    postDate.setDate(postDate.getDate() - p.daysAgo);
    postDate.setHours(16, 55, 0, 0);

    const post = {
      id: `seed-${postDate.toISOString().slice(0, 10)}-${i}`,
      date: postDate.toISOString().slice(0, 10),
      caption: p.caption,
      newsTitle: p.newsTitle,
      newsSource: p.newsSource,
      newsLink: p.newsLink,
      tweetId: undefined,
      tweetUrl: undefined,
      visualTheme: THEMES[i],
      postedAt: postDate.toISOString(),
    };

    // LPUSH so newest is index 0
    const result = await redisRequest("POST", `/lpush/${encodeURIComponent(POSTS_KEY)}`, [
      JSON.stringify(post),
    ]);
    console.log(`  ✓ [${THEMES[i]}] ${p.caption.slice(0, 60)}...`);
    if (result.error) {
      console.error("    Redis error:", result.error);
    }
  }

  // Trim to 90
  await redisRequest("POST", `/ltrim/${encodeURIComponent(POSTS_KEY)}/0/89`);

  console.log("\n✅  Done — visit http://localhost:4312/social-pulse");
}

seed().catch(console.error);
