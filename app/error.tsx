"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-extrabold text-white">Something went wrong</h1>
      <p className="max-w-md text-gray-400">
        An unexpected error occurred. You can try again or return to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
