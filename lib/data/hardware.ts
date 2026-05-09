export type Quantization = "fp16" | "q8" | "q6" | "q5" | "q4" | "q3" | "q2";
export type HardwareTier = "cpu-only" | "entry" | "mid" | "high" | "enthusiast" | "workstation";
export type UseCase = "chat" | "coding" | "writing" | "reasoning" | "vision" | "agents";

export interface LocalModel {
  id: string;
  name: string;
  baseModel: string;
  params: string;
  company: string;
  logo: string;
  logoColor: string;
  quant: Quantization;
  vramGb: number;
  ramGb: number;
  diskGb: number;
  quality: number; // 0-100 relative quality score
  speed: "slow" | "medium" | "fast" | "very-fast";
  useCases: UseCase[];
  notes?: string;
  downloadUrl?: string;
  ollamaTag?: string;
}

export interface GpuPreset {
  id: string;
  name: string;
  vramGb: number;
  tier: HardwareTier;
}

export interface CloudRecommendation {
  name: string;
  model: string;
  company: string;
  logo: string;
  logoColor: string;
  reason: string;
  costLabel: string;
  toolId: string;
  href: string;
}

export const GPU_PRESETS: GpuPreset[] = [
  { id: "no-gpu", name: "No GPU / CPU only", vramGb: 0, tier: "cpu-only" },
  { id: "rtx-3050", name: "RTX 3050 (4GB)", vramGb: 4, tier: "entry" },
  { id: "rtx-2060", name: "RTX 2060 (6GB)", vramGb: 6, tier: "entry" },
  { id: "rtx-3060", name: "RTX 3060 (12GB)", vramGb: 12, tier: "mid" },
  { id: "rtx-4060", name: "RTX 4060 (8GB)", vramGb: 8, tier: "mid" },
  { id: "rtx-4060ti", name: "RTX 4060 Ti (16GB)", vramGb: 16, tier: "mid" },
  { id: "rtx-3070", name: "RTX 3070 (8GB)", vramGb: 8, tier: "mid" },
  { id: "rtx-3080", name: "RTX 3080 (10GB)", vramGb: 10, tier: "high" },
  { id: "rtx-4070", name: "RTX 4070 (12GB)", vramGb: 12, tier: "high" },
  { id: "rtx-4070-super", name: "RTX 4070 Super (12GB)", vramGb: 12, tier: "high" },
  { id: "rtx-4070-ti", name: "RTX 4070 Ti (12GB)", vramGb: 12, tier: "high" },
  { id: "rtx-4080", name: "RTX 4080 (16GB)", vramGb: 16, tier: "high" },
  { id: "rtx-3090", name: "RTX 3090 (24GB)", vramGb: 24, tier: "enthusiast" },
  { id: "rtx-4090", name: "RTX 4090 (24GB)", vramGb: 24, tier: "enthusiast" },
  { id: "rtx-3090-sli", name: "Dual RTX 3090 (48GB)", vramGb: 48, tier: "workstation" },
  { id: "a100-40", name: "NVIDIA A100 (40GB)", vramGb: 40, tier: "enthusiast" },
  { id: "a100-80", name: "NVIDIA A100 (80GB)", vramGb: 80, tier: "workstation" },
  { id: "h100", name: "NVIDIA H100 (80GB)", vramGb: 80, tier: "workstation" },
  { id: "rtx-6000-ada", name: "RTX 6000 Ada (48GB)", vramGb: 48, tier: "workstation" },
  { id: "m1-pro", name: "Apple M1 Pro (18GB unified)", vramGb: 18, tier: "high" },
  { id: "m2-max", name: "Apple M2 Max (38GB unified)", vramGb: 38, tier: "enthusiast" },
  { id: "m3-max", name: "Apple M3 Max (48GB unified)", vramGb: 48, tier: "workstation" },
  { id: "m4-max", name: "Apple M4 Max (48GB+ unified)", vramGb: 48, tier: "workstation" },
];

