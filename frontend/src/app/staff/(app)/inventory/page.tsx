"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createInventoryItem,
  createInventoryLot,
  deleteInventoryItem,
  dispenseMedication,
  listInventoryAlerts,
  listInventoryItems,
  listInventoryLots,
  listInventoryMovements,
  recordInventoryMovement,
  updateInventoryItem,
  type InventoryAlertResponse,
  type InventoryDispenseResponse,
  type InventoryItemResponse,
  type InventoryLotResponse,
  type InventoryMovementResponse,
} from "@/lib/operations-api";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";
import { Package, AlertTriangle, AlertCircle } from "lucide-react";

type InventoryDialog = "item" | "lot" | "movement" | "dispense" | null;

interface ItemFormState {
  sku: string;
  itemName: string;
  category: string;
  unit: string;
  reorderLevel: string;
  quantityOnHand: string;
  departmentId: string;
}

interface LotFormState {
  itemId: string;
  lotCode: string;
  supplierName: string;
  quantityReceived: string;
  expiresOn: string;
}

interface MovementFormState {
  itemId: string;
  movementType: string;
  quantityDelta: string;
  note: string;
}

interface DispenseFormState {
  itemId: string;
  lotId: string;
  medicalRecordId: string;
  prescriptionItemName: string;
  quantity: string;
  note: string;
}

const emptyItemForm: ItemFormState = {
  sku: "",
  itemName: "",
  category: "",
  unit: "",
  reorderLevel: "0",
  quantityOnHand: "0",
  departmentId: "",
};

const emptyLotForm: LotFormState = {
  itemId: "",
  lotCode: "",
  supplierName: "",
  quantityReceived: "1",
  expiresOn: "",
};

const emptyMovementForm: MovementFormState = {
  itemId: "",
  movementType: "ADJUSTMENT",
  quantityDelta: "0",
  note: "",
};

