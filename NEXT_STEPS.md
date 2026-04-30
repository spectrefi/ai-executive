# Next Steps & Deployment Checklist

## Build Status

### Core platform

| Area | Status | Notes |
|---|---|---|
| Social Pulse page | ✅ Done | `/social-pulse`, ISR 300s |
| Daily cron (GitHub Actions) | ✅ Done | 16:59 UTC, max-time 3660s |
| X / Twitter posting | ✅ Done | Image + text, metrics via API |
| Instagram posting | ✅ Done | Image post via Meta Graph API |
| TikTok posting | ✅ Done | FILE_UPLOAD chunked MP4 |
| TikTok video (Runway) | ✅ Done | gen4_turbo, 10s, 720×1280, theme-prompted |
| Kling video fallback | ✅ Done | Runway → Kling → ffmpeg static loop |
| Cross-platform analytics | ✅ Done | Impressions, likes, reach, views per post |
| Analytics dashboard | ✅ Done | Charts + theme leaderboard |
| Affiliate links | ✅ Done | Tool + compare pages, UTM tracked |
| OG image generator | ✅ Done | 8 themes, Edge runtime |
| Sample posts (dev fallback) | ✅ Done | 10 posts shown without Redis |

### v2 enhancements

| Feature | Status | Notes |
|---|---|---|
| v1 dashboard (frozen) | ✅ Done | `/social-pulse/v1` |
| v2 dashboard | ✅ Done | `/social-pulse/v2` |
| Flux AI image generation | ✅ Done | `lib/image-generator.ts` — Replicate; Ideogram fallback |
| ElevenLabs voiceover | ✅ Done | `lib/elevenlabs-client.ts` — mixed into TikTok video |
| Audio mixing (ffmpeg) | ✅ Done | `lib/video-generator.ts` `mixAudioIntoVideo()` |
| GIF export | ✅ Done | `lib/video-generator.ts` `videoToGif()` — 4s, 480px, 12fps |
| Day-of-week analytics | ✅ Done | `lib/post-analytics.ts` — `byDayOfWeek` + `bestDay` |
| Recommendation engine | ✅ Done | `buildRecommendation()` in post-analytics |
| v2 generate-post route | ✅ Done | `/api/generate-post-v2` |
| v2 GitHub Actions cron | ✅ Done | `.github/workflows/social_post_v2.yml` |
| V1 vs V2 comparison doc | ✅ Done | `V1_VS_V2.md` |
| Compare dashboard | ✅ Done | `/social-pulse/compare` — live, 60s ISR, radar + per-day table |
| Three-port dev setup | ✅ Done | 4312=v1, 4313=v2, 4314=compare (`npm run dev:all`) |
| Suno background music | ⏳ Stubbed | `lib/suno-client.ts` — no public Suno API yet |

---

## Before Going Live

### 1. Vercel Environment Variables

**Required (both pipelines):**
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET` (random secret — same value in GitHub Actions)
- `NEXT_PUBLIC_SITE_URL` = `https://aiexecutive.io`

**X / Twitter:**
- `TWITTER_APP_KEY`, `TWITTER_APP_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_SECRET`

**Instagram:**
- `INSTAGRAM_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN`

**TikTok:**
- `TIKTOK_ACCESS_TOKEN`, `TIKTOK_OPEN_ID`

**AI video (v1 + v2):**
- `RUNWAY_API_KEY` — app.runwayml.com → API Keys
- `KLING_API_KEY` — klingai.com (video fallback)

**v2 only:**
- `REPLICATE_API_KEY` — replicate.com (Flux image generation)
- `IDEOGRAM_API_KEY` — ideogram.ai (image fallback)
- `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` — elevenlabs.io (voiceover)
- `SUNO_API_KEY` — when available (background music)

### 2. X / Twitter

1. Apply for Elevated access at developer.twitter.com (required for non-public metrics)
2. Create an App → generate Access Token + Secret for your posting account
3. Add the 4 Twitter vars to Vercel

### 3. Instagram

1. Create a Facebook App at developers.facebook.com
2. Add Instagram Graph API product
3. Connect your Instagram Professional account
4. Generate a long-lived access token (valid 60 days — refresh before expiry)
5. Find your Account ID via the Graph API Explorer
6. Add `INSTAGRAM_ACCOUNT_ID`, `INSTAGRAM_ACCESS_TOKEN` to Vercel

### 4. TikTok

