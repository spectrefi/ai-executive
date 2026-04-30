import { MetadataRoute } from "next";
import { AI_TOOLS, INDUSTRIES, USE_CASES } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/best-ai-for`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/daily-update`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/trends`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/embed`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const toolPages: MetadataRoute.Sitemap = AI_TOOLS.map((t) => ({
    url: `${SITE_URL}/tools/${t.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  const comparisonPages: MetadataRoute.Sitemap = [];
  AI_TOOLS.forEach((a) => {
    AI_TOOLS.forEach((b) => {
      if (a.id < b.id) {
        comparisonPages.push({
          url: `${SITE_URL}/compare/${a.id}-vs-${b.id}`,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.8,
        });
      }
    });
  });

  const industryPages: MetadataRoute.Sitemap = INDUSTRIES.map((i) => ({
    url: `${SITE_URL}/best-ai-for/${i.value}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const useCasePages: MetadataRoute.Sitemap = USE_CASES.map((u) => ({
    url: `${SITE_URL}/best-ai-for/${u.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...toolPages,
    ...comparisonPages,
    ...industryPages,
    ...useCasePages,
  ];
}
