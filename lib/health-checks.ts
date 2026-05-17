import { Redis } from "@upstash/redis";
import { getLastRankingsSnapshot } from "./rankings-store";
import { getBreakingLog } from "./breaking-store";
import { getSocialPosts } from "./social-post-archive";
import { SITE_URL } from "./constants";
import { readFile } from "fs/promises";
import { join } from "path";

export type CheckStatus = "ok" | "warn" | "error" | "skip";

export interface EnvVarCheck {
  key: string;
  label: string;
  group: string;
  required: boolean;
  set: boolean;
}

export interface RouteCheck {
  path: string;
  label: string;
  method: "GET" | "POST";
  expectedStatus: number;
  status: CheckStatus;
  actualStatus?: number;
  latencyMs?: number;
  note?: string;
}

export interface HealthReport {
  timestamp: string;
  overall: CheckStatus;
  envVars: {
    status: CheckStatus;
    checks: EnvVarCheck[];
    missingRequired: number;
    missingOptional: number;
  };
  redis: {
    status: CheckStatus;
    latencyMs?: number;
    error?: string;
  };
  rankingsSnapshot: {
    status: CheckStatus;
    capturedAt?: string;
    ageHours?: number;
  };
  breakingLog: {
    status: CheckStatus;
    count: number;
    lastPostedAt?: string;
  };
  socialPosts: {
    status: CheckStatus;
    count: number;
    lastPostedAt?: string;
  };
  routes: {
    status: CheckStatus;
    checked: boolean;
    checks: RouteCheck[];
  };
  navigation: {
    status: CheckStatus;
    missingFromNav: string[];
  };
}

const ENV_DEFINITIONS: Omit<EnvVarCheck, "set">[] = [
  { key: "UPSTASH_REDIS_REST_URL",    label: "Upstash Redis URL",      group: "Redis",    required: true },
  { key: "UPSTASH_REDIS_REST_TOKEN",  label: "Upstash Redis Token",    group: "Redis",    required: true },
  { key: "ANTHROPIC_API_KEY",         label: "Anthropic API Key",      group: "AI",       required: true },
  { key: "CRON_SECRET",               label: "Cron Secret",            group: "Auth",     required: true },
  { key: "ADMIN_SECRET",              label: "Admin Secret",           group: "Auth",     required: true },
  { key: "NEXT_PUBLIC_SITE_URL",      label: "Site URL",               group: "Config",   required: false },
  { key: "TWITTER_APP_KEY",           label: "Twitter App Key",        group: "Social",   required: false },
  { key: "TWITTER_APP_SECRET",        label: "Twitter App Secret",     group: "Social",   required: false },
  { key: "TWITTER_ACCESS_TOKEN",      label: "Twitter Access Token",   group: "Social",   required: false },
  { key: "TWITTER_ACCESS_SECRET",     label: "Twitter Access Secret",  group: "Social",   required: false },
  { key: "INSTAGRAM_ACCOUNT_ID",      label: "Instagram Account ID",   group: "Social",   required: false },
  { key: "INSTAGRAM_ACCESS_TOKEN",    label: "Instagram Token",        group: "Social",   required: false },
  { key: "TIKTOK_ACCESS_TOKEN",       label: "TikTok Access Token",    group: "Social",   required: false },
  { key: "TIKTOK_OPEN_ID",            label: "TikTok Open ID",         group: "Social",   required: false },
  { key: "RESEND_API_KEY",            label: "Resend API Key",         group: "Email",    required: false },
  { key: "RESEND_AUDIENCE_ID",        label: "Resend Audience ID",     group: "Email",    required: false },
  { key: "REPLICATE_API_KEY",         label: "Replicate API Key",      group: "Media AI", required: false },
  { key: "RUNWAY_API_KEY",            label: "Runway API Key",         group: "Media AI", required: false },
  { key: "ELEVENLABS_API_KEY",        label: "ElevenLabs API Key",     group: "Media AI", required: false },
  { key: "IDEOGRAM_API_KEY",          label: "Ideogram API Key",       group: "Media AI", required: false },
];

// Routes to verify — pages expect 200, protected APIs expect 401 (route exists but auth required)
const ROUTE_DEFINITIONS: Omit<RouteCheck, "status" | "actualStatus" | "latencyMs" | "note">[] = [
  { path: "/badges",                              label: "Badges page",           method: "GET",  expectedStatus: 200 },
  { path: "/leaderboard-card",                    label: "Leaderboard card",       method: "GET",  expectedStatus: 200 },
  { path: "/breaking",                            label: "Breaking news page",     method: "GET",  expectedStatus: 200 },
  { path: "/embed/compare/chatgpt-vs-claude",     label: "Compare embed widget",   method: "GET",  expectedStatus: 200 },
  { path: "/embed/widget",                        label: "Leaderboard widget",     method: "GET",  expectedStatus: 200 },
  { path: "/api/badge/chatgpt",                   label: "Badge API (SVG)",        method: "GET",  expectedStatus: 200 },
  { path: "/api/og/leaderboard",                  label: "Leaderboard OG image",   method: "GET",  expectedStatus: 200 },
  { path: "/api/health",                          label: "Health API",             method: "GET",  expectedStatus: 200 },
  { path: "/api/breaking/news",                   label: "Breaking news API",      method: "POST", expectedStatus: 401 },
  { path: "/api/breaking/rank-jump",              label: "Rank jump API",          method: "POST", expectedStatus: 401 },
  { path: "/api/power-rankings",                  label: "Power rankings API",     method: "POST", expectedStatus: 401 },
];

