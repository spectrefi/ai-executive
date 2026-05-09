export interface PriceSnapshot {
  date: string;
  inputPer1M: number;
  outputPer1M: number;
}

export interface ApiModel {
  id: string;
  name: string;
  model: string;
  company: string;
  logo: string;
  logoColor: string;
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M: number | null;
  contextK: number;
  category: "frontier" | "balanced" | "fast" | "open";
  tier: "premium" | "standard" | "budget";
  history: PriceSnapshot[];
  notes?: string;
  toolId: string;
}

export const API_MODELS: ApiModel[] = [
  {
    id: "claude-opus-47",
    name: "Claude Opus 4.7",
    model: "claude-opus-4-7",
    company: "Anthropic",
    logo: "🧠",
    logoColor: "#d97706",
    inputPer1M: 15.00,
    outputPer1M: 75.00,
    cachedInputPer1M: 1.50,
    contextK: 200,
    category: "frontier",
    tier: "premium",
    history: [
      { date: "2025-11-01", inputPer1M: 15.00, outputPer1M: 75.00 },
    ],
    toolId: "claude",
  },
  {
    id: "claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    model: "claude-sonnet-4-6",
    company: "Anthropic",
    logo: "🧠",
    logoColor: "#d97706",
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    cachedInputPer1M: 0.30,
    contextK: 200,
    category: "balanced",
    tier: "standard",
    history: [
      { date: "2025-10-01", inputPer1M: 3.00, outputPer1M: 15.00 },
      { date: "2024-06-01", inputPer1M: 3.00, outputPer1M: 15.00 },
    ],
    notes: "Best overall value in the Claude family",
    toolId: "claude",
  },
  {
    id: "claude-haiku-45",
    name: "Claude Haiku 4.5",
    model: "claude-haiku-4-5-20251001",
    company: "Anthropic",
    logo: "🧠",
    logoColor: "#d97706",
    inputPer1M: 0.25,
    outputPer1M: 1.25,
    cachedInputPer1M: 0.03,
    contextK: 200,
    category: "fast",
    tier: "budget",
    history: [
      { date: "2025-10-01", inputPer1M: 0.25, outputPer1M: 1.25 },
    ],
    notes: "Cheapest Claude; ideal for high-volume tasks",
    toolId: "claude",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    model: "gpt-4o",
    company: "OpenAI",
    logo: "🤖",
    logoColor: "#10a37f",
    inputPer1M: 2.50,
    outputPer1M: 10.00,
    cachedInputPer1M: 1.25,
    contextK: 128,
    category: "balanced",
    tier: "standard",
    history: [
      { date: "2025-10-01", inputPer1M: 2.50, outputPer1M: 10.00 },
      { date: "2024-05-13", inputPer1M: 5.00, outputPer1M: 15.00 },
    ],
    notes: "50% price cut in Oct 2025",
    toolId: "chatgpt",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    model: "gpt-4o-mini",
    company: "OpenAI",
    logo: "🤖",
    logoColor: "#10a37f",
    inputPer1M: 0.15,
    outputPer1M: 0.60,
    cachedInputPer1M: 0.075,
    contextK: 128,
    category: "fast",
    tier: "budget",
    history: [
      { date: "2024-07-18", inputPer1M: 0.15, outputPer1M: 0.60 },
    ],
    notes: "Cheapest OpenAI option",
    toolId: "chatgpt",
  },
  {
    id: "o3",
    name: "o3",
    model: "o3",
    company: "OpenAI",
    logo: "🤖",
    logoColor: "#10a37f",
    inputPer1M: 10.00,
    outputPer1M: 40.00,
    cachedInputPer1M: 2.50,
    contextK: 200,
    category: "frontier",
    tier: "premium",
    history: [
      { date: "2026-01-01", inputPer1M: 10.00, outputPer1M: 40.00 },
    ],
    notes: "Reasoning model — higher latency by design",
    toolId: "chatgpt",
  },
  {
    id: "gemini-15-pro",
    name: "Gemini 1.5 Pro",
    model: "gemini-1.5-pro",
    company: "Google",
    logo: "✨",
    logoColor: "#4285f4",
    inputPer1M: 1.25,
    outputPer1M: 5.00,
    cachedInputPer1M: 0.3125,
    contextK: 2000,
    category: "frontier",
    tier: "standard",
    history: [
      { date: "2024-09-24", inputPer1M: 1.25, outputPer1M: 5.00 },
      { date: "2024-05-14", inputPer1M: 3.50, outputPer1M: 10.50 },
    ],
    notes: "2M context at this price is exceptional; rate limits apply",
    toolId: "gemini",
  },
  {
    id: "gemini-20-flash",
    name: "Gemini 2.0 Flash",
    model: "gemini-2.0-flash",
    company: "Google",
    logo: "✨",
    logoColor: "#4285f4",
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    cachedInputPer1M: 0.01875,
    contextK: 1000,
    category: "fast",
    tier: "budget",
    history: [
      { date: "2026-01-15", inputPer1M: 0.075, outputPer1M: 0.30 },
    ],
    notes: "Native image/audio output at budget price",
    toolId: "gemini",
  },
  {
    id: "mistral-large",
    name: "Mistral Large 2",
    model: "mistral-large-latest",
    company: "Mistral AI",
    logo: "🌊",
    logoColor: "#ff7000",
    inputPer1M: 2.00,
    outputPer1M: 6.00,
    cachedInputPer1M: null,
    contextK: 128,
    category: "balanced",
    tier: "standard",
    history: [
      { date: "2024-07-24", inputPer1M: 2.00, outputPer1M: 6.00 },
    ],
    toolId: "mistral",
  },
  {
    id: "mistral-small",
    name: "Mistral Small",
    model: "mistral-small-latest",
    company: "Mistral AI",
    logo: "🌊",
    logoColor: "#ff7000",
    inputPer1M: 0.20,
    outputPer1M: 0.60,
    cachedInputPer1M: null,
    contextK: 32,
    category: "fast",
    tier: "budget",
    history: [
      { date: "2024-09-18", inputPer1M: 0.20, outputPer1M: 0.60 },
    ],
    toolId: "mistral",
  },
  {
    id: "llama-31-405b-groq",
    name: "Llama 3.1 405B (Groq)",
    model: "llama-3.1-405b-reasoning",
    company: "Groq",
    logo: "⚡",
    logoColor: "#f97316",
    inputPer1M: 0.59,
    outputPer1M: 0.79,
    cachedInputPer1M: null,
    contextK: 128,
    category: "open",
    tier: "standard",
    history: [
      { date: "2024-08-01", inputPer1M: 0.59, outputPer1M: 0.79 },
    ],
    notes: "Llama weights served on Groq LPU — fastest open-model inference",
    toolId: "chatgpt",
  },
  {
    id: "command-r-plus",
    name: "Command R+",
    model: "command-r-plus",
    company: "Cohere",
    logo: "⚡",
    logoColor: "#39d353",
    inputPer1M: 2.50,
    outputPer1M: 10.00,
    cachedInputPer1M: null,
    contextK: 128,
    category: "balanced",
    tier: "standard",
    history: [
      { date: "2024-04-04", inputPer1M: 3.00, outputPer1M: 15.00 },
      { date: "2024-08-01", inputPer1M: 2.50, outputPer1M: 10.00 },
    ],
    notes: "Optimised for RAG; strong tool calling",
    toolId: "cohere",
  },
];

export const TIER_META: Record<string, { label: string; color: string }> = {
  premium:  { label: "Premium",  color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  standard: { label: "Standard", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  budget:   { label: "Budget",   color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export const CATEGORY_META: Record<string, { label: string }> = {
  frontier: { label: "Frontier" },
  balanced: { label: "Balanced" },
  fast:     { label: "Fast / Cheap" },
  open:     { label: "Open Weights" },
};

export function estimateCost(model: ApiModel, inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1_000_000) * model.inputPer1M +
         (outputTokens / 1_000_000) * model.outputPer1M;
}
