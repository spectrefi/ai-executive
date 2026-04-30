import { type NewsItem } from "@/lib/data/news";
import { getSourceWeights } from "@/lib/vote-store";
import { archiveArticles } from "@/lib/news-archive";
import { RSS_FEEDS_META, type FeedConfig } from "@/lib/rss-meta";

interface RssEntry {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

function stripHtml(raw: string): string {
  return raw
    // Decode entities FIRST so encoded tags like &lt;img&gt; become strippable
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    // Strip all HTML tags (including those that were entity-encoded above)
    .replace(/<[^>]+>/g, " ")
    // Collapse whitespace
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const cdata = cdataRe.exec(xml);
  if (cdata) return stripHtml(cdata[1]);
  const plain = plainRe.exec(xml);
  return plain ? stripHtml(plain[1]) : "";
}

function parseItems(xml: string): RssEntry[] {
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  const items: RssEntry[] = [];
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      link: extractTag(block, "link"),
      description: extractTag(block, "description").slice(0, 280),
      pubDate: extractTag(block, "pubDate"),
    });
  }
  return items;
}

const AI_KEYWORDS = [
  "artificial intelligence", " ai ", "ai-", "llm", "large language model",
  "chatgpt", "claude", "gemini", "openai", "anthropic", "deepmind", "mistral",
  "gpt-", "gpt4", "gpt3", "copilot", "machine learning", "deep learning",
  "neural network", "generative ai", "gen ai", "foundation model", "language model",
  "deepseek", "hugging face", "diffusion model", "multimodal", "ai model",
  "ai agent", "ai tool", "ai system", "ai startup", "ai company",
];

function isAiRelated(title: string, desc: string): boolean {
  const text = (title + " " + desc).toLowerCase();
  return AI_KEYWORDS.some((kw) => text.includes(kw));
}

function guessImpact(title: string): NewsItem["impact"] {
  const t = title.toLowerCase();
  if (t.includes("launch") || t.includes("release") || t.includes("raises") || t.includes("billion") || t.includes("breakthrough")) return "high";
  if (t.includes("update") || t.includes("new") || t.includes("million") || t.includes("partner")) return "medium";
  return "low";
}

function guessType(title: string): NewsItem["type"] {
  const t = title.toLowerCase();
  if (t.includes("pric") || t.includes("cost") || t.includes("subscri") || t.includes("free")) return "pricing";
  if (t.includes("benchmark") || t.includes("score") || t.includes("beats") || t.includes("surpass") || t.includes("eval")) return "benchmark";
  if (t.includes("launch") || t.includes("release") || t.includes("announc") || t.includes("introduc")) return "launch";
  if (t.includes("outage") || t.includes("down") || t.includes("breach") || t.includes("vulnerab")) return "outage";
  if (t.includes("research") || t.includes("study") || t.includes("paper") || t.includes("discover")) return "research";
  return "update";
}

const RSS_FEEDS = RSS_FEEDS_META;

// ── HackerNews: top AI stories with ≥100 points in last 48 hours ──────────────
async function fetchHNStories(): Promise<NewsItem[]> {
  try {
    const since = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000);
    const url =
      `https://hn.algolia.com/api/v1/search` +
      `?query=AI+LLM+OpenAI+Anthropic+Claude+Gemini+DeepSeek` +
      `&tags=story&numericFilters=points>100,created_at_i>${since}&hitsPerPage=10`;
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json() as { hits: Array<{
      objectID: string; title: string; url?: string;
      points: number; num_comments: number; created_at: string;
    }> };
    return (data.hits ?? []).map((hit, i) => ({
      id: `hn-${hit.objectID ?? i}`,
      title: hit.title,
      summary: `${hit.points} points · ${hit.num_comments} comments on Hacker News`,
      tool: "AI Industry",
      toolId: "",
      type: guessType(hit.title),
      date: hit.created_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
      impact: (hit.points > 300 ? "high" : hit.points > 150 ? "medium" : "low") as NewsItem["impact"],
      source: "Hacker News",
      link: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
    }));
  } catch {
    return [];
  }
}

