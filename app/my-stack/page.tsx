import { buildMetadata } from "@/lib/seo";
import { AI_TOOLS } from "@/lib/data/tools";
import { SITE_URL } from "@/lib/constants";
import StackSelector from "@/components/StackSelector";

export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tools?: string }>;
}) {
  const { tools: rawTools } = await searchParams;
  const ids = (rawTools ?? "").split(",").filter(Boolean).slice(0, 5);
  const selected = ids.map((id) => AI_TOOLS.find((t) => t.id === id)).filter(Boolean) as typeof AI_TOOLS;

  const title =
    selected.length > 0
      ? `${selected.map((t) => t.name).join(", ")} — My AI Stack 2026`
      : "Build Your AI Stack — AI Executive";

  const description =
    selected.length > 0
      ? `My AI stack: ${selected.map((t) => `${t.name} (#${t.currentRank}, ${t.scores.overall}/100)`).join(" · ")}. See how they rank and build your own.`
      : "Pick your top AI tools, generate a shareable card, and show the world your stack.";

  const ogImage =
    selected.length > 0
      ? `${SITE_URL}/api/og/ai-stack?tools=${ids.join(",")}`
      : undefined;

  return {
    ...buildMetadata({ title, description, path: "/my-stack" }),
    ...(ogImage
      ? {
          openGraph: { images: [{ url: ogImage, width: 1200, height: 628 }] },
          twitter: { card: "summary_large_image", images: [ogImage] },
        }
      : {}),
  };
}

export default async function MyStackPage({
  searchParams,
}: {
  searchParams: Promise<{ tools?: string }>;
}) {
  const { tools: rawTools } = await searchParams;
  const initialIds = (rawTools ?? "").split(",").filter(Boolean).slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-3 text-4xl font-extrabold text-white">My AI Stack</h1>
        <p className="text-gray-400">
          Pick up to 5 tools, generate a shareable card, and post your stack.
          Every card links back here with live rankings.
        </p>
      </div>
      <StackSelector initialIds={initialIds} />
    </div>
  );
}
