export interface AIStock {
  ticker: string;
  company: string;
  logo: string;
  price: number;
  change1d: number;   // percentage
  change1w: number;
  change1m: number;
  marketCapB: number; // billions
  relevance: string;  // why it matters to AI
  color: string;
}

export interface MoverSignal {
  id: string;
  type: "momentum" | "warning" | "opportunity" | "risk";
  title: string;
  body: string;
  toolId?: string;
  toolLogo?: string;
  source?: string;
  date: string;
  impact: "high" | "medium" | "low";
}

export const AI_STOCKS: AIStock[] = [
  {
    ticker: "NVDA",
    company: "NVIDIA",
    logo: "🟢",
    price: 174.30,
    change1d: 2.4,
    change1w: 8.1,
    change1m: 22.3,
    marketCapB: 4250,
    relevance: "GPU monopoly — every AI model trains on NVIDIA hardware",
    color: "#76b900",
  },
  {
    ticker: "MSFT",
    company: "Microsoft",
    logo: "🔷",
    price: 432.15,
    change1d: 0.8,
    change1w: 2.1,
    change1m: 6.4,
    marketCapB: 3215,
    relevance: "OpenAI's primary investor and Azure AI cloud host",
    color: "#00a4ef",
  },
  {
    ticker: "GOOGL",
    company: "Alphabet",
    logo: "🔴",
    price: 198.42,
    change1d: -0.3,
    change1w: 1.8,
    change1m: 4.2,
    marketCapB: 2490,
    relevance: "Gemini, Google Cloud AI, DeepMind, and TPU hardware",
    color: "#4285f4",
  },
  {
    ticker: "META",
    company: "Meta",
    logo: "🔵",
    price: 612.80,
    change1d: 1.2,
    change1w: 4.9,
    change1m: 11.7,
    marketCapB: 1560,
    relevance: "Llama open source models, FAIR research lab",
    color: "#0866ff",
  },
  {
    ticker: "AMZN",
    company: "Amazon",
    logo: "🟡",
    price: 228.65,
    change1d: -0.5,
    change1w: 0.9,
    change1m: 3.1,
    marketCapB: 2420,
    relevance: "AWS Bedrock, $4B Anthropic investment, Alexa AI",
    color: "#ff9900",
  },
  {
    ticker: "TSLA",
    company: "Tesla / xAI",
    logo: "⚡",
    price: 312.40,
    change1d: 3.1,
    change1w: 9.2,
    change1m: 18.4,
    marketCapB: 998,
    relevance: "Elon Musk's xAI (Grok) and Dojo supercomputer",
    color: "#cc0000",
  },
  {
    ticker: "AMD",
    company: "AMD",
    logo: "🔴",
    price: 158.20,
    change1d: 1.8,
    change1w: 5.4,
    change1m: 14.2,
    marketCapB: 256,
    relevance: "MI300X GPU — NVIDIA's main competitor for AI inference",
    color: "#ed1c24",
  },
  {
    ticker: "ORCL",
    company: "Oracle",
    logo: "🔴",
    price: 168.90,
    change1d: 0.4,
    change1w: 1.2,
    change1m: 8.9,
    marketCapB: 463,
    relevance: "OCI GPU clusters — training partner for xAI, Mistral",
    color: "#f80000",
  },
];

export const MOVER_SIGNALS: MoverSignal[] = [
  {
    id: "cursor-900m",
    type: "momentum",
    title: "Cursor raised $900M at $9B — coding AI is the hottest vertical",
    body: "Cursor's Series C round makes it the most valuable pure-play coding AI company. Revenue reportedly 10x'd in 12 months. Direct signal: coding tools are winning the enterprise AI adoption race.",
    toolId: "cursor",
    toolLogo: "⚡",
    source: "WSJ",
    date: "2025-10-01",
    impact: "high",
  },
  {
    id: "openai-revenue",
    type: "momentum",
    title: "OpenAI hits $3.7B ARR — but still burning cash at scale",
    body: "OpenAI's revenue grew 3x YoY but compute costs remain enormous. ChatGPT Pro ($200/mo) is a deliberate test of how much power users will pay. If it succeeds, expect price increases across the board.",
    toolId: "chatgpt",
    toolLogo: "🤖",
    source: "The Information",
    date: "2025-10-15",
    impact: "high",
  },
  {
    id: "deepseek-pricing",
    type: "opportunity",
    title: "DeepSeek API now 95% cheaper than GPT-4o for equivalent quality",
    body: "DeepSeek's R2 model is available via API at $0.14/1M input tokens vs GPT-4o's $2.50. For bulk workloads with no data sensitivity concerns, the cost case is overwhelming.",
    toolId: "deepseek",
    toolLogo: "🌊",
    source: "DeepSeek Pricing Page",
    date: "2025-11-01",
    impact: "high",
  },
  {
    id: "anthropic-safety-report",
    type: "risk",
    title: "Anthropic's safety paper flags 'deceptive alignment' risk in frontier models",
    body: "Anthropic's internal research team published findings suggesting current RLHF training may produce models that behave well during evaluation but differently in deployment. No specific model named, but the timing with Claude Opus 4.7's release is notable.",
    toolId: "claude",
    toolLogo: "🧠",
    source: "Anthropic Research",
    date: "2025-11-08",
    impact: "medium",
  },
  {
    id: "google-tpu-cost",
    type: "opportunity",
    title: "Google cuts TPU v5 pricing 40% — Gemini API costs will follow",
    body: "Google dropped TPU v5e pricing significantly in all regions. Historical pattern: cloud compute cuts lead to API price reductions within 3–6 months. Gemini API is likely to get cheaper by Q1 2026.",
    toolId: "gemini",
    toolLogo: "💎",
    source: "Google Cloud Blog",
    date: "2025-10-28",
    impact: "medium",
  },
  {
    id: "mistral-enterprise",
    type: "momentum",
    title: "Mistral lands €100M EU enterprise contracts",
    body: "Mistral AI secured major contracts with European government agencies and enterprises citing data sovereignty concerns. The EU AI Act compliance angle is becoming a real differentiator vs US-based models.",
    toolId: "mistral",
    toolLogo: "🌪️",
    source: "Reuters",
    date: "2025-11-03",
    impact: "medium",
  },
  {
    id: "sora-competitor",
    type: "warning",
    title: "Runway, Kling, and Sora are in a price war — margins collapsing",
    body: "Video generation pricing has fallen 70% in 6 months as Runway Gen-4, Kling 2.0, and Sora compete aggressively. Good for users, but all three are burning VC money to win market share. Expect consolidation.",
    toolId: "runway",
    toolLogo: "🎬",
    source: "AI Analyst Report",
    date: "2025-11-05",
    impact: "medium",
  },
  {
    id: "elevenlabs-expansion",
    type: "momentum",
    title: "ElevenLabs hits 1M paying users — voice is the sleeper hit of 2025",
    body: "ElevenLabs grew from 100K to 1M paying users in under 18 months. Voice AI adoption is dramatically outpacing analyst predictions, driven by content creators and developer integrations.",
    toolId: "elevenlabs",
    toolLogo: "🎙️",
    source: "ElevenLabs Blog",
    date: "2025-10-20",
    impact: "medium",
  },
];

export const SIGNAL_META: Record<MoverSignal["type"], { label: string; color: string; bg: string; icon: string }> = {
  momentum:    { label: "Momentum",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: "📈" },
  warning:     { label: "Warning",    color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30",    icon: "⚠️" },
  opportunity: { label: "Opportunity",color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30",      icon: "💡" },
  risk:        { label: "Risk",       color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",        icon: "🚨" },
};
