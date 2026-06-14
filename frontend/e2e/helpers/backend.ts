import type { APIRequestContext } from "@playwright/test";

export const apiURL =
  process.env.HMS_API_URL ??
  process.env.API_BASE_URL_SERVER ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8081/api/v1";

export async function isBackendHealthy(request: APIRequestContext) {
  const healthURL = apiURL.replace(/\/api\/v1\/?$/, "/actuator/health");

  try {
    const response = await request.get(healthURL, { timeout: 5_000 });
    return response.ok();
  } catch {
    return false;
  }
}