// ── Reddit: top weekly posts from ML subreddits ──────────────────────────────
async function fetchRedditPosts(): Promise<NewsItem[]> {
  const subs = [
    { name: "MachineLearning", slots: 8 },
    { name: "LocalLLaMA",      slots: 5 },
  ];
  const results: NewsItem[] = [];
  await Promise.allSettled(
    subs.map(async ({ name, slots }) => {
      try {
        const res = await fetch(
          `https://www.reddit.com/r/${name}/top.json?t=week&limit=${slots}`,
          { headers: { "User-Agent": "AIExecutive/1.0" }, cache: "no-store", signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return;
        const data = await res.json() as { data: { children: Array<{ data: {
          id: string; title: string; selftext: string; score: number;
          num_comments: number; created_utc: number; permalink: string;
        } }> } };
        for (const { data: post } of data?.data?.children ?? []) {
          if (!post?.title || post.score < 50) continue;
          results.push({
            id: `reddit-${name}-${post.id}`,
            title: post.title,
            summary: post.selftext
              ? stripHtml(post.selftext).slice(0, 200)
              : `${post.score} upvotes · ${post.num_comments} comments`,
            tool: "AI Community",
            toolId: "",
            type: guessType(post.title),
            date: new Date(post.created_utc * 1000).toISOString().split("T")[0],
            impact: (post.score > 500 ? "high" : post.score > 200 ? "medium" : "low") as NewsItem["impact"],
            source: `r/${name}`,
            link: `https://www.reddit.com${post.permalink}`,
          });
        }
      } catch {
        // silent
      }
    })
  );
  return results;
}

let cache: { items: NewsItem[]; fetchedAt: number } | null = null;
const TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000; // drop items older than 60 days

export async function fetchLiveNews(): Promise<NewsItem[]> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.items;

  const now = Date.now();
  const results: NewsItem[] = [];
  const weights = await getSourceWeights(); // vote-adjusted weights per source

  await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source, filterByAI }) => {
      // Scale article slots by vote weight: 0.2→2 slots, 1.0→8 slots, 2.0→16 slots
      const weight = weights[source] ?? 1.0;
      const maxSlots = Math.max(1, Math.round(8 * weight));

      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "AIExecutive/1.0" },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        });
        if (!res.ok) return;
        const xml = await res.text();
        const rawItems = parseItems(xml);

        // Build NewsItem objects for all AI-relevant items from this feed
        const allNewsItems: (NewsItem & { link?: string })[] = rawItems
          .filter((it) => !filterByAI || isAiRelated(it.title, it.description))
          .map((it, i) => ({
            id: `rss-${source}-${i}-${new Date(it.pubDate || "").getTime() || Date.now()}`,
            title: it.title,
            summary: it.description || it.title,
            tool: "AI Industry",
            toolId: "",
            type: guessType(it.title),
            date: it.pubDate
              ? new Date(it.pubDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            impact: guessImpact(it.title),
            source,
            link: it.link,
          }));

        // Archive ALL fetched items before applying display filter
        await archiveArticles(allNewsItems);

        // Only push items within the 60-day display window
        allNewsItems
          .filter((it) => {
            const age = now - new Date(it.date).getTime();
            return age <= MAX_AGE_MS;
          })
          .slice(0, maxSlots)
          .forEach((it) => results.push(it));
      } catch {
        // silent — caller falls back to static data
      }
    })
  );

  // Community sources: HackerNews top stories + Reddit ML subreddits
  const [hnItems, redditItems] = await Promise.all([
    fetchHNStories(),
    fetchRedditPosts(),
  ]);
  const communityItems = [...hnItems, ...redditItems];
  await archiveArticles(communityItems);
  results.push(...communityItems);

  // Sort newest first
  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (results.length > 0) {
    cache = { items: results, fetchedAt: Date.now() };
  }

  return results;
}
