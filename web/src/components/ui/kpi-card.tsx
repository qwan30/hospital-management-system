import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiTone = "blue" | "green" | "amber" | "red" | "purple" | "teal";

interface KpiCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: LucideIcon;
  tone?: KpiTone;
  className?: string;
}

const toneClasses: Record<KpiTone, string> = {
  blue: "bg-[#E8F0FF] text-[var(--hc-blue-600)]",
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
}: KpiCardProps) {
  return (
    <section
      className={cn(
        "hc-kpi-card flex min-h-[112px] items-center gap-5 rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-[22px] shadow-[var(--shadow-card)] transition duration-150 hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      <div className={cn("grid size-[60px] shrink-0 place-items-center rounded-[var(--radius-lg)]", toneClasses[tone])}>
        <Icon className="size-[26px]" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase leading-4 tracking-[0.05em] text-[#334155]">
          {label}
        </p>
        <p className="mt-1 text-[30px] font-bold leading-9 tracking-normal text-[var(--hc-text)]">
          {value}
        </p>
        {helper ? (
          <p className="mt-0.5 text-xs font-medium leading-4 text-[var(--hc-text-secondary)]">
            {helper}
          </p>
        ) : null}
      </div>
    </section>
  );
}
