/**
 * TikTok Content Posting API — FILE_UPLOAD chunked video publishing.
 *
 * Env vars needed:
 *  TIKTOK_ACCESS_TOKEN    — OAuth 2.0 user access token (from auth flow)
 *  TIKTOK_OPEN_ID         — TikTok user open_id (returned during auth)
 *
 * Setup:
 *  1. developer.tiktok.com → Create App → enable Content Posting API
 *  2. Complete OAuth flow to get access token for your account
 *  3. Add env vars above to Vercel
 */

const BASE = "https://open.tiktokapis.com/v2";
const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk (TikTok minimum)

function isConfigured() {
  return Boolean(process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_OPEN_ID);
}

export interface TikTokMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Publish a video buffer to TikTok using the FILE_UPLOAD chunked method.
 * No external video URL required — the MP4 buffer is uploaded directly.
 */
export async function postToTikTok(
  caption: string,
  videoBuffer: Buffer
): Promise<{ videoId: string } | null> {
  if (!isConfigured()) return null;

  const token = process.env.TIKTOK_ACCESS_TOKEN!;
  const videoSize = videoBuffer.byteLength;
  const chunkCount = Math.ceil(videoSize / CHUNK_SIZE);

  // 1. Initialise upload
  const initRes = await fetch(`${BASE}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: caption.slice(0, 150),
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoSize,
        chunk_size: CHUNK_SIZE,
        total_chunk_count: chunkCount,
      },
    }),
  });

  const initData = await initRes.json() as {
    data?: { publish_id?: string; upload_url?: string };
    error?: { message: string };
  };

  if (!initData.data?.publish_id || !initData.data?.upload_url) {
    console.error("TikTok init failed:", initData.error?.message);
    return null;
  }

  const { publish_id, upload_url } = initData.data;

  // 2. Upload chunks
  for (let i = 0; i < chunkCount; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, videoSize);
    const chunk = videoBuffer.subarray(start, end);

    const uploadRes = await fetch(upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Range": `bytes ${start}-${end - 1}/${videoSize}`,
        "Content-Length": String(chunk.byteLength),
      },
      body: new Uint8Array(chunk),
    });

    if (!uploadRes.ok) {
      console.error(`TikTok chunk ${i} upload failed: ${uploadRes.status}`);
      return null;
    }
  }

  return { videoId: publish_id };
}

/** Fetch metrics for a published TikTok video */
export async function getTikTokMetrics(videoId: string): Promise<TikTokMetrics | null> {
  if (!isConfigured()) return null;
  try {
    const token = process.env.TIKTOK_ACCESS_TOKEN!;
    const res = await fetch(
      `${BASE}/video/query/?fields=id,like_count,comment_count,share_count,play_count`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters: { video_ids: [videoId] } }),
      }
    );
    const data = await res.json() as {
      data?: { videos?: { id: string; play_count: number; like_count: number; comment_count: number; share_count: number }[] };
    };
    const v = data.data?.videos?.[0];
    if (!v) return null;
    return {
      views: v.play_count,
      likes: v.like_count,
      comments: v.comment_count,
      shares: v.share_count,
    };
  } catch {
    return null;
  }
}

export async function getBatchTikTokMetrics(
  videoIds: string[]
): Promise<Record<string, TikTokMetrics>> {
  if (!isConfigured() || videoIds.length === 0) return {};
  const results: Record<string, TikTokMetrics> = {};
  await Promise.allSettled(
    videoIds.map(async (id) => {
      const m = await getTikTokMetrics(id);
      if (m) results[id] = m;
    })
  );
  return results;
}
