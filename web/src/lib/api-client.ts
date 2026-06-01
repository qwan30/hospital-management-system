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

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:8081/api/v1";

export interface ApiRequestOptions {
  authScope?: AuthScope;
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const headers = buildHeaders(init.headers, options.authScope);

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch {
    throw new ApiClientError(
      "Unable to reach the hospital server. Check your connection and try again.",
      0,
      "NETWORK_ERROR",
    );
  }

  const payload = await readJson<ApiEnvelope<T>>(response);

  if (!response.ok) {
    throw new ApiClientError(
      payload.error?.message || payload.message || "Request failed",
      response.status,
      payload.error?.code,
    );
  }

  return payload;
}

function buildHeaders(
  initHeaders: HeadersInit | undefined,
  authScope: AuthScope | undefined,
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

  return headers;
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
