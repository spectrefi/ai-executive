import { Redis } from "@upstash/redis";
import { type NewsItem } from "@/lib/data/news";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const ARCHIVE_KEY = "ai_executive:archive";

interface ArchiveFile {
  articles: Record<string, NewsItem & { fetchedAt: string }>;
  totalCount: number;
  oldestDate: string;
  newestDate: string;
}

async function readArchive(): Promise<ArchiveFile> {
  if (!redis) return { articles: {}, totalCount: 0, oldestDate: "", newestDate: "" };
  try {
    const data = await redis.get<ArchiveFile>(ARCHIVE_KEY);
    return data ?? { articles: {}, totalCount: 0, oldestDate: "", newestDate: "" };
  } catch {
    return { articles: {}, totalCount: 0, oldestDate: "", newestDate: "" };
  }
}

async function writeArchive(data: ArchiveFile): Promise<void> {
  if (!redis) return;
  await redis.set(ARCHIVE_KEY, data);
}

export async function archiveArticles(items: (NewsItem & { link?: string })[]): Promise<void> {
  if (items.length === 0) return;

  const data = await readArchive();
  let changed = false;

  for (const item of items) {
    const key = item.link || item.id;
    if (!key || data.articles[key]) continue;

    data.articles[key] = { ...item, fetchedAt: new Date().toISOString() };
    changed = true;
  }

  if (!changed) return;

  const dates = Object.values(data.articles).map((a) => a.date).filter(Boolean).sort();
  data.totalCount = Object.keys(data.articles).length;
  data.oldestDate = dates[0] ?? "";
  data.newestDate = dates[dates.length - 1] ?? "";

  await writeArchive(data);
}

export async function getArchive(): Promise<(NewsItem & { fetchedAt: string })[]> {
  const data = await readArchive();
  return Object.values(data.articles).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getArchiveStats(): Promise<{ total: number; oldest: string; newest: string }> {
  const data = await readArchive();
  return {
    total: data.totalCount,
    oldest: data.oldestDate,
    newest: data.newestDate,
  };
}
