"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Unhandled Application Error:", error);
  }, [error]);

  const isRateLimited = error.message?.toLowerCase().includes("rate limit") || error.message?.toLowerCase().includes("too many");
  const isNetwork = error.message?.toLowerCase().includes("network") || error.message?.toLowerCase().includes("unreachable") || error.message?.toLowerCase().includes("connection");

  let heading = "Something went wrong";
  let message = "An unexpected error occurred while loading this page. Please try again later.";

  if (isRateLimited) {
    heading = "Too Many Requests";
    message = "You have made too many requests. Please slow down and try again later.";
  } else if (isNetwork) {
    heading = "Connection Error";
    message = "Unable to reach the hospital server. Check your connection and try again.";
  } else if (error.message) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--hc-content-bg)] p-6 text-center text-[var(--hc-text)]">
      <div className="flex flex-col items-center max-w-md w-full bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]">
        <div className="grid size-16 place-items-center rounded-full bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] mb-6">
          <AlertCircle className="size-8" strokeWidth={2} aria-hidden="true" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {heading}
        </h1>
        
        <p className="text-[15px] text-[var(--hc-text-secondary)] mb-8">
          {message}
        </p>
        
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-primary)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--hc-primary-hover)]"
          >
            <RefreshCcw className="size-4" />
            Try again
          </button>
          
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)]"
          >
            <Home className="size-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
