"use client";

import { useState } from "react";
import { AI_TOOLS, type AITool } from "@/lib/data/tools";
import { getOutboundUrl } from "@/lib/affiliates";
import Link from "next/link";
import { ExternalLink, ChevronRight, RotateCcw, CheckCircle } from "lucide-react";

type Step = {
  id: string;
  question: string;
  subtitle?: string;
  options: { id: string; label: string; emoji: string; desc?: string }[];
};

const STEPS: Step[] = [
  {
    id: "usecase",
    question: "What's your primary use case?",
    subtitle: "Pick the one that matters most to you right now.",
    options: [
      { id: "coding", label: "Writing code", emoji: "💻", desc: "Build, debug, review" },
      { id: "writing", label: "Writing & content", emoji: "✍️", desc: "Emails, docs, copy" },
      { id: "research", label: "Research & analysis", emoji: "🔍", desc: "Summarise, synthesise" },
      { id: "image", label: "Image creation", emoji: "🎨", desc: "Art, design, visuals" },
      { id: "voice", label: "Voice & audio", emoji: "🎙️", desc: "TTS, voice cloning" },
      { id: "video", label: "Video generation", emoji: "🎬", desc: "AI video, editing" },
    ],
  },
  {
    id: "budget",
    question: "What's your monthly budget?",
    options: [
      { id: "free", label: "Free only", emoji: "🆓", desc: "No credit card" },
      { id: "low", label: "Under $20/mo", emoji: "💵", desc: "Individual plan range" },
      { id: "mid", label: "$20–$100/mo", emoji: "💳", desc: "Pro plan range" },
      { id: "high", label: "$100+/mo", emoji: "💎", desc: "Power user or team" },
    ],
  },
  {
    id: "techLevel",
    question: "How technical are you?",
    options: [
      { id: "nontechnical", label: "Non-technical", emoji: "🙋", desc: "I prefer simple UIs" },
      { id: "some", label: "Somewhat technical", emoji: "🛠️", desc: "I use some APIs" },
      { id: "developer", label: "Developer", emoji: "👨‍💻", desc: "I build things with APIs" },
      { id: "researcher", label: "ML/AI researcher", emoji: "🧪", desc: "I work at the frontier" },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      { id: "quality", label: "Best output quality", emoji: "🏆", desc: "I don't mind paying more" },
      { id: "speed", label: "Speed of response", emoji: "⚡", desc: "Low latency matters" },
      { id: "cost", label: "Lowest cost", emoji: "💰", desc: "Efficiency first" },
      { id: "privacy", label: "Privacy & control", emoji: "🔒", desc: "I want my data protected" },
    ],
  },
  {
    id: "teamSize",
    question: "Are you buying for yourself or a team?",
    options: [
      { id: "solo", label: "Just me", emoji: "👤" },
      { id: "small", label: "Small team (2–10)", emoji: "👥" },
      { id: "large", label: "Large team (10+)", emoji: "🏢" },
      { id: "enterprise", label: "Enterprise", emoji: "🏭", desc: "Compliance, SSO, SLAs" },
    ],
  },
];

type Answers = Record<string, string>;

function scoreTools(answers: Answers): AITool[] {
  return AI_TOOLS.map((tool) => {
    let score = tool.scores.overall;

    // Use case boost
    const uc = answers.usecase;
    if (uc === "coding" && tool.scores.coding > 80) score += 20;
    if (uc === "writing" && tool.scores.writing > 80) score += 20;
    if (uc === "research" && tool.scores.reasoning > 80) score += 20;
    if (uc === "image" && tool.category.includes("image")) score += 30;
    if (uc === "voice" && tool.category.includes("voice")) score += 40;
    if (uc === "video" && tool.category.includes("video")) score += 40;

    // Budget filter
    const budget = answers.budget;
    if (budget === "free" && !tool.pricing.free) score -= 50;
    if (budget === "low" && !tool.pricing.free && tool.pricing.startingAt.includes("$") && parseInt(tool.pricing.startingAt.replace(/\D/g, "")) > 20) score -= 20;
    if (budget === "high") score += (tool.scores.costEfficiency < 50 ? -5 : 5);

    // Tech level
    const tech = answers.techLevel;
    if (tech === "nontechnical" && tool.specs.apiAvailable && !tool.pricing.free) score -= 5;
    if (tech === "developer" && tool.specs.apiAvailable) score += 10;
    if (tech === "researcher" && tool.scores.reasoning > 85) score += 15;

    // Priority
    const priority = answers.priority;
    if (priority === "quality") score += tool.scores.overall > 85 ? 15 : -5;
    if (priority === "speed") score += tool.scores.speed * 0.2;
    if (priority === "cost") score += tool.scores.costEfficiency * 0.2;
    if (priority === "privacy" && tool.enterprise?.soc2) score += 10;

    // Team size
    const team = answers.teamSize;
    if (team === "enterprise" && tool.enterprise) score += 15;
    if (team === "enterprise" && !tool.enterprise) score -= 20;

    return { ...tool, _matchScore: score };
  })
    .sort((a, b) => (b as any)._matchScore - (a as any)._matchScore)
    .slice(0, 5);
}

