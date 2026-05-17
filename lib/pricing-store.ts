import { Redis } from "@upstash/redis";
import { API_MODELS, type ApiModel } from "@/lib/data/api-pricing";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const PRICING_KEY = "ai_executive:pricing_overrides";

export interface PricingOverride {
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M: number | null;
  contextK: number;
  lastVerified: string; // ISO date
  source?: string;
}

export interface PricingOverrides {
  updatedAt: string;
  models: Record<string, PricingOverride>; // keyed by ApiModel.id
}

export async function getPricingOverrides(): Promise<PricingOverrides | null> {
  if (!redis) return null;
  try {
    return await redis.get<PricingOverrides>(PRICING_KEY);
  } catch {
    return null;
  }
}

export async function savePricingOverrides(overrides: PricingOverrides): Promise<void> {
  if (!redis) return;
  await redis.set(PRICING_KEY, overrides);
}

/** Returns API_MODELS merged with any live Redis overrides */
export async function getApiModels(): Promise<(ApiModel & { lastVerified?: string })[]> {
  const overrides = await getPricingOverrides();
  if (!overrides) return API_MODELS;

  return API_MODELS.map((model) => {
    const override = overrides.models[model.id];
    if (!override) return model;
    return {
      ...model,
      inputPer1M: override.inputPer1M,
      outputPer1M: override.outputPer1M,
      cachedInputPer1M: override.cachedInputPer1M,
      contextK: override.contextK,
      lastVerified: override.lastVerified,
    };
  });
}
