"use client";

import Link from "next/link";
import { HcIcon } from "@/components/ui/hc-icon";
import { cn } from "@/lib/utils";

interface RouteErrorStateProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  className?: string;
  retryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  onRetry?: () => void;
}

export function RouteErrorState({
  title,
  description,
  primaryHref,
  primaryLabel,
  className,
  retryLabel = "Try Again",
  secondaryHref,
  secondaryLabel,
  onRetry,
}: RouteErrorStateProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--hc-border-soft)] bg-white p-10 text-center shadow-sm sm:p-12",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)]">
        <HcIcon name="error_outline" className="text-3xl" />
      </div>
      <h1 className="mx-auto mb-3 max-w-2xl text-2xl font-bold tracking-tight text-[var(--hc-text)]">
        {title}
      </h1>
      <p className="mx-auto mb-8 max-w-xl text-sm font-medium leading-6 text-[var(--hc-text-secondary)]">
        {description}
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link className="hc-button-primary inline-flex min-h-11 min-w-44 items-center justify-center" href={primaryHref}>
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link className="hc-button-secondary inline-flex min-h-11 min-w-36 items-center justify-center" href={secondaryHref}>
            {secondaryLabel}
          </Link>
        ) : null}
        {onRetry ? (
          <button
            className="hc-button-secondary inline-flex min-h-11 min-w-32 items-center justify-center"
            onClick={onRetry}
            type="button"
          >
            {retryLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
