import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** Text shown below the spinner. */
  message?: string;
  /** Size variant. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

/**
 * Shared loading spinner with optional message.
 *
 * Consolidates the inline spinner markup duplicated across 8+ pages.
 *
 * @example
 *   <LoadingSpinner message="Loading appointments..." />
 */
export function LoadingSpinner({
  message,
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12",
        className,
      )}
    >
      <Loader2
        className={cn("animate-spin text-[var(--hc-primary)]", sizeClasses[size])}
        aria-hidden="true"
      />
      {message && (
        <p className="text-sm text-[var(--hc-text-muted)]">{message}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