const emptyDispenseForm: DispenseFormState = {
  itemId: "",
  lotId: "",
  medicalRecordId: "",
  prescriptionItemName: "",
  quantity: "1",
  note: "",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemResponse[]>([]);
  const [lots, setLots] = useState<InventoryLotResponse[]>([]);
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlertResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialog, setDialog] = useState<InventoryDialog>(null);
  const [editingItem, setEditingItem] = useState<InventoryItemResponse | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm);
  const [lotForm, setLotForm] = useState<LotFormState>(emptyLotForm);
  const [movementForm, setMovementForm] = useState<MovementFormState>(emptyMovementForm);
  const [dispenseForm, setDispenseForm] = useState<DispenseFormState>(emptyDispenseForm);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextItems, nextLots, nextMovements, nextAlerts] = await Promise.all([
        listInventoryItems(),
        listInventoryLots(),
        listInventoryMovements(),
        listInventoryAlerts(),
      ]);
      setItems(nextItems);
      setLots(nextLots);
      setMovements(nextMovements);
      setAlerts(nextAlerts);
    } catch (loadError) {
      setItems([]);
      setLots([]);
      setMovements([]);
      setAlerts([]);
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
    const lowStockAlerts = alerts.filter((alert) => alert.alertType === "LOW_STOCK");
    const expiryAlerts = alerts.filter(isExpiryAlert);
    const totalQuantity = items.reduce((total, item) => total + item.quantityOnHand, 0);

    return {
      lowStockAlerts,
      expiryAlerts,
      totalQuantity,
      movementCount: movements.length,
    };
  }, [alerts, items, movements]);

  function openCreateItem() {
    setEditingItem(null);
    setItemForm(emptyItemForm);
    setError(null);
    setSuccess(null);
    setDialog("item");
  }

  function openEditItem(item: InventoryItemResponse) {
    setEditingItem(item);
    setItemForm({
      sku: item.sku,
      itemName: item.itemName,
      category: item.category,
      unit: item.unit,
      reorderLevel: String(item.reorderLevel),
      quantityOnHand: String(item.quantityOnHand),
      departmentId: "",
    });
    setError(null);
    setSuccess(null);
    setDialog("item");
  }

  function openLotForm(item?: InventoryItemResponse) {
    setLotForm({ ...emptyLotForm, itemId: item?.itemId ?? items[0]?.itemId ?? "" });
    setError(null);
    setSuccess(null);
    setDialog("lot");
  }

  function openMovementForm(item?: InventoryItemResponse) {
    setMovementForm({ ...emptyMovementForm, itemId: item?.itemId ?? items[0]?.itemId ?? "" });
    setError(null);
    setSuccess(null);
    setDialog("movement");
  }

  function openDispenseForm(item?: InventoryItemResponse) {
    const itemId = item?.itemId ?? items[0]?.itemId ?? "";
    const matchingLot = lots.find((lot) => lot.itemId === itemId && lot.quantityRemaining > 0);
    setDispenseForm({
      ...emptyDispenseForm,
      itemId,
      lotId: matchingLot?.lotId ?? "",
      prescriptionItemName: item?.itemName ?? "",
    });
    setError(null);
    setSuccess(null);
    setDialog("dispense");
  }

  async function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!itemForm.sku.trim() || !itemForm.itemName.trim() || !itemForm.category.trim() || !itemForm.unit.trim()) {
      setError("SKU, item name, category, and unit are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const saved = await updateInventoryItem(editingItem.itemId, {
          itemName: itemForm.itemName.trim(),
          category: itemForm.category.trim(),
          unit: itemForm.unit.trim(),
          reorderLevel: Number(itemForm.reorderLevel),
          departmentId: nullableText(itemForm.departmentId),
        });
        setSuccess(saved ? `Item ${saved.itemName} updated.` : "Inventory item updated.");
      } else {
        const saved = await createInventoryItem({
          sku: itemForm.sku.trim(),
          itemName: itemForm.itemName.trim(),
          category: itemForm.category.trim(),
          unit: itemForm.unit.trim(),
          reorderLevel: Number(itemForm.reorderLevel),
          quantityOnHand: Number(itemForm.quantityOnHand),
          departmentId: nullableText(itemForm.departmentId),
        });
        setSuccess(saved ? `Item ${saved.itemName} created.` : "Inventory item created.");
      }
      setDialog(null);
      setEditingItem(null);
      await loadInventory();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to save inventory item."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!lotForm.itemId || !lotForm.lotCode.trim()) {
      setError("A real item and lot code are required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await createInventoryLot({
        itemId: lotForm.itemId,
        lotCode: lotForm.lotCode.trim(),
        supplierName: nullableText(lotForm.supplierName),
        quantityReceived: Number(lotForm.quantityReceived),
        expiresOn: nullableText(lotForm.expiresOn),
      });
      setSuccess(saved ? `Lot ${saved.lotCode} created.` : "Inventory lot created.");
      setDialog(null);
      await loadInventory();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to create inventory lot."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMovementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!movementForm.itemId || !movementForm.movementType.trim()) {
      setError("A real item and movement type are required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await recordInventoryMovement({
        itemId: movementForm.itemId,
        movementType: movementForm.movementType.trim(),
        quantityDelta: Number(movementForm.quantityDelta),
        note: nullableText(movementForm.note),
      });
      setSuccess(saved ? `Movement for ${saved.itemName} recorded.` : "Inventory movement recorded.");
      setDialog(null);
      await loadInventory();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to record inventory movement."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDispenseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!dispenseForm.itemId || !dispenseForm.lotId || !dispenseForm.medicalRecordId.trim() || !dispenseForm.prescriptionItemName.trim()) {
      setError("A real item, lot, medical record, and prescription item are required.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await dispenseMedication({
        itemId: dispenseForm.itemId,
        lotId: dispenseForm.lotId,
        medicalRecordId: dispenseForm.medicalRecordId.trim(),
        prescriptionItemName: dispenseForm.prescriptionItemName.trim(),
        quantity: Number(dispenseForm.quantity),
        note: nullableText(dispenseForm.note),
      });
      setSuccess(dispenseSuccessMessage(saved));
      setDialog(null);
      await loadInventory();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to dispense medication."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteItem(item: InventoryItemResponse) {
    const confirmed = window.confirm(`Delete inventory item ${item.itemName}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      await deleteInventoryItem(item.itemId);
      setSuccess(`Item ${item.itemName} deleted.`);
      await loadInventory();
    } catch (caught) {
      setError(errorMessage(caught, "Unable to delete inventory item."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="p-8 pb-20" data-testid="inventory-workspace">
      <PageHeader
        title="Inventory Workspace"
        description="Operations Center • Monitor stock levels, lots, and movements"
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <button className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--hc-primary)] px-4 text-[12px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[var(--hc-blue-700)] disabled:opacity-60 shadow-sm" onClick={openCreateItem} type="button">
              <HcIcon name="add" className="text-sm" />
              Add Item
            </button>
            <button className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-white px-4 text-[12px] font-bold uppercase tracking-widest text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)] disabled:opacity-60 shadow-sm" disabled={items.length === 0} onClick={() => openLotForm()} type="button">
              <HcIcon name="inventory_2" className="text-sm" />
              Add Lot
            </button>
            <button className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-white px-4 text-[12px] font-bold uppercase tracking-widest text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)] disabled:opacity-60 shadow-sm" disabled={items.length === 0} onClick={() => openMovementForm()} type="button">
              <HcIcon name="sync_alt" className="text-sm" />
              Movement
            </button>
            <button className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-white px-4 text-[12px] font-bold uppercase tracking-widest text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)] disabled:opacity-60 shadow-sm" disabled={items.length === 0 || lots.length === 0} onClick={() => openDispenseForm()} type="button">
              <HcIcon name="medication" className="text-sm" />
              Dispense
            </button>
            <button className="flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--hc-border)] bg-white px-4 text-[12px] font-bold uppercase tracking-widest text-[var(--hc-text)] transition-colors hover:bg-[var(--hc-surface-soft)] disabled:opacity-60 shadow-sm" onClick={loadInventory} disabled={isLoading} type="button">
              <HcIcon name="refresh" className="text-sm" />
              Refresh
            </button>
          </div>
        }
      />

      <div className="hc-kpi-grid mb-[30px]">
        <KpiCard label="Tracked Items" value={items.length.toString()} icon={Package} tone="blue" />
        <KpiCard label="On Hand Units" value={summary.totalQuantity.toString()} icon={Package} tone="blue" />
        <KpiCard label="Critical Alerts" value={summary.lowStockAlerts.length.toString()} helper={pluralize(summary.lowStockAlerts.length, "low-stock item")} icon={AlertTriangle} tone="red" />
        <KpiCard label="Expiry Warnings" value={summary.expiryAlerts.length.toString()} helper={pluralize(summary.expiryAlerts.length, "expiring lot")} icon={AlertCircle} tone="teal" />
      </div>

      {error ? (
        <div className="mb-8 border border-[var(--hc-danger-bg)] bg-[var(--hc-danger-bg)] p-6 rounded-[var(--radius-lg)]" role="alert">
          <p className="text-[13px] font-semibold text-[var(--hc-danger)]">{error}</p>
        </div>
      ) : null}
      {success ? (
        <div className="mb-8 border border-[var(--hc-success-bg)] bg-[var(--hc-success-bg)] p-6 rounded-[var(--radius-lg)]" role="status">
          <p className="text-[13px] font-semibold text-[var(--hc-success)]">{success}</p>
        </div>
      ) : null}

      <DataPanel
        filters={
          <div className="flex flex-1 items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-[var(--hc-text)]">
              Items
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
              {isLoading ? "Loading" : `Showing ${items.length} items`}
            </span>
          </div>
        }
        className="mb-8"
      >
        <div className="overflow-x-auto">
          <table className="hc-table w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">SKU / Item</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Department</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Qty</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Threshold</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)]">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] bg-[var(--hc-surface-soft)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hc-border-soft)]">
              {items.map((item) => (
                <tr key={item.itemId} className="group transition-colors hover:bg-[var(--hc-primary-bg)]">
                  <td className="p-4">
                    <div className="font-bold text-[13px] text-[var(--hc-text)]">{item.sku}</div>
                    <div className="text-[11px] text-[var(--hc-text-secondary)]">{item.itemName}</div>
                  </td>
                  <td className="p-4 text-[13px] text-[var(--hc-text)] font-medium">{item.departmentName ?? "Unassigned"}</td>
                  <td className="p-4 text-[13px] font-semibold text-[var(--hc-text)]">
                    {item.quantityOnHand} {item.unit}
                  </td>
                  <td className="p-4 text-[13px] text-[var(--hc-text)]">{item.reorderLevel}</td>
                  <td className="p-4">
                    <StatusBadge label={item.status} warning={isLowStock(item)} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3 text-[10px] font-bold uppercase tracking-widest">
                      <button className="text-[var(--hc-primary)] hover:underline disabled:opacity-40" disabled={isSaving} onClick={() => openEditItem(item)} type="button">
                        Edit
                      </button>
                      <button className="text-[var(--hc-primary)] hover:underline disabled:opacity-40" disabled={isSaving} onClick={() => openLotForm(item)} type="button">
                        Lot
                      </button>
                      <button className="text-[var(--hc-primary)] hover:underline disabled:opacity-40" disabled={isSaving} onClick={() => openMovementForm(item)} type="button">
                        Move
                      </button>
                      <button className="text-[var(--hc-primary)] hover:underline disabled:opacity-40" disabled={isSaving || !lots.some((lot) => lot.itemId === item.itemId && lot.quantityRemaining > 0)} onClick={() => openDispenseForm(item)} type="button">
                        Dispense
                      </button>
                      <button className="text-[var(--hc-danger)] hover:underline disabled:opacity-40" disabled={isSaving} onClick={() => handleDeleteItem(item)} type="button">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && items.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-[13px] font-semibold text-[var(--hc-text-secondary)]" colSpan={6}>
                    No inventory items are available.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </DataPanel>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <InventoryPanel title="Expiring Lots">
          <div className="divide-y divide-[var(--hc-border-soft)]">
            {lots.map((lot) => (
              <div key={lot.lotId} className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-bold text-[var(--hc-text)]">{lot.lotCode}</div>
                    <div className="text-[11px] text-[var(--hc-text-secondary)] mt-0.5">{lot.itemName}</div>
                  </div>
                  <StatusBadge
                    label={lot.expiresOn ? formatDate(lot.expiresOn) : "No expiry"}
                    warning={isExpiringSoon(lot)}
                  />
                </div>
              </div>
            ))}
            {lots.length === 0 && <div className="py-4 text-[13px] text-[var(--hc-text-secondary)]">No active lots.</div>}
          </div>
        </InventoryPanel>

        <InventoryPanel title="Recent Movements">
          <div className="divide-y divide-[var(--hc-border-soft)]">
            {movements.map((movement) => (
              <div key={movement.movementId} className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-bold text-[var(--hc-text)]">{movement.itemName}</div>
                    <div className="text-[11px] text-[var(--hc-text-secondary)] mt-0.5">
                      {movement.note ?? "No note"}
                    </div>
                  </div>
                  <span className={`text-[13px] font-bold ${movement.quantityDelta > 0 ? "text-[var(--hc-success)]" : "text-[var(--hc-danger)]"}`}>
                    {movement.quantityDelta > 0 ? "+" : ""}
                    {movement.quantityDelta}
                  </span>
                </div>
              </div>
            ))}
            {movements.length === 0 && <div className="py-4 text-[13px] text-[var(--hc-text-secondary)]">No recent movements.</div>}
          </div>
        </InventoryPanel>
      </section>

      {dialog === "item" ? (
        <Dialog title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"} onClose={() => setDialog(null)}>
          <ItemForm form={itemForm} isEditing={Boolean(editingItem)} isSaving={isSaving} onChange={setItemForm} onSubmit={handleItemSubmit} />
        </Dialog>
      ) : null}
      {dialog === "lot" ? (
        <Dialog title="Add Inventory Lot" onClose={() => setDialog(null)}>
          <LotForm form={lotForm} isSaving={isSaving} items={items} onChange={setLotForm} onSubmit={handleLotSubmit} />
        </Dialog>
      ) : null}
      {dialog === "movement" ? (
        <Dialog title="Record Inventory Movement" onClose={() => setDialog(null)}>
          <MovementForm form={movementForm} isSaving={isSaving} items={items} onChange={setMovementForm} onSubmit={handleMovementSubmit} />
        </Dialog>
      ) : null}
      {dialog === "dispense" ? (
        <Dialog title="Dispense Medication" onClose={() => setDialog(null)}>
          <DispenseForm form={dispenseForm} isSaving={isSaving} items={items} lots={lots} onChange={setDispenseForm} onSubmit={handleDispenseSubmit} />
        </Dialog>
      ) : null}
    </main>
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
    <section className="bg-white rounded-[var(--radius-xl)] border border-[var(--hc-border)] shadow-[var(--shadow-card)] p-6">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text)] border-b border-[var(--hc-border-soft)] pb-4">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function ItemForm({
  form,
  isEditing,
  isSaving,
  onChange,
  onSubmit,
}: {
  form: ItemFormState;
  isEditing: boolean;
  isSaving: boolean;
  onChange: (form: ItemFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <TextField disabled={isEditing} label="SKU" onChange={(value) => onChange({ ...form, sku: value })} required value={form.sku} />
      <TextField label="Item Name" onChange={(value) => onChange({ ...form, itemName: value })} required value={form.itemName} />
      <TextField label="Category" onChange={(value) => onChange({ ...form, category: value })} required value={form.category} />
      <TextField label="Unit" onChange={(value) => onChange({ ...form, unit: value })} required value={form.unit} />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Reorder Level" onChange={(value) => onChange({ ...form, reorderLevel: value })} required type="number" value={form.reorderLevel} />
        <TextField disabled={isEditing} label="Quantity On Hand" onChange={(value) => onChange({ ...form, quantityOnHand: value })} required type="number" value={form.quantityOnHand} />
      </div>
      <TextField label="Department ID" onChange={(value) => onChange({ ...form, departmentId: value })} value={form.departmentId} />
      <div className="mt-4 flex justify-end">
        <button className="bg-[var(--hc-primary)] rounded-[var(--radius-md)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-60 transition-colors hover:bg-[var(--hc-blue-700)]" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save Item"}
        </button>
      </div>
    </form>
  );
}

function LotForm({
  form,
  isSaving,
  items,
  onChange,
  onSubmit,
}: {
  form: LotFormState;
  isSaving: boolean;
  items: InventoryItemResponse[];
  onChange: (form: LotFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <ItemSelect itemId={form.itemId} items={items} onChange={(itemId) => onChange({ ...form, itemId })} />
      <TextField label="Lot Code" onChange={(value) => onChange({ ...form, lotCode: value })} required value={form.lotCode} />
      <TextField label="Supplier Name" onChange={(value) => onChange({ ...form, supplierName: value })} value={form.supplierName} />
      <TextField label="Quantity Received" onChange={(value) => onChange({ ...form, quantityReceived: value })} required type="number" value={form.quantityReceived} />
      <TextField label="Expires On" onChange={(value) => onChange({ ...form, expiresOn: value })} type="date" value={form.expiresOn} />
      <div className="mt-4 flex justify-end">
        <button className="bg-[var(--hc-primary)] rounded-[var(--radius-md)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-60 transition-colors hover:bg-[var(--hc-blue-700)]" disabled={isSaving || items.length === 0} type="submit">
          {isSaving ? "Saving..." : "Save Lot"}
        </button>
      </div>
    </form>
  );
}

function MovementForm({
  form,
  isSaving,
  items,
  onChange,
  onSubmit,
}: {
  form: MovementFormState;
  isSaving: boolean;
  items: InventoryItemResponse[];
  onChange: (form: MovementFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <ItemSelect itemId={form.itemId} items={items} onChange={(itemId) => onChange({ ...form, itemId })} />
      <TextField label="Movement Type" onChange={(value) => onChange({ ...form, movementType: value })} required value={form.movementType} />
      <TextField label="Quantity Delta" onChange={(value) => onChange({ ...form, quantityDelta: value })} required type="number" value={form.quantityDelta} />
      <TextField label="Note" onChange={(value) => onChange({ ...form, note: value })} value={form.note} />
      <div className="mt-4 flex justify-end">
        <button className="bg-[var(--hc-primary)] rounded-[var(--radius-md)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-60 transition-colors hover:bg-[var(--hc-blue-700)]" disabled={isSaving || items.length === 0} type="submit">
          {isSaving ? "Saving..." : "Record Movement"}
        </button>
      </div>
    </form>
  );
}

function DispenseForm({
  form,
  isSaving,
  items,
  lots,
  onChange,
  onSubmit,
}: {
  form: DispenseFormState;
  isSaving: boolean;
  items: InventoryItemResponse[];
  lots: InventoryLotResponse[];
  onChange: (form: DispenseFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const availableLots = lots.filter((lot) => lot.itemId === form.itemId && lot.quantityRemaining > 0);

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <ItemSelect
        itemId={form.itemId}
        items={items}
        onChange={(itemId) => {
          const nextLot = lots.find((lot) => lot.itemId === itemId && lot.quantityRemaining > 0);
          const selectedItem = items.find((item) => item.itemId === itemId);
          onChange({
            ...form,
            itemId,
            lotId: nextLot?.lotId ?? "",
            prescriptionItemName: selectedItem?.itemName ?? form.prescriptionItemName,
          });
        }}
      />
      <LotSelect lotId={form.lotId} lots={availableLots} onChange={(lotId) => onChange({ ...form, lotId })} />
      <TextField label="Medical Record ID" onChange={(value) => onChange({ ...form, medicalRecordId: value })} required value={form.medicalRecordId} />
      <TextField label="Prescription Item Name" onChange={(value) => onChange({ ...form, prescriptionItemName: value })} required value={form.prescriptionItemName} />
      <TextField label="Quantity To Dispense" onChange={(value) => onChange({ ...form, quantity: value })} required type="number" value={form.quantity} />
      <TextField label="Note" onChange={(value) => onChange({ ...form, note: value })} value={form.note} />
      <div className="mt-4 flex justify-end">
        <button className="bg-[var(--hc-primary)] rounded-[var(--radius-md)] px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-60 transition-colors hover:bg-[var(--hc-blue-700)]" disabled={isSaving || items.length === 0 || availableLots.length === 0} type="submit">
          {isSaving ? "Saving..." : "Dispense Medication"}
        </button>
      </div>
    </form>
  );
}

function ItemSelect({
  itemId,
  items,
  onChange,
}: {
  itemId: string;
  items: InventoryItemResponse[];
  onChange: (itemId: string) => void;
}) {
  return (
    <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
      Item
      <select className="h-10 rounded-md border border-[var(--hc-border-soft)] bg-white px-3 text-[13px] font-medium text-[var(--hc-text)] focus:border-[var(--hc-blue-500)] focus:outline-none focus:ring-1 focus:ring-[var(--hc-blue-500)]" onChange={(event) => onChange(event.target.value)} required value={itemId}>
        <option value="">Select real item</option>
        {items.map((item) => (
          <option key={item.itemId} value={item.itemId}>{item.itemName}</option>
        ))}
      </select>
    </label>
  );
}

function LotSelect({
  lotId,
  lots,
  onChange,
}: {
  lotId: string;
  lots: InventoryLotResponse[];
  onChange: (lotId: string) => void;
}) {
  return (
    <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
      Lot
      <select className="h-10 rounded-md border border-[var(--hc-border-soft)] bg-white px-3 text-[13px] font-medium text-[var(--hc-text)] focus:border-[var(--hc-blue-500)] focus:outline-none focus:ring-1 focus:ring-[var(--hc-blue-500)]" onChange={(event) => onChange(event.target.value)} required value={lotId}>
        <option value="">Select lot with stock</option>
        {lots.map((lot) => (
          <option key={lot.lotId} value={lot.lotId}>
            {lot.lotCode} - {lot.quantityRemaining} remaining
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  disabled = false,
  label,
  onChange,
  required = false,
  type = "text",
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)]">
      {label}
      <input className="h-10 rounded-md border border-[var(--hc-border-soft)] bg-white px-3 text-[13px] font-medium focus:border-[var(--hc-blue-500)] focus:outline-none focus:ring-1 focus:ring-[var(--hc-blue-500)] text-[var(--hc-text)] disabled:opacity-60" disabled={disabled} onChange={(event) => onChange(event.target.value)} required={required} type={type} value={value} />
    </label>
  );
}

function Dialog({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white p-8 rounded-[var(--radius-xl)] shadow-2xl border border-[var(--hc-border-soft)]">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--hc-border-soft)] pb-4">
          <h2 className="text-xl font-bold text-[var(--hc-text)]">{title}</h2>
          <button className="text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] transition-colors" onClick={onClose} type="button">
            <HcIcon name="close" className="text-2xl" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ label, warning }: { label: string; warning: boolean }) {
  return (
    <span
      className={`hc-badge ${
        warning ? "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] border-[var(--hc-danger-bg)]" : "bg-[var(--hc-success-bg)] text-[var(--hc-success)] border-[var(--hc-success-bg)]"
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

function isExpiryAlert(alert: InventoryAlertResponse) {
  return alert.alertType === "EXPIRING_SOON" || alert.alertType === "EXPIRED";
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

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function dispenseSuccessMessage(response: InventoryDispenseResponse | null) {
  if (!response) {
    return "Medication dispensed.";
  }

  return `Dispensed ${response.quantityDispensed} ${response.itemName} from ${response.lotCode}.`;
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}
