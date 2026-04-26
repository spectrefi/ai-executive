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
}

export const DAILY_NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Claude Sonnet 4.6 tops LMSYS Chatbot Arena for reasoning",
    summary:
      "Anthropic's latest model overtook GPT-4o in the LMSYS Chatbot Arena blind ranking for reasoning tasks, pushing Claude to #2 overall.",
    tool: "Claude",
    toolId: "claude",
    type: "benchmark",
    date: "2026-04-26",
    impact: "high",
    source: "LMSYS Chatbot Arena",
  },
  {
    id: "n2",
    title: "Gemini 2.5 Pro achieves 1M token context — largest in market",
    summary:
      "Google's Gemini 2.5 Pro now supports 1 million token context windows, enabling full codebase and legal document analysis in a single prompt.",
    tool: "Gemini",
    toolId: "gemini",
    type: "update",
    date: "2026-04-25",
    impact: "high",
    source: "Google DeepMind Blog",
  },
  {
    id: "n3",
    title: "ElevenLabs v3 launches with real-time voice cloning in 29 languages",
    summary:
      "ElevenLabs releases its most advanced model yet, dramatically improving naturalness and adding real-time cloning support for enterprise customers.",
    tool: "ElevenLabs",
    toolId: "elevenlabs",
    type: "launch",
    date: "2026-04-24",
    impact: "high",
    source: "ElevenLabs Blog",
  },
  {
    id: "n4",
    title: "Meta AI crosses 500M weekly active users via WhatsApp",
    summary:
      "Meta reports Meta AI surpassed 500M weekly active users, driven by deep integration in WhatsApp — making it the most-used AI by reach globally.",
    tool: "Meta AI",
    toolId: "meta-ai",
    type: "update",
    date: "2026-04-24",
    impact: "medium",
    source: "Meta Earnings Report Q1 2026",
  },
  {
    id: "n5",
    title: "Grok 3 scores 87.3 on MMLU, narrowing gap with GPT-4o",
    summary:
      "xAI's Grok 3 shows strong reasoning benchmark results, narrowing the gap with leading models on MMLU and HumanEval.",
    tool: "Grok",
    toolId: "grok",
    type: "benchmark",
    date: "2026-04-23",
    impact: "medium",
    source: "xAI Technical Report",
  },
  {
    id: "n6",
    title: "GitHub Copilot adds multi-file context for enterprise",
    summary:
      "GitHub Copilot Workspace now supports multi-repository context for enterprise teams, enabling cross-codebase refactoring and migration tasks.",
    tool: "GitHub Copilot",
    toolId: "github-copilot",
    type: "update",
    date: "2026-04-22",
    impact: "medium",
    source: "GitHub Blog",
  },
  {
    id: "n7",
    title: "Perplexity AI reaches 100M monthly users milestone",
    summary:
      "Perplexity AI announces 100M monthly active users, confirming its position as the leading AI-native search engine globally.",
    tool: "Perplexity",
    toolId: "perplexity",
    type: "update",
    date: "2026-04-21",
    impact: "medium",
    source: "Perplexity Blog",
  },
  {
    id: "n8",
    title: "ChatGPT o3 model now available to all Plus subscribers",
    summary:
      "OpenAI rolls out o3, its most capable reasoning model, to ChatGPT Plus users — delivering major gains on complex math and science tasks.",
    tool: "ChatGPT",
    toolId: "chatgpt",
    type: "update",
    date: "2026-04-20",
    impact: "high",
    source: "OpenAI Blog",
  },
];
