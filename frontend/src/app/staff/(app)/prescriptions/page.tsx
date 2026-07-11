import { HcIcon } from "@/components/ui/hc-icon";
import { Button } from "@/components/ui/button";

export default function PrescriptionsQueuePage() {
  return (
    <main className="max-w-[1400px] mx-auto p-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-[var(--hc-text)] mb-2">Prescriptions Queue</h1>
        <p className="text-[var(--hc-text-secondary)] text-sm max-w-2xl font-normal">Manage and fulfill electronic prescriptions.</p>
      </header>

      <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)] flex justify-between items-center">
          <h2 className="text-sm font-bold text-[var(--hc-text)]">Active Orders</h2>
          <Button variant="outline" size="sm">
            <HcIcon name="refresh" className="mr-2" /> Refresh
          </Button>
        </div>
        
        <div className="p-8 text-center text-[var(--hc-text-muted)] flex flex-col items-center">
          <HcIcon name="inventory_2" className="text-4xl mb-4 opacity-50" />
          <p className="font-medium">No pending prescriptions at this time.</p>
          <p className="text-sm mt-1">New e-prescriptions from consultations will appear here.</p>
        </div>
      </div>
    </main>
  );
}
