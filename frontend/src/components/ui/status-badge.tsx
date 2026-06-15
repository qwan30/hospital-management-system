import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Tones mirror `KpiCard` for consistency across the design system.
 * Maps to the Badge component's variant system.
 */
type StatusTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "teal"
  | "neutral";

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

const toneVariantMap: Record<StatusTone, {
  variant: "default" | "success" | "warning" | "danger" | "purple" | "secondary";
  overrideClass?: string;
}> = {
  blue:    { variant: "default" },
  green:   { variant: "success" },
  amber:   { variant: "warning" },
  red:     { variant: "danger" },
  purple:  { variant: "purple" },
  teal:    { variant: "secondary", overrideClass: "bg-[var(--hc-teal-bg)] text-[var(--hc-teal-700)]" },
  neutral: { variant: "secondary" },
};

/**
 * Opinionated status badge built on top of the core `Badge` component.
 *
 * Replaces the 8+ inline role/status badge implementations scattered across
 * pages with hardcoded `bg-purple-50 text-purple-600` etc.
 *
 * @example
 *   <StatusBadge label="Critical" tone="red" />
 *   <StatusBadge label="Completed" tone="green" />
 *   <StatusBadge label="In Progress" tone="amber" />
 */
export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  const mapping = toneVariantMap[tone];

  return (
    <Badge
      variant={mapping.variant}
      className={cn(mapping.overrideClass, className)}
    >
      {label}
    </Badge>
  );
}
