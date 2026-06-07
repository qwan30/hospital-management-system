export type ClientEventType =
  | "browser_error"
  | "unhandled_rejection"
  | "web_vital"
  | "api_request";

export interface ClientEventPayload {
  eventType: ClientEventType;
  requestId: string;
  path: string;
  message?: string;
  metricName?: string;
  metricValue?: number;
  durationMs?: number;
  status?: number;
}

const EVENT_TYPES = new Set<ClientEventType>([
  "browser_error",
  "unhandled_rejection",
  "web_vital",
  "api_request",
]);
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;
const MAX_TEXT_LENGTH = 240;

export function sanitizeClientEvent(input: unknown): ClientEventPayload | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const event = input as Record<string, unknown>;
  const eventType = normalizeEventType(event.eventType);
  const requestId = safeRequestId(event.requestId);
  const path = safePath(event.path);

  if (!eventType || !requestId || !path) {
    return null;
  }

  return {
    eventType,
    requestId,
    path,
    message: safeText(event.message),
    metricName: safeMetricName(event.metricName),
    metricValue: safeFiniteNumber(event.metricValue),
    durationMs: safeFiniteNumber(event.durationMs),
    status: safeStatus(event.status),
  };
}

export function redactSensitiveText(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/\b(?:\+?84|0)\d{8,10}\b/g, "[redacted-phone]")
    .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, "{id}")
    .replace(/\b(?:access|refresh)?token[=:][^\s&]+/gi, "token=[redacted]")
    .replace(/\d{6,}/g, "{id}");
}

function normalizeEventType(value: unknown): ClientEventType | null {
  return typeof value === "string" && EVENT_TYPES.has(value as ClientEventType)
    ? value as ClientEventType
    : null;
}

function safeRequestId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return SAFE_REQUEST_ID.test(trimmed) ? trimmed : null;
}

function safePath(value: unknown) {
  if (typeof value !== "string") {
    return "/";
  }
  const path = redactSensitiveText(value.trim().split("?")[0] || "/");
  return path.startsWith("/") ? path.slice(0, MAX_TEXT_LENGTH) : "/";
}

function safeText(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }
  return redactSensitiveText(value.trim()).slice(0, MAX_TEXT_LENGTH);
}

function safeMetricName(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const metricName = value.trim();
  return /^[A-Za-z0-9_.:-]{1,80}$/.test(metricName) ? metricName : undefined;
}

function safeFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeStatus(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return undefined;
  }
  return value >= 0 && value <= 599 ? value : undefined;
}
