import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { HcIcon } from "@/components/ui/hc-icon";
import Link from "next/link";
import { ShoppingBag, PackageOpen, Calendar } from "lucide-react";

export default function PortalInventoryPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Home Care Inventory"
          description="Track patient-facing supplies, prescription pickup readiness, and items requested by the care team."
          className="mb-0"
        />
        <Link 
          href="/portal/pharmacy"
          className="hc-button-secondary"
        >
          Open Pharmacy
        </Link>
      </div>

      <div className="hc-kpi-grid">
        <KpiCard
          label="Ready Items"
          value="03"
          helper="For pickup"
          tone="blue"
          icon={ShoppingBag}
        />
        <KpiCard
          label="Low Supplies"
          value="01"
          helper="Needs refill"
          tone="amber"
          icon={PackageOpen}
        />
        <KpiCard
          label="Next Review"
          value="Nov 02"
          helper="Care plan"
          tone="blue"
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[var(--hc-surface-soft)] rounded-[var(--radius-lg)] p-6 space-y-6 border border-[var(--hc-border)] shadow-[var(--shadow-card)]">
            {[
              {
                eyebrow: "Pharmacy pickup",
                title: "Vitamin D supplement",
                detail: "Recommended after lab review. Confirm availability with the pharmacy desk.",
                status: "Ready",
              },
              {
                eyebrow: "Home monitoring",
                title: "Peak flow meter log",
                detail: "Bring your latest readings to the upcoming allergy follow-up.",
                status: "Bring",
              },
              {
                eyebrow: "Medication list",
                title: "Current inhaler inventory",
                detail: "Update remaining doses before the next respiratory review.",
                status: "Review",
              },
            ].map((row, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--hc-border-soft)] last:border-0 last:pb-0">
                <div>
                  <span className="text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest">{row.eyebrow}</span>
                  <h3 className="text-base font-bold text-[var(--hc-text)] mt-1">{row.title}</h3>
                  <p className="text-sm text-[var(--hc-text-secondary)] mt-1">{row.detail}</p>
                </div>
                <span className={`hc-badge ${row.status === 'Ready' ? 'bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] border-[var(--hc-blue-200)]' : 'bg-[var(--hc-surface-soft)] border-[var(--hc-border)] text-[var(--hc-text-secondary)]'} whitespace-nowrap`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[var(--radius-lg)] p-6 border border-[var(--hc-border)] shadow-[var(--shadow-card)]">
            <span className="text-[11px] font-bold text-[var(--hc-blue-600)] uppercase tracking-widest mb-4 block">Portal inventory</span>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--hc-blue-50)] text-[var(--hc-blue-600)] flex items-center justify-center">
                <HcIcon name="inventory" className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-[var(--hc-text)]">Supply data is care-facing</h3>
            </div>
            <p className="text-sm text-[var(--hc-text-secondary)] leading-relaxed">
              This page is not a hospital warehouse view. It only shows patient-facing items connected to current care plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
