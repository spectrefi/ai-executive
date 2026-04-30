export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  tool: string;
  toolId: string;
  type: "update" | "pricing" | "benchmark" | "launch" | "outage" | "research";
  date: string;
  impact: "high" | "medium" | "low";
  source: string;
  link?: string;
}

export const DAILY_NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "OpenAI launches GPT-4.5 with improved emotional intelligence",
    summary: "OpenAI's GPT-4.5 shows significantly improved empathy and nuance in conversations, scoring highest ever on human preference evaluations for tone and context awareness.",
    tool: "ChatGPT", toolId: "chatgpt", type: "launch", date: "2026-05-01", impact: "high", source: "OpenAI Blog",
  },
  {
    id: "n2",
    title: "Google DeepMind ships Gemini 2.5 Ultra — tops all major benchmarks",
    summary: "Gemini 2.5 Ultra achieves #1 on MMLU, MATH, and HumanEval, displacing GPT-4o across all three. Available via Gemini Advanced today.",
    tool: "Gemini", toolId: "gemini", type: "benchmark", date: "2026-04-30", impact: "high", source: "Google DeepMind Blog",
  },
  {
    id: "n3",
    title: "Anthropic ships Claude 4 Opus with extended thinking mode",
    summary: "Claude 4 Opus introduces extended thinking — a visible chain-of-thought mode that shows reasoning steps before answering, improving accuracy on hard tasks by 28%.",
    tool: "Claude", toolId: "claude", type: "launch", date: "2026-04-29", impact: "high", source: "Anthropic Blog",
  },
  {
    id: "n4",
    title: "Cursor surpasses 2M paid developers, doubles revenue in Q1",
    summary: "Cursor reports 2M paying developers and $200M ARR run rate after Q1 2026 — making it the fastest-growing developer tool in history.",
    tool: "Cursor", toolId: "cursor", type: "update", date: "2026-04-28", impact: "high", source: "TechCrunch",
  },
  {
    id: "n5",
    title: "Perplexity Pro launches Deep Research — rival to ChatGPT o3",
    summary: "Perplexity's Deep Research mode runs multi-step web searches and synthesises findings into structured reports, directly competing with OpenAI's o3 research agent.",
    tool: "Perplexity", toolId: "perplexity", type: "launch", date: "2026-04-27", impact: "high", source: "Perplexity Blog",
  },
  {
    id: "n6",
    title: "Meta releases Llama 4 Maverick — beats GPT-4o on coding",
    summary: "Meta's Llama 4 Maverick open-weight model surpasses GPT-4o on HumanEval and SWE-bench, the first open model to do so at competitive inference speed.",
    tool: "Llama", toolId: "llama", type: "benchmark", date: "2026-04-26", impact: "high", source: "Meta AI Research",
  },
  {
    id: "n7",
    title: "GitHub Copilot Workspace exits beta — GA for all enterprise teams",
    summary: "GitHub's AI-native development environment graduates from beta with autonomous PR creation, test generation, and cross-repo change management.",
    tool: "GitHub Copilot", toolId: "github-copilot", type: "launch", date: "2026-04-25", impact: "medium", source: "GitHub Blog",
  },
  {
    id: "n8",
    title: "ElevenLabs raises $250M Series C, valued at $3.5B",
    summary: "ElevenLabs closes $250M at a $3.5B valuation to expand real-time voice AI infrastructure, targeting dubbing, audiobook, and enterprise voice markets.",
    tool: "ElevenLabs", toolId: "elevenlabs", type: "update", date: "2026-04-24", impact: "high", source: "Bloomberg",
  },
  {
    id: "n9",
    title: "Mistral Large 3 achieves SOTA on multilingual reasoning",
    summary: "Mistral Large 3 sets new state-of-the-art scores on multilingual MMLU across 14 languages, with particular gains in Arabic, Hindi, and Japanese.",
    tool: "Mistral", toolId: "mistral", type: "benchmark", date: "2026-04-23", impact: "medium", source: "Mistral AI Blog",
  },
  {
    id: "n10",
    title: "Midjourney V7 releases — real-time generation under 3 seconds",
    summary: "Midjourney V7 cuts average generation time to under 3 seconds while improving photorealism, hand rendering, and prompt adherence over V6.",
    tool: "Midjourney", toolId: "midjourney", type: "launch", date: "2026-04-22", impact: "high", source: "Midjourney Blog",
  },
  {
    id: "n11",
    title: "Microsoft 365 Copilot adds autonomous email triage and reply drafts",
    summary: "Microsoft 365 Copilot's new Inbox Agent autonomously triages, labels, and drafts replies for high-volume email, rolling out to E3/E5 customers.",
    tool: "Microsoft Copilot", toolId: "copilot", type: "launch", date: "2026-04-21", impact: "medium", source: "Microsoft Blog",
  },
  {
    id: "n12",
    title: "xAI releases Grok 3.5 with real-time X feed integration",
    summary: "Grok 3.5 gets live access to X posts, trending topics, and breaking news — giving it a real-time information edge over models relying on static training data.",
    tool: "Grok", toolId: "grok", type: "update", date: "2026-04-20", impact: "medium", source: "xAI Blog",
  },
  {
    id: "n13",
    title: "Runway Gen-4 Turbo cuts video generation cost by 50%",
    summary: "Runway's Gen-4 Turbo model delivers near-identical quality to Gen-4 at half the cost, targeting professional video production teams at scale.",
    tool: "Runway", toolId: "runway", type: "pricing", date: "2026-04-19", impact: "medium", source: "Runway Blog",
  },
  {
    id: "n14",
    title: "Notion AI adds autonomous project planning from meeting transcripts",
    summary: "Notion AI can now build full project plans — with tasks, owners, deadlines, and milestones — directly from uploaded meeting transcripts or recordings.",
    tool: "Notion AI", toolId: "notion-ai", type: "launch", date: "2026-04-18", impact: "medium", source: "Notion Blog",
  },
  {
    id: "n15",
    title: "DeepSeek releases open R2 reasoning model — matches o1 on math",
    summary: "DeepSeek's open-weight R2 model matches OpenAI o1 on MATH and AIME benchmarks, making frontier-level reasoning accessible without API costs.",
    tool: "DeepSeek", toolId: "deepseek", type: "benchmark", date: "2026-04-17", impact: "high", source: "DeepSeek Research",
  },
  {
    id: "n16",
    title: "Adobe Firefly 4 adds video generation for Creative Cloud subscribers",
    summary: "Adobe integrates Firefly 4 video generation directly into Premiere Pro and After Effects, allowing text-to-video and extend-clip features inside the timeline.",
    tool: "Adobe Firefly", toolId: "adobe-firefly", type: "launch", date: "2026-04-16", impact: "medium", source: "Adobe Blog",
  },
  {
    id: "n17",
    title: "Amazon Q Developer adds full-repo refactoring for Java and Python",
    summary: "Amazon Q Developer can now refactor entire Java and Python codebases — upgrading frameworks, replacing deprecated APIs, and writing migration tests.",
    tool: "Amazon Q", toolId: "amazon-q", type: "update", date: "2026-04-15", impact: "medium", source: "AWS Blog",
  },
  {
    id: "n18",
    title: "Grammarly launches Go — autonomous writing agent for enterprise",
    summary: "Grammarly Go is a new autonomous writing agent that drafts, edits, and publishes content across email, docs, and CMS platforms from a single brief.",
    tool: "Grammarly", toolId: "grammarly", type: "launch", date: "2026-04-14", impact: "medium", source: "Grammarly Blog",
  },
  {
    id: "n19",
    title: "Pika 2.1 adds lip-sync and talking head generation",
    summary: "Pika 2.1 introduces accurate lip-sync video generation and talking head avatars from static images, targeting marketing and social content creators.",
    tool: "Pika", toolId: "pika", type: "launch", date: "2026-04-13", impact: "medium", source: "Pika Blog",
  },
  {
    id: "n20",
    title: "Gemini Flash 2.5 cuts API price to $0.04/1M tokens",
    summary: "Google cuts Gemini Flash 2.5 input pricing to $0.04 per million tokens — 46% cheaper than the previous Flash model — making it the most affordable capable model on the market.",
    tool: "Gemini", toolId: "gemini", type: "pricing", date: "2026-04-12", impact: "high", source: "Google Cloud Blog",
  },
  {
    id: "n21",
    title: "Meta AI hits 600M weekly active users globally",
    summary: "Meta AI surpasses 600M weekly active users driven by WhatsApp, Instagram, and Facebook integrations — the widest reach of any AI assistant worldwide.",
    tool: "Meta AI", toolId: "meta-ai", type: "update", date: "2026-04-11", impact: "medium", source: "Meta Q1 2026 Earnings",
  },
  {
    id: "n22",
    title: "Cohere Command A launches for enterprise RAG at $0.15/1M tokens",
    summary: "Cohere's Command A is purpose-built for retrieval-augmented generation with 256K context, structured output, and citation grounding at enterprise pricing.",
    tool: "Cohere", toolId: "cohere", type: "launch", date: "2026-04-10", impact: "medium", source: "Cohere Blog",
  },
  {
    id: "n23",
    title: "Stable Diffusion 4 Turbo ships — 4K images in under 2 seconds",
    summary: "Stability AI's SD4 Turbo model generates 4096×4096 images in under 2 seconds locally on RTX 4090 hardware, removing the speed barrier for professional workflows.",
    tool: "Stable Diffusion", toolId: "stable-diffusion", type: "benchmark", date: "2026-04-09", impact: "high", source: "Stability AI Blog",
  },
  {
    id: "n24",
    title: "OpenAI Sora adds 4K export and real-time preview for Pro users",
    summary: "Sora Pro now supports 4K video export and a real-time low-res preview mode that shows generation progress live — addressing top complaints from production users.",
    tool: "Sora", toolId: "sora", type: "update", date: "2026-04-08", impact: "medium", source: "OpenAI Blog",
  },
  {
    id: "n25",
    title: "Claude Haiku 4 sets new price-performance record at $0.20/1M tokens",
    summary: "Anthropic's Claude Haiku 4 achieves GPT-4o-mini-level quality at $0.20 per million input tokens, the best price-to-capability ratio for high-volume production use cases.",
    tool: "Claude", toolId: "claude", type: "pricing", date: "2026-04-07", impact: "medium", source: "Anthropic Blog",
  },
];
