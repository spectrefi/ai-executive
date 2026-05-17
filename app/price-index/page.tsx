import { buildMetadata } from "@/lib/seo";
import { getApiModels } from "@/lib/pricing-store";
import { getPricingOverrides } from "@/lib/pricing-store";
import PriceIndexClient from "./PriceIndexClient";
export const revalidate = 3600; // 1 hour — pricing cron runs daily

export const metadata = buildMetadata({
  title: "AI API Pricing Index 2026 — Compare Token Costs Live",
  description:
    "Live pricing for every major AI API. Compare input/output token costs for GPT-4o, Claude, Gemini, Mistral and more. Auto-updated daily.",
  path: "/price-index",
});

export default async function PriceIndexPage() {
  const [models, overrides] = await Promise.all([getApiModels(), getPricingOverrides()]);
  return <PriceIndexClient models={models} pricingUpdatedAt={overrides?.updatedAt ?? null} />;
}
