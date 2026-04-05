type ApiEnvelopeError = {
  readonly code?: string;
  readonly message?: string;
};

export type ApiEnvelope<T> = {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
  readonly error?: ApiEnvelopeError | null;
  readonly pagination?: unknown;
  readonly timestamp?: string;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export function buildApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export async function parseApiEnvelope<T>(response: Response): Promise<ApiEnvelope<T> | null> {
  const raw = await response.text();
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as ApiEnvelope<T>;
}

export function toApiClientError<T>(
    response: Response,
    envelope: ApiEnvelope<T> | null,
    fallbackMessage: string
) {
  const message = envelope?.error?.message ?? envelope?.message ?? fallbackMessage;
  return new ApiClientError(response.status, message, envelope?.error?.code);
}

