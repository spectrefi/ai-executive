import { buildMetadata } from "@/lib/seo";
import { INDUSTRIES, USE_CASES } from "@/lib/data/tools";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = buildMetadata({
  title: "Best AI Tools by Use Case & Industry",
  description:
    "Find the best AI tool for your specific industry or use case. Rankings for healthcare, finance, legal, marketing, education, coding, writing, and more.",
  path: "/best-ai-for",
});

export default function BestAiForPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold text-white">Best AI For…</h1>
        <p className="text-gray-400">
          Industry-specific and use-case rankings to find the right AI for your context.
        </p>
      </div>

      {/* By industry */}
      <section className="mb-14">
        <h2 className="mb-6 text-xl font-bold text-white">By Industry</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind.value}
              href={`/best-ai-for/${ind.value}`}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-violet-500/40 hover:bg-white/8"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ind.icon}</span>
                <div>
                  <div className="font-semibold text-white group-hover:text-violet-300">
                    {ind.label}
                  </div>
                  <div className="text-xs text-gray-500">See top AI tools</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-violet-400" />
            </Link>
          ))}
        </div>
      </section>

      {/* By use case */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-white">By Use Case</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {USE_CASES.map((uc) => (
            <Link
              key={uc.slug}
              href={`/best-ai-for/${uc.slug}`}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-violet-500/40 hover:bg-white/8"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{uc.icon}</span>
                <div>
                  <div className="font-semibold text-white group-hover:text-violet-300">
                    {uc.label}
                  </div>
                  <div className="text-xs text-gray-500">Top AI tools</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-violet-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
