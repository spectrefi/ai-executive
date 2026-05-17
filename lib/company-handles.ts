/** X (Twitter) handles for each AI tool, used for tagging in breaking-news posts */
export const COMPANY_HANDLES: Record<string, string> = {
  chatgpt:             "@OpenAI",
  "openai-o3":         "@OpenAI",
  sora:                "@OpenAI",
  dalle3:              "@OpenAI",
  claude:              "@AnthropicAI",
  "claude-haiku":      "@AnthropicAI",
  "claude-opus":       "@AnthropicAI",
  gemini:              "@GoogleDeepMind",
  "gemini-flash":      "@GoogleDeepMind",
  copilot:             "@Microsoft",
  phi:                 "@Microsoft",
  "github-copilot":    "@github",
  midjourney:          "@midjourney",
  perplexity:          "@perplexity_ai",
  grok:                "@xAI",
  "meta-ai":           "@MetaAI",
  llama:               "@MetaAI",
  elevenlabs:          "@elevenlabsio",
  cursor:              "@cursor_ai",
  windsurf:            "@codeiumdev",
  runway:              "@runwayml",
  mistral:             "@MistralAI",
  "adobe-firefly":     "@Adobe",
  "notion-ai":         "@NotionHQ",
  "stable-diffusion":  "@StabilityAI",
  grammarly:           "@Grammarly",
  pika:                "@pika_labs",
  deepseek:            "@deepseek_ai",
  cohere:              "@cohere",
  bolt:                "@stackblitz",
  synthesia:           "@SynthesiaIO",
  heygen:              "@HeyGen_Official",
  kling:               "@KlingAI_official",
  ideogram:            "@ideogram_ai",
  flux:                "@bfl_ml",
  suno:                "@suno_ai",
  jasper:              "@heyjasperai",
  writer:              "@writerai",
  glean:               "@gleanwork",
  harvey:              "@harvey",
  "salesforce-einstein": "@Salesforce",
  tabnine:             "@tabnine",
  assemblyai:          "@AssemblyAI",
  descript:            "@DescriptApp",
  "replit-ai":         "@replit",
  qwen:                "@AlibabaGroup",
  luma:                "@lumalabsai",
  leonardo:            "@LeonardoAi_",
  "character-ai":      "@character_ai",
};

/** Return all X handles mentioned in a news headline */
export function detectHandlesInHeadline(title: string): string[] {
  const lower = title.toLowerCase();
  const found = new Set<string>();
  for (const [toolId, handle] of Object.entries(COMPANY_HANDLES)) {
    const toolName = toolId.replace(/-/g, " "); // e.g. "github-copilot" → "github copilot"
    if (lower.includes(toolName) || lower.includes(toolId)) {
      found.add(handle);
    }
  }
  // Explicit keyword matching for common brand names not in IDs
  if (lower.includes("openai") || lower.includes("gpt")) found.add("@OpenAI");
  if (lower.includes("anthropic") || lower.includes("claude")) found.add("@AnthropicAI");
  if (lower.includes("google") && lower.includes("ai")) found.add("@GoogleDeepMind");
  if (lower.includes("meta") && lower.includes("ai")) found.add("@MetaAI");
  if (lower.includes("mistral")) found.add("@MistralAI");
  if (lower.includes("deepseek")) found.add("@deepseek_ai");
  if (lower.includes("midjourney")) found.add("@midjourney");
  if (lower.includes("perplexity")) found.add("@perplexity_ai");
  if (lower.includes("cursor")) found.add("@cursor_ai");
  return Array.from(found).slice(0, 3); // cap at 3 tags to avoid spam
}

/** Best compare URL for a tool (vs its primary competitor) */
const PRIMARY_RIVALS: Record<string, string> = {
  chatgpt:         "chatgpt-vs-claude",
  claude:          "chatgpt-vs-claude",
  "claude-haiku":  "claude-haiku-vs-chatgpt",
  "claude-opus":   "claude-opus-vs-chatgpt",
  gemini:          "chatgpt-vs-gemini",
  "gemini-flash":  "gemini-flash-vs-claude-haiku",
  "openai-o3":     "openai-o3-vs-claude",
  grok:            "chatgpt-vs-grok",
  deepseek:        "chatgpt-vs-deepseek",
  mistral:         "chatgpt-vs-mistral",
  cursor:          "cursor-vs-github-copilot",
  "github-copilot":"cursor-vs-github-copilot",
  midjourney:      "midjourney-vs-stable-diffusion",
  "stable-diffusion":"midjourney-vs-stable-diffusion",
  perplexity:      "chatgpt-vs-perplexity",
};

export function getBestCompareSlug(toolId: string): string | null {
  return PRIMARY_RIVALS[toolId] ?? null;
}
