import { NextRequest, NextResponse } from "next/server";
import { getToolById } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 14400;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;
  const tool = getToolById(toolId);

  if (!tool) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rank = tool.currentRank;
  const rankText = `Ranked #${rank}`;
  const color = rank === 1 ? "#f59e0b" : rank <= 3 ? "#3b82f6" : "#7c3aed";

  // Left section: "AI Executive" label, right section: rank value
  const lw = 100;
  const rw = 90;
  const total = lw + rw;
  const h = 20;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${h}" role="img" aria-label="${rankText} on AI Executive">
  <title>${rankText} on AI Executive — ${SITE_URL}/tools/${toolId}</title>
  <clipPath id="r"><rect width="${total}" height="${h}" rx="4"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="${h}" fill="#1e1e2e"/>
    <rect x="${lw}" width="${rw}" height="${h}" fill="${color}"/>
  </g>
  <g font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${lw / 2}" y="14" text-anchor="middle" fill="#9ca3af">AI Executive</text>
    <text x="${lw + rw / 2}" y="14" text-anchor="middle" fill="white" font-weight="bold">${rankText}</text>
  </g>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=14400, s-maxage=14400",
    },
  });
}
