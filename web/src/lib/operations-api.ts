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
