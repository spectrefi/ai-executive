import { buildMetadata, SITE_URL } from "@/lib/seo";
import { DAILY_NEWS } from "@/lib/data/news";
import { AI_TOOLS } from "@/lib/data/tools";
import { fetchLiveNews } from "@/lib/rss";
import NewsCard from "@/components/NewsCard";
import TrendBadge from "@/components/TrendBadge";
import SubscribeForm from "@/components/SubscribeForm";
import Link from "next/link";
import { RefreshCw, TrendingUp, Radio } from "lucide-react";

// Regenerate every 4 hours
export const revalidate = 14400;

export const metadata = buildMetadata({
  title: "Daily AI Updates — Latest Benchmarks & News",
  description:
    "Today's AI tool updates: new model releases, pricing changes, benchmark results, and performance shifts. The AI intelligence feed, refreshed every 4 hours.",
  path: "/daily-update",
});

function articleListJsonLd(items: typeof DAILY_NEWS) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest AI News & Updates",
    url: `${SITE_URL}/daily-update`,
    itemListElement: items.slice(0, 10).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "NewsArticle",
        headline: item.title,
        description: item.summary,
        datePublished: item.date,
        publisher: { "@type": "Organization", name: item.source },
      },
    })),
  };
}

export default async function DailyUpdatePage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // Try live RSS; fall back to static data
  let news = await fetchLiveNews().catch(() => []);
  if (news.length < 5) news = DAILY_NEWS;
  const isLive = news !== DAILY_NEWS && news.length > 0;

  const movers = AI_TOOLS.filter((t) => t.trending !== "stable").sort(
    (a, b) => b.trendPercent - a.trendPercent
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleListJsonLd(news)) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3 text-sm">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live feed · refreshes every 4 hours
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-blue-400">
                <RefreshCw className="h-3.5 w-3.5" />
                Curated updates
              </span>
            )}
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-white">Daily AI Updates</h1>
          <p className="text-gray-400">{today}</p>
        </div>

        {/* Movers */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Today&apos;s Movers
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {movers.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#161c28] p-4 hover:border-blue-500/30"
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${tool.logoColor}22` }}
                >
                  {tool.logo}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-white">{tool.name}</div>
                  <div className="text-xs text-gray-500">#{tool.currentRank} overall</div>
                </div>
                <TrendBadge direction={tool.trending} percent={tool.trendPercent} />
              </Link>
            ))}
          </div>
        </section>

        {/* All news */}
        <section className="mb-16">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {isLive ? "Live AI News" : "Latest Updates"}
            </h2>
            <span className="text-xs text-gray-600">{news.length} stories</span>
          </div>
          <div className="space-y-3">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Subscribe */}
        <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">
            Get the Daily AI Intelligence Briefing
          </h2>
          <p className="mb-6 text-gray-400">
            Every morning: benchmark shifts, new releases, pricing changes, and the one AI tool
            worth watching today.
          </p>
          <SubscribeForm />
        </section>
      </div>
    </>
  );
}
