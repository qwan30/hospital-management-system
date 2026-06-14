import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listInventoryItems,
  listInventoryLots,
  listInventoryMovements,
  listInventoryAlerts,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createInventoryLot,
  recordInventoryMovement,
  dispenseMedication,
  getMonitoringSnapshot,
  listAuditLogs,
  getPatientPortalOverview,
  listPatientPortalLabResults,
  listPatientPortalAppointments,
  listPatientPortalMessages,
  getPatientPortalProfile,
  updatePatientPortalProfile,
  listInvoices,
  createInvoice,
  recordInvoicePayment,
  voidInvoice,
  listServicePricing,
  createServicePricing,
  updateServicePricing,
  getDailyRevenueReport,
  getMonthlyRevenueReport,
  listAdminUsers,
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  activateAdminUser,
  deactivateAdminUser,
  changeAdminUserRole,
  listAdminDepartments,
  createAdminDepartment,
  updateAdminDepartment,
  deactivateAdminDepartment,
  listAdminRooms,
  createAdminRoom,
  updateAdminRoom,
  updateAdminRoomStatus,
  deactivateAdminRoom,
  listAdminNewsArticles,
  createAdminNewsArticle,
  updateAdminNewsArticle,
  listAdminContentSections,
  createAdminContentSection,
  updateAdminContentSection,
  listAdminScheduleTemplates,
  createAdminScheduleTemplate,
  updateAdminScheduleTemplate,
  listAdminSpecialClosures,
  createAdminSpecialClosure,
  updateAdminSpecialClosure,
  listAdminSlots,
  generateAdminSlots,
  blockAdminSlot,
  deleteAdminSlot,
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

  describe("inventory mutations", () => {
    it("creates an inventory item", async () => {
      const request = {
        sku: "MED-001",
        itemName: "Bandage",
        category: "Supplies",
        unit: "box",
        reorderLevel: 10,
        quantityOnHand: 20,
        departmentId: null,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { itemId: "item-1", ...request } });

      const result = await createInventoryItem(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/inventory/items",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("updates an inventory item", async () => {
      const request = {
        itemName: "Bandage Updated",
        category: "Supplies",
        unit: "box",
        reorderLevel: 5,
        departmentId: null,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { itemId: "item-1", ...request } });

      const result = await updateInventoryItem("item-1", request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/inventory/items/item-1",
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("deletes an inventory item", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const result = await deleteInventoryItem("item-1");

      expect(apiRequest).toHaveBeenCalledWith(
        "/inventory/items/item-1",
        {
          method: "DELETE",
        },
        { authScope: "staff" },
      );
      expect(result).toBeNull();
    });

    it("creates an inventory lot", async () => {
      const request = {
        itemId: "item-1",
        lotCode: "LOT-1",
        supplierName: "Supplier",
        quantityReceived: 12,
        expiresOn: "2026-06-01",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { lotId: "lot-1", ...request } });

      const result = await createInventoryLot(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/inventory/lots",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("records an inventory movement", async () => {
      const request = {
        itemId: "item-1",
        movementType: "ADJUSTMENT",
        quantityDelta: -2,
        note: "Damaged",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { movementId: "movement-1", ...request } });

      const result = await recordInventoryMovement(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/inventory/movements",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("dispenses medication against a prescription and lot", async () => {
      const request = {
        itemId: "item-1",
        lotId: "lot-1",
        medicalRecordId: "record-1",
        prescriptionItemName: "Bandage",
        quantity: 1,
        note: "Prescription pickup",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({
        data: { movementId: "movement-1", ...request },
      });

      const result = await dispenseMedication(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/inventory/dispense",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
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

  describe("admin users", () => {
    const request = {
      email: "doctor@example.com",
      password: "password123",
      fullName: "Doctor Example",
      phone: "0900000000",
      role: "DOCTOR" as const,
      departmentId: null,
      specialty: "Cardiology",
      qualification: "MD",
      experienceYears: 8,
      active: true,
    };

    it("lists admin users through the staff auth scope", async () => {
      const users = [{ userId: "user-1", fullName: "Doctor Example" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: users });

      const result = await listAdminUsers();

      expect(apiRequest).toHaveBeenCalledWith("/admin/users", {}, { authScope: "staff" });
      expect(result).toEqual(users);
    });

    it("gets one admin user", async () => {
      const user = { userId: "user-1", fullName: "Doctor Example" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: user });

      const result = await getAdminUser("user-1");

      expect(apiRequest).toHaveBeenCalledWith("/admin/users/user-1", {}, { authScope: "staff" });
      expect(result).toEqual(user);
    });

    it("creates and updates admin users with the backend request shape", async () => {
      vi.mocked(apiRequest)
        .mockResolvedValueOnce({ data: { userId: "user-1", ...request } })
        .mockResolvedValueOnce({ data: { userId: "user-1", ...request, fullName: "Updated Doctor" } });

      await createAdminUser(request);
      await updateAdminUser("user-1", { ...request, fullName: "Updated Doctor", password: null });

      expect(apiRequest).toHaveBeenNthCalledWith(
        1,
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/admin/users/user-1",
        {
          method: "PUT",
          body: JSON.stringify({ ...request, fullName: "Updated Doctor", password: null }),
        },
        { authScope: "staff" },
      );
    });

    it("activates, deactivates, and changes roles by real user ID", async () => {
      vi.mocked(apiRequest)
        .mockResolvedValueOnce({ data: { userId: "user-1", active: true } })
        .mockResolvedValueOnce({ data: { userId: "user-1", active: false } })
        .mockResolvedValueOnce({ data: { userId: "user-1", role: "ADMIN" } });

      await activateAdminUser("user-1");
      await deactivateAdminUser("user-1");
      await changeAdminUserRole("user-1", "ADMIN");

      expect(apiRequest).toHaveBeenNthCalledWith(
        1,
        "/admin/users/user-1/activate",
        { method: "POST" },
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/admin/users/user-1/deactivate",
        { method: "POST" },
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        3,
        "/admin/users/user-1/role",
        {
          method: "PUT",
          body: JSON.stringify({ role: "ADMIN" }),
        },
        { authScope: "staff" },
      );
    });
  });

  describe("admin departments", () => {
    const request = {
      name: "Cardiology",
      description: "Heart care",
      imageUrl: null,
      phone: "0900000000",
      active: true,
    };

    it("lists admin departments through the staff auth scope", async () => {
      const departments = [{ departmentId: "department-1", name: "Cardiology" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: departments });

      const result = await listAdminDepartments();

      expect(apiRequest).toHaveBeenCalledWith("/admin/departments", {}, { authScope: "staff" });
      expect(result).toEqual(departments);
    });

    it("creates and updates admin departments", async () => {
      vi.mocked(apiRequest)
        .mockResolvedValueOnce({ data: { departmentId: "department-1", ...request } })
        .mockResolvedValueOnce({ data: { departmentId: "department-1", ...request, name: "Cardiology Updated" } });

      await createAdminDepartment(request);
      await updateAdminDepartment("department-1", { ...request, name: "Cardiology Updated" });

      expect(apiRequest).toHaveBeenNthCalledWith(
        1,
        "/admin/departments",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/admin/departments/department-1",
        {
          method: "PUT",
          body: JSON.stringify({ ...request, name: "Cardiology Updated" }),
        },
        { authScope: "staff" },
      );
    });

    it("deactivates an admin department by real ID", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: null });

      const result = await deactivateAdminDepartment("department-1");

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/departments/department-1",
        {
          method: "DELETE",
        },
        { authScope: "staff" },
      );
      expect(result).toBeNull();
    });
  });

  describe("admin rooms", () => {
    const request = {
      name: "RM-101",
      departmentId: "department-1",
      status: "READY" as const,
      active: true,
    };

    it("lists admin rooms through the staff auth scope", async () => {
      const rooms = [{ roomId: "room-1", name: "RM-101" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: rooms });

      const result = await listAdminRooms();

      expect(apiRequest).toHaveBeenCalledWith("/admin/rooms", {}, { authScope: "staff" });
      expect(result).toEqual(rooms);
    });

    it("creates and updates admin rooms", async () => {
      vi.mocked(apiRequest)
        .mockResolvedValueOnce({ data: { roomId: "room-1", ...request } })
        .mockResolvedValueOnce({ data: { roomId: "room-1", ...request, name: "RM-102" } });

      await createAdminRoom(request);
      await updateAdminRoom("room-1", { ...request, name: "RM-102" });

      expect(apiRequest).toHaveBeenNthCalledWith(
        1,
        "/admin/rooms",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/admin/rooms/room-1",
        {
          method: "PUT",
          body: JSON.stringify({ ...request, name: "RM-102" }),
        },
        { authScope: "staff" },
      );
    });

    it("updates room status and deactivates rooms by real ID", async () => {
      vi.mocked(apiRequest)
        .mockResolvedValueOnce({ data: { roomId: "room-1", status: "MAINTENANCE" } })
        .mockResolvedValueOnce({ data: null });

      await updateAdminRoomStatus("room-1", "MAINTENANCE");
      const result = await deactivateAdminRoom("room-1");

      expect(apiRequest).toHaveBeenNthCalledWith(
        1,
        "/admin/rooms/room-1/status",
        {
          method: "PUT",
          body: JSON.stringify({ status: "MAINTENANCE" }),
        },
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/admin/rooms/room-1",
        {
          method: "DELETE",
        },
        { authScope: "staff" },
      );
      expect(result).toBeNull();
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

  describe("listInvoices", () => {
    it("returns staff invoices from the API", async () => {
      const mockInvoices = [{ invoiceId: "invoice-1", status: "UNPAID" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockInvoices });

      const result = await listInvoices();

      expect(apiRequest).toHaveBeenCalledWith("/invoices", {}, { authScope: "staff" });
      expect(result).toEqual(mockInvoices);
    });

    it("passes the optional status filter to the API", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [] });

      await listInvoices("PAID");

      expect(apiRequest).toHaveBeenCalledWith("/invoices?status=PAID", {}, { authScope: "staff" });
    });

    it("creates an invoice for a completed appointment", async () => {
      const created = { invoiceId: "invoice-1", appointmentId: "appointment-1" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: created });

      const result = await createInvoice({ appointmentId: "appointment-1" });

      expect(apiRequest).toHaveBeenCalledWith(
        "/invoices",
        {
          method: "POST",
          body: JSON.stringify({ appointmentId: "appointment-1" }),
        },
        { authScope: "staff" },
      );
      expect(result).toEqual(created);
    });

    it("records a payment for an unpaid invoice", async () => {
      const paid = { invoiceId: "invoice-1", status: "PAID" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: paid });

      const result = await recordInvoicePayment("invoice-1", { paymentMethod: "CARD" });

      expect(apiRequest).toHaveBeenCalledWith(
        "/invoices/invoice-1/payments",
        {
          method: "POST",
          body: JSON.stringify({ paymentMethod: "CARD" }),
        },
        { authScope: "staff" },
      );
      expect(result).toEqual(paid);
    });

    it("voids an unpaid invoice", async () => {
      const voided = { invoiceId: "invoice-1", status: "CANCELLED" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: voided });

      const result = await voidInvoice("invoice-1");

      expect(apiRequest).toHaveBeenCalledWith(
        "/invoices/invoice-1/void",
        {
          method: "POST",
        },
        { authScope: "staff" },
      );
      expect(result).toEqual(voided);
    });
  });

  describe("service pricing", () => {
    it("lists service pricing rules from the API", async () => {
      const mockPricing = [{ pricingId: "pricing-1", serviceName: "CONSULTATION" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockPricing });

      const result = await listServicePricing();

      expect(apiRequest).toHaveBeenCalledWith("/pricing", {}, { authScope: "staff" });
      expect(result).toEqual(mockPricing);
    });

    it("creates a service pricing rule", async () => {
      const request = {
        departmentId: null,
        serviceName: "CONSULTATION",
        amount: 120,
        effectiveDate: "2026-05-01",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { pricingId: "pricing-1", ...request } });

      const result = await createServicePricing(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/pricing",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("updates a service pricing rule", async () => {
      const request = {
        departmentId: "department-1",
        serviceName: "FOLLOW_UP",
        amount: 90,
        effectiveDate: "2026-05-02",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { pricingId: "pricing-1", ...request } });

      const result = await updateServicePricing("pricing-1", request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/pricing/pricing-1",
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });
  });

  describe("revenue reports", () => {
    it("gets daily revenue by date", async () => {
      const report = { date: "2026-05-01", totalRevenue: 100 };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: report });

      const result = await getDailyRevenueReport("2026-05-01");

      expect(apiRequest).toHaveBeenCalledWith(
        "/reports/revenue/daily?date=2026-05-01",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual(report);
    });

    it("gets monthly revenue by month", async () => {
      const report = { month: "2026-05", totalRevenue: 200 };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: report });

      const result = await getMonthlyRevenueReport("2026-05");

      expect(apiRequest).toHaveBeenCalledWith(
        "/reports/revenue/monthly?month=2026-05",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual(report);
    });
  });

  describe("admin content", () => {
    it("lists admin news articles from the API", async () => {
      const articles = [{ id: "article-1", title: "Visiting hours" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: articles });

      const result = await listAdminNewsArticles();

      expect(apiRequest).toHaveBeenCalledWith("/admin/news", {}, { authScope: "staff" });
      expect(result).toEqual(articles);
    });

    it("creates an admin news article", async () => {
      const request = {
        slug: "visiting-hours",
        title: "Visiting hours",
        summary: "Updated patient visiting hours",
        content: "Long body",
        imageUrl: null,
        publishedAt: "2026-05-15T00:00:00Z",
        active: true,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { id: "article-1", ...request } });

      const result = await createAdminNewsArticle(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/news",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("updates an admin news article", async () => {
      const request = {
        slug: "visiting-hours",
        title: "Visiting hours updated",
        summary: "Updated patient visiting hours",
        content: null,
        imageUrl: null,
        publishedAt: null,
        active: true,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { id: "article-1", ...request } });

      const result = await updateAdminNewsArticle("article-1", request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/news/article-1",
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("lists public content sections from the API", async () => {
      const sections = [{ id: "section-1", title: "Hero Landing" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: sections });

      const result = await listAdminContentSections();

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/content/sections",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual(sections);
    });

    it("creates a public content section", async () => {
      const request = {
        slug: "hero",
        title: "Hero Landing",
        body: "Welcome",
        imageUrl: null,
        ctaLabel: "Book now",
        ctaHref: "/booking",
        sortOrder: 1,
        active: true,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { id: "section-1", ...request } });

      const result = await createAdminContentSection(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/content/sections",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("updates a public content section", async () => {
      const request = {
        slug: "hero",
        title: "Hero Landing Updated",
        body: null,
        imageUrl: null,
        ctaLabel: null,
        ctaHref: null,
        sortOrder: 2,
        active: true,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { id: "section-1", ...request } });

      const result = await updateAdminContentSection("section-1", request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/content/sections/section-1",
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });
  });

  describe("admin schedule templates", () => {
    it("lists schedule templates from the API", async () => {
      const templates = [{ templateId: "template-1", doctorName: "Dr. Nguyen" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: templates });

      const result = await listAdminScheduleTemplates();

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/schedule-templates",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual(templates);
    });

    it("creates a schedule template", async () => {
      const request = {
        doctorId: "doctor-1",
        weekday: 1,
        startTime: "08:00",
        endTime: "12:00",
        slotDurationMinutes: 30,
        active: true,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { templateId: "template-1", ...request } });

      const result = await createAdminScheduleTemplate(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/schedule-templates",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("updates a schedule template", async () => {
      const request = {
        doctorId: "doctor-1",
        weekday: 2,
        startTime: "09:00",
        endTime: "13:00",
        slotDurationMinutes: 20,
        active: false,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { templateId: "template-1", ...request } });

      const result = await updateAdminScheduleTemplate("template-1", request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/schedule-templates/template-1",
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });
  });

  describe("admin special closures", () => {
    it("lists special closures from the API", async () => {
      const closures = [{ closureId: "closure-1", title: "Holiday" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: closures });

      const result = await listAdminSpecialClosures();

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/special-closures",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual(closures);
    });

    it("creates a special closure", async () => {
      const request = {
        title: "Doctor Leave",
        closureDate: "2026-05-20",
        doctorId: "doctor-1",
        roomId: null,
        reason: "Annual leave",
        active: true,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { closureId: "closure-1", ...request } });

      const result = await createAdminSpecialClosure(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/special-closures",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });

    it("updates a special closure", async () => {
      const request = {
        title: "Room Maintenance",
        closureDate: "2026-05-21",
        doctorId: null,
        roomId: "room-1",
        reason: null,
        active: false,
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { closureId: "closure-1", ...request } });

      const result = await updateAdminSpecialClosure("closure-1", request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/special-closures/closure-1",
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toMatchObject(request);
    });
  });

  describe("admin slots", () => {
    it("lists admin slots from the API", async () => {
      const slots = [{ id: "slot-1", status: "AVAILABLE" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: slots });

      const result = await listAdminSlots();

      expect(apiRequest).toHaveBeenCalledWith("/admin/slots", {}, { authScope: "staff" });
      expect(result).toEqual(slots);
    });

    it("generates admin slots", async () => {
      const request = { doctorId: "doctor-1", fromDate: "2026-05-20", toDate: "2026-05-21" };
      const response = { slotsCreated: 4, slotsSkipped: 1, summary: "Generated" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: response });

      const result = await generateAdminSlots(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/slots/generate",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toEqual(response);
    });

    it("blocks an admin slot", async () => {
      const blocked = { id: "slot-1", status: "BLOCKED" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: blocked });

      const result = await blockAdminSlot("slot-1");

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/slots/slot-1/block",
        {
          method: "PUT",
        },
        { authScope: "staff" },
      );
      expect(result).toEqual(blocked);
    });

    it("deletes an admin slot", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const result = await deleteAdminSlot("slot-1");

      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/slots/slot-1",
        {
          method: "DELETE",
        },
        { authScope: "staff" },
      );
      expect(result).toBeNull();
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

  describe("listPatientPortalAppointments", () => {
    it("returns patient appointments from the API", async () => {
      const mockAppointments = [{ appointmentId: "1", doctorName: "Dr. Lan Tran" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointments });

      const result = await listPatientPortalAppointments();

      expect(apiRequest).toHaveBeenCalledWith(
        "/patient-portal/appointments",
        {},
        { authScope: "patient" },
      );
      expect(result).toEqual(mockAppointments);
    });
  });

  describe("listPatientPortalMessages", () => {
    it("returns patient message threads from the API", async () => {
      const mockThreads = [{ threadId: "thread-1", subject: "Follow up" }];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockThreads });

      const result = await listPatientPortalMessages();

      expect(apiRequest).toHaveBeenCalledWith(
        "/patient-portal/messages",
        {},
        { authScope: "patient" },
      );
      expect(result).toEqual(mockThreads);
    });
  });

  describe("patient portal profile", () => {
    it("gets the current patient profile from the API", async () => {
      const mockProfile = { patientId: "patient-1", fullName: "Linh Tran" };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockProfile });

      const result = await getPatientPortalProfile();

      expect(apiRequest).toHaveBeenCalledWith(
        "/patient-portal/profile",
        {},
        { authScope: "patient" },
      );
      expect(result).toEqual(mockProfile);
    });

    it("updates the current patient profile through the API", async () => {
      const request = {
        fullName: "Linh Tran",
        email: "linh@example.com",
        phone: "0900000000",
        occupation: "Teacher",
        bloodType: "O+",
        medicalHistory: null,
        drugAllergies: "Penicillin",
        insuranceNumber: "INS-100",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: { patientId: "patient-1", ...request } });

      const result = await updatePatientPortalProfile(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/patient-portal/profile",
        {
          method: "PUT",
          body: JSON.stringify(request),
        },
        { authScope: "patient" },
      );
      expect(result).toMatchObject(request);
    });
  });
});
