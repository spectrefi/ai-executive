import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10">
        <Search className="h-10 w-10 text-blue-400" />
      </div>
      <h1 className="mb-2 text-5xl font-extrabold text-white">404</h1>
      <p className="mb-2 text-xl font-semibold text-gray-300">Page not found</p>
      <p className="mb-8 max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist. It may have been moved, or the URL
        might be incorrect.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Rankings
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#161c28] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e2640]"
        >
          Browse All Tools
        </Link>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#161c28] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e2640]"
        >
          Compare Tools
        </Link>
      </div>
    </div>
  );
}
