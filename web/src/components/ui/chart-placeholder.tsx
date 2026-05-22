import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function ChartPlaceholder({ className, title = "Chart Data", description, ...props }: ChartPlaceholderProps) {
  return (
    <div className={cn("flex flex-col rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-5 shadow-[var(--shadow-card)]", className)} {...props}>
      <div className="mb-8 flex items-start justify-between">
         <div>
           <h3 className="text-base font-bold text-[var(--hc-text)]">{title}</h3>
           {description && <p className="text-sm text-[var(--hc-text-secondary)] mt-1">{description}</p>}
         </div>
         <div className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--hc-surface-soft)] p-1 text-[13px] font-medium">
            <span className="rounded-[var(--radius-sm)] bg-white px-3 py-1 shadow-sm text-[var(--hc-text)] cursor-pointer">Daily</span>
            <span className="px-3 py-1 text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] cursor-pointer transition-colors">Weekly</span>
         </div>
      </div>
      <div className="relative flex h-[240px] w-full items-end gap-3 border-b border-l border-[var(--hc-border)] pb-0 pl-0 pt-4 ml-8">
        {/* Y Axis Labels */}
        <div className="absolute -left-9 top-0 flex h-full flex-col justify-between pb-0 text-[11px] font-medium text-[var(--hc-text-secondary)]">
          <span className="-mt-2">100</span>
          <span className="mt-[-2px]">75</span>
          <span className="mt-[-2px]">50</span>
          <span className="mt-[-2px]">25</span>
          <span className="translate-y-2">0</span>
        </div>
        {/* Grid lines */}
        <div className="absolute left-0 top-0 h-full w-full pointer-events-none">
           <div className="h-1/4 w-full border-t border-dashed border-[var(--hc-border-soft)]"></div>
           <div className="h-1/4 w-full border-t border-dashed border-[var(--hc-border-soft)]"></div>
           <div className="h-1/4 w-full border-t border-dashed border-[var(--hc-border-soft)]"></div>
           <div className="h-1/4 w-full border-t border-dashed border-[var(--hc-border-soft)]"></div>
        </div>
        {/* Bars */}
        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
          <div key={i} className="relative z-10 flex h-full flex-1 flex-col justify-end group">
            <div
               className="w-full rounded-t-[4px] bg-[var(--hc-blue-500)] transition-all group-hover:bg-[var(--hc-blue-600)]"
               style={{ height: `${h}%` }}
            ></div>
            {/* X Axis Labels */}
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] font-medium text-[var(--hc-text-secondary)]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-4 text-[13px] font-medium text-[var(--hc-text-secondary)]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--hc-blue-500)]"></span>
          Current Period
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--hc-surface-muted)] border border-[var(--hc-border)]"></span>
          Previous Period
        </div>
      </div>
    </div>
  )
}
