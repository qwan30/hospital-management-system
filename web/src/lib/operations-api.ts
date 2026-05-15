import { apiRequest } from "@/lib/api-client";

export interface InventoryItemResponse {
  itemId: string;
  sku: string;
  itemName: string;
  category: string;
  unit: string;
  reorderLevel: number;
  quantityOnHand: number;
  status: string;
  departmentName: string | null;
  lastRestockedAt: string | null;
}

export interface InventoryLotResponse {
  lotId: string;
  itemId: string;
  itemName: string;
  lotCode: string;
  supplierName: string | null;
  quantityReceived: number;
  quantityRemaining: number;
  expiresOn: string | null;
}

export interface InventoryMovementResponse {
  movementId: string;
  itemId: string;
  itemName: string;
  movementType: string;
  quantityDelta: number;
  note: string | null;
  createdAt: string;
}

export interface InventoryAlertResponse {
  alertType: "LOW_STOCK" | "EXPIRING_SOON" | "EXPIRED" | string;
  severity: "WARNING" | "CRITICAL" | string;
  itemId: string;
  itemName: string;
  lotId: string | null;
  lotCode: string | null;
  quantityOnHand: number;
  reorderLevel: number;
  expiresOn: string | null;
  daysUntilExpiry: number | null;
  message: string;
}

export interface InventoryItemCreateRequest {
  sku: string;
  itemName: string;
  category: string;
  unit: string;
  reorderLevel: number;
  quantityOnHand: number;
  departmentId: string | null;
}

export interface InventoryItemUpdateRequest {
  itemName: string | null;
  category: string | null;
  unit: string | null;
  reorderLevel: number | null;
  departmentId: string | null;
}

export interface InventoryLotCreateRequest {
  itemId: string;
  lotCode: string;
  supplierName: string | null;
  quantityReceived: number;
  expiresOn: string | null;
}

export interface InventoryMovementCreateRequest {
  itemId: string;
  movementType: string;
  quantityDelta: number;
  note: string | null;
}

export interface SystemMonitoringSnapshotResponse {
  generatedAt: string;
  uptimeSeconds: number;
  healthy: boolean;
  activeAlerts: number;
  scheduleAlertCount: number;
  inventoryAlertCount: number;
  databaseStatus: string;
  queueStatus: string;
}