function ResultCard({ tool, rank }: { tool: AITool; rank: number }) {
  const isTop = rank === 0;
  return (
    <div className={`rounded-xl border p-5 ${isTop ? "border-blue-500/40 bg-blue-500/5" : "border-white/[0.07] bg-[#161c28]"}`}>
      {isTop && (
        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
          ⭐ Best match for you
        </div>
      )}
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${tool.logoColor}22` }}>
          {tool.logo}
        </span>
        <div className="flex-1">
          <div className="font-bold text-white">#{rank + 1} {tool.name}</div>
          <div className="text-sm text-gray-500">{tool.company} · {tool.pricing.startingAt}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold text-blue-400">{tool.scores.overall}</div>
          <div className="text-xs text-gray-600">score</div>
        </div>
      </div>
      <p className="mb-3 text-sm text-gray-400">{tool.tagline}</p>
      <div className="mb-3 flex flex-wrap gap-1">
        {tool.bestFor.slice(0, 3).map((b) => (
          <span key={b} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400">{b}</span>
        ))}
      </div>
      <div className="flex gap-2">
        <Link href={`/tools/${tool.id}`} className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white">
          Full review
        </Link>
        <a
          href={getOutboundUrl(tool.id, tool.website)}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
        >
          Try {tool.name} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);

  const currentStep = STEPS[step];
  const results = done ? scoreTools(answers) : [];
  const progress = Math.round((step / STEPS.length) * 100);

  function selectOption(optionId: string) {
    const newAnswers = { ...answers, [currentStep.id]: optionId };
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setDone(false);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">🎯</div>
          <h1 className="mb-2 text-2xl font-extrabold text-white">Your personalised AI stack</h1>
          <p className="text-gray-400">Based on your answers — ranked best match first.</p>
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {results.slice(0, 4).map((tool, i) => (
            <ResultCard key={tool.id} tool={tool} rank={i} />
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={restart} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#161c28] px-4 py-2 text-sm text-gray-300 hover:text-white">
            <RotateCcw className="h-4 w-4" /> Retake quiz
          </button>
          <Link href="/compare" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            Compare any two tools <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Question {step + 1} of {STEPS.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <h1 className="mb-2 text-2xl font-extrabold text-white">{currentStep.question}</h1>
      {currentStep.subtitle && <p className="mb-8 text-gray-400">{currentStep.subtitle}</p>}
      {!currentStep.subtitle && <div className="mb-8" />}

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {currentStep.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => selectOption(opt.id)}
            className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-[#161c28] p-4 text-left transition-all hover:border-blue-500/40 hover:bg-blue-500/5 hover:text-blue-400"
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <div className="font-semibold text-white">{opt.label}</div>
              {opt.desc && <div className="text-xs text-gray-500">{opt.desc}</div>}
            </div>
            {answers[currentStep.id] === opt.id && (
              <CheckCircle className="ml-auto h-4 w-4 text-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Previous answers */}
      {step > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(answers).map(([stepId, answerId]) => {
            const s = STEPS.find((st) => st.id === stepId);
            const o = s?.options.find((opt) => opt.id === answerId);
            if (!o) return null;
            return (
              <span key={stepId} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-gray-400">
                {o.emoji} {o.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
