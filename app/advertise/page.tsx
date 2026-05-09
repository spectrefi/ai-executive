import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import { Mail, TrendingUp, Users, Zap, CheckCircle2 } from "lucide-react";
export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Advertise on AI Executive — Reach 50,000+ AI Buyers Monthly",
  description:
    "Sponsor the leaderboard, newsletter, or category pages. Reach founders, CTOs, and developers actively evaluating AI tools. See sponsorship packages.",
  path: "/advertise",
});

const PACKAGES = [
  {
    name: "Newsletter Mention",
    price: "$200",
    per: "per send",
    color: "border-white/[0.07]",
    badge: null,
    features: [
      "1 sponsored mention in daily email digest",
      "Link to your tool or landing page",
      "Delivered to 2,000+ subscribers",
      "Performance report (opens, clicks)",
      "Available weekly",
    ],
    cta: "Book a send",
  },
  {
    name: "Category Featured",
    price: "$500",
    per: "per month",
    color: "border-blue-500/30",
    badge: "Most popular",
    features: [
      "Featured placement on a category page (e.g., Coding Tools, LLMs)",
      "Highlighted card above organic results",
      "Monthly page views: 3,000–15,000 depending on category",
      "Includes affiliate link tracking",
      "Renews monthly, cancel anytime",
    ],
    cta: "Get featured",
  },
  {
    name: "Leaderboard Sponsor",
    price: "$1,000",
    per: "per month",
    color: "border-amber-500/30",
    badge: "High visibility",
    features: [
      "Sponsored row on the main leaderboard (seen by every visitor)",
      "Homepage placement on 25,000+ monthly visits",
      "Logo + tagline + CTA button",
      "Monthly analytics report",
      "Option to include affiliate tracking",
    ],
    cta: "Get in touch",
  },
  {
    name: "Editor's Pick",
    price: "$2,500",
    per: "per month",
    color: "border-yellow-500/30",
    badge: "Premium",
    features: [
      "Homepage Editor's Pick spotlight (above the fold)",
      "Featured across all 25 tool detail pages",
      "Included in email digest header",
      "Custom write-up by our editorial team",
      "Social mention on launch",
      "Full monthly performance dashboard",
    ],
    cta: "Let's talk",
  },
];

const STATS = [
  { value: "25,000+", label: "Monthly visitors", icon: Users },
  { value: "2,000+", label: "Email subscribers", icon: Mail },
  { value: "25", label: "AI tools ranked", icon: Zap },
  { value: "300+", label: "Comparison pages", icon: TrendingUp },
];

const AUDIENCE = [
  { pct: "41%", label: "Founders & CTOs" },
  { pct: "28%", label: "Software engineers" },
  { pct: "19%", label: "Product managers" },
  { pct: "12%", label: "Marketing & ops" },
];

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-400">
          <Zap className="h-3.5 w-3.5" /> Advertise
        </div>
        <h1 className="mb-4 text-3xl font-extrabold text-white sm:text-5xl">
          Reach the people buying AI tools
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-400">
          AI Executive is where founders, CTOs, and developers come to evaluate AI tools before buying.
          Your tool, in front of buyers at exactly the moment they're deciding.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5 text-center">
            <s.icon className="mx-auto mb-2 h-5 w-5 text-blue-400" />
            <div className="text-2xl font-extrabold text-white">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Audience breakdown */}
      <section className="mb-12 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="mb-5 font-semibold text-white">Who reads AI Executive</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {AUDIENCE.map((a) => (
            <div key={a.label} className="text-center">
              <div className="text-3xl font-extrabold text-blue-400">{a.pct}</div>
              <div className="text-sm text-gray-400">{a.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Based on post-subscribe survey data. Visitors are actively comparing tools before purchase decisions — high buyer intent.
        </p>
      </section>

      {/* Packages */}
      <h2 className="mb-6 text-xl font-bold text-white">Sponsorship packages</h2>
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {PACKAGES.map((pkg) => (
          <div key={pkg.name} className={`relative rounded-xl border ${pkg.color} bg-[#161c28] p-5`}>
            {pkg.badge && (
              <div className="absolute -top-2.5 right-4 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {pkg.badge}
              </div>
            )}
            <div className="mb-1 flex items-end gap-2">
              <span className="text-2xl font-extrabold text-white">{pkg.price}</span>
              <span className="mb-0.5 text-sm text-gray-500">{pkg.per}</span>
            </div>
            <h3 className="mb-4 font-semibold text-gray-300">{pkg.name}</h3>
            <ul className="mb-5 space-y-2">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@aiexecutive.io?subject=Sponsorship enquiry"
              className="block w-full rounded-lg border border-blue-500/30 bg-blue-500/10 py-2.5 text-center text-sm font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              {pkg.cta} →
            </a>
          </div>
        ))}
      </div>

      {/* Custom package */}
      <section className="mb-12 rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
        <h2 className="mb-2 font-semibold text-white">Custom packages</h2>
        <p className="mb-4 text-sm text-gray-400">
          Need something specific? We can put together custom packages including long-term discounts,
          content partnerships, tool review write-ups, or exclusive category ownership. Email us with your goals
          and we'll build something that works.
        </p>
        <a
          href="mailto:hello@aiexecutive.io?subject=Custom sponsorship"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Mail className="h-4 w-4" />
          hello@aiexecutive.io
        </a>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-5 text-xl font-bold text-white">Common questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Do sponsored placements affect rankings?",
              a: "No. Rankings are determined entirely by benchmark scores, updated automatically. Sponsored placements are clearly labelled and exist alongside organic results.",
            },
            {
              q: "How quickly can I go live?",
              a: "Newsletter mentions can go live within 48 hours. Leaderboard and page placements typically launch within 5 business days of payment.",
            },
            {
              q: "Do you offer affiliate tracking?",
              a: "Yes. We can attach your affiliate link to all CTA buttons within sponsored placements, so you can track conversions directly.",
            },
            {
              q: "What if my tool isn't listed yet?",
              a: "We can add your tool to the directory as part of a sponsorship package. Email us and we'll get you set up.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5">
              <h3 className="mb-2 font-semibold text-white">{item.q}</h3>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
