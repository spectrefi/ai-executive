# AI Executive

AI tool intelligence platform — rankings, comparisons, and a daily viral social post auto-posted to X, Instagram, and TikTok.

**Stack:** Next.js 16.2.4 · React 19 · Tailwind CSS v4 · TypeScript · Upstash Redis · Vercel

---

## Getting Started

```bash
npm install

# Run all three dashboards simultaneously (BAU)
npm run dev:all

# Or individually
npm run dev:v1       # http://localhost:4312  →  /social-pulse/v1
npm run dev:v2       # http://localhost:4313  →  /social-pulse/v2
npm run dev:compare  # http://localhost:4314  →  /social-pulse/compare
```

Copy `.env.local.example` → `.env.local` and fill in the required values (see below).

---

## Environment Variables

### Core (required)

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Post archive storage |
| `UPSTASH_REDIS_REST_TOKEN` | Post archive storage |
| `ANTHROPIC_API_KEY` | Caption generation (claude-sonnet-4-6) |
| `CRON_SECRET` | Protects `/api/generate-post` and `/api/generate-post-v2` |
| `NEXT_PUBLIC_SITE_URL` | OG image URL construction |

### Social platforms (optional — each platform posts independently)

| Variable | Purpose |
|---|---|
| `TWITTER_APP_KEY` | Post to X |
| `TWITTER_APP_SECRET` | Post to X |
| `TWITTER_ACCESS_TOKEN` | Post to X |
| `TWITTER_ACCESS_SECRET` | Post to X |
| `INSTAGRAM_ACCOUNT_ID` | Post to Instagram |
| `INSTAGRAM_ACCESS_TOKEN` | Post to Instagram |
| `TIKTOK_ACCESS_TOKEN` | Post to TikTok |
| `TIKTOK_OPEN_ID` | Post to TikTok |

### AI services (optional — degrade gracefully without each)

| Variable | Purpose | Fallback |
|---|---|---|
| `RUNWAY_API_KEY` | AI video for TikTok (gen4_turbo, 10s, 9:16) | Kling → ffmpeg static loop |
| `KLING_API_KEY` | Video fallback if Runway fails | ffmpeg static loop |
| `REPLICATE_API_KEY` | Flux 1.1 Pro image generation (v2) | Ideogram → OG template |
| `IDEOGRAM_API_KEY` | Image generation fallback (v2) | OG template |
| `ELEVENLABS_API_KEY` | Voiceover narration on TikTok videos (v2) | No audio |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice selection (v2) | Defaults to Rachel |
| `SUNO_API_KEY` | Background music on TikTok videos (v2, stubbed) | No music |
| `NEWS_API_KEY` | NewsAPI source | RSS feeds only |

---

## Key Pages

| Route | Description |
|---|---|
| `/` | Tool rankings dashboard |
| `/tools/[slug]` | Tool detail + affiliate CTA |
| `/compare/[slug]` | Side-by-side tool comparison |
| `/social-pulse` | Daily viral post archive + analytics (live) |
| `/social-pulse/v1` | v1 dashboard — frozen for comparison (dev: port 4312) |
| `/social-pulse/v2` | v2 dashboard — AI image, voiceover, day-of-week analytics (dev: port 4313) |
| `/social-pulse/compare` | Live v1 vs v2 comparison — 60s refresh, radar, per-day table (dev: port 4314) |

---

## Social Pulse

Two parallel daily pipelines running for A/B performance comparison. See `V1_VS_V2.md` for the full comparison framework and `NEXT_STEPS.md` for the deployment checklist.

### v1 (original)
- Template visual (8 themed CSS/SVG designs, @vercel/og)
- Runway gen4_turbo animates the template → 10s TikTok video
- Analytics: impressions, engagement, theme leaderboard

### v2 (AI-enhanced)
- **Flux 1.1 Pro** generates a unique AI image per post (no two posts share a template)
- **ElevenLabs Turbo v2.5** narrates the caption as a voiceover
- **Suno** adds background music matched to the theme (stubbed — API pending)
- **ffmpeg** mixes voiceover + music into the Runway video before TikTok upload
- **GIF export** — 4s animated GIF from the video (for X / Instagram stories)
- Analytics: all v1 metrics + day-of-week heatmap + recommendation engine

---

## Project Structure

```
app/
  social-pulse/
    page.tsx              Original dashboard (live)
    v1/page.tsx           v1 frozen dashboard
    v2/page.tsx           v2 enhanced dashboard
  api/
    generate-post/        v1 cron endpoint
    generate-post-v2/     v2 cron endpoint
    og/social-post/       OG template image generator (Edge)
  tools/[slug]/           Tool detail + affiliate CTA
  compare/[slug]/         Tool comparison

components/
  SocialPostCard.tsx      v1 post card
  SocialPostCardV2.tsx    v2 card — AI image display, voiceover/music badges
  SocialPulseStats.tsx    v1 analytics — impressions, engagement, theme chart
  SocialPulseStatsV2.tsx  v2 analytics — adds day-of-week chart + recommendations

lib/
  social-post-generator.ts   Claude caption + theme selection
  social-post-archive.ts     Redis store + SocialPost type (v1 + v2 fields)
  post-analytics.ts          Cross-platform aggregation (byDayOfWeek, recommendation)
  image-generator.ts         Flux 1.1 Pro (Replicate) + Ideogram fallback
  video-generator.ts         Runway → Kling → ffmpeg; audio mixing; GIF export
  elevenlabs-client.ts       ElevenLabs TTS → MP3 buffer
  suno-client.ts             Suno music stub
  twitter-client.ts          X API — post + metrics
  instagram-client.ts        Meta Graph API — post + metrics
  tiktok-client.ts           TikTok FILE_UPLOAD + metrics
  affiliates.ts              Affiliate link map + UTM helpers
  sample-social-posts.ts     10 dev fallback posts (auto when Redis not configured)

.github/workflows/
  social_post.yml            v1 daily cron (16:59 UTC)
  social_post_v2.yml         v2 daily cron (16:59 UTC)

V1_VS_V2.md                  A/B comparison framework — features, costs, metrics to track
NEXT_STEPS.md                Deployment checklist + open decisions
```
