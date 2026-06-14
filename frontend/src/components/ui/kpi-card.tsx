import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiTone = "blue" | "green" | "amber" | "red" | "purple" | "teal";

interface KpiCardProps {
  label: string;
  value: string | number | ReactNode;
  helper?: string | ReactNode;
  icon?: LucideIcon;
  tone?: KpiTone;
  className?: string;
  /** When true, renders a skeleton placeholder matching the KPI card dimensions. */
  isLoading?: boolean;
}

const toneClasses: Record<KpiTone, string> = {
  blue: "bg-hc-blue-50 text-[var(--hc-blue-600)]",
  green: "bg-[var(--hc-success-bg)] text-[var(--hc-success)]",
  amber: "bg-[#FFF3E0] text-[var(--hc-warning)]",
  red: "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]",
  purple: "bg-[var(--hc-purple-bg)] text-[var(--hc-purple)]",
  teal: "bg-[#CCFBF1] text-[#0F766E]",
};

export function KpiCard({
  label,
  value,
  helper,
  icon: Icon = Activity,
  tone = "blue",
  className,
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <section
        aria-hidden="true"
        className={cn(
          "flex min-h-[112px] items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-5",
          className,
        )}
      >
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-[var(--hc-border-soft)]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-[var(--hc-border-soft)]" />
          <div className="h-8 w-24 animate-pulse rounded bg-[var(--hc-border-soft)]" />
          <div className="h-3 w-32 animate-pulse rounded bg-[var(--hc-border-soft)]" />
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "flex min-h-[112px] items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-5 shadow-[var(--shadow-card)] transition duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      <div className={cn("grid size-10 shrink-0 place-items-center rounded-full", toneClasses[tone])}>
        <Icon className="size-[20px]" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase leading-none tracking-widest text-slate-500">
          {label}
        </p>
        <p className="mt-1.5 text-[32px] font-semibold leading-none tracking-tight text-[var(--hc-text)]">
          {value}
        </p>
        {helper ? (
          <p className="mt-1.5 text-[13px] font-medium leading-none text-slate-500">
            {helper}
          </p>
        ) : null}
      </div>
    </section>
  );
}
