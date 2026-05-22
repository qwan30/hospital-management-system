import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api-client";
import {
  activateAdminUser,
  blockAdminSlot,
  changeAdminUserRole,
  createAdminContentSection,
  createAdminDepartment,
  createAdminNewsArticle,
  createAdminRoom,
  createAdminScheduleTemplate,
  createAdminSpecialClosure,
  createAdminUser,
  createInventoryItem,
  createInventoryLot,
  createInvoice,
  createServicePricing,
  deactivateAdminDepartment,
  deactivateAdminRoom,
  deactivateAdminUser,
  deleteAdminSlot,
  deleteInventoryItem,
  generateAdminSlots,
  getAdminUser,
  getDailyRevenueReport,
  getMonthlyRevenueReport,
  getMonitoringSnapshot,
  getPatientPortalOverview,
  getPatientPortalProfile,
  listAuditLogs,
  listAdminContentSections,
  listAdminDepartments,
  listAdminNewsArticles,
  listAdminRooms,
  listAdminScheduleTemplates,
  listAdminSlots,
  listAdminSpecialClosures,
  listAdminUsers,
  listInvoices,
  listInventoryAlerts,
  listInventoryItems,
  listInventoryLots,
  listInventoryMovements,
  listPatientPortalAppointments,
  listPatientPortalLabResults,
  listPatientPortalMessages,
  listServicePricing,
  recordInventoryMovement,
  recordInvoicePayment,
  updateAdminContentSection,
  updateAdminDepartment,
  updateAdminNewsArticle,
  updateAdminRoom,
  updateAdminRoomStatus,
  updateAdminScheduleTemplate,
  updateAdminSpecialClosure,
  updateAdminUser,
  updateInventoryItem,
  updatePatientPortalProfile,
  updateServicePricing,
  voidInvoice,
  type UserRole,
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
    ["listAdminUsers", listAdminUsers],
    ["listAdminDepartments", listAdminDepartments],
    ["listAdminRooms", listAdminRooms],
    ["listAdminNewsArticles", listAdminNewsArticles],
    ["listAdminContentSections", listAdminContentSections],
    ["listAdminScheduleTemplates", listAdminScheduleTemplates],
    ["listAdminSpecialClosures", listAdminSpecialClosures],
    ["listAdminSlots", listAdminSlots],
    ["listInvoices", listInvoices],
    ["listServicePricing", listServicePricing],
    ["listPatientPortalLabResults", listPatientPortalLabResults],
    ["listPatientPortalAppointments", listPatientPortalAppointments],
    ["listPatientPortalMessages", listPatientPortalMessages],
  ])("%s returns an empty array when the API envelope has no data", async (_name, action) => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

    await expect(action()).resolves.toEqual([]);
  });

  it.each([
    ["createInventoryItem", () => createInventoryItem({
      sku: "MED-001",
      itemName: "Bandage",
      category: "Supplies",
      unit: "box",
      reorderLevel: 1,
      quantityOnHand: 0,
      departmentId: null,
    })],
    ["updateInventoryItem", () => updateInventoryItem("item-1", {
      itemName: "Bandage",
      category: "Supplies",
      unit: "box",
      reorderLevel: 1,
      departmentId: null,
    })],
    ["deleteInventoryItem", () => deleteInventoryItem("item-1")],
    ["createInventoryLot", () => createInventoryLot({
      itemId: "item-1",
      lotCode: "LOT-1",
      supplierName: null,
      quantityReceived: 5,
      expiresOn: null,
    })],
    ["recordInventoryMovement", () => recordInventoryMovement({
      itemId: "item-1",
      movementType: "ADJUSTMENT",
      quantityDelta: -1,
      note: null,
    })],
    ["getAdminUser", () => getAdminUser("user-1")],
    ["createAdminUser", () => createAdminUser(adminUserRequest())],
    ["updateAdminUser", () => updateAdminUser("user-1", adminUserRequest())],
    ["activateAdminUser", () => activateAdminUser("user-1")],
    ["deactivateAdminUser", () => deactivateAdminUser("user-1")],
    ["changeAdminUserRole", () => changeAdminUserRole("user-1", "DOCTOR")],
    ["createAdminDepartment", () => createAdminDepartment(adminDepartmentRequest())],
    ["updateAdminDepartment", () => updateAdminDepartment("department-1", adminDepartmentRequest())],
    ["deactivateAdminDepartment", () => deactivateAdminDepartment("department-1")],
    ["createAdminRoom", () => createAdminRoom(adminRoomRequest())],
    ["updateAdminRoom", () => updateAdminRoom("room-1", adminRoomRequest())],
    ["updateAdminRoomStatus", () => updateAdminRoomStatus("room-1", "MAINTENANCE")],
    ["deactivateAdminRoom", () => deactivateAdminRoom("room-1")],
    ["createAdminNewsArticle", () => createAdminNewsArticle(adminNewsRequest())],
    ["updateAdminNewsArticle", () => updateAdminNewsArticle("article-1", adminNewsRequest())],
    ["createAdminContentSection", () => createAdminContentSection(adminContentRequest())],
    ["updateAdminContentSection", () => updateAdminContentSection("section-1", adminContentRequest())],
    ["createAdminScheduleTemplate", () => createAdminScheduleTemplate(adminScheduleTemplateRequest())],
    ["updateAdminScheduleTemplate", () => updateAdminScheduleTemplate("template-1", adminScheduleTemplateRequest())],
    ["createAdminSpecialClosure", () => createAdminSpecialClosure(adminSpecialClosureRequest())],
    ["updateAdminSpecialClosure", () => updateAdminSpecialClosure("closure-1", adminSpecialClosureRequest())],
    ["generateAdminSlots", () => generateAdminSlots({
      doctorId: null,
      fromDate: "2026-05-22",
      toDate: "2026-05-23",
    })],
    ["blockAdminSlot", () => blockAdminSlot("slot-1")],
    ["deleteAdminSlot", () => deleteAdminSlot("slot-1")],
    ["createInvoice", () => createInvoice({ appointmentId: "appointment-1" })],
    ["recordInvoicePayment", () => recordInvoicePayment("invoice-1", { paymentMethod: "CARD" })],
    ["voidInvoice", () => voidInvoice("invoice-1")],
    ["createServicePricing", () => createServicePricing({
      departmentId: null,
      serviceName: "Consultation",
      amount: 100,
      effectiveDate: "2026-05-22",
    })],
    ["updateServicePricing", () => updateServicePricing("pricing-1", {
      departmentId: null,
      serviceName: "Consultation",
      amount: 100,
      effectiveDate: "2026-05-22",
    })],
    ["getDailyRevenueReport", () => getDailyRevenueReport("2026-05-22")],
    ["getMonthlyRevenueReport", () => getMonthlyRevenueReport("2026-05")],
    ["getPatientPortalProfile", getPatientPortalProfile],
    ["updatePatientPortalProfile", () => updatePatientPortalProfile({
      fullName: "Synthetic Patient",
      email: "patient@example.com",
      phone: "0900000000",
      occupation: null,
      bloodType: null,
      medicalHistory: null,
      drugAllergies: null,
      insuranceNumber: null,
    })],
  ] satisfies Array<[string, () => Promise<unknown>]>)(
    "%s returns null when the API envelope has no data",
    async (_name, action) => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(action()).resolves.toBeNull();
    },
  );

  it.each([
    ["getPatientPortalOverview", getPatientPortalOverview],
    ["getMonitoringSnapshot", getMonitoringSnapshot],
  ])("%s returns null when the API envelope has no data", async (_name, action) => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

    await expect(action()).resolves.toBeNull();
  });
});