export const LOCAL_MODELS: LocalModel[] = [
  // CPU-viable models
  {
    id: "llama32-1b-q4",
    name: "Llama 3.2 1B (Q4)",
    baseModel: "Llama 3.2",
    params: "1B",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "q4",
    vramGb: 0,
    ramGb: 4,
    diskGb: 1,
    quality: 30,
    speed: "very-fast",
    useCases: ["chat", "writing"],
    notes: "Runs on any machine. Useful for simple Q&A.",
    ollamaTag: "llama3.2:1b",
  },
  {
    id: "llama32-3b-q4",
    name: "Llama 3.2 3B (Q4)",
    baseModel: "Llama 3.2",
    params: "3B",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "q4",
    vramGb: 2,
    ramGb: 6,
    diskGb: 2,
    quality: 42,
    speed: "fast",
    useCases: ["chat", "writing", "coding"],
    notes: "Good for lightweight tasks. Works on integrated graphics.",
    ollamaTag: "llama3.2:3b",
  },
  // Entry GPU models (4-8GB VRAM)
  {
    id: "phi4-q4",
    name: "Phi-4 Mini (Q4)",
    baseModel: "Phi-4",
    params: "3.8B",
    company: "Microsoft",
    logo: "🪟",
    logoColor: "#0078d4",
    quant: "q4",
    vramGb: 3,
    ramGb: 8,
    diskGb: 2.5,
    quality: 52,
    speed: "fast",
    useCases: ["chat", "coding", "reasoning"],
    notes: "Punches above its weight on reasoning tasks.",
    ollamaTag: "phi4-mini",
  },
  {
    id: "mistral-7b-q4",
    name: "Mistral 7B (Q4)",
    baseModel: "Mistral 7B",
    params: "7B",
    company: "Mistral AI",
    logo: "🌊",
    logoColor: "#ff7000",
    quant: "q4",
    vramGb: 5,
    ramGb: 8,
    diskGb: 4,
    quality: 62,
    speed: "fast",
    useCases: ["chat", "writing", "coding"],
    notes: "Fast and solid. Great starting point for local LLMs.",
    ollamaTag: "mistral",
  },
  {
    id: "gemma2-9b-q4",
    name: "Gemma 2 9B (Q4)",
    baseModel: "Gemma 2",
    params: "9B",
    company: "Google",
    logo: "✨",
    logoColor: "#4285f4",
    quant: "q4",
    vramGb: 6,
    ramGb: 12,
    diskGb: 5.5,
    quality: 65,
    speed: "medium",
    useCases: ["chat", "writing", "reasoning"],
    notes: "Better quality than Mistral 7B for most tasks.",
    ollamaTag: "gemma2:9b",
  },
  {
    id: "llama31-8b-q4",
    name: "Llama 3.1 8B (Q4)",
    baseModel: "Llama 3.1",
    params: "8B",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "q4",
    vramGb: 6,
    ramGb: 12,
    diskGb: 5,
    quality: 64,
    speed: "fast",
    useCases: ["chat", "coding", "writing", "agents"],
    notes: "Strong tool-use support. Good for agentic workflows.",
    ollamaTag: "llama3.1:8b",
  },
  {
    id: "deepseek-r1-8b-q4",
    name: "DeepSeek R1 8B (Q4)",
    baseModel: "DeepSeek R1",
    params: "8B",
    company: "DeepSeek",
    logo: "🌐",
    logoColor: "#4f46e5",
    quant: "q4",
    vramGb: 6,
    ramGb: 12,
    diskGb: 5,
    quality: 68,
    speed: "medium",
    useCases: ["reasoning", "coding", "chat"],
    notes: "Reasoning-focused distillation. Excellent at math & logic.",
    ollamaTag: "deepseek-r1:8b",
  },
  // Mid GPU models (8-16GB VRAM)
  {
    id: "phi4-14b-q4",
    name: "Phi-4 14B (Q4)",
    baseModel: "Phi-4",
    params: "14B",
    company: "Microsoft",
    logo: "🪟",
    logoColor: "#0078d4",
    quant: "q4",
    vramGb: 9,
    ramGb: 16,
    diskGb: 8,
    quality: 72,
    speed: "medium",
    useCases: ["coding", "reasoning", "chat"],
    notes: "Best-in-class for coding at this size. Beats many larger models.",
    ollamaTag: "phi4",
  },
  {
    id: "llama31-8b-fp16",
    name: "Llama 3.1 8B (FP16)",
    baseModel: "Llama 3.1",
    params: "8B",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "fp16",
    vramGb: 16,
    ramGb: 16,
    diskGb: 16,
    quality: 68,
    speed: "medium",
    useCases: ["chat", "coding", "writing", "agents"],
    notes: "Full precision. Higher quality than Q4, same model.",
    ollamaTag: "llama3.1:8b-instruct-fp16",
  },
  {
    id: "gemma2-27b-q4",
    name: "Gemma 2 27B (Q4)",
    baseModel: "Gemma 2",
    params: "27B",
    company: "Google",
    logo: "✨",
    logoColor: "#4285f4",
    quant: "q4",
    vramGb: 16,
    ramGb: 24,
    diskGb: 16,
    quality: 76,
    speed: "medium",
    useCases: ["chat", "writing", "reasoning", "vision"],
    notes: "Excellent quality. Competes with GPT-3.5 Turbo on benchmarks.",
    ollamaTag: "gemma2:27b",
  },
  {
    id: "deepseek-r1-32b-q4",
    name: "DeepSeek R1 32B (Q4)",
    baseModel: "DeepSeek R1",
    params: "32B",
    company: "DeepSeek",
    logo: "🌐",
    logoColor: "#4f46e5",
    quant: "q4",
    vramGb: 20,
    ramGb: 32,
    diskGb: 19,
    quality: 79,
    speed: "slow",
    useCases: ["reasoning", "coding", "chat"],
    notes: "Best local reasoning model for 16-24GB GPUs. Strong at math.",
    ollamaTag: "deepseek-r1:32b",
  },
  // Enthusiast models (24GB VRAM)
  {
    id: "llama31-70b-q4",
    name: "Llama 3.1 70B (Q4)",
    baseModel: "Llama 3.1",
    params: "70B",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "q4",
    vramGb: 40,
    ramGb: 64,
    diskGb: 40,
    quality: 86,
    speed: "slow",
    useCases: ["chat", "coding", "writing", "reasoning", "agents"],
    notes: "Near-GPT-4 quality. Requires high-end hardware.",
    ollamaTag: "llama3.1:70b",
  },
  {
    id: "llama4-scout-q4",
    name: "Llama 4 Scout (Q4)",
    baseModel: "Llama 4 Scout",
    params: "17B active (109B total MoE)",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "q4",
    vramGb: 24,
    ramGb: 32,
    diskGb: 24,
    quality: 84,
    speed: "medium",
    useCases: ["chat", "coding", "writing", "reasoning", "vision"],
    notes: "MoE — only 17B params active per token. Fast for its quality.",
    ollamaTag: "llama4:scout",
  },
  {
    id: "deepseek-r1-70b-q4",
    name: "DeepSeek R1 70B (Q4)",
    baseModel: "DeepSeek R1",
    params: "70B",
    company: "DeepSeek",
    logo: "🌐",
    logoColor: "#4f46e5",
    quant: "q4",
    vramGb: 40,
    ramGb: 64,
    diskGb: 40,
    quality: 88,
    speed: "slow",
    useCases: ["reasoning", "coding", "chat"],
    notes: "Best local reasoning model. Beats GPT-4o on many math tasks.",
    ollamaTag: "deepseek-r1:70b",
  },
  // Workstation models (48GB+)
  {
    id: "llama31-70b-fp16",
    name: "Llama 3.1 70B (FP16)",
    baseModel: "Llama 3.1",
    params: "70B",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "fp16",
    vramGb: 140,
    ramGb: 128,
    diskGb: 140,
    quality: 89,
    speed: "slow",
    useCases: ["chat", "coding", "writing", "reasoning", "agents"],
    notes: "Full precision 70B. Requires 2x A100 or H100.",
    ollamaTag: "llama3.1:70b-instruct-fp16",
  },
  {
    id: "llama4-maverick-q4",
    name: "Llama 4 Maverick (Q4)",
    baseModel: "Llama 4 Maverick",
    params: "17B active (400B total MoE)",
    company: "Meta",
    logo: "🦙",
    logoColor: "#0668E1",
    quant: "q4",
    vramGb: 48,
    ramGb: 64,
    diskGb: 48,
    quality: 90,
    speed: "medium",
    useCases: ["chat", "coding", "writing", "reasoning", "vision", "agents"],
    notes: "Top open-weights model. GPT-4o quality locally.",
    ollamaTag: "llama4:maverick",
  },
];

