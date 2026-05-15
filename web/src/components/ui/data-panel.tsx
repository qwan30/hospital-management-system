import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataPanelProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  filters?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DataPanel({ title, action, children, filters, footer, className }: DataPanelProps) {
  return (
    <section
      className={cn(
        "hc-data-panel overflow-hidden rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {title || action ? (
        <div className="flex items-center justify-between border-b border-[var(--hc-border)] px-[22px] py-4 bg-[var(--hc-surface-soft)]">
          {title ? <h2 className="text-[15px] font-bold text-[var(--hc-text)]">{title}</h2> : <div />}
          {action ? <div>{action}</div> : null}
        </div>
      ) : null}
      {filters ? (
        <div className="hc-filter-row flex flex-wrap items-center gap-3.5 border-b border-[var(--hc-border)] p-[22px]">
          {filters}
        </div>
      ) : null}
      {children}
      {footer ? (
        <div className="hc-table-footer flex min-h-14 items-center justify-between border-t border-[var(--hc-border)] bg-white px-[22px]">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
