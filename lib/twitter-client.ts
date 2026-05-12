import { TwitterApi } from "twitter-api-v2";

export interface TweetMetrics {
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  urlClicks: number;
}

function getClient() {
  return new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY!,
    appSecret: process.env.TWITTER_APP_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });
}

function isConfigured() {
  return Boolean(process.env.TWITTER_APP_KEY && process.env.TWITTER_ACCESS_TOKEN);
}

/** Fetch public + non-public metrics for a single tweet */
export async function getTweetMetrics(tweetId: string): Promise<TweetMetrics | null> {
  if (!isConfigured()) return null;
  try {
    const client = getClient();
    const res = await client.v2.singleTweet(tweetId, {
      "tweet.fields": ["public_metrics", "non_public_metrics"],
    });
    const pub = res.data.public_metrics;
    const nonPub = ((res.data as unknown) as Record<string, unknown>)["non_public_metrics"] as Record<string, number> | undefined;
    return {
      impressions: nonPub?.["impression_count"] ?? pub?.impression_count ?? 0,
      likes: pub?.like_count ?? 0,
      retweets: (pub?.retweet_count ?? 0) + (pub?.quote_count ?? 0),
      replies: pub?.reply_count ?? 0,
      urlClicks: nonPub?.["url_link_clicks"] ?? 0,
    };
  } catch {
    return null;
  }
}

/** Fetch metrics for multiple tweet IDs in one API call (up to 100) */
export async function getBatchTweetMetrics(
  tweetIds: string[]
): Promise<Record<string, TweetMetrics>> {
  if (!isConfigured() || tweetIds.length === 0) return {};
  try {
    const client = getClient();
    const res = await client.v2.tweets(tweetIds, {
      "tweet.fields": ["public_metrics", "non_public_metrics"],
    });
    const result: Record<string, TweetMetrics> = {};
    for (const tweet of res.data ?? []) {
      const pub = tweet.public_metrics;
      const nonPub = ((tweet as unknown) as Record<string, unknown>)["non_public_metrics"] as Record<string, number> | undefined;
      result[tweet.id] = {
        impressions: nonPub?.["impression_count"] ?? pub?.impression_count ?? 0,
        likes: pub?.like_count ?? 0,
        retweets: (pub?.retweet_count ?? 0) + (pub?.quote_count ?? 0),
        replies: pub?.reply_count ?? 0,
        urlClicks: nonPub?.["url_link_clicks"] ?? 0,
      };
    }
    return result;
  } catch {
    return {};
  }
}

/** Post a thread — each string is one tweet, replies are chained automatically */
export async function postThread(
  tweets: string[]
): Promise<{ ids: string[]; firstUrl: string }> {
  if (!isConfigured()) throw new Error("Twitter not configured");
  const client = getClient();
  const rw = client.readWrite;
  const ids: string[] = [];
  let replyToId: string | undefined;

  for (const text of tweets) {
    const tweet = await rw.v2.tweet({
      text,
      ...(replyToId ? { reply: { in_reply_to_tweet_id: replyToId } } : {}),
    });
    ids.push(tweet.data.id);
    replyToId = tweet.data.id;
  }

  return { ids, firstUrl: `https://x.com/i/web/status/${ids[0]}` };
}

export async function postTweet(
  text: string,
  imageBuffer?: Buffer
): Promise<{ id: string; url: string }> {
  const client = getClient();
  const rw = client.readWrite;

  let mediaId: string | undefined;
  if (imageBuffer) {
    mediaId = await rw.v1.uploadMedia(imageBuffer, { mimeType: "image/png" });
  }

  const tweet = await rw.v2.tweet({
    text,
    ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
  });

  return {
    id: tweet.data.id,
    url: `https://x.com/i/web/status/${tweet.data.id}`,
  };
}