export const CLOUD_RECOMMENDATIONS: Record<UseCase, CloudRecommendation[]> = {
  chat: [
    { name: "Claude Sonnet 4.6", model: "claude-sonnet-4-6", company: "Anthropic", logo: "🧠", logoColor: "#d97706", reason: "Best balance of quality and speed for conversational use", costLabel: "$3/M tokens", toolId: "claude", href: "/tools/claude" },
    { name: "GPT-4o", model: "gpt-4o", company: "OpenAI", logo: "🤖", logoColor: "#10a37f", reason: "Voice, image and text in one — great all-rounder", costLabel: "$2.50/M tokens", toolId: "chatgpt", href: "/tools/chatgpt" },
  ],
  coding: [
    { name: "Claude Opus 4.7", model: "claude-opus-4-7", company: "Anthropic", logo: "🧠", logoColor: "#d97706", reason: "Best code quality of any model. Handles complex multi-file tasks", costLabel: "$15/M tokens", toolId: "claude", href: "/tools/claude" },
    { name: "GPT-4o", model: "gpt-4o", company: "OpenAI", logo: "🤖", logoColor: "#10a37f", reason: "Strong code quality with excellent context handling", costLabel: "$2.50/M tokens", toolId: "chatgpt", href: "/tools/chatgpt" },
  ],
  writing: [
    { name: "Claude Sonnet 4.6", model: "claude-sonnet-4-6", company: "Anthropic", logo: "🧠", logoColor: "#d97706", reason: "Best prose quality of any model — nuanced, stylistic, long-form", costLabel: "$3/M tokens", toolId: "claude", href: "/tools/claude" },
    { name: "Gemini 1.5 Pro", model: "gemini-1.5-pro", company: "Google", logo: "✨", logoColor: "#4285f4", reason: "2M token context — process entire books in one call", costLabel: "$1.25/M tokens", toolId: "gemini", href: "/tools/gemini" },
  ],
  reasoning: [
    { name: "o3", model: "o3", company: "OpenAI", logo: "🤖", logoColor: "#10a37f", reason: "Best reasoning model available. 87.5% on ARC-AGI", costLabel: "$10/M tokens", toolId: "chatgpt", href: "/tools/chatgpt" },
    { name: "Claude Opus 4.7", model: "claude-opus-4-7", company: "Anthropic", logo: "🧠", logoColor: "#d97706", reason: "Extended thinking mode for complex multi-step problems", costLabel: "$15/M tokens", toolId: "claude", href: "/tools/claude" },
  ],
  vision: [
    { name: "GPT-4o", model: "gpt-4o", company: "OpenAI", logo: "🤖", logoColor: "#10a37f", reason: "Best multimodal model — image, audio, and video understanding", costLabel: "$2.50/M tokens", toolId: "chatgpt", href: "/tools/chatgpt" },
    { name: "Gemini 2.0 Flash", model: "gemini-2.0-flash", company: "Google", logo: "✨", logoColor: "#4285f4", reason: "Native image/video output as well as input — most capable vision model", costLabel: "$0.075/M tokens", toolId: "gemini", href: "/tools/gemini" },
  ],
  agents: [
    { name: "Claude Sonnet 4.6", model: "claude-sonnet-4-6", company: "Anthropic", logo: "🧠", logoColor: "#d97706", reason: "Best tool-use reliability. Lowest error rate in multi-step tasks", costLabel: "$3/M tokens", toolId: "claude", href: "/tools/claude" },
    { name: "GPT-4o", model: "gpt-4o", company: "OpenAI", logo: "🤖", logoColor: "#10a37f", reason: "Strong function calling. Rich ecosystem of pre-built integrations", costLabel: "$2.50/M tokens", toolId: "chatgpt", href: "/tools/chatgpt" },
  ],
};

