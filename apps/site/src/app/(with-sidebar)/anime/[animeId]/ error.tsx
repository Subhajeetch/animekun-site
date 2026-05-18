"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnimeError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[AnimePage Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0e0e11] flex flex-col items-center justify-center px-4">
      {/* Decorative border */}
      <div className="w-full max-w-md border border-red-900/60 bg-red-950/20 p-8 space-y-6">
        {/* Icon */}
        <div className="w-12 h-12 border border-red-800 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-6 h-6 text-red-500"
          >
            <path
              strokeLinecap="square"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-xs uppercase tracking-[0.22em] font-black text-red-500 mb-2">
            Failed to Load Anime
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {error.message.includes("Network")
              ? "Could not reach AniList. Check your connection and try again."
              : "Something went wrong while fetching this anime's data."}
          </p>
          {error.digest && (
            <p className="mt-3 text-[10px] text-zinc-700 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}