import { request } from "@playwright/test";

import { apiURL, isBackendHealthy } from "./helpers/backend";

/**
 * Fails the run immediately when a backend is required but unreachable.
 *
 * Several specs guard themselves with `test.skip(!(await isBackendHealthy(request)), ...)`. That is
 * the right default for local work — you should be able to run the UI specs without booting Spring
 * Boot. But a skipped test reports `status: "skipped"`, `ok() === true`, and Playwright exits 0, so a
 * CI job with no backend produces a green run that verified none of the authorization behaviour it
 * appears to cover.
 *
 * Opting in with HMS_REQUIRE_BACKEND=true converts that silence into a fast, explicit failure before
 * any browser starts. Unset, this is a no-op and local behaviour is unchanged.
 */
export default async function globalSetup() {
  if (process.env.HMS_REQUIRE_BACKEND !== "true") {
    return;
  }

  const context = await request.newContext();
  try {
    if (!(await isBackendHealthy(context))) {
      throw new Error(
        [
          `HMS_REQUIRE_BACKEND=true but no healthy backend responded at ${apiURL}.`,
          "Backend-gated specs would self-skip and the run would still report success.",
          "Start the backend (./backend/run.ps1) or unset HMS_REQUIRE_BACKEND.",
        ].join("\n"),
      );
    }
  } finally {
    await context.dispose();
  }
}
