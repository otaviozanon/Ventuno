"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-felt-green to-emerald-950">
      <div className="max-w-md rounded-lg bg-charcoal p-8 text-center shadow-2xl">
        <h2 className="mb-4 text-3xl font-bold text-gold">Something went wrong!</h2>
        <p className="mb-6 text-gray-300">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-gold px-6 py-3 font-bold text-charcoal transition-colors hover:bg-gold-light"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
