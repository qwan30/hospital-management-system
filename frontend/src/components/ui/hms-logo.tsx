import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HmsLogoProps {
  href?: string;
  className?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  isLink?: boolean;
  "aria-label"?: string;
}

export function HmsLogo({
  href = "/",
  className,
  iconContainerClassName,
  iconClassName,
  textClassName,
  showText = true,
  isLink = true,
  "aria-label": ariaLabel = "Hospital Core home",
}: HmsLogoProps) {
  const content = (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 font-bold uppercase leading-6 tracking-normal text-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[10px] border border-border bg-muted/50 text-[var(--hc-blue-500)]",
          iconContainerClassName,
        )}
      >
        <Activity className={cn("size-5", iconClassName)} aria-hidden="true" />
      </span>
      {showText ? (
        <span
          className={cn(
            "shrink-0 whitespace-nowrap text-[16px] sm:text-[18px]",
            textClassName,
          )}
        >
          HOSPITAL CORE
        </span>
      ) : null}
    </div>
  );

  if (isLink && href) {
    return (
      <Link
        href={href}
        className="flex items-center rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hc-blue-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return content;
}
