export type TakeSource = "x" | "hn" | "reddit" | "substack" | "linkedin";

export interface HotTake {
  id: string;
  take: string;
  author: string;
  authorHandle?: string;
  authorRole: string;
  source: TakeSource;
  url?: string;
  date: string;
  agreeBaseline: number;   // 0–100 percentage
  totalVotes: number;
  tags: string[];
  controversial: boolean;  // true = expect near 50/50 split
  featured?: boolean;
}

export const SOURCE_META: Record<TakeSource, { label: string; color: string; icon: string }> = {
  x:         { label: "X",         color: "text-white",        icon: "𝕏" },
  hn:        { label: "Hacker News", color: "text-orange-400", icon: "Y" },
  reddit:    { label: "Reddit",    color: "text-orange-500",    icon: "🔴" },
  substack:  { label: "Substack",  color: "text-amber-400",    icon: "📰" },
  linkedin:  { label: "LinkedIn",  color: "text-blue-400",     icon: "in" },
};

export const HOT_TAKES: HotTake[] = [
  {
    id: "agents-overhyped-2025",
    take: "AI agents are the most overhyped thing in tech right now. 95% of 'agentic' demos fall apart on real tasks. We're at least 3 years from reliable autonomous agents in production.",
    author: "Gary Marcus",
    authorHandle: "@GaryMarcus",
    authorRole: "AI Researcher & Author",
    source: "x",
    date: "2025-11-01",
    agreeBaseline: 44,
    totalVotes: 8412,
    tags: ["agents", "hype", "reality-check"],
    controversial: true,
    featured: true,
  },
  {
    id: "gpt4o-vs-claude-coding",
    take: "GPT-4o is no longer the best coding model. Claude Sonnet 3.7 has been quietly better for production code for months. Most people haven't noticed because they haven't switched.",
    author: "swyx",
    authorHandle: "@swyx",
    authorRole: "AI Engineer & Writer",
    source: "x",
    date: "2025-10-28",
    agreeBaseline: 61,
    totalVotes: 5204,
    tags: ["coding", "Claude", "GPT-4o", "benchmarks"],
    controversial: false,
    featured: true,
  },
  {
    id: "llm-not-replacing-jobs",
    take: "LLMs aren't replacing software engineers — they're replacing the 20% of engineers who refused to learn new tools. The other 80% are 3x more productive.",
    author: "Andrej Karpathy",
    authorHandle: "@karpathy",
    authorRole: "Former OpenAI / Tesla AI",
    source: "x",
    date: "2025-10-15",
    agreeBaseline: 72,
    totalVotes: 14830,
    tags: ["jobs", "productivity", "software engineers"],
    controversial: true,
  },
  {
    id: "open-source-wins",
    take: "Open source has already won the AI race for 90% of use cases. The gap between Llama 4 and GPT-4o is now smaller than the gap between GPT-4o and the privacy/cost of using it.",
    author: "Yann LeCun",
    authorHandle: "@ylecun",
    authorRole: "Chief AI Scientist, Meta",
    source: "x",
    date: "2025-11-05",
    agreeBaseline: 55,
    totalVotes: 9102,
    tags: ["open source", "Llama", "Meta", "GPT-4o"],
    controversial: true,
    featured: true,
  },
  {
    id: "rag-dead",
    take: "RAG is becoming obsolete. When context windows hit 10M tokens and cost $0.001/1M, you'll just feed the entire knowledge base every time. The RAG complexity is not worth it for most teams.",
    author: "Simon Willison",
    authorHandle: "@simonw",
    authorRole: "Creator of Datasette",
    source: "x",
    date: "2025-10-22",
    agreeBaseline: 38,
    totalVotes: 4201,
    tags: ["RAG", "context windows", "engineering"],
    controversial: true,
  },
  {
    id: "ai-wrappers-real-business",
    take: "People mock 'AI wrapper' companies, but Cursor is worth $9B, Jasper raised $125M, and ElevenLabs is at $3.3B. Distribution and UX beat model quality every time.",
    author: "Lenny Rachitsky",
    authorHandle: "@lennysan",
    authorRole: "Product Growth Writer",
    source: "substack",
    date: "2025-11-02",
    agreeBaseline: 68,
    totalVotes: 6730,
    tags: ["startups", "wrappers", "distribution", "valuation"],
    controversial: false,
  },
  {
    id: "benchmarks-meaningless",
    take: "MMLU, HumanEval, and MATH benchmarks are now essentially useless. Every frontier model scores 85%+ and the real-world performance differences don't correlate. We need vibes-based evals.",
    author: "Jason Wei",
    authorHandle: "@jaseweston",
    authorRole: "Research Scientist, OpenAI",
    source: "x",
    date: "2025-10-10",
    agreeBaseline: 59,
    totalVotes: 3891,
    tags: ["benchmarks", "evals", "research"],
    controversial: true,
  },
  {
    id: "prompt-engineering-dead",
    take: "Prompt engineering as a job title will be completely gone by 2026. The models have gotten so good that careful prompting only matters at the margins now.",
    author: "HN user throwaway",
    authorHandle: "ryanlc99",
    authorRole: "ML Engineer",
    source: "hn",
    date: "2025-10-08",
    agreeBaseline: 47,
    totalVotes: 2104,
    tags: ["prompt engineering", "jobs", "future"],
    controversial: true,
  },
  {
    id: "deepseek-underrated",
    take: "DeepSeek R2 is the most underrated model in the West right now. It's matching o1 on reasoning at 1/10th the API cost. The only reason people aren't using it is geopolitics.",
    author: "Nathan Lambert",
    authorHandle: "@natolambert",
    authorRole: "AI Researcher, Allen Institute",
    source: "x",
    date: "2025-11-08",
    agreeBaseline: 52,
    totalVotes: 5012,
    tags: ["DeepSeek", "cost", "China", "reasoning"],
    controversial: true,
    featured: true,
  },
  {
    id: "fine-tuning-overrated",
    take: "90% of teams that think they need fine-tuning just need better prompts and examples. Fine-tuning is expensive, fragile, and obsolete within 6 months when the base model is updated.",
    author: "Eugene Yan",
    authorHandle: "@eugeneyan",
    authorRole: "Applied Science, Amazon",
    source: "substack",
    date: "2025-09-30",
    agreeBaseline: 63,
    totalVotes: 3245,
    tags: ["fine-tuning", "prompting", "engineering"],
    controversial: false,
  },
  {
    id: "multimodal-underused",
    take: "We're criminally underusing multimodal AI. Attaching screenshots, diagrams, and photos to your prompts instead of describing them in text gets dramatically better results. Most people still type descriptions.",
    author: "Ethan Mollick",
    authorHandle: "@emollick",
    authorRole: "Wharton Professor, AI Researcher",
    source: "x",
    date: "2025-11-03",
    agreeBaseline: 81,
    totalVotes: 7820,
    tags: ["multimodal", "images", "productivity"],
    controversial: false,
  },
  {
    id: "ai-safety-distraction",
    take: "The AI safety discourse has been completely hijacked by people more worried about fictional AGI scenarios than the real harms happening right now: misinformation, deepfakes, job disruption.",
    author: "Timnit Gebru",
    authorHandle: "@timnitGebru",
    authorRole: "AI Ethics Researcher",
    source: "x",
    date: "2025-10-25",
    agreeBaseline: 49,
    totalVotes: 11203,
    tags: ["AI safety", "ethics", "policy"],
    controversial: true,
  },
];

export function getFeaturedTakes(): HotTake[] {
  return HOT_TAKES.filter((t) => t.featured);
}

export function getControversialTakes(): HotTake[] {
  return HOT_TAKES.filter((t) => t.controversial)
    .sort((a, b) => Math.abs(b.agreeBaseline - 50) - Math.abs(a.agreeBaseline - 50));
}
