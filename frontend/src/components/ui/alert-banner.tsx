"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReactNode, useState } from "react";

type AlertTone = "success" | "warning" | "danger" | "info";

interface AlertBannerProps {
  tone: AlertTone;
  title?: string;
  children: ReactNode;
  /** If provided, renders a Retry button that calls this callback. */
  onRetry?: () => void;
  /** If true, shows a dismiss button. */
  dismissible?: boolean;
  className?: string;
}

const toneConfig: Record<AlertTone, {
  icon: typeof AlertTriangle;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-[var(--hc-success-bg)]",
    border: "border-[var(--hc-success)]/20",
    text: "text-[var(--hc-success)]",
    iconColor: "text-[var(--hc-success)]",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-[var(--hc-warning-bg)]",
    border: "border-[var(--hc-warning)]/20",
    text: "text-[var(--hc-warning)]",
    iconColor: "text-[var(--hc-warning)]",
  },
  danger: {
    icon: XCircle,
    bg: "bg-[var(--hc-danger-bg)]",
    border: "border-[var(--hc-danger)]/20",
    text: "text-[var(--hc-danger)]",
    iconColor: "text-[var(--hc-danger)]",
  },
  info: {
    icon: Info,
    bg: "bg-[var(--hc-info-bg)]",
    border: "border-[var(--hc-info)]/20",
    text: "text-[var(--hc-info)]",
    iconColor: "text-[var(--hc-info)]",
  },
};

/**
 * Shared alert banner for success, warning, error, and info messages.
 *
 * Consolidates the inline alert markup duplicated across 10+ pages.
 * Supports optional retry button and dismiss.
 *
 * @example
 *   <AlertBanner tone="danger" onRetry={() => refetch()}>
 *     Failed to load patient data.
 *   </AlertBanner>
 */
export function AlertBanner({
  tone,
  title,
  children,
  onRetry,
  dismissible = false,
  className,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = toneConfig[tone];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-lg)] border p-4",
        config.bg,
        config.border,
        config.text,
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 size-5 shrink-0", config.iconColor)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {title && (
          <p className="mb-1 text-sm font-semibold">{title}</p>
        )}
        <div className="text-sm">{children}</div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold transition-colors",
              "bg-white/80 hover:bg-white",
              config.text,
            )}
          >
            Try again
          </button>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-[var(--radius-sm)] p-1 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
