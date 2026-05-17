import { Redis } from "@upstash/redis";
import { AI_STOCKS, type AIStock } from "@/lib/data/market-movers";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const CACHE_KEY = "ai_executive:stocks_cache";
const CACHE_TTL = 900; // 15 minutes

interface StocksCache {
  fetchedAt: string;
  stocks: AIStock[];
}

const TICKERS = AI_STOCKS.map((s) => s.ticker);

async function fetchFromYahoo(): Promise<AIStock[]> {
  const symbols = TICKERS.join(",");

  const [quoteRes, sparkRes] = await Promise.all([
    fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AIExecutive/1.0)" },
      next: { revalidate: 0 },
    }),
    fetch(
      `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${symbols}&range=1mo&interval=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AIExecutive/1.0)" },
        next: { revalidate: 0 },
      }
    ),
  ]);

  if (!quoteRes.ok || !sparkRes.ok) {
    throw new Error(`Yahoo Finance error: quote=${quoteRes.status} spark=${sparkRes.status}`);
  }

  const [quoteData, sparkData] = await Promise.all([quoteRes.json(), sparkRes.json()]);

  const quotes: Record<string, { regularMarketPrice: number; regularMarketChangePercent: number; marketCap: number }> = {};
  for (const q of quoteData?.quoteResponse?.result ?? []) {
    quotes[q.symbol] = q;
  }

  const sparks: Record<string, number[]> = {};
  for (const s of sparkData?.spark?.result ?? []) {
    const closes: (number | null)[] = s.response?.[0]?.close ?? [];
    sparks[s.symbol] = closes.filter((c): c is number => c !== null);
  }

  return AI_STOCKS.map((stock) => {
    const quote = quotes[stock.ticker];
    const closes = sparks[stock.ticker] ?? [];

    if (!quote || closes.length < 2) return stock;

    const current = closes[closes.length - 1];
    const weekAgo = closes[Math.max(0, closes.length - 6)];
    const monthAgo = closes[0];

    const pct = (a: number, b: number) => Math.round(((a - b) / b) * 1000) / 10;

    return {
      ...stock,
      price: Math.round(quote.regularMarketPrice * 100) / 100,
      change1d: Math.round(quote.regularMarketChangePercent * 10) / 10,
      change1w: pct(current, weekAgo),
      change1m: pct(current, monthAgo),
      marketCapB: Math.round((quote.marketCap ?? 0) / 1e9) || stock.marketCapB,
    };
  });
}

export async function fetchLiveStocks(): Promise<{
  stocks: AIStock[];
  fetchedAt: string;
  isLive: boolean;
}> {
  if (redis) {
    try {
      const cached = await redis.get<StocksCache>(CACHE_KEY);
      if (cached) return { stocks: cached.stocks, fetchedAt: cached.fetchedAt, isLive: true };
    } catch {
      // fall through to live fetch
    }
  }

  try {
    const stocks = await fetchFromYahoo();
    const fetchedAt = new Date().toISOString();
    if (redis) {
      await redis.set(CACHE_KEY, { fetchedAt, stocks } satisfies StocksCache, { ex: CACHE_TTL });
    }
    return { stocks, fetchedAt, isLive: true };
  } catch (err) {
    console.error("[stocks-store] Yahoo Finance fetch failed:", err);
    return { stocks: AI_STOCKS, fetchedAt: "hardcoded", isLive: false };
  }
}
