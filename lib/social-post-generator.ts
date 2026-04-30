import Anthropic from "@anthropic-ai/sdk";
import { fetchLiveNews } from "@/lib/rss";
import { DAILY_NEWS, type NewsItem } from "@/lib/data/news";

const VISUAL_THEMES = [
  "pulse", "glitch", "neon", "matrix", "fire", "cosmic", "viral", "breaking",
];

export interface GeneratedPost {
  caption: string;
  newsItem: NewsItem;
  visualTheme: string;
}

export async function generateDailyPost(): Promise<GeneratedPost> {
  let news = await fetchLiveNews().catch(() => []);
  if (news.length < 5) news = DAILY_NEWS;

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = news.filter((item) => new Date(item.date) >= cutoff);
  const pool = recent.length >= 3 ? recent : news;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const newsContext = pool
    .slice(0, 12)
    .map((n, i) => `${i + 1}. [${n.impact.toUpperCase()}] ${n.title} — ${n.source}`)
    .join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system:
      "You are a viral AI industry social media writer. Your posts are punchy, provocative, and feel urgent. You write for Twitter/X. Never use quotation marks around the post. ACCURACY IS NON-NEGOTIABLE: never invent, round, or change any number, statistic, company name, or product name from the headline. If the headline says 5M users, write 5M users — not 8M, not 5M developers. Copy facts exactly as stated.",
    messages: [
      {
        role: "user",
        content: `Pick the single most electrifying story below and write a viral 1-2 line post (max 230 chars before hashtags). Make it feel like breaking news or a hot take. Add 2-3 punchy hashtags at the end.\n\nCRITICAL: every number and fact must match the headline exactly — do not paraphrase statistics.\n\nReturn ONLY:\nLine 1: the post text with hashtags\nLine 2: just the story number (e.g. "3")\n\nStories:\n${newsContext}`,
      },
    ],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text.trim();
  const lines = raw.split("\n").filter((l) => l.trim());
  const caption = lines[0].trim();
  const idx = parseInt(lines[lines.length - 1]) - 1;
  const pickedIdx = idx >= 0 && idx < pool.length ? idx : 0;
  const newsItem = pool[pickedIdx];

  const dayIndex = new Date().getDay();
  const visualTheme = VISUAL_THEMES[dayIndex % VISUAL_THEMES.length];

  return { caption, newsItem, visualTheme };
}
