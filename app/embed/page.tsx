import { SITE_URL, SITE_NAME } from "@/lib/seo";
export const revalidate = 14400;


export const metadata = {
  title: `Embed the AI Leaderboard | ${SITE_NAME}`,
  description:
    "Free embeddable AI tool leaderboard widget. Paste one line of HTML to add live AI rankings to your blog, newsletter, or website.",
  robots: { index: true, follow: true },
};

export default function EmbedPage() {
  const iframeCode = `<iframe src="${SITE_URL}/embed/widget" width="360" height="520" frameborder="0" style="border-radius:12px;border:1px solid #ffffff18;" title="AI Tool Rankings by AI Executive"></iframe>`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-3 text-3xl font-extrabold text-white">Embed the AI Leaderboard</h1>
      <p className="mb-10 text-gray-400">
        Add live AI tool rankings to your site, blog, or newsletter — free, one line of code.
      </p>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Embed instructions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-6">
            <h2 className="mb-3 font-semibold text-white">How to embed</h2>
            <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
              <li>Copy the code snippet below.</li>
              <li>Paste it anywhere in your HTML.</li>
              <li>The widget auto-updates daily — no maintenance needed.</li>
            </ol>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Embed code</span>
              <span className="text-xs text-gray-500">Standard · 360 × 520px</span>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-gray-300 whitespace-pre-wrap break-all">
              {iframeCode}
            </pre>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#161c28] p-5 space-y-2 text-sm text-gray-400">
            <div className="font-medium text-white">Customisation options</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <span className="text-gray-500">Width</span><span>Any — responsive</span>
              <span className="text-gray-500">Rows shown</span><span>Top 10 (fixed)</span>
              <span className="text-gray-500">Theme</span><span>Dark only</span>
              <span className="text-gray-500">Update frequency</span><span>Daily</span>
              <span className="text-gray-500">Attribution</span><span>Powered by AI Executive</span>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            By embedding this widget you agree to display the "Powered by AI Executive" attribution link
            unchanged. No other requirements. Data is provided free under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              CC BY 4.0
            </a>.
          </div>
        </div>

        {/* Live preview — actual iframe of the widget */}
        <div>
          <div className="mb-3 text-sm font-medium text-gray-400">Live preview</div>
          <iframe
            src="/embed/widget"
            width={360}
            height={520}
            style={{ borderRadius: 12, border: "1px solid #ffffff18", display: "block" }}
            title="AI Tool Rankings by AI Executive"
          />
        </div>
      </div>
    </div>
  );
}
