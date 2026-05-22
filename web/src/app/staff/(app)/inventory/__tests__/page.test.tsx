import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InventoryPage from "../page";
import {
  createInventoryItem,
  createInventoryLot,
  deleteInventoryItem,
  listInventoryAlerts,
  listInventoryItems,
  listInventoryLots,
  listInventoryMovements,
  recordInventoryMovement,
  updateInventoryItem,
  type InventoryItemResponse,
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

describe("InventoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listInventoryItems).mockResolvedValue(items);
    vi.mocked(listInventoryLots).mockResolvedValue([]);
    vi.mocked(listInventoryMovements).mockResolvedValue([]);
    vi.mocked(listInventoryAlerts).mockResolvedValue([]);
    vi.mocked(createInventoryItem).mockResolvedValue(items[0]);
    vi.mocked(updateInventoryItem).mockResolvedValue({ ...items[0], itemName: "Bandage Updated" });
    vi.mocked(deleteInventoryItem).mockResolvedValue(null);
    vi.mocked(createInventoryLot).mockResolvedValue({
      lotId: "lot-1",
      itemId: "item-1",
      itemName: "Bandage",
      lotCode: "LOT-1",
      supplierName: null,
      quantityReceived: 5,
      quantityRemaining: 5,
      expiresOn: null,
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

    expect(await screen.findByText("Bandage")).toBeInTheDocument();
    expect(screen.getByText("MED-001")).toBeInTheDocument();
    expect(screen.queryByText("Static Supply")).not.toBeInTheDocument();
    expect(listInventoryItems).toHaveBeenCalledOnce();
  });

  it("creates and updates inventory items with backend DTOs", async () => {
    render(<InventoryPage />);

    await screen.findByText("Bandage");
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

    await screen.findByText("Bandage");
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

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteInventoryItem).toHaveBeenCalledWith("item-1");
    });
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
