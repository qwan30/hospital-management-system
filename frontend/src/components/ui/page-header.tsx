import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  categoryLabel?: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, categoryLabel, description, action, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "hc-page-header mb-[22px] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {categoryLabel ? (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--hc-blue-600)]">
            {categoryLabel}
          </p>
        ) : null}
        <h1 className="text-[28px] font-bold leading-9 tracking-normal text-[var(--hc-text)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 flex items-center gap-2 text-sm leading-[22px] text-[var(--hc-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
