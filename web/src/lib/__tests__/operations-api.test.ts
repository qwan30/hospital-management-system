import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listInventoryItems,
  listInventoryLots,
  listInventoryMovements,
  listInventoryAlerts,
  getMonitoringSnapshot,
  listAuditLogs,
  getPatientPortalOverview,
  listPatientPortalLabResults,
} from "../operations-api";
import { apiRequest } from "@/lib/api-client";

// Mock apiRequest
vi.mock("@/lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("operations-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listInventoryItems", () => {
    it("returns items from the API", async () => {
      const mockItems = [{ itemId: "1", itemName: "Paracetamol" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockItems });

      const result = await listInventoryItems();

      expect(apiRequest).toHaveBeenCalledWith("/inventory/items", {}, { authScope: "staff" });
      expect(result).toEqual(mockItems);
    });

    it("returns empty array if data is undefined", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const result = await listInventoryItems();

      expect(result).toEqual([]);
    });
  });

  describe("listInventoryLots", () => {
    it("returns lots from the API", async () => {
      const mockLots = [{ lotId: "1", lotCode: "LOT1" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockLots });

      const result = await listInventoryLots();

      expect(apiRequest).toHaveBeenCalledWith("/inventory/lots", {}, { authScope: "staff" });
      expect(result).toEqual(mockLots);
    });
  });

  describe("listInventoryMovements", () => {
    it("returns movements from the API", async () => {
      const mockMovements = [{ movementId: "1", movementType: "IN" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockMovements });

      const result = await listInventoryMovements();

      expect(apiRequest).toHaveBeenCalledWith("/inventory/movements", {}, { authScope: "staff" });
      expect(result).toEqual(mockMovements);
    });
  });

  describe("listInventoryAlerts", () => {
    it("returns alerts from the API", async () => {
      const mockAlerts = [{ alertType: "LOW_STOCK", severity: "WARNING" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAlerts });

      const result = await listInventoryAlerts();

      expect(apiRequest).toHaveBeenCalledWith("/inventory/alerts", {}, { authScope: "staff" });
      expect(result).toEqual(mockAlerts);
    });
  });

  describe("getMonitoringSnapshot", () => {
    it("returns snapshot from the API", async () => {
      const mockSnapshot = { healthy: true, uptimeSeconds: 100 };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockSnapshot });

      const result = await getMonitoringSnapshot();

      expect(apiRequest).toHaveBeenCalledWith("/admin/monitoring", {}, { authScope: "staff" });
      expect(result).toEqual(mockSnapshot);
    });

    it("returns null if data is undefined", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const result = await getMonitoringSnapshot();

      expect(result).toBeNull();
    });
  });

  describe("listAuditLogs", () => {
    it("returns audit logs from the API with default limit", async () => {
      const mockLogs = [{ auditLogId: "1", action: "CREATE" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockLogs });

      const result = await listAuditLogs();

      expect(apiRequest).toHaveBeenCalledWith("/admin/audit-logs?limit=50", {}, { authScope: "staff" });
      expect(result).toEqual(mockLogs);
    });

    it("returns audit logs with custom limit", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [] });

      await listAuditLogs(10);

      expect(apiRequest).toHaveBeenCalledWith("/admin/audit-logs?limit=10", {}, { authScope: "staff" });
    });
  });

  describe("getPatientPortalOverview", () => {
    it("returns portal overview from the API", async () => {
      const mockOverview = { patientFullName: "John Doe" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockOverview });

      const result = await getPatientPortalOverview();

      expect(apiRequest).toHaveBeenCalledWith("/patient-portal/overview", {}, { authScope: "patient" });
      expect(result).toEqual(mockOverview);
    });
  });

  describe("listPatientPortalLabResults", () => {
    it("returns lab results from the API", async () => {
      const mockResults = [{ labResultId: "1", testName: "Blood Test" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockResults });

      const result = await listPatientPortalLabResults();

      expect(apiRequest).toHaveBeenCalledWith("/patient-portal/lab-results", {}, { authScope: "patient" });
      expect(result).toEqual(mockResults);
    });
  });
});