export interface AuditLogResponse {
  auditLogId: string;
  actorName: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export type UserRole =
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "ACCOUNTANT"
  | "PATIENT";

export interface AdminUserResponse {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  departmentId: string | null;
  departmentName: string | null;
  specialty: string | null;
  qualification: string | null;
  experienceYears: number | null;
  active: boolean;
}

export interface AdminUserUpsertRequest {
  email: string;
  password?: string | null;
  fullName: string;
  phone: string | null;
  role: UserRole;
  departmentId: string | null;
  specialty: string | null;
  qualification: string | null;
  experienceYears: number | null;
  active: boolean | null;
}

export interface AdminDepartmentResponse {
  departmentId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  phone: string | null;
  active: boolean;
}

export interface AdminDepartmentUpsertRequest {
  name: string;
  description: string | null;
  imageUrl: string | null;
  phone: string | null;
  active: boolean | null;
}

export type RoomStatus = "READY" | "IN_USE" | "BREAK" | "MAINTENANCE";

export interface AdminRoomResponse {
  roomId: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  status: RoomStatus;
  active: boolean;
}

export interface AdminRoomUpsertRequest {
  name: string;
  departmentId: string | null;
  status: RoomStatus;
  active: boolean | null;
}

export interface AdminNewsArticleResponse {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
}

export interface AdminNewsArticleUpsertRequest {
  slug: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  active: boolean | null;
}

export interface AdminContentSectionResponse {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
}

export interface AdminContentSectionUpsertRequest {
  slug: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  active: boolean | null;
}

export interface DoctorScheduleTemplateResponse {
  templateId: string;
  doctorId: string;
  doctorName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  active: boolean;
}

export interface DoctorScheduleTemplateUpsertRequest {
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  active: boolean | null;
}

export interface SpecialClosureResponse {
  closureId: string;
  title: string;
  closureDate: string;
  doctorId: string | null;
  doctorName: string | null;
  roomId: string | null;
  roomName: string | null;
  reason: string | null;
  active: boolean;
}

export interface SpecialClosureUpsertRequest {
  title: string;
  closureDate: string;
  doctorId: string | null;
  roomId: string | null;
  reason: string | null;
  active: boolean | null;
}

export type AdminSlotStatus = "AVAILABLE" | "BOOKED" | "BLOCKED";

export interface AdminSlotResponse {
  id: string;
  doctorId: string;
  doctorName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: AdminSlotStatus;
}

export interface AdminSlotGenerateRequest {
  doctorId: string | null;
  fromDate: string;
  toDate: string;
}

export interface AdminSlotGenerateResult {
  slotsCreated: number;
  slotsSkipped: number;
  summary: string;
}

export type InvoiceStatus = "UNPAID" | "PAID" | "CANCELLED";

export interface InvoiceResponse {
  invoiceId: string;
  appointmentId: string;
  patientId: string;
  patientFullName: string;
  doctorName: string;
  departmentName: string;
  appointmentDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  paymentMethod: string | null;
  paidAt: string | null;
}

export interface InvoiceCreateRequest {
  appointmentId: string;
}

export interface InvoicePaymentRequest {
  paymentMethod: string;
}

export interface ServicePricingResponse {
  pricingId: string;
  departmentId: string | null;
  departmentName: string | null;
  serviceName: string;
  amount: number;
  effectiveDate: string;
}

export interface ServicePricingUpsertRequest {
  departmentId: string | null;
  serviceName: string;
  amount: number;
  effectiveDate: string;
}

export interface RevenueDepartmentResponse {
  departmentName: string;
  totalRevenue: number;
  invoiceCount: number;
}

export interface DailyRevenueReportResponse {
  date: string;
  totalRevenue: number;
  paidInvoiceCount: number;
  departmentBreakdown: RevenueDepartmentResponse[];
}

export interface MonthlyRevenueReportResponse {
  month: string;
  totalRevenue: number;
  paidInvoiceCount: number;
}

export interface PatientPortalOverviewResponse {
  patientFullName: string;
  upcomingAppointments?: number;
  upcomingAppointmentCount?: number;
  unreadThreads?: number;
  unreadMessageCount?: number;
  availableLabResults?: number;
  labResultCount?: number;
  nextAppointment?: {
    appointmentDate: string;
    startTime: string;
    doctorName: string;
    status: string;
  } | null;
}

export interface PatientPortalLabResultResponse {
  labResultId: string;
  appointmentId?: string;
  testName: string;
  status: string;
  resultSummary: string | null;
  doctorComment: string | null;
  attachmentUrl: string | null;
  collectedAt: string;
}

export interface PatientPortalAppointmentResponse {
  appointmentId: string;
  confirmationCode: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  doctorName: string;
  status: string;
}

export interface PatientPortalMessageResponse {
  messageId: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

export interface PatientPortalMessageThreadResponse {
  threadId: string;
  subject: string;
  channel: string;
  unreadCount: number;
  lastMessagePreview: string;
  updatedAt: string;
  messages: PatientPortalMessageResponse[];
}

export interface PatientPortalProfileResponse {
  patientId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  occupation: string | null;
  bloodType: string | null;
  medicalHistory: string | null;
  drugAllergies: string | null;
  insuranceNumber: string | null;
}

export interface PatientPortalProfileUpdateRequest {
  fullName: string;
  email: string;
  phone: string;
  occupation: string | null;
  bloodType: string | null;
  medicalHistory: string | null;
  drugAllergies: string | null;
  insuranceNumber: string | null;
}

export async function listInventoryItems() {
  const response = await apiRequest<InventoryItemResponse[]>(
    "/inventory/items",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function listInventoryLots() {
  const response = await apiRequest<InventoryLotResponse[]>(
    "/inventory/lots",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function listInventoryMovements() {
  const response = await apiRequest<InventoryMovementResponse[]>(
    "/inventory/movements",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function listInventoryAlerts() {
  const response = await apiRequest<InventoryAlertResponse[]>(
    "/inventory/alerts",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createInventoryItem(request: InventoryItemCreateRequest) {
  const response = await apiRequest<InventoryItemResponse>(
    "/inventory/items",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateInventoryItem(
  itemId: string,
  request: InventoryItemUpdateRequest,
) {
  const response = await apiRequest<InventoryItemResponse>(
    `/inventory/items/${itemId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function deleteInventoryItem(itemId: string) {
  const response = await apiRequest<void>(
    `/inventory/items/${itemId}`,
    {
      method: "DELETE",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function createInventoryLot(request: InventoryLotCreateRequest) {
  const response = await apiRequest<InventoryLotResponse>(
    "/inventory/lots",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function recordInventoryMovement(
  request: InventoryMovementCreateRequest,
) {
  const response = await apiRequest<InventoryMovementResponse>(
    "/inventory/movements",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function getMonitoringSnapshot() {
  const response = await apiRequest<SystemMonitoringSnapshotResponse>(
    "/admin/monitoring",
    {},
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAuditLogs(limit = 50) {
  const response = await apiRequest<AuditLogResponse[]>(
    `/admin/audit-logs?limit=${limit}`,
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function listAdminUsers() {
  const response = await apiRequest<AdminUserResponse[]>(
    "/admin/users",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function getAdminUser(userId: string) {
  const response = await apiRequest<AdminUserResponse>(
    `/admin/users/${userId}`,
    {},
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function createAdminUser(request: AdminUserUpsertRequest) {
  const response = await apiRequest<AdminUserResponse>(
    "/admin/users",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminUser(
  userId: string,
  request: AdminUserUpsertRequest,
) {
  const response = await apiRequest<AdminUserResponse>(
    `/admin/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function activateAdminUser(userId: string) {
  const response = await apiRequest<AdminUserResponse>(
    `/admin/users/${userId}/activate`,
    {
      method: "POST",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function deactivateAdminUser(userId: string) {
  const response = await apiRequest<AdminUserResponse>(
    `/admin/users/${userId}/deactivate`,
    {
      method: "POST",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function changeAdminUserRole(userId: string, role: UserRole) {
  const response = await apiRequest<AdminUserResponse>(
    `/admin/users/${userId}/role`,
    {
      method: "PUT",
      body: JSON.stringify({ role }),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAdminDepartments() {
  const response = await apiRequest<AdminDepartmentResponse[]>(
    "/admin/departments",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createAdminDepartment(request: AdminDepartmentUpsertRequest) {
  const response = await apiRequest<AdminDepartmentResponse>(
    "/admin/departments",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminDepartment(
  departmentId: string,
  request: AdminDepartmentUpsertRequest,
) {
  const response = await apiRequest<AdminDepartmentResponse>(
    `/admin/departments/${departmentId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function deactivateAdminDepartment(departmentId: string) {
  const response = await apiRequest<void>(
    `/admin/departments/${departmentId}`,
    {
      method: "DELETE",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAdminRooms() {
  const response = await apiRequest<AdminRoomResponse[]>(
    "/admin/rooms",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createAdminRoom(request: AdminRoomUpsertRequest) {
  const response = await apiRequest<AdminRoomResponse>(
    "/admin/rooms",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminRoom(
  roomId: string,
  request: AdminRoomUpsertRequest,
) {
  const response = await apiRequest<AdminRoomResponse>(
    `/admin/rooms/${roomId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminRoomStatus(roomId: string, status: RoomStatus) {
  const response = await apiRequest<AdminRoomResponse>(
    `/admin/rooms/${roomId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function deactivateAdminRoom(roomId: string) {
  const response = await apiRequest<void>(
    `/admin/rooms/${roomId}`,
    {
      method: "DELETE",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAdminNewsArticles() {
  const response = await apiRequest<AdminNewsArticleResponse[]>(
    "/admin/news",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createAdminNewsArticle(
  request: AdminNewsArticleUpsertRequest,
) {
  const response = await apiRequest<AdminNewsArticleResponse>(
    "/admin/news",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminNewsArticle(
  articleId: string,
  request: AdminNewsArticleUpsertRequest,
) {
  const response = await apiRequest<AdminNewsArticleResponse>(
    `/admin/news/${articleId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAdminContentSections() {
  const response = await apiRequest<AdminContentSectionResponse[]>(
    "/admin/content/sections",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createAdminContentSection(
  request: AdminContentSectionUpsertRequest,
) {
  const response = await apiRequest<AdminContentSectionResponse>(
    "/admin/content/sections",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminContentSection(
  sectionId: string,
  request: AdminContentSectionUpsertRequest,
) {
  const response = await apiRequest<AdminContentSectionResponse>(
    `/admin/content/sections/${sectionId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAdminScheduleTemplates() {
  const response = await apiRequest<DoctorScheduleTemplateResponse[]>(
    "/admin/schedule-templates",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createAdminScheduleTemplate(
  request: DoctorScheduleTemplateUpsertRequest,
) {
  const response = await apiRequest<DoctorScheduleTemplateResponse>(
    "/admin/schedule-templates",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminScheduleTemplate(
  templateId: string,
  request: DoctorScheduleTemplateUpsertRequest,
) {
  const response = await apiRequest<DoctorScheduleTemplateResponse>(
    `/admin/schedule-templates/${templateId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAdminSpecialClosures() {
  const response = await apiRequest<SpecialClosureResponse[]>(
    "/admin/special-closures",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createAdminSpecialClosure(request: SpecialClosureUpsertRequest) {
  const response = await apiRequest<SpecialClosureResponse>(
    "/admin/special-closures",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateAdminSpecialClosure(
  closureId: string,
  request: SpecialClosureUpsertRequest,
) {
  const response = await apiRequest<SpecialClosureResponse>(
    `/admin/special-closures/${closureId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listAdminSlots() {
  const response = await apiRequest<AdminSlotResponse[]>(
    "/admin/slots",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function generateAdminSlots(request: AdminSlotGenerateRequest) {
  const response = await apiRequest<AdminSlotGenerateResult>(
    "/admin/slots/generate",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function blockAdminSlot(slotId: string) {
  const response = await apiRequest<AdminSlotResponse>(
    `/admin/slots/${slotId}/block`,
    {
      method: "PUT",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function deleteAdminSlot(slotId: string) {
  const response = await apiRequest<void>(
    `/admin/slots/${slotId}`,
    {
      method: "DELETE",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listInvoices(status?: InvoiceStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await apiRequest<InvoiceResponse[]>(
    `/invoices${query}`,
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createInvoice(request: InvoiceCreateRequest) {
  const response = await apiRequest<InvoiceResponse>(
    "/invoices",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function recordInvoicePayment(
  invoiceId: string,
  request: InvoicePaymentRequest,
) {
  const response = await apiRequest<InvoiceResponse>(
    `/invoices/${invoiceId}/payments`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function voidInvoice(invoiceId: string) {
  const response = await apiRequest<InvoiceResponse>(
    `/invoices/${invoiceId}/void`,
    {
      method: "POST",
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function listServicePricing() {
  const response = await apiRequest<ServicePricingResponse[]>(
    "/pricing",
    {},
    { authScope: "staff" },
  );
  return response.data ?? [];
}

export async function createServicePricing(request: ServicePricingUpsertRequest) {
  const response = await apiRequest<ServicePricingResponse>(
    "/pricing",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function updateServicePricing(
  pricingId: string,
  request: ServicePricingUpsertRequest,
) {
  const response = await apiRequest<ServicePricingResponse>(
    `/pricing/${pricingId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function getDailyRevenueReport(date: string) {
  const response = await apiRequest<DailyRevenueReportResponse>(
    `/reports/revenue/daily?date=${encodeURIComponent(date)}`,
    {},
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function getMonthlyRevenueReport(month: string) {
  const response = await apiRequest<MonthlyRevenueReportResponse>(
    `/reports/revenue/monthly?month=${encodeURIComponent(month)}`,
    {},
    { authScope: "staff" },
  );
  return response.data ?? null;
}

export async function getPatientPortalOverview() {
  const response = await apiRequest<PatientPortalOverviewResponse>(
    "/patient-portal/overview",
    {},
    { authScope: "patient" },
  );
  return response.data ?? null;
}

export async function listPatientPortalLabResults() {
  const response = await apiRequest<PatientPortalLabResultResponse[]>(
    "/patient-portal/lab-results",
    {},
    { authScope: "patient" },
  );
  return response.data ?? [];
}

export async function listPatientPortalAppointments() {
  const response = await apiRequest<PatientPortalAppointmentResponse[]>(
    "/patient-portal/appointments",
    {},
    { authScope: "patient" },
  );
  return response.data ?? [];
}

export async function listPatientPortalMessages() {
  const response = await apiRequest<PatientPortalMessageThreadResponse[]>(
    "/patient-portal/messages",
    {},
    { authScope: "patient" },
  );
  return response.data ?? [];
}

export async function getPatientPortalProfile() {
  const response = await apiRequest<PatientPortalProfileResponse>(
    "/patient-portal/profile",
    {},
    { authScope: "patient" },
  );
  return response.data ?? null;
}

export async function updatePatientPortalProfile(
  request: PatientPortalProfileUpdateRequest,
) {
  const response = await apiRequest<PatientPortalProfileResponse>(
    "/patient-portal/profile",
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { authScope: "patient" },
  );
  return response.data ?? null;
}