export function getCompatibleModels(vramGb: number, ramGb: number): LocalModel[] {
  return LOCAL_MODELS.filter(
    (m) => m.vramGb <= vramGb && m.ramGb <= ramGb
  ).sort((a, b) => b.quality - a.quality);
}

export function getHardwareTier(vramGb: number): HardwareTier {
  if (vramGb === 0) return "cpu-only";
  if (vramGb <= 6) return "entry";
  if (vramGb <= 16) return "mid";
  if (vramGb <= 23) return "high";
  if (vramGb <= 40) return "enthusiast";
  return "workstation";
}

export const SPEED_META: Record<string, { label: string; color: string }> = {
  "very-fast": { label: "Very fast", color: "text-emerald-400" },
  fast:        { label: "Fast",      color: "text-emerald-400" },
  medium:      { label: "Medium",    color: "text-amber-400" },
  slow:        { label: "Slow",      color: "text-red-400" },
};

export const QUANT_META: Record<Quantization, { label: string; note: string }> = {
  fp16: { label: "FP16", note: "Full precision — max quality" },
  q8:   { label: "Q8",   note: "Near-lossless compression" },
  q6:   { label: "Q6",   note: "Minimal quality loss" },
  q5:   { label: "Q5",   note: "Good balance" },
  q4:   { label: "Q4",   note: "Best size/quality tradeoff" },
  q3:   { label: "Q3",   note: "Smaller, noticeable degradation" },
  q2:   { label: "Q2",   note: "Smallest, significant quality loss" },
};
