import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api-client";
import {
  getMonitoringSnapshot,
  getPatientPortalOverview,
  listAuditLogs,
  listInventoryAlerts,
  listInventoryItems,
  listInventoryLots,
  listInventoryMovements,
  listPatientPortalLabResults,
} from "../operations-api";

vi.mock("@/lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("operations-api fallback behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["listInventoryItems", listInventoryItems],
    ["listInventoryLots", listInventoryLots],
    ["listInventoryMovements", listInventoryMovements],
    ["listInventoryAlerts", listInventoryAlerts],
    ["listAuditLogs", listAuditLogs],
    ["listPatientPortalLabResults", listPatientPortalLabResults],
  ])("%s returns an empty array when the API envelope has no data", async (_name, action) => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

    await expect(action()).resolves.toEqual([]);
  });

  it("getPatientPortalOverview returns null when the API envelope has no data", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

    await expect(getPatientPortalOverview()).resolves.toBeNull();
  });

  it("getMonitoringSnapshot returns null when the API envelope has no data", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

    await expect(getMonitoringSnapshot()).resolves.toBeNull();
  });
});
