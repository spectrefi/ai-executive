export const SITE_NAME = "AI Executive";
export const SITE_URL = "https://aiexecutive.io";
export const SITE_DESCRIPTION =
  "Live AI tool rankings, daily performance benchmarks, and instant side-by-side comparisons across the top 10 AI platforms. Updated daily for executives, teams, and enterprises.";

export function buildMetadata({
  title,
  description,
  path = "",
  image,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}) {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? `${SITE_URL}/og-default.png`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const JSON_LD_SITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/compare?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function toolJsonLd(tool: {
  name: string;
  description: string;
  website: string;
  scores: { overall: number };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.website,
    applicationCategory: "Artificial Intelligence",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (tool.scores.overall / 20).toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: "1000",
    },
  };
}

export function comparisonJsonLd(toolA: string, toolB: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${toolA} vs ${toolB}: Head-to-Head AI Comparison`,
    description: `Detailed benchmark comparison of ${toolA} vs ${toolB} across speed, accuracy, cost, and use-case performance.`,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    dateModified: new Date().toISOString(),
  };
}

export function faqJsonLd(
  toolA: { name: string; scores: { overall: number }; pricing: { startingAt: string; free: boolean } },
  toolB: { name: string; scores: { overall: number }; pricing: { startingAt: string; free: boolean } }
) {
  const winner = toolA.scores.overall >= toolB.scores.overall ? toolA : toolB;
  const loser = winner.name === toolA.name ? toolB : toolA;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Which is better: ${toolA.name} or ${toolB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Based on our composite benchmark scores, ${winner.name} leads with an overall score of ${winner.scores.overall}/100 versus ${loser.scores.overall}/100 for ${loser.name}. The best choice depends on your specific use case — see the full breakdown above.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${toolA.name} cheaper than ${toolB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${toolA.name} starts at ${toolA.pricing.startingAt}${toolA.pricing.free ? " with a free tier" : ""}. ${toolB.name} starts at ${toolB.pricing.startingAt}${toolB.pricing.free ? " with a free tier" : ""}. Use our Pricing Calculator to estimate your real monthly cost based on actual usage.`,
        },
      },
      {
        "@type": "Question",
        name: `What are the main differences between ${toolA.name} and ${toolB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${toolA.name} and ${toolB.name} differ across benchmark dimensions including reasoning, coding, writing, speed, cost efficiency, and multimodal capabilities. The side-by-side score comparison on this page shows exactly where each tool excels.`,
        },
      },
      {
        "@type": "Question",
        name: `Does ${toolA.name} have a free plan?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: toolA.pricing.free
            ? `Yes, ${toolA.name} offers a free tier. Paid plans start at ${toolA.pricing.startingAt}.`
            : `${toolA.name} does not currently offer a free plan. Pricing starts at ${toolA.pricing.startingAt}.`,
        },
      },
    ],
  };
}
