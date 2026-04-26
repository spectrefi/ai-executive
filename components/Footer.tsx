import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#0a0a0f]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-white">
                AI <span className="text-violet-400">Executive</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Live AI performance rankings for executives, teams, and enterprises. Updated daily.
            </p>
          </div>

          {/* Rankings */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Rankings</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-300">Overall Leaderboard</Link></li>
              <li><Link href="/best-ai-for/coding" className="hover:text-gray-300">Best for Coding</Link></li>
              <li><Link href="/best-ai-for/writing" className="hover:text-gray-300">Best for Writing</Link></li>
              <li><Link href="/best-ai-for/research" className="hover:text-gray-300">Best for Research</Link></li>
              <li><Link href="/daily-update" className="hover:text-gray-300">Daily Updates</Link></li>
            </ul>
          </div>

          {/* Compare */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Compare</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/compare/chatgpt-vs-claude" className="hover:text-gray-300">ChatGPT vs Claude</Link></li>
              <li><Link href="/compare/claude-vs-gemini" className="hover:text-gray-300">Claude vs Gemini</Link></li>
              <li><Link href="/compare/chatgpt-vs-gemini" className="hover:text-gray-300">ChatGPT vs Gemini</Link></li>
              <li><Link href="/compare/grok-vs-chatgpt" className="hover:text-gray-300">Grok vs ChatGPT</Link></li>
              <li><Link href="/compare" className="hover:text-gray-300">All Comparisons</Link></li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">By Industry</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/best-ai-for/healthcare" className="hover:text-gray-300">Healthcare</Link></li>
              <li><Link href="/best-ai-for/finance" className="hover:text-gray-300">Finance</Link></li>
              <li><Link href="/best-ai-for/legal" className="hover:text-gray-300">Legal</Link></li>
              <li><Link href="/best-ai-for/marketing" className="hover:text-gray-300">Marketing</Link></li>
              <li><Link href="/best-ai-for/education" className="hover:text-gray-300">Education</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} AI Executive. Benchmark data aggregated from LMSYS, HuggingFace, and public sources.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Data refreshed daily
          </div>
        </div>
      </div>
    </footer>
  );
}