function adminUserRequest() {
  return {
    email: "doctor@example.com",
    password: null,
    fullName: "Doctor Example",
    phone: null,
    role: "DOCTOR" as UserRole,
    departmentId: null,
    specialty: null,
    qualification: null,
    experienceYears: null,
    active: true,
  };
}

function adminDepartmentRequest() {
  return {
    name: "Cardiology",
    description: null,
    imageUrl: null,
    phone: null,
    active: true,
  };
}

function adminRoomRequest() {
  return {
    name: "Room 101",
    departmentId: null,
    status: "READY" as const,
    active: true,
  };
}

function adminNewsRequest() {
  return {
    slug: "release-note",
    title: "Release note",
    summary: "Synthetic update",
    content: null,
    imageUrl: null,
    publishedAt: null,
    active: true,
  };
}

function adminContentRequest() {
  return {
    slug: "hero",
    title: "Hero",
    body: null,
    imageUrl: null,
    ctaLabel: null,
    ctaHref: null,
    sortOrder: 1,
    active: true,
  };
}

function adminScheduleTemplateRequest() {
  return {
    doctorId: "doctor-1",
    weekday: 1,
    startTime: "08:00",
    endTime: "12:00",
    slotDurationMinutes: 30,
    active: true,
  };
}

function adminSpecialClosureRequest() {
  return {
    title: "Maintenance",
    closureDate: "2026-05-22",
    doctorId: null,
    roomId: null,
    reason: null,
    active: true,
  };
}
