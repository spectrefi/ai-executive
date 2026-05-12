/**
 * Instagram Graph API — image post publishing.
 *
 * Requirements:
 *  - Instagram Professional account (Creator or Business)
 *  - Linked to a Facebook Page
 *  - Facebook App with instagram_content_publish + pages_read_engagement permissions
 *  - Long-lived Page access token
 *
 * Env vars needed:
 *  INSTAGRAM_ACCOUNT_ID   — your IG business account ID (numeric)
 *  INSTAGRAM_ACCESS_TOKEN — long-lived page access token
 *  NEXT_PUBLIC_SITE_URL   — needed so IG can fetch the image URL (must be public)
 */

const BASE = "https://graph.facebook.com/v19.0";

function isConfigured() {
  return Boolean(
    process.env.INSTAGRAM_ACCOUNT_ID && process.env.INSTAGRAM_ACCESS_TOKEN
  );
}

export interface IgMetrics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  saved: number;
}

/**
 * Publish an image post to Instagram.
 * imageUrl must be publicly reachable (Instagram fetches it server-side).
 * Returns the IG media ID on success.
 */
export async function postToInstagram(
  caption: string,
  imageUrl: string
): Promise<{ mediaId: string; url: string } | null> {
  if (!isConfigured()) return null;

  const accountId = process.env.INSTAGRAM_ACCOUNT_ID!;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN!;

  const authHeader = { Authorization: `Bearer ${token}` };

  // Step 1 — create media container
  const createBody = new URLSearchParams({ image_url: imageUrl, caption });
  const createRes = await fetch(`${BASE}/${accountId}/media`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: createBody.toString(),
  });
  const created = await createRes.json() as { id?: string; error?: { message: string } };
  if (!created.id) {
    console.error("Instagram media container failed:", created.error?.message);
    return null;
  }

  // Step 2 — publish container
  const publishBody = new URLSearchParams({ creation_id: created.id });
  const publishRes = await fetch(`${BASE}/${accountId}/media_publish`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/x-www-form-urlencoded" },
    body: publishBody.toString(),
  });
  const published = await publishRes.json() as { id?: string; error?: { message: string } };
  if (!published.id) {
    console.error("Instagram publish failed:", published.error?.message);
    return null;
  }

  return {
    mediaId: published.id,
    url: `https://www.instagram.com/p/${published.id}/`,
  };
}

/** Fetch basic insights for a published media object */
export async function getIgMetrics(mediaId: string): Promise<IgMetrics | null> {
  if (!isConfigured()) return null;
  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN!;
    const fields = "impressions,reach,like_count,comments_count,saved";
    const res = await fetch(`${BASE}/${mediaId}/insights?metric=${fields}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { data?: { name: string; values: { value: number }[] }[]; error?: unknown };
    if (!data.data) return null;

    const get = (name: string) =>
      data.data!.find((d) => d.name === name)?.values?.[0]?.value ?? 0;

    return {
      impressions: get("impressions"),
      reach: get("reach"),
      likes: get("like_count"),
      comments: get("comments_count"),
      saved: get("saved"),
    };
  } catch {
    return null;
  }
}

export async function getBatchIgMetrics(
  mediaIds: string[]
): Promise<Record<string, IgMetrics>> {
  if (!isConfigured() || mediaIds.length === 0) return {};
  const results: Record<string, IgMetrics> = {};
  await Promise.allSettled(
    mediaIds.map(async (id) => {
      const m = await getIgMetrics(id);
      if (m) results[id] = m;
    })
  );
  return results;
}
