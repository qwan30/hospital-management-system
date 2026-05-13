import type { APIRequestContext } from "@playwright/test";

export const apiURL = process.env.HMS_API_URL ?? "http://localhost:8080/api/v1";

export async function isBackendHealthy(request: APIRequestContext) {
  const healthURL = apiURL.replace(/\/api\/v1\/?$/, "/actuator/health");

  try {
    const response = await request.get(healthURL, { timeout: 5_000 });
    return response.ok();
  } catch {
    return false;
  }
}