// New pages that should appear in the navbar
const EXPECTED_IN_NAV = [
  { path: "/breaking",       label: "Breaking News" },
  { path: "/badges",         label: "Badges" },
  { path: "/leaderboard-card", label: "Leaderboard Card" },
];

export async function runAllChecks(): Promise<HealthReport> {
  const timestamp = new Date().toISOString();

  // ── 1. Env vars ──────────────────────────────────────────────
  const envChecks: EnvVarCheck[] = ENV_DEFINITIONS.map((d) => ({
    ...d,
    set: !!process.env[d.key],
  }));
  const missingRequired = envChecks.filter((c) => c.required && !c.set).length;
  const missingOptional = envChecks.filter((c) => !c.required && !c.set).length;
  const envStatus: CheckStatus = missingRequired > 0 ? "error" : missingOptional > 8 ? "warn" : "ok";

  // ── 2. Redis ─────────────────────────────────────────────────
  let redisStatus: CheckStatus;
  let redisLatency: number | undefined;
  let redisError: string | undefined;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    try {
      const t0 = Date.now();
      await redis.ping();
      redisLatency = Date.now() - t0;
      redisStatus = redisLatency < 500 ? "ok" : "warn";
    } catch (e) {
      redisStatus = "error";
      redisError = String(e).slice(0, 200);
    }
  } else {
    redisStatus = "error";
    redisError = "UPSTASH_REDIS_REST_URL / TOKEN not set";
  }

  // ── 3. Rankings snapshot ──────────────────────────────────────
  const snapshot = await getLastRankingsSnapshot();
  let snapshotStatus: CheckStatus;
  let snapshotAge: number | undefined;
  if (!snapshot) {
    snapshotStatus = "warn";
  } else {
    snapshotAge = (Date.now() - new Date(snapshot.capturedAt).getTime()) / 3_600_000;
    snapshotStatus = snapshotAge > 192 ? "warn" : "ok"; // stale if > 8 days
  }

  // ── 4. Breaking log ───────────────────────────────────────────
  const breakingLog = await getBreakingLog(20);

  // ── 5. Social posts ───────────────────────────────────────────
  const socialPosts = await getSocialPosts();
  const socialStatus: CheckStatus = socialPosts.length === 0 ? "warn" : "ok";

  // ── 6. Route checks (HTTP) ────────────────────────────────────
  const routeChecks: RouteCheck[] = [];
  const canCheckRoutes = Boolean(SITE_URL && !SITE_URL.includes("localhost"));

  if (canCheckRoutes) {
    const results = await Promise.allSettled(
      ROUTE_DEFINITIONS.map(async (def) => {
        const t0 = Date.now();
        try {
          const res = await fetch(`${SITE_URL}${def.path}`, {
            method: def.method,
            signal: AbortSignal.timeout(10_000),
            cache: "no-store",
          });
          const latencyMs = Date.now() - t0;
          const pass = res.status === def.expectedStatus;
          return {
            ...def,
            status: pass ? ("ok" as CheckStatus) : ("error" as CheckStatus),
            actualStatus: res.status,
            latencyMs,
            note: pass ? undefined : `Expected ${def.expectedStatus}, got ${res.status}`,
          };
        } catch (e) {
          return {
            ...def,
            status: "error" as CheckStatus,
            latencyMs: Date.now() - t0,
            note: String(e).slice(0, 100),
          };
        }
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") routeChecks.push(r.value);
    }
  }

  const routesFailed = routeChecks.filter((r) => r.status === "error").length;
  const routesStatus: CheckStatus = !canCheckRoutes ? "skip" : routesFailed > 0 ? "error" : "ok";

  // ── 7. Navigation check ───────────────────────────────────────
  const missingFromNav: string[] = [];
  try {
    const navContent = await readFile(join(process.cwd(), "components", "Navbar.tsx"), "utf-8");
    for (const { path, label } of EXPECTED_IN_NAV) {
      if (!navContent.includes(`"${path}"`)) missingFromNav.push(label);
    }
  } catch {
    // can't read — skip
  }
  const navStatus: CheckStatus = missingFromNav.length > 0 ? "warn" : "ok";

  // ── Overall ───────────────────────────────────────────────────
  const statuses = [envStatus, redisStatus, snapshotStatus, routesStatus, navStatus];
  const overall: CheckStatus =
    statuses.includes("error") ? "error" :
    statuses.includes("warn")  ? "warn"  : "ok";

  return {
    timestamp,
    overall,
    envVars: { status: envStatus, checks: envChecks, missingRequired, missingOptional },
    redis: { status: redisStatus, latencyMs: redisLatency, error: redisError },
    rankingsSnapshot: { status: snapshotStatus, capturedAt: snapshot?.capturedAt, ageHours: snapshotAge },
    breakingLog: { status: "ok", count: breakingLog.length, lastPostedAt: breakingLog[0]?.postedAt },
    socialPosts: { status: socialStatus, count: socialPosts.length, lastPostedAt: socialPosts[0]?.postedAt },
    routes: { status: routesStatus, checked: canCheckRoutes, checks: routeChecks },
    navigation: { status: navStatus, missingFromNav },
  };
}
