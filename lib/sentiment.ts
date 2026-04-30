export interface ToolBuzz {
  toolId: string;
  buzzScore: number;
  mentionCount: number;
  level: "hot" | "active" | "quiet";
  topStory: { title: string; url: string; source: "hn" | "reddit"; score: number } | null;
}

// Per-tool search terms that avoid noise (e.g. "Claude" alone hits too many unrelated results)
const SEARCH_TERMS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude AI Anthropic",
  gemini: "Google Gemini AI",
  copilot: "Microsoft Copilot AI",
  "github-copilot": "GitHub Copilot",
  midjourney: "Midjourney AI",
  perplexity: "Perplexity AI",
  grok: "Grok xAI",
  "meta-ai": "Meta AI Llama",
  elevenlabs: "ElevenLabs voice AI",
  cursor: "Cursor AI code editor",
  runway: "Runway AI video",
  mistral: "Mistral AI",
  "adobe-firefly": "Adobe Firefly AI",
  "notion-ai": "Notion AI",
  "stable-diffusion": "Stable Diffusion",
  grammarly: "Grammarly AI",
  pika: "Pika AI video",
  sora: "OpenAI Sora video",
  deepseek: "DeepSeek AI model",
  llama: "Meta Llama AI model",
  cohere: "Cohere AI",
  "claude-haiku": "Claude Haiku Anthropic",
  "gemini-flash": "Gemini Flash Google AI",
  "amazon-q": "Amazon Q Business AI",
  "openai-o3": "OpenAI o3 reasoning model",
  "claude-opus": "Claude Opus Anthropic",
  windsurf: "Windsurf Codeium AI editor",
  bolt: "Bolt.new StackBlitz AI",
  synthesia: "Synthesia AI video avatar",
  heygen: "HeyGen AI video",
  kling: "Kling AI video generation",
  dalle3: "DALL-E 3 OpenAI image",
  ideogram: "Ideogram AI image",
  flux: "Flux AI image Black Forest Labs",
  suno: "Suno AI music generation",
  jasper: "Jasper AI marketing",
  writer: "Writer AI enterprise",
  glean: "Glean enterprise AI search",
  harvey: "Harvey AI legal",
  "salesforce-einstein": "Salesforce Einstein AI",
  tabnine: "Tabnine AI code",
  assemblyai: "AssemblyAI speech transcription",
  descript: "Descript AI audio video",
  "replit-ai": "Replit AI agent",
  qwen: "Qwen Alibaba AI model",
  phi: "Microsoft Phi AI model",
  luma: "Luma Dream Machine AI video",
  leonardo: "Leonardo AI image generation",
  "character-ai": "Character AI roleplay",
};

interface HnHit {
  title: string;
  url?: string;
  points: number;
  num_comments: number;
  created_at_i: number;
}

interface RedditPost {
  data: { title: string; url: string; score: number; subreddit: string; permalink: string };
}

async function fetchHn(query: string, since: number): Promise<{ score: number; title: string; url: string }[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=5`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4000), next: { revalidate: 14400 } } as RequestInit);
  if (!res.ok) return [];
  const json = await res.json() as { hits: HnHit[] };
  return (json.hits ?? []).map((h) => ({
    score: (h.points ?? 0) + (h.num_comments ?? 0),
    title: h.title,
    url: h.url ?? `https://news.ycombinator.com/item?id=${h.created_at_i}`,
  }));
}

async function fetchReddit(query: string): Promise<{ score: number; title: string; url: string }[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=top&t=week&limit=5`;
  const res = await fetch(url, {
    headers: { "User-Agent": "AIExecutive/1.0 (https://aiexecutive.io)" },
    signal: AbortSignal.timeout(4000),
    next: { revalidate: 14400 },
  } as RequestInit);
  if (!res.ok) return [];
  const json = await res.json() as { data?: { children?: RedditPost[] } };
  return (json.data?.children ?? []).map((c) => ({
    score: c.data.score,
    title: c.data.title,
    url: `https://reddit.com${c.data.permalink}`,
  }));
}

function computeLevel(buzz: number): ToolBuzz["level"] {
  if (buzz >= 500) return "hot";
  if (buzz >= 100) return "active";
  return "quiet";
}

let cache: { data: Record<string, ToolBuzz>; fetchedAt: number } | null = null;
const TTL_MS = 4 * 60 * 60 * 1000;

export async function fetchAllSentiment(toolIds: string[]): Promise<Record<string, ToolBuzz>> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.data;

  const since = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);

  const results = await Promise.allSettled(
    toolIds.map(async (id): Promise<[string, ToolBuzz]> => {
      const query = SEARCH_TERMS[id] ?? id;
      const [hnItems, redditItems] = await Promise.allSettled([
        fetchHn(query, since),
        fetchReddit(query),
      ]);

      const hn = hnItems.status === "fulfilled" ? hnItems.value : [];
      const rd = redditItems.status === "fulfilled" ? redditItems.value : [];
      const all = [...hn, ...rd].sort((a, b) => b.score - a.score);

      const buzzScore = all.reduce((s, i) => s + i.score, 0);
      const topStory = all[0]
        ? { title: all[0].title, url: all[0].url, source: (hn.includes(all[0]) ? "hn" : "reddit") as "hn" | "reddit", score: all[0].score }
        : null;

      return [id, { toolId: id, buzzScore, mentionCount: all.length, level: computeLevel(buzzScore), topStory }];
    })
  );

  const data: Record<string, ToolBuzz> = {};
  for (const r of results) {
    if (r.status === "fulfilled") {
      const [id, buzz] = r.value;
      data[id] = buzz;
    }
  }

  cache = { data, fetchedAt: Date.now() };
  return data;
}
