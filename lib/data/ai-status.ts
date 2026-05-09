export type StatusLevel = "operational" | "degraded" | "partial_outage" | "major_outage" | "unknown";

export interface ServiceStatus {
  id: string;
  name: string;
  company: string;
  logo: string;
  logoColor: string;
  statusPageUrl: string;
  statusApiUrl: string | null;
  apiUrl: string;
  category: "llm" | "image" | "voice" | "code" | "search";
  status: StatusLevel;
  description: string;
  uptimePct: number;
  incidentCount30d: number;
  lastChecked: string;
  toolId: string;
}

export interface LiveStatusResponse {
  status: { indicator: "none" | "minor" | "major" | "critical"; description: string };
  page: { name: string; url: string; updated_at: string };
}

export const STATUS_SERVICES: ServiceStatus[] = [
  {
    id: "openai",
    name: "ChatGPT / OpenAI API",
    company: "OpenAI",
    logo: "🤖",
    logoColor: "#10a37f",
    statusPageUrl: "https://status.openai.com",
    statusApiUrl: "https://status.openai.com/api/v2/status.json",
    apiUrl: "https://api.openai.com",
    category: "llm",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.1,
    incidentCount30d: 2,
    lastChecked: new Date().toISOString(),
    toolId: "chatgpt",
  },
  {
    id: "anthropic",
    name: "Claude / Anthropic API",
    company: "Anthropic",
    logo: "🧠",
    logoColor: "#d97706",
    statusPageUrl: "https://status.anthropic.com",
    statusApiUrl: "https://status.anthropic.com/api/v2/status.json",
    apiUrl: "https://api.anthropic.com",
    category: "llm",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.6,
    incidentCount30d: 1,
    lastChecked: new Date().toISOString(),
    toolId: "claude",
  },
  {
    id: "google-gemini",
    name: "Gemini / Google AI",
    company: "Google DeepMind",
    logo: "✨",
    logoColor: "#4285f4",
    statusPageUrl: "https://status.cloud.google.com",
    statusApiUrl: null,
    apiUrl: "https://generativelanguage.googleapis.com",
    category: "llm",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.8,
    incidentCount30d: 0,
    lastChecked: new Date().toISOString(),
    toolId: "gemini",
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    company: "Perplexity",
    logo: "🔍",
    logoColor: "#20b2aa",
    statusPageUrl: "https://status.perplexity.ai",
    statusApiUrl: null,
    apiUrl: "https://api.perplexity.ai",
    category: "search",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.3,
    incidentCount30d: 1,
    lastChecked: new Date().toISOString(),
    toolId: "perplexity",
  },
  {
    id: "cohere",
    name: "Cohere API",
    company: "Cohere",
    logo: "⚡",
    logoColor: "#39d353",
    statusPageUrl: "https://status.cohere.com",
    statusApiUrl: "https://status.cohere.com/api/v2/status.json",
    apiUrl: "https://api.cohere.ai",
    category: "llm",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.0,
    incidentCount30d: 3,
    lastChecked: new Date().toISOString(),
    toolId: "cohere",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs API",
    company: "ElevenLabs",
    logo: "🎙️",
    logoColor: "#f59e0b",
    statusPageUrl: "https://status.elevenlabs.io",
    statusApiUrl: null,
    apiUrl: "https://api.elevenlabs.io",
    category: "voice",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.4,
    incidentCount30d: 1,
    lastChecked: new Date().toISOString(),
    toolId: "elevenlabs",
  },
  {
    id: "mistral",
    name: "Mistral API",
    company: "Mistral AI",
    logo: "🌊",
    logoColor: "#ff7000",
    statusPageUrl: "https://status.mistral.ai",
    statusApiUrl: null,
    apiUrl: "https://api.mistral.ai",
    category: "llm",
    status: "operational",
    description: "All systems operational",
    uptimePct: 98.7,
    incidentCount30d: 4,
    lastChecked: new Date().toISOString(),
    toolId: "mistral",
  },
  {
    id: "runway",
    name: "Runway ML",
    company: "Runway",
    logo: "🎬",
    logoColor: "#6366f1",
    statusPageUrl: "https://status.runwayml.com",
    statusApiUrl: null,
    apiUrl: "https://api.runwayml.com",
    category: "image",
    status: "operational",
    description: "All systems operational",
    uptimePct: 98.2,
    incidentCount30d: 5,
    lastChecked: new Date().toISOString(),
    toolId: "runway",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    company: "Midjourney",
    logo: "🎨",
    logoColor: "#a855f7",
    statusPageUrl: "https://status.midjourney.com",
    statusApiUrl: null,
    apiUrl: "https://discord.com",
    category: "image",
    status: "operational",
    description: "All systems operational",
    uptimePct: 97.9,
    incidentCount30d: 3,
    lastChecked: new Date().toISOString(),
    toolId: "midjourney",
  },
  {
    id: "stability",
    name: "Stability AI API",
    company: "Stability AI",
    logo: "🖼️",
    logoColor: "#ec4899",
    statusPageUrl: "https://status.stability.ai",
    statusApiUrl: null,
    apiUrl: "https://api.stability.ai",
    category: "image",
    status: "operational",
    description: "All systems operational",
    uptimePct: 97.5,
    incidentCount30d: 6,
    lastChecked: new Date().toISOString(),
    toolId: "adobe-firefly",
  },
  {
    id: "groq",
    name: "Groq API",
    company: "Groq",
    logo: "⚡",
    logoColor: "#f97316",
    statusPageUrl: "https://status.groq.com",
    statusApiUrl: null,
    apiUrl: "https://api.groq.com",
    category: "llm",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.2,
    incidentCount30d: 2,
    lastChecked: new Date().toISOString(),
    toolId: "chatgpt",
  },
  {
    id: "cursor",
    name: "Cursor IDE",
    company: "Anysphere",
    logo: "⌨️",
    logoColor: "#2563eb",
    statusPageUrl: "https://status.cursor.com",
    statusApiUrl: null,
    apiUrl: "https://cursor.com",
    category: "code",
    status: "operational",
    description: "All systems operational",
    uptimePct: 99.7,
    incidentCount30d: 0,
    lastChecked: new Date().toISOString(),
    toolId: "cursor",
  },
];

export function indicatorToStatus(indicator: string): StatusLevel {
  switch (indicator) {
    case "none": return "operational";
    case "minor": return "degraded";
    case "major": return "partial_outage";
    case "critical": return "major_outage";
    default: return "unknown";
  }
}

export const STATUS_META: Record<StatusLevel, { label: string; color: string; bg: string; dot: string }> = {
  operational:    { label: "Operational",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  degraded:       { label: "Degraded",       color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30",  dot: "bg-yellow-400" },
  partial_outage: { label: "Partial Outage", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/30",  dot: "bg-orange-400" },
  major_outage:   { label: "Major Outage",   color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",        dot: "bg-red-400" },
  unknown:        { label: "Unknown",        color: "text-gray-500",    bg: "bg-gray-500/10 border-gray-500/30",      dot: "bg-gray-500" },
};
