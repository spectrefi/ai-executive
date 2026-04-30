export interface FeedConfig {
  url: string;
  source: string;
  filterByAI: boolean;
}

export const RSS_FEEDS_META: FeedConfig[] = [
  // ── Official company & research labs ──
  { url: "https://openai.com/news/rss.xml",                                         source: "OpenAI",               filterByAI: false },
  { url: "https://www.anthropic.com/news/rss",                                      source: "Anthropic",            filterByAI: false },
  { url: "https://blog.google/technology/ai/rss/",                                  source: "Google AI Blog",       filterByAI: false },
  { url: "https://deepmind.google/discover/blog/rss.xml",                           source: "Google DeepMind",      filterByAI: false },
  { url: "https://research.google/blog/rss/",                                       source: "Google Research",      filterByAI: false },
  { url: "https://ai.meta.com/blog/rss/",                                           source: "Meta AI",              filterByAI: false },
  { url: "https://blogs.microsoft.com/ai/feed/",                                    source: "Microsoft AI",         filterByAI: false },
  { url: "https://www.microsoft.com/en-us/research/feed/",                          source: "Microsoft Research",   filterByAI: true  },
  { url: "https://huggingface.co/blog/feed.xml",                                    source: "HuggingFace",          filterByAI: false },
  { url: "https://blogs.nvidia.com/blog/category/artificial-intelligence/feed/",    source: "NVIDIA AI",            filterByAI: false },
  { url: "https://aws.amazon.com/blogs/machine-learning/feed/",                     source: "AWS Machine Learning", filterByAI: false },
  { url: "https://www.ibm.com/blogs/research/category/ai-research/feed/",           source: "IBM Research",         filterByAI: false },
  { url: "https://stability.ai/news/rss.xml",                                       source: "Stability AI",         filterByAI: false },
  { url: "https://mistral.ai/news/rss.xml",                                         source: "Mistral AI",           filterByAI: false },
  { url: "https://cohere.com/blog/rss",                                             source: "Cohere",               filterByAI: false },
  { url: "https://github.blog/feed/",                                               source: "GitHub Blog",          filterByAI: true  },
  // ── Premium tech journalism ──
  { url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",    source: "MIT Tech Review",      filterByAI: false },
  { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",       source: "The Verge",            filterByAI: false },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab",                source: "Ars Technica",         filterByAI: true  },
  { url: "https://www.wired.com/feed/tag/artificial-intelligence/latest/rss",       source: "Wired",                filterByAI: false },
  { url: "https://spectrum.ieee.org/feeds/feed.rss",                                source: "IEEE Spectrum",        filterByAI: true  },
  { url: "https://www.scientificamerican.com/feed/category/technology/",            source: "Scientific American",  filterByAI: true  },
  { url: "https://www.nature.com/subjects/machine-learning.rss",                    source: "Nature",               filterByAI: false },
  // ── Wire services & financial press ──
  { url: "https://feeds.reuters.com/reuters/technologyNews",                        source: "Reuters",              filterByAI: true  },
  { url: "https://fortune.com/section/technology/feed/",                            source: "Fortune",              filterByAI: true  },
  { url: "https://www.cnbc.com/id/100727362/device/rss/rss.html",                  source: "CNBC Tech",            filterByAI: true  },
  { url: "https://www.businessinsider.com/sai/rss",                                source: "Business Insider",     filterByAI: true  },
  // ── Specialist AI press ──
  { url: "https://venturebeat.com/category/ai/feed/",                              source: "VentureBeat AI",       filterByAI: false },
  { url: "https://techcrunch.com/tag/artificial-intelligence/feed/",               source: "TechCrunch",           filterByAI: false },
  { url: "https://www.deeplearning.ai/the-batch/feed/",                            source: "The Batch",            filterByAI: false },
  { url: "https://www.zdnet.com/topic/artificial-intelligence/rss.xml",            source: "ZDNet AI",             filterByAI: false },
  { url: "https://www.techrepublic.com/rssfeeds/topic/artificial-intelligence/",   source: "TechRepublic",         filterByAI: false },
  { url: "https://www.cnet.com/rss/ai/",                                           source: "CNET AI",              filterByAI: false },
  { url: "https://towardsdatascience.com/feed",                                    source: "Towards Data Science", filterByAI: true  },
  { url: "https://syncedreview.com/feed/",                                         source: "Synced Review",        filterByAI: false },
  { url: "https://www.aitrends.com/feed/",                                         source: "AI Trends",            filterByAI: false },
  // ── Enterprise & developer ──
  { url: "https://www.infoq.com/ai-ml-data-eng/rss/",                             source: "InfoQ AI",             filterByAI: false },
  { url: "https://thenewstack.io/category/machine-learning/feed/",                 source: "The New Stack",        filterByAI: false },
  { url: "https://www.theregister.com/software/ai_ml/headlines.atom",             source: "The Register",         filterByAI: false },
  { url: "https://siliconangle.com/category/ai/feed/",                             source: "SiliconANGLE",         filterByAI: false },
  { url: "https://www.datanami.com/feed/",                                         source: "Datanami",             filterByAI: true  },
  // ── Research & academic ──
  { url: "https://bair.berkeley.edu/blog/feed.xml",                                source: "Berkeley AI Research", filterByAI: false },
  { url: "https://ai.stanford.edu/blog/feed.xml",                                  source: "Stanford AI Lab",      filterByAI: false },
  { url: "https://news.mit.edu/rss/topic/artificial-intelligence",                 source: "MIT News",             filterByAI: false },
  { url: "https://research.facebook.com/blog/feed/",                              source: "Meta Research",        filterByAI: true  },
  // ── High-signal newsletters (Substack) ──
  { url: "https://importai.substack.com/feed",                                     source: "Import AI",            filterByAI: false },
  { url: "https://www.interconnects.ai/feed",                                      source: "Interconnects",        filterByAI: false },
  { url: "https://thegradient.pub/rss/",                                           source: "The Gradient",         filterByAI: false },
  { url: "https://www.oneusefulthing.org/feed",                                    source: "One Useful Thing",     filterByAI: false },
  // ── Community sources (API-based, handled separately in rss.ts) ──
  { url: "https://hn.algolia.com/api/v1/search",                                   source: "Hacker News",          filterByAI: false },
  { url: "https://www.reddit.com/r/MachineLearning/top.json",                      source: "r/MachineLearning",    filterByAI: false },
  { url: "https://www.reddit.com/r/LocalLLaMA/top.json",                           source: "r/LocalLLaMA",         filterByAI: false },
];
