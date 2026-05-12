"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const PRIMARY_LINKS = [
  { href: "/", label: "Leaderboard" },
  { href: "/compare", label: "Compare" },
  { href: "/tools", label: "All Tools" },
  { href: "/best-ai-for", label: "By Use Case" },
  { href: "/my-stack", label: "My Stack" },
];

const INTELLIGENCE_LINKS = [
  { href: "/prompt-lab", label: "🧪 Prompt Lab", desc: "One prompt, five models, you vote" },
  { href: "/hacks", label: "⚡ AI Hacks", desc: "Prompt tricks & shortcuts, community-voted" },
  { href: "/hot-takes", label: "🔥 Hot Takes", desc: "AI's most controversial opinions — vote now" },
  { href: "/movers", label: "📈 Market Movers", desc: "Stocks, funding & tool momentum" },
  { href: "/weekly", label: "📅 Weekly Digest", desc: "Everything that mattered this week" },
  { href: "/status", label: "🟢 AI Status", desc: "Live uptime for 12 AI services" },
  { href: "/changelog", label: "📋 Changelog", desc: "Every model release & price cut" },
  { href: "/price-index", label: "💰 API Pricing", desc: "Cost calculator for every model" },
  { href: "/context-window", label: "📏 Context Windows", desc: "Token limits across all models" },
  { href: "/funding", label: "💸 VC Funding", desc: "Rounds, valuations, what it means" },
  { href: "/hardware-advisor", label: "🖥️ Hardware Advisor", desc: "Which models can your PC run?" },
  { href: "/quiz", label: "🎯 AI Buyer's Quiz", desc: "Find your perfect AI stack in 60 seconds" },
];

const MORE_LINKS = [
  { href: "/alternatives", label: "Alternatives", desc: "Best replacements for every AI tool" },
  { href: "/jobs", label: "AI Jobs", desc: "Roles at Anthropic, OpenAI & more" },
  { href: "/advertise", label: "Advertise", desc: "Reach 25,000+ AI buyers monthly" },
  { href: "/enterprise-report", label: "Enterprise Report", desc: "Full vendor analysis for teams" },
  { href: "/trends", label: "Trends" },
  { href: "/methodology", label: "Methodology" },
];

const ALL_MOBILE_LINKS = [
  ...PRIMARY_LINKS,
  ...INTELLIGENCE_LINKS.map((l) => ({ href: l.href, label: l.label })),
  ...MORE_LINKS,
];

function DropdownMenu({
  label,
  links,
  pathname,
}: {
  label: string;
  links: { href: string; label: string; desc?: string }[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = links.some((l) => pathname === l.href);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
          isActive
            ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-blue-400"
            : "text-gray-400 hover:bg-[#161c28] hover:text-white"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0e1117] shadow-2xl">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex flex-col gap-0.5 px-4 py-3 text-sm transition-colors hover:bg-[#161c28]",
                pathname === l.href ? "bg-[#161c28] text-white" : "text-gray-300"
              )}
            >
              <span className="font-medium">{l.label}</span>
              {l.desc && <span className="text-xs text-gray-600">{l.desc}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0e1117]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            AI <span className="text-blue-400">Executive</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
                pathname === l.href
                  ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-blue-400"
                  : "text-gray-400 hover:bg-[#161c28] hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}

          <DropdownMenu label="Intelligence" links={INTELLIGENCE_LINKS} pathname={pathname} />
          <DropdownMenu label="More" links={MORE_LINKS} pathname={pathname} />
        </nav>

        {/* Live badge */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            LIVE
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-gray-400 hover:bg-[#161c28] hover:text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-white/[0.07] bg-[#0e1117] px-4 pb-4 md:hidden">
          {ALL_MOBILE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === l.href
                  ? "bg-[#1e2640] text-white"
                  : "text-gray-400 hover:bg-[#161c28] hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
