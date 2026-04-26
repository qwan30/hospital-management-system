"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listInventoryItems,
  listInventoryLots,
  listInventoryMovements,
  type InventoryItemResponse,
  type InventoryLotResponse,
  type InventoryMovementResponse,
} from "@/lib/operations-api";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemResponse[]>([]);
  const [lots, setLots] = useState<InventoryLotResponse[]>([]);
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextItems, nextLots, nextMovements] = await Promise.all([
        listInventoryItems(),
        listInventoryLots(),
        listInventoryMovements(),
      ]);
      setItems(nextItems);
      setLots(nextLots);
      setMovements(nextMovements);
    } catch (loadError) {
      setItems([]);
      setLots([]);
      setMovements([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInventory();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadInventory]);

  const summary = useMemo(() => {
    const lowStockItems = items.filter(isLowStock);
    const expiringLots = lots.filter(isExpiringSoon);
    const totalQuantity = items.reduce((total, item) => total + item.quantityOnHand, 0);

    return {
      lowStockItems,
      expiringLots,
      totalQuantity,
      movementCount: movements.length,
    };
  }, [items, lots, movements]);

  return (
    <main className="p-8" data-testid="inventory-workspace">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-primary-container">
            Operations Center
          </span>
          <h1 className="text-4xl font-light tracking-tight text-on-surface">
            Inventory Workspace
          </h1>
        </div>
        <button
          className="w-fit bg-primary-container px-4 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60"
          type="button"
          onClick={loadInventory}
          disabled={isLoading}
        >
          Refresh
        </button>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-px bg-outline-variant/20 md:grid-cols-4">
        <Metric label="Tracked Items" value={items.length} />
        <Metric label="On Hand Units" value={summary.totalQuantity} />
        <Metric
          label="Critical Alerts"
          value={summary.lowStockItems.length}
          detail={pluralize(summary.lowStockItems.length, "low-stock item")}
          tone="critical"
        />
        <Metric
          label="Expiry Warnings"
          value={summary.expiringLots.length}
          detail={pluralize(summary.expiringLots.length, "expiring lot")}
          tone="warning"
        />
      </section>

      {error ? (
        <section className="mb-8 border border-error-container bg-white p-6" role="alert">
          <p className="text-sm font-semibold text-error">{error}</p>
        </section>
      ) : null}

      <section className="bg-white">
        <div className="flex items-center justify-between bg-surface-container-low p-4">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-on-surface">
            Items
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
            {isLoading ? "Loading" : `Showing ${items.length} items`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container text-[10px] font-bold uppercase tracking-widest text-outline">
                <th className="px-4 py-3">SKU / Item</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map((item) => (
                <tr key={item.itemId} className="border-b border-surface-container">
                  <td className="px-4 py-4">
                    <div className="font-bold text-on-surface">{item.sku}</div>
                    <div className="text-on-surface-variant">{item.itemName}</div>
                  </td>
                  <td className="px-4 py-4">{item.departmentName ?? "Unassigned"}</td>
                  <td className="px-4 py-4 font-semibold">
                    {item.quantityOnHand} {item.unit}
                  </td>
                  <td className="px-4 py-4">{item.reorderLevel}</td>
                  <td className="px-4 py-4">
                    <StatusBadge label={item.status} warning={isLowStock(item)} />
                  </td>
                </tr>
              ))}
              {!isLoading && items.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm font-semibold" colSpan={5}>
                    No inventory items are available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <InventoryPanel title="Expiring Lots">
          {lots.map((lot) => (
            <div key={lot.lotId} className="border-b border-surface-container py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-on-surface">{lot.lotCode}</div>
                  <div className="text-xs text-on-surface-variant">{lot.itemName}</div>
                </div>
                <StatusBadge
                  label={lot.expiresOn ? formatDate(lot.expiresOn) : "No expiry"}
                  warning={isExpiringSoon(lot)}
                />
              </div>
            </div>
          ))}
        </InventoryPanel>

        <InventoryPanel title="Recent Movements">
          {movements.map((movement) => (
            <div key={movement.movementId} className="border-b border-surface-container py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-on-surface">{movement.itemName}</div>
                  <div className="text-xs text-on-surface-variant">
                    {movement.note ?? "No note"}
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary-container">
                  {movement.quantityDelta > 0 ? "+" : ""}
                  {movement.quantityDelta}
                </span>
              </div>
            </div>
          ))}
        </InventoryPanel>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: number;
  detail?: string;
  tone?: "default" | "critical" | "warning";
}) {
  const valueClass =
    tone === "critical"
      ? "text-error"
      : tone === "warning"
        ? "text-tertiary"
        : "text-on-surface";

  return (
    <div className="bg-surface-container-highest p-6">
      <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-on-surface/60">
        {label}
      </span>
      <div className={`text-3xl font-light ${valueClass}`}>{value}</div>
      {detail ? (
        <div className={`mt-2 text-[10px] font-bold uppercase ${valueClass}`}>
          {detail}
        </div>
      ) : null}
    </div>
  );
}

function InventoryPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface-container-low p-6">
      <h2 className="mb-4 text-[10px] font-extrabold uppercase tracking-widest text-outline">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function StatusBadge({ label, warning }: { label: string; warning: boolean }) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest ${
        warning ? "bg-error-container text-error" : "bg-primary-fixed text-primary"
      }`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}

function isLowStock(item: InventoryItemResponse) {
  return item.quantityOnHand <= item.reorderLevel || item.status !== "IN_STOCK";
}

function isExpiringSoon(lot: InventoryLotResponse) {
  if (!lot.expiresOn || lot.quantityRemaining <= 0) {
    return false;
  }

  const expiresAt = new Date(`${lot.expiresOn}T00:00:00`);
  const daysUntilExpiry = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}
