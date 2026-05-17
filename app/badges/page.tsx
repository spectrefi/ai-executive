import { AI_TOOLS } from "@/lib/data/tools";
import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 14400;

export const metadata = buildMetadata({
  title: `Rankings Badges for AI Tools | ${SITE_NAME}`,
  description:
    "Add an AI Executive rankings badge to your website, GitHub repo, or docs. Free, auto-updating SVG badges for every ranked AI tool.",
  path: "/badges",
});

const SORTED = [...AI_TOOLS].sort((a, b) => a.currentRank - b.currentRank);

export default function BadgesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-3 text-3xl font-extrabold text-white">Rankings Badges</h1>
      <p className="mb-10 text-gray-400">
        Add a live AI Executive ranking badge to your site, docs, or GitHub README.
        Badges auto-update when rankings change — no maintenance needed.
      </p>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Instructions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
            <h2 className="mb-3 font-semibold text-white">How to use</h2>
            <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
              <li>Find your tool in the list on the right.</li>
              <li>Copy the HTML or Markdown snippet.</li>
              <li>Paste it into your website, README, or docs.</li>
            </ol>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5 space-y-4">
            <div className="font-medium text-white text-sm">Example snippets</div>

            <div>
              <div className="text-xs text-gray-500 mb-2">HTML (with link)</div>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 whitespace-pre-wrap break-all">
                {`<a href="${SITE_URL}/tools/chatgpt">
  <img src="${SITE_URL}/api/badge/chatgpt"
       alt="Ranked #1 on AI Executive"
       height="20">
</a>`}
              </pre>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-2">Markdown (GitHub README)</div>
              <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 whitespace-pre-wrap break-all">
                {`[![Ranked on AI Executive](${SITE_URL}/api/badge/chatgpt)](${SITE_URL}/tools/chatgpt)`}
              </pre>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5 space-y-2 text-sm text-gray-400">
            <div className="font-medium text-white">Details</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <span className="text-gray-500">Format</span><span>SVG (scales to any size)</span>
              <span className="text-gray-500">Update frequency</span><span>Daily</span>
              <span className="text-gray-500">Cache TTL</span><span>4 hours</span>
              <span className="text-gray-500">Attribution</span><span>Required link back</span>
            </div>
          </div>
        </div>

        {/* Badge list */}
        <div>
          <div className="mb-4 text-sm font-medium text-gray-400">All ranked tools</div>
          <div className="space-y-3">
            {SORTED.map((tool) => {
              const badgeUrl = `${SITE_URL}/api/badge/${tool.id}`;
              const htmlSnippet = `<a href="${SITE_URL}/tools/${tool.id}"><img src="${badgeUrl}" alt="Ranked #${tool.currentRank} on AI Executive" height="20"></a>`;
              return (
                <div
                  key={tool.id}
                  className="rounded-xl border border-white/[0.07] bg-[#161c28] p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg">{tool.logo}</span>
                    <span className="font-semibold text-white text-sm">{tool.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">#{tool.currentRank}</span>
                  </div>
                  {/* Badge preview */}
                  <div className="mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={badgeUrl}
                      alt={`Ranked #${tool.currentRank} on AI Executive`}
                      height={20}
                    />
                  </div>
                  {/* Embed snippet */}
                  <pre className="overflow-x-auto rounded-lg bg-black/40 p-2.5 text-xs text-gray-400 whitespace-pre-wrap break-all">
                    {htmlSnippet}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