1. Create an app at developer.tiktok.com
2. Enable **Content Posting API** scope
3. Complete OAuth 2.0 flow to get `access_token` + `open_id`
4. Add to Vercel
5. TikTok tokens expire — set up a refresh mechanism before production

### 5. GitHub Actions

1. Add `CRON_SECRET` as a GitHub Actions secret (same value as Vercel)
2. Add `SITE_URL` secret = `https://aiexecutive.io`
3. Both workflows run at `cron: "59 16 * * *"` (already set)
4. Disable `social_post_v2.yml` if you only want to run one pipeline

### 6. Seed Redis (optional)

```bash
# From project root, with .env.local populated
npx tsx scripts/seed-social-posts.ts
```

---

## Affiliate Programs to Sign Up

| Tool | Program | Notes |
|---|---|---|
| Cursor | cursor.com/affiliates | Apply via their site |
| Perplexity | Direct outreach | No public program yet |
| Notion | notion.so/affiliates | Commission on paid plans |
| Midjourney | No affiliate program | — |
| RunwayML | runway.ml/affiliates | Apply via site |

---

## Running the Dashboards

All three dashboards run as independent persistent processes from a single command:

```bash
npm run dev:all
```

Or individually:

```bash
npm run dev:v1       # http://localhost:4312  → /social-pulse/v1
npm run dev:v2       # http://localhost:4313  → /social-pulse/v2
npm run dev:compare  # http://localhost:4314  → /social-pulse/compare
```

Each port auto-redirects its root (`/`) to the correct dashboard via `middleware.ts`.
All three run as BAU — leave them running, they will stay live independently.

---

## Open Decisions

| Decision | Recommendation |
|---|---|
| v1 vs v2 winner | Run both for 2–4 weeks, compare via `V1_VS_V2.md` framework |
| TikTok token refresh | Build `/api/refresh-tiktok-token` on a weekly cron |
| Instagram token refresh | Same — long-lived tokens last 60 days |
| Suno music | Enable once official API ships (monitor suno.com/api-access) |
| GIF storage | Replace `gifUrl: "generated"` stub in v2 route with Vercel Blob upload |
| Multi-post days | Could post 2–3× on high-news days — not yet built |
| TikTok watch-time | Add via TikTok Analytics API for fuller v2 picture |

---

## All Key Files

```
app/
  social-pulse/page.tsx              Original dashboard (live)
  social-pulse/v1/page.tsx           v1 frozen dashboard (port 4312)
  social-pulse/v2/page.tsx           v2 enhanced dashboard (port 4313)
  social-pulse/compare/page.tsx      Live compare dashboard (port 4314, ISR 60s)
  api/generate-post/route.ts         v1 cron endpoint
  api/generate-post-v2/route.ts      v2 cron endpoint
  api/og/social-post/route.tsx       OG template image (Edge)
  tools/[slug]/page.tsx              Tool detail + affiliate CTA
  compare/[slug]/page.tsx            Tool comparison

components/
  SocialPostCard.tsx                 v1 post card
  SocialPostCardV2.tsx               v2 card (AI image, badges)
  SocialPulseStats.tsx               v1 analytics
  SocialPulseStatsV2.tsx             v2 analytics (day-of-week, recommendations)
  SocialPulseCompare.tsx             Compare dashboard — scoreboard, charts, radar, per-day table

lib/
  social-post-generator.ts           Claude caption + theme selection
  social-post-archive.ts             Redis store + SocialPost type
  post-analytics.ts                  Cross-platform aggregation + day-of-week
  image-generator.ts                 Flux 1.1 Pro (Replicate) + Ideogram fallback
  video-generator.ts                 Runway → Kling → ffmpeg; audio mix; GIF export
  elevenlabs-client.ts               ElevenLabs TTS voiceover
  suno-client.ts                     Suno music stub (pending API)
  twitter-client.ts                  X post + metrics
  instagram-client.ts                Meta Graph API post + metrics
  tiktok-client.ts                   TikTok FILE_UPLOAD + metrics
  affiliates.ts                      Affiliate URL map + UTM helpers
  sample-social-posts.ts             Dev fallback (10 posts)

.github/workflows/
  social_post.yml                    v1 daily cron (16:59 UTC)
  social_post_v2.yml                 v2 daily cron (16:59 UTC)

V1_VS_V2.md                          A/B comparison framework
NEXT_STEPS.md                        This file
README.md                            Project overview + env vars
```
