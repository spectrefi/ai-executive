/**
 * Affiliate / referral links for each tracked tool.
 *
 * HOW TO UPDATE:
 * 1. Sign up to each program (links below)
 * 2. Replace the placeholder URL with your personal referral link
 * 3. Leave affiliateUrl as null for tools with no program — the site falls back to tool.website
 *
 * PROGRAM SIGN-UP URLS:
 *   Cursor       → https://cursor.com/affiliates
 *   Grammarly    → https://www.grammarly.com/affiliates
 *   Notion       → https://www.notion.so/affiliate
 *   ElevenLabs   → https://elevenlabs.io/affiliate-program
 *   Runway       → https://runwayml.com/affiliates
 *   Adobe        → https://www.adobe.com/affiliates.html
 *   Perplexity   → https://www.perplexity.ai/hub/affiliates
 *   Pika         → https://pika.art/affiliates
 */

interface AffiliateEntry {
  affiliateUrl: string | null;
  /** Badge shown next to the CTA button. null = no badge */
  badge: string | null;
}

/** Map of tool id → affiliate config. Null URL = fall back to tool.website */
const AFFILIATES: Record<string, AffiliateEntry> = {
  chatgpt:     { affiliateUrl: null,                                   badge: null },
  claude:      { affiliateUrl: null,                                   badge: null },
  gemini:      { affiliateUrl: null,                                   badge: null },
  copilot:     { affiliateUrl: null,                                   badge: null },
  githubcopilot: { affiliateUrl: null,                                 badge: null },
  cursor:      { affiliateUrl: "https://cursor.com",                   badge: "Affiliate" },
  midjourney:  { affiliateUrl: null,                                   badge: null },
  perplexity:  { affiliateUrl: "https://perplexity.ai",                badge: "Affiliate" },
  grok:        { affiliateUrl: null,                                   badge: null },
  metaai:      { affiliateUrl: null,                                   badge: null },
  elevenlabs:  { affiliateUrl: "https://elevenlabs.io",                badge: "Affiliate" },
  runway:      { affiliateUrl: "https://runwayml.com",                 badge: "Affiliate" },
  mistral:     { affiliateUrl: null,                                   badge: null },
  adobefirefly: { affiliateUrl: "https://www.adobe.com/products/firefly.html", badge: "Affiliate" },
  notion:      { affiliateUrl: "https://notion.so",                    badge: "Affiliate" },
  stablediffusion: { affiliateUrl: null,                               badge: null },
  grammarly:   { affiliateUrl: "https://www.grammarly.com",            badge: "Affiliate" },
  pika:        { affiliateUrl: "https://pika.art",                     badge: "Affiliate" },
  sora:        { affiliateUrl: null,                                   badge: null },
  deepseek:    { affiliateUrl: null,                                   badge: null },
  llama:       { affiliateUrl: null,                                   badge: null },
  cohere:      { affiliateUrl: null,                                   badge: null },
  amazonq:     { affiliateUrl: null,                                   badge: null },
  googlebard:  { affiliateUrl: null,                                   badge: null },
};

const UTM = "?utm_source=ai-executive&utm_medium=affiliate&utm_campaign=tool-page";

/**
 * Returns the best URL to send a user to for a given tool.
 * Appends UTM params to affiliate links for tracking.
 * Falls back to the tool's own website for tools without a program.
 */
export function getOutboundUrl(toolId: string, fallbackWebsite: string): string {
  const entry = AFFILIATES[toolId];
  if (!entry || !entry.affiliateUrl) return fallbackWebsite;
  return `${entry.affiliateUrl}${UTM}`;
}

/** Returns the affiliate badge label if one is configured, otherwise null */
export function getAffiliateBadge(toolId: string): string | null {
  return AFFILIATES[toolId]?.badge ?? null;
}

/** True if this tool has an affiliate link configured */
export function hasAffiliate(toolId: string): boolean {
  return Boolean(AFFILIATES[toolId]?.affiliateUrl);
}
