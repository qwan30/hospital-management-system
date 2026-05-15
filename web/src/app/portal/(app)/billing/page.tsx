import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { HcIcon } from "@/components/ui/hc-icon";
import Link from "next/link";
import { Wallet, ShieldAlert, Receipt } from "lucide-react";

export default function PatientBillingPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Billing"
          description="Track recent invoices, insurance processing, and patient balances from one patient-facing workspace."
          className="mb-0"
        />
        <Link 
          href="/portal/support"
          className="hc-button-secondary"
        >
          Contact Billing
        </Link>
      </div>

      <div className="hc-kpi-grid">
        <KpiCard
          label="Open Balance"
          value="$184"
          helper="Due Nov 15"
          tone="blue"
          icon={Wallet}
        />
        <KpiCard
          label="Insurance Claims"
          value="03"
          helper="In processing"
          tone="blue"
          icon={ShieldAlert}
        />
        <KpiCard
          label="Paid This Year"
          value="$2.4k"
          helper="Receipts available"
          tone="blue"
          icon={Receipt}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[var(--hc-surface-soft)] rounded-[var(--radius-lg)] p-6 space-y-6 border border-[var(--hc-border)] shadow-[var(--shadow-card)]">
            {[
              {
                eyebrow: "Invoice HMS-2024-1042",
                title: "Annual physical examination",
                detail: "Insurance applied. Remaining patient responsibility: $84.",
                status: "Open",
              },
              {
                eyebrow: "Invoice HMS-2024-0988",
                title: "Comprehensive metabolic panel",
                detail: "Submitted to insurer on Oct 14 with supporting diagnostic code.",
                status: "Pending",
              },
              {
                eyebrow: "Receipt HMS-2024-0871",
                title: "Specialist consultation",
                detail: "Paid by card ending 0422. Receipt is available for download.",
                status: "Paid",
              },
            ].map((row, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--hc-border-soft)] last:border-0 last:pb-0">
                <div>
                  <span className="text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest">{row.eyebrow}</span>
                  <h3 className="text-base font-bold text-[var(--hc-text)] mt-1">{row.title}</h3>
                  <p className="text-sm text-[var(--hc-text-secondary)] mt-1">{row.detail}</p>
                </div>
                <span className={`hc-badge ${row.status === 'Open' ? 'bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] border-[var(--hc-danger)]' : row.status === 'Pending' ? 'bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] border-[var(--hc-blue-200)]' : 'bg-[var(--hc-surface-soft)] border-[var(--hc-border)] text-[var(--hc-text-secondary)]'} whitespace-nowrap`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 border border-[var(--hc-border)] shadow-[var(--shadow-card)]">
            <span className="text-[11px] font-bold text-[var(--hc-blue-600)] uppercase tracking-widest mb-4 block">Revenue cycle desk</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                <HcIcon name="support_agent" className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-[var(--hc-text)]">Billing support hours</h3>
            </div>
            <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed">
              The finance desk responds Monday through Friday, 08:00 to 17:00. Urgent coverage questions can be routed through secure support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
