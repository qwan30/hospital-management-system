export interface ApiEnvelope<T> {
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

const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

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

export function persistSession(scope: "staff" | "patient", token?: TokenPair) {
  if (!token?.accessToken || typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(`hms_${scope}_access_token`, token.accessToken);
  sessionStorage.setItem(
    `hms_${scope}_access_token_expires_in`,
    String(token.expiresInSeconds),
  );
}

export function clearSessions() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem("hms_staff_access_token");
  sessionStorage.removeItem("hms_staff_access_token_expires_in");
  sessionStorage.removeItem("hms_patient_access_token");
  sessionStorage.removeItem("hms_patient_access_token_expires_in");
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
