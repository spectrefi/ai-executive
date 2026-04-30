# Social Pulse: v1 vs v2 Comparison

## What to compare

Run both pipelines in parallel for 2–4 weeks, then compare the metrics below.
v1 posts are tagged `version: "v1"` · v2 posts are tagged `version: "v2"`.

**Dashboards (all run as BAU — leave all three up simultaneously):**

```bash
npm run dev:all   # starts all three

# Or individually:
npm run dev:v1       # http://localhost:4312  →  /social-pulse/v1
npm run dev:v2       # http://localhost:4313  →  /social-pulse/v2
npm run dev:compare  # http://localhost:4314  →  /social-pulse/compare
```

| Port | Dashboard | Purpose |
|---|---|---|
| 4312 | `/social-pulse/v1` | v1 live feed + analytics |
| 4313 | `/social-pulse/v2` | v2 live feed + enhanced analytics |
| 4314 | `/social-pulse/compare` | Side-by-side comparison (60s ISR, always live) |

The compare dashboard at port 4314 is the primary decision tool — it shows all metrics, deltas, radar chart, and a per-day winner table updated every minute.

---

## Feature Differences

| Capability | v1 | v2 |
|---|---|---|
| **Post visual** | Static CSS/SVG template (8 themes, repeats) | AI-generated unique image per post (Flux 1.1 Pro via Replicate; Ideogram fallback) |
| **TikTok video** | Runway gen4_turbo image-to-video | Runway gen4_turbo → Kling fallback → ffmpeg static loop |
| **Voiceover** | None | ElevenLabs Turbo v2.5 (narrates caption, hashtags stripped) |
| **Background music** | None | Suno AI (theme-matched style — stubbed until Suno API available) |
| **Audio mixing** | None | ffmpeg: voiceover at 100% vol + music at 25% vol, mixed into TikTok video |
| **GIF export** | None | ffmpeg: first 4s of video → 480px animated GIF (for X / Instagram stories) |
| **Day-of-week analytics** | Not shown | Bar chart of avg impressions by day; best day highlighted |
| **Recommendation engine** | Strategy insight (theme-based) | Strategy insight + actionable recommendation (best theme + best day) |
| **Post card** | Fixed themed template visual | Shows AI image if generated; Voiceover + Music badges on card |
| **Dashboard badges** | None | AI Image · Voiceover · Music count badges in stats header |

---

## Generation Pipeline

### v1 pipeline (route: `/api/generate-post`)
```
1. Claude picks story + writes caption
2. @vercel/og generates 1200×628 PNG (themed template)
3. → X: text + template image
4. → Instagram: template image
5. → TikTok: Runway animates template image → 720×1280 MP4
6. Save to Redis
```

### v2 pipeline (route: `/api/generate-post-v2`)
```
1. Claude picks story + writes caption
2. Flux 1.1 Pro generates unique 1200×628 AI image
3. → X: text + AI image
4. → Instagram: AI image
5. → TikTok:
   a. Runway animates AI image → 720×1280 MP4 (Kling fallback)
   b. ElevenLabs generates voiceover MP3
   c. Suno generates background music (when API available)
   d. ffmpeg mixes voiceover + music into MP4
   e. ffmpeg exports 4s GIF from video
   f. Upload full MP4 to TikTok via FILE_UPLOAD
6. Save to Redis with v2 fields (aiImageUrl, hasVoiceover, hasMusic, gifUrl)
```

---

## New Environment Variables (v2 only)

| Variable | Service | Purpose |
|---|---|---|
| `REPLICATE_API_KEY` | replicate.com | Flux 1.1 Pro image generation |
| `IDEOGRAM_API_KEY` | ideogram.ai | Fallback image generation (text/typography accuracy) |
| `ELEVENLABS_API_KEY` | elevenlabs.io | Caption voiceover (MP3) |
| `ELEVENLABS_VOICE_ID` | elevenlabs.io | Optional — defaults to Rachel |
| `KLING_API_KEY` | klingai.com | Video generation fallback |
| `SUNO_API_KEY` | suno.com | Background music (stubbed — no public API yet) |

---

## What to Measure

After 2–4 weeks of parallel posting, compare these metrics between v1 and v2 posts:

| Metric | Where to find |
|---|---|
| X impressions | `/social-pulse/v1` vs `/social-pulse/v2` stats panels |
| X engagement rate | Theme leaderboard, avg engagement % |
| X link clicks | Link Clicks stat card |
| Instagram reach | IG totals card |
| Instagram saves | IG totals card (saves = interest signal) |
| TikTok views | TikTok totals card |
| TikTok completion rate | Not yet tracked — add via TikTok Analytics API |
| TikTok shares | TikTok totals card |

**Key questions:**
1. Does the AI image drive higher X impressions than the template?
2. Does the voiceover increase TikTok view duration / shares?
3. Which themes perform better in v2 vs v1?
4. Is the cost-per-impression of v2 justified vs v1?

---

## Cost Comparison

| Item | v1 cost | v2 cost |
|---|---|---|
| Caption (Claude Sonnet 4.6) | ~$0.01/post | ~$0.01/post |
| Post image | $0 (template) | ~$0.04/post (Flux via Replicate) |
| TikTok video (Runway 10s) | ~$0.10/post | ~$0.10/post |
| Voiceover (ElevenLabs) | $0 | ~$0.01–0.03/post |
| Background music (Suno) | $0 | ~$0.05/post (when available) |
| **Total / post** | **~$0.11** | **~$0.20–0.23** |
| **Total / month (30 posts)** | **~$3.30** | **~$6–7** |

---

## Decision Framework

After the trial, keep whichever version wins on **cost-per-impression** (not raw impressions).

- If v2 doubles impressions at 2× cost → switch to v2 (same CPM)
- If v2 improves impressions by 50% at 2× cost → v1 wins on efficiency
- If TikTok views increase 3×+ with voiceover → voiceover is worth keeping regardless
- Suno music: test separately (enable/disable via env var) once API is live

---

## Files

| File | Version |
|---|---|
| `app/social-pulse/page.tsx` | Original (live) |
| `app/social-pulse/v1/page.tsx` | v1 frozen dashboard |
| `app/social-pulse/v2/page.tsx` | v2 enhanced dashboard |
| `components/SocialPostCard.tsx` | v1 card |
| `components/SocialPostCardV2.tsx` | v2 card (AI image, badges) |
| `components/SocialPulseStats.tsx` | v1 stats |
| `components/SocialPulseStatsV2.tsx` | v2 stats (day-of-week, recommendations) |
| `app/api/generate-post/route.ts` | v1 pipeline |
| `app/api/generate-post-v2/route.ts` | v2 pipeline |
| `lib/image-generator.ts` | Flux + Ideogram |
| `lib/elevenlabs-client.ts` | ElevenLabs TTS |
| `lib/suno-client.ts` | Suno stub |
| `lib/video-generator.ts` | Runway + Kling + ffmpeg + audio mixing + GIF export |
| `.github/workflows/social_post.yml` | v1 cron |
| `.github/workflows/social_post_v2.yml` | v2 cron |
