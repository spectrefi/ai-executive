"use client";

import { useState } from "react";
import { type AITool } from "@/lib/data/tools";
import ToolCard from "@/components/ToolCard";

interface CategoryItem {
  value: string;
  label: string;
  icon: string;
}

interface Props {
  tools: AITool[];
  categories: CategoryItem[];
}

export default function ToolsGrid({ tools, categories }: Props) {
  const [active, setActive] = useState<string>("all");

  const filtered =
    active === "all" ? tools : tools.filter((t) => t.category.includes(active as never));

  return (
    <>
      {/* Category filter */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Browse by Category
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActive("all")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active === "all"
                ? "border-blue-500/60 bg-blue-500/20 text-blue-300"
                : "border-white/[0.07] bg-[#161c28] text-gray-300 hover:border-blue-500/40 hover:bg-[#1e2640] hover:text-white"
            }`}
          >
            All ({tools.length})
          </button>
          {categories.map((c) => {
            const count = tools.filter((t) => t.category.includes(c.value as never)).length;
            return (
              <button
                key={c.value}
                onClick={() => setActive(c.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active === c.value
                    ? "border-blue-500/60 bg-blue-500/20 text-blue-300"
                    : "border-white/[0.07] bg-[#161c28] text-gray-300 hover:border-blue-500/40 hover:bg-[#1e2640] hover:text-white"
                }`}
              >
                {c.icon} {c.label}
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} showRank />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500">No tools match this filter.</p>
      )}
    </>
  );
}
