import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InventoryPage from "../page";
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
  type InventoryItemResponse,
  type InventoryLotResponse,
  type InventoryMovementResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    createInventoryItem: vi.fn(),
    createInventoryLot: vi.fn(),
    deleteInventoryItem: vi.fn(),
    dispenseMedication: vi.fn(),
    listInventoryAlerts: vi.fn(),
    listInventoryItems: vi.fn(),
    listInventoryLots: vi.fn(),
    listInventoryMovements: vi.fn(),
    recordInventoryMovement: vi.fn(),
    updateInventoryItem: vi.fn(),
  };
});

const items: InventoryItemResponse[] = [
  {
    itemId: "item-1",
    sku: "MED-001",
    itemName: "Bandage",
    category: "Supplies",
    unit: "box",
    reorderLevel: 10,
    quantityOnHand: 20,
    status: "IN_STOCK",
    departmentName: "Cardiology",
    lastRestockedAt: null,
  },
];

const lots: InventoryLotResponse[] = [
  {
    lotId: "lot-1",
    itemId: "item-1",
    itemName: "Bandage",
    lotCode: "LOT-1",
    supplierName: null,
    quantityReceived: 5,
    quantityRemaining: 5,
    expiresOn: null,
  },
];

const richItems: InventoryItemResponse[] = [
  {
    ...items[0],
    departmentName: null,
    quantityOnHand: 3,
    reorderLevel: 5,
    status: "LOW_STOCK",
  },
  {
    itemId: "item-2",
    sku: "MED-002",
    itemName: "Gauze",
    category: "Supplies",
    unit: "pack",
    reorderLevel: 1,
    quantityOnHand: 25,
    status: "IN_STOCK",
    departmentName: "Emergency",
    lastRestockedAt: null,
  },
];

const richLots: InventoryLotResponse[] = [
  {
    ...lots[0],
    expiresOn: "2026-06-15",
  },
  {
    lotId: "lot-2",
    itemId: "item-2",
    itemName: "Gauze",
    lotCode: "LOT-2",
    supplierName: "Local supplier",
    quantityReceived: 10,
    quantityRemaining: 0,
    expiresOn: "2026-07-15",
  },
];

const richMovements: InventoryMovementResponse[] = [
  {
    movementId: "movement-positive",
    itemId: "item-1",
    itemName: "Bandage",
    movementType: "RESTOCK",
    quantityDelta: 4,
    note: null,
    createdAt: "2026-05-20T00:00:00Z",
  },
  {
    movementId: "movement-negative",
    itemId: "item-2",
    itemName: "Gauze",
    movementType: "ADJUSTMENT",
    quantityDelta: -2,
    note: "Damaged",
    createdAt: "2026-05-20T00:00:00Z",
  },
];

const richAlerts: InventoryAlertResponse[] = [
  {
    alertType: "LOW_STOCK",
    severity: "WARNING",
    itemId: "item-1",
    itemName: "Bandage",
    lotId: null,
    lotCode: null,
    quantityOnHand: 3,
    reorderLevel: 5,
    expiresOn: null,
    daysUntilExpiry: null,
    message: "Bandage is below reorder level",
  },
  {
    alertType: "EXPIRING_SOON",
    severity: "WARNING",
    itemId: "item-1",
    itemName: "Bandage",
    lotId: "lot-1",
    lotCode: "LOT-1",
    quantityOnHand: 3,
    reorderLevel: 5,
    expiresOn: "2026-06-15",
    daysUntilExpiry: 14,
    message: "LOT-1 expires soon",
  },
  {
    alertType: "EXPIRED",
    severity: "CRITICAL",
    itemId: "item-2",
    itemName: "Gauze",
    lotId: "lot-2",
    lotCode: "LOT-2",
    quantityOnHand: 25,
    reorderLevel: 1,
    expiresOn: "2026-05-15",
    daysUntilExpiry: -17,
    message: "LOT-2 is expired",
  },
];

