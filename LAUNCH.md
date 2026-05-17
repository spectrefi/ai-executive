# AI Executive — Launch Checklist

## 1. Register the Domain

1. Go to your registrar (Namecheap, Cloudflare Registrar, etc.) and register **aiexecutive.io**
2. In Netlify → Site settings → Domain management → Add custom domain → `aiexecutive.io`
3. Point your domain's nameservers to Netlify's (shown in the Netlify domain settings), or add the DNS records Netlify gives you
4. Wait for DNS propagation (usually 10–30 min with Cloudflare, up to 48h elsewhere)
5. Netlify auto-provisions an SSL cert once DNS resolves

## 2. Update Environment Variables in Netlify

Go to **Netlify → Site → Environment variables** and set:

```
NEXT_PUBLIC_SITE_URL=https://aiexecutive.io
```

Also regenerate the secrets that were created with placeholder values:

```bash
# Run these locally, copy the output into Netlify
openssl rand -hex 32   # use for ADMIN_SECRET
openssl rand -hex 32   # use for CRON_SECRET
```

Full list of required vars:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://aiexecutive.io` |
| `ADMIN_SECRET` | `openssl rand -hex 32` |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `UPSTASH_REDIS_REST_URL` | See step 3 |
| `UPSTASH_REDIS_REST_TOKEN` | See step 3 |
| `RESEND_API_KEY` | See step 4 |
| `RESEND_AUDIENCE_ID` | See step 4 |

## 3. Set Up Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com) and create a free account
2. Create a new Redis database → choose the region closest to your Netlify deploy region
3. Copy **REST URL** and **REST Token** from the database dashboard
4. Add to Netlify env vars:
   ```
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

Redis powers: rankings snapshots, breaking news dedup, social post archive, tool alert subscribers, news vote scores.

## 4. Set Up Resend (Email)

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your sending domain (`aiexecutive.io`) under Domains
3. Create an API key under API Keys
4. Create an Audience under Audiences (this is your email list)
5. Add to Netlify env vars:
   ```
   RESEND_API_KEY=re_your_key_here
   RESEND_AUDIENCE_ID=your_audience_id_here
   ```

## 5. Submit to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → Domain → `aiexecutive.io`
3. Verify ownership (Netlify makes this easy — add the TXT record to your DNS)
4. Go to Sitemaps → Submit `https://aiexecutive.io/sitemap.xml`
5. Go to [bing.com/webmasters](https://bing.com/webmasters) → Import from GSC (one click, covers Bing + DuckDuckGo)

This indexes all 2,600+ pages. The compare pages (`/compare/chatgpt-vs-claude` etc.) are the biggest SEO asset — they target high-intent search queries.

## 6. Sign Up to Affiliate Programs

Edit `lib/affiliates.ts` and replace placeholder links with your actual referral URLs.

| Tool | Program |
|---|---|
| ChatGPT Plus | [openai.com/affiliate-program](https://openai.com/affiliate-program) |
| Claude Pro | [anthropic.com](https://anthropic.com) — contact partnerships |
| Cursor | [cursor.com/affiliates](https://cursor.com/affiliates) |
| GitHub Copilot | GitHub affiliate / partner program |
| Midjourney | No affiliate program yet |
| Perplexity | [perplexity.ai/hub/affiliates](https://perplexity.ai/hub/affiliates) |
| ElevenLabs | [elevenlabs.io/affiliates](https://elevenlabs.io/affiliates) |
| Jasper | [jasper.ai/affiliates](https://jasper.ai/affiliates) |
| Grammarly | [grammarly.com/affiliates](https://grammarly.com/affiliates) |

Every "Try now" button on tool and compare pages uses these links. This is the primary revenue mechanism.

## 7. Connect Social Accounts (Optional but recommended)

Add to Netlify env vars to enable auto-posting:

```
TWITTER_APP_KEY=
TWITTER_APP_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
```

Get these from [developer.twitter.com](https://developer.twitter.com) → your app → Keys and tokens. You need a project with OAuth 1.0a User Context and Read+Write permissions.

Instagram and TikTok are optional at launch — X/Twitter alone is enough to start.

## 8. Run First Weekly Power Rankings

Once Redis and Twitter are connected, bootstrap the system:

```bash
curl -X POST https://aiexecutive.io/api/power-rankings \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

This:
- Saves the first rankings snapshot to Redis (required for future rank-change detection)
- Posts the first weekly thread to X
- Sends the first email to your audience (once you have subscribers)

## 9. Enable GitHub Actions

The GitHub Actions workflows need two secrets set in the repo:

Go to **GitHub → spectrefi/ai-executive → Settings → Secrets → Actions** and add:

| Secret | Value |
|---|---|
| `SITE_URL` | `https://aiexecutive.io` |
| `CRON_SECRET` | Same value as Netlify env var |

This activates:
- Daily social posts (16:59 UTC)
- Weekly power rankings (Monday 09:00 UTC)
- Breaking news checks (every 6 hours)

## 10. Product Hunt Launch

Do this after the domain is live and the site has been indexed for at least a week.

**Preparation:**
- Write the tagline: *"Live AI tool rankings, daily benchmarks, and instant head-to-head comparisons"*
- Screenshot the compare pages, leaderboard card, and embed widget for gallery images
- Line up 10–20 upvoters (friends, colleagues, AI community contacts) to vote in the first hour — the first-hour velocity determines your day-one ranking

**On launch day:**
- Post to X tagging @OpenAI, @AnthropicAI, @GoogleDeepMind — companies often repost rankings content
- Submit to r/MachineLearning, r/LocalLLaMA, r/ChatGPT as a genuine resource (not a spam post)
- Post on LinkedIn — weekly power rankings posts perform well there

**Post-launch:**
- Email the rankings API (`GET /api/og/leaderboard`) to 10 AI journalists as a free data source
- Pitch the embed widget to AI bloggers — each embed is a backlink

---

## Security Checklist (before going live)

- [ ] Regenerate `ADMIN_SECRET` with `openssl rand -hex 32`
- [ ] Regenerate `CRON_SECRET` with `openssl rand -hex 32`
- [ ] Run `npm audit fix` in the project directory
- [ ] Enable Dependabot on the GitHub repo (Settings → Security → Dependabot)
- [ ] Enable branch protection on `main` (Settings → Branches → Add rule → Require PR review)
- [ ] Pin GitHub Actions to commit SHAs (see SECURITY.md)

---

## Admin & Monitoring

Once live, the admin panel at `/admin/status` (requires `x-admin-secret` header) runs health checks on:
- Redis connectivity and latency
- Rankings snapshot age
- All new route responses (badges, OG images, compare widgets, breaking news API)
- Environment variable coverage
- Navigation completeness

Run the JSON health check from terminal:
```bash
curl https://aiexecutive.io/api/admin/health \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```
