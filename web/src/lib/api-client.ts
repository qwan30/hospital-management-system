export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string | null;
  expiresInSeconds: number;
}

export interface StaffLoginResponse {
  userId: string;
  fullName: string;
  role: string;
  tokens: TokenPair;
}

export type PatientLoginResponse = StaffLoginResponse;
type AuthScope = "staff" | "patient";

export interface ApiRequestMetric {
  path: string;
  method: string;
  status: number;
  ok: boolean;
  requestId: string;
  durationMs: number;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly requestId?: string,
    readonly durationMs?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:8081/api/v1";
const REQUEST_ID_HEADER = "X-Request-Id";
const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;

export interface ApiRequestOptions {
  authScope?: AuthScope;
  requestId?: string;
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const headers = buildHeaders(init.headers, options.authScope, options.requestId);
  const requestId = headers.get(REQUEST_ID_HEADER) ?? createRequestId();
  headers.set(REQUEST_ID_HEADER, requestId);
  const startedAt = nowMs();
  const method = (init.method ?? "GET").toUpperCase();

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch {
    const durationMs = elapsedMs(startedAt);
    recordApiRequestMetric({
      path: sanitizeMetricPath(path),
      method,
      status: 0,
      ok: false,
      requestId,
      durationMs,
    });
    throw new ApiClientError(
      "Unable to reach the hospital server. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
      requestId,
      durationMs,
    );
  }

  const durationMs = elapsedMs(startedAt);
  const responseRequestId = response.headers?.get(REQUEST_ID_HEADER) || requestId;
  const payload = await readJson<ApiEnvelope<T>>(response);
  recordApiRequestMetric({
    path: sanitizeMetricPath(path),
    method,
    status: response.status,
    ok: response.ok,
    requestId: responseRequestId,
    durationMs,
  });

  if (!response.ok) {
    throw new ApiClientError(
      payload.error?.message || payload.message || "Request failed",
      response.status,
      payload.error?.code,
      responseRequestId,
      durationMs,
    );
  }

  return payload;
}

function buildHeaders(
  initHeaders: HeadersInit | undefined,
  authScope: AuthScope | undefined,
  requestId: string | undefined,
) {
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  new Headers(initHeaders).forEach((value, key) => {
    headers.set(key, value);
  });

  const token = getStoredAccessToken(authScope);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (requestId && SAFE_REQUEST_ID.test(requestId)) {
    headers.set(REQUEST_ID_HEADER, requestId);
  }

  return headers;
}

export function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `hms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowMs() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function elapsedMs(startedAt: number) {
  return Math.max(0, Math.round((nowMs() - startedAt) * 100) / 100);
}

function sanitizeMetricPath(path: string) {
  return path
    .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, "{id}")
    .replace(/\d{6,}/g, "{id}")
    .split("?")[0];
}

function recordApiRequestMetric(metric: ApiRequestMetric) {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }

  window.dispatchEvent(new CustomEvent("hms:api-request", { detail: metric }));
}

function getStoredAccessToken(authScope: AuthScope | undefined) {
  if (!authScope || typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.sessionStorage.getItem(`hms_${authScope}_access_token`) || undefined;
  } catch {
    return undefined;
  }
}

export function getStoredRole(scope: AuthScope) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(`hms_${scope}_role`);
  } catch {
    return null;
  }
}

export function persistSession(scope: AuthScope, token?: TokenPair, role?: string) {
  if (!token?.accessToken || typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(`hms_${scope}_access_token`, token.accessToken);
  sessionStorage.setItem(
    `hms_${scope}_access_token_expires_in`,
    String(token.expiresInSeconds),
  );
  if (role) {
    sessionStorage.setItem(`hms_${scope}_role`, role);
  }
}

export function clearSessions() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem("hms_staff_access_token");
  sessionStorage.removeItem("hms_staff_access_token_expires_in");
  sessionStorage.removeItem("hms_staff_role");
  sessionStorage.removeItem("hms_patient_access_token");
  sessionStorage.removeItem("hms_patient_access_token_expires_in");
  sessionStorage.removeItem("hms_patient_role");
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