describe("InventoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "confirm", {
      writable: true,
      value: vi.fn(() => true),
    });
    vi.mocked(listInventoryItems).mockResolvedValue(items);
    vi.mocked(listInventoryLots).mockResolvedValue(lots);
    vi.mocked(listInventoryMovements).mockResolvedValue([]);
    vi.mocked(listInventoryAlerts).mockResolvedValue([]);
    vi.mocked(createInventoryItem).mockResolvedValue(items[0]);
    vi.mocked(updateInventoryItem).mockResolvedValue({ ...items[0], itemName: "Bandage Updated" });
    vi.mocked(deleteInventoryItem).mockResolvedValue(null);
    vi.mocked(createInventoryLot).mockResolvedValue(lots[0]);
    vi.mocked(dispenseMedication).mockResolvedValue({
      movementId: "movement-dispense-1",
      itemId: "item-1",
      itemName: "Bandage",
      lotId: "lot-1",
      lotCode: "LOT-1",
      medicalRecordId: "record-1",
      prescriptionItemName: "Bandage",
      quantityDispensed: 1,
      itemQuantityOnHand: 19,
      lotQuantityRemaining: 4,
      note: "Prescription pickup",
      createdAt: "2026-05-20T00:00:00Z",
    });
    vi.mocked(recordInventoryMovement).mockResolvedValue({
      movementId: "movement-1",
      itemId: "item-1",
      itemName: "Bandage",
      movementType: "ADJUSTMENT",
      quantityDelta: -2,
      note: "Damaged",
      createdAt: "2026-05-20T00:00:00Z",
    });
  });

  it("loads real inventory without static fallback rows", async () => {
    render(<InventoryPage />);

    expect(await screen.findByText("MED-001")).toBeInTheDocument();
    expect(screen.getAllByText("Bandage").length).toBeGreaterThan(0);
    expect(screen.getByText("MED-001")).toBeInTheDocument();
    expect(screen.queryByText("Static Supply")).not.toBeInTheDocument();
    expect(listInventoryItems).toHaveBeenCalledOnce();
  });

  it("creates and updates inventory items with backend DTOs", async () => {
    render(<InventoryPage />);

    await screen.findByText("MED-001");
    await userEvent.click(screen.getByRole("button", { name: /add item/i }));
    fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "MED-002" } });
    fireEvent.change(screen.getByLabelText("Item Name"), { target: { value: "Gauze" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Supplies" } });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "pack" } });
    await userEvent.click(screen.getByRole("button", { name: /save item/i }));

    await waitFor(() => {
      expect(createInventoryItem).toHaveBeenCalledWith({
        sku: "MED-002",
        itemName: "Gauze",
        category: "Supplies",
        unit: "pack",
        reorderLevel: 0,
        quantityOnHand: 0,
        departmentId: null,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Item Name"), { target: { value: "Bandage Updated" } });
    await userEvent.click(screen.getByRole("button", { name: /save item/i }));

    await waitFor(() => {
      expect(updateInventoryItem).toHaveBeenCalledWith(
        "item-1",
        expect.objectContaining({ itemName: "Bandage Updated" }),
      );
    });
  });

  it("creates lots, records movements, and deletes items by real IDs", async () => {
    render(<InventoryPage />);

    await screen.findByText("MED-001");
    await userEvent.click(screen.getByRole("button", { name: "Lot" }));
    fireEvent.change(screen.getByLabelText("Lot Code"), { target: { value: "LOT-1" } });
    fireEvent.change(screen.getByLabelText("Quantity Received"), { target: { value: "5" } });
    await userEvent.click(screen.getByRole("button", { name: /save lot/i }));

    await waitFor(() => {
      expect(createInventoryLot).toHaveBeenCalledWith({
        itemId: "item-1",
        lotCode: "LOT-1",
        supplierName: null,
        quantityReceived: 5,
        expiresOn: null,
      });
    });

    await userEvent.click(screen.getByRole("button", { name: "Move" }));
    fireEvent.change(screen.getByLabelText("Quantity Delta"), { target: { value: "-2" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Damaged" } });
    await userEvent.click(screen.getByRole("button", { name: "Record Movement" }));

    await waitFor(() => {
      expect(recordInventoryMovement).toHaveBeenCalledWith({
        itemId: "item-1",
        movementType: "ADJUSTMENT",
        quantityDelta: -2,
        note: "Damaged",
      });
    });

    const dispenseButtons = screen.getAllByRole("button", { name: "Dispense" });
    await userEvent.click(dispenseButtons[dispenseButtons.length - 1]);
    fireEvent.change(screen.getByLabelText("Medical Record ID"), { target: { value: "record-1" } });
    fireEvent.change(screen.getByLabelText("Quantity To Dispense"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Prescription pickup" } });
    await userEvent.click(screen.getByRole("button", { name: "Dispense Medication" }));

    await waitFor(() => {
      expect(dispenseMedication).toHaveBeenCalledWith({
        itemId: "item-1",
        lotId: "lot-1",
        medicalRecordId: "record-1",
        prescriptionItemName: "Bandage",
        quantity: 1,
        note: "Prescription pickup",
      });
    });

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteInventoryItem).toHaveBeenCalledWith("item-1");
    });
  });

  it("renders inventory warning branches and prevents unsupported dispense/delete paths", async () => {
    vi.mocked(listInventoryItems).mockResolvedValue(richItems);
    vi.mocked(listInventoryLots).mockResolvedValue(richLots);
    vi.mocked(listInventoryMovements).mockResolvedValue(richMovements);
    vi.mocked(listInventoryAlerts).mockResolvedValue(richAlerts);

    render(<InventoryPage />);

    expect(await screen.findByText("Unassigned")).toBeInTheDocument();
    expect(screen.getByText("1 low-stock item")).toBeInTheDocument();
    expect(screen.getByText("No note")).toBeInTheDocument();
    expect(screen.getByText("+4")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "Dispense" })[0]);
    fireEvent.submit(screen.getByRole("button", { name: "Dispense Medication" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A real item, lot, medical record, and prescription item are required.",
    );
    expect(dispenseMedication).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Item"), { target: { value: "item-2" } });
    expect(screen.getByLabelText("Prescription Item Name")).toHaveValue("Gauze");
    expect(screen.getByRole("button", { name: "Dispense Medication" })).toBeDisabled();

    vi.mocked(window.confirm).mockReturnValueOnce(false);
    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(deleteInventoryItem).not.toHaveBeenCalled();
  });

  it("shows dispense fallback success and API failure states", async () => {
    vi.mocked(dispenseMedication).mockResolvedValueOnce(null as never);

    const { unmount } = render(<InventoryPage />);

    await screen.findByText("MED-001");
    const firstDispenseButtons = screen.getAllByRole("button", { name: "Dispense" });
    await userEvent.click(firstDispenseButtons[firstDispenseButtons.length - 1]);
    fireEvent.change(screen.getByLabelText("Medical Record ID"), { target: { value: "record-1" } });
    fireEvent.change(screen.getByLabelText("Prescription Item Name"), { target: { value: "Bandage" } });
    fireEvent.change(screen.getByLabelText("Quantity To Dispense"), { target: { value: "1" } });
    await userEvent.click(screen.getByRole("button", { name: "Dispense Medication" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Medication dispensed.");

    unmount();
    vi.mocked(dispenseMedication).mockRejectedValueOnce(new Error("Dispense conflict"));

    render(<InventoryPage />);

    await screen.findByText("MED-001");
    const secondDispenseButtons = screen.getAllByRole("button", { name: "Dispense" });
    await userEvent.click(secondDispenseButtons[secondDispenseButtons.length - 1]);
    fireEvent.change(screen.getByLabelText("Medical Record ID"), { target: { value: "record-1" } });
    fireEvent.change(screen.getByLabelText("Prescription Item Name"), { target: { value: "Bandage" } });
    await userEvent.click(screen.getByRole("button", { name: "Dispense Medication" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Dispense conflict");
  });

  it("shows empty and error states without mock fallback", async () => {
    vi.mocked(listInventoryItems).mockResolvedValueOnce([]);

    const { unmount } = render(<InventoryPage />);

    expect(await screen.findByText(/no inventory items are available/i)).toBeInTheDocument();

    unmount();
    vi.mocked(listInventoryItems).mockRejectedValueOnce(new Error("Inventory access denied"));

    render(<InventoryPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Inventory access denied");
  });
});
