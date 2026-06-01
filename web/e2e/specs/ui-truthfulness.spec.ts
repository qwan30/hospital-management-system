import fs from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  exhaustiveRouteContracts,
  seedRouteSession,
  type ExhaustiveRouteContract,
} from "../helpers/exhaustive-route-contracts";

type ControlClassification =
  | "working"
  | "disabled honestly"
  | "needs review"
  | "bug";

interface ControlManifestEntry {
  route: string;
  area: string;
  label: string;
  controlType: string;
  accessibleName: string;
  enabled: boolean;
  href: string | null;
  title: string;
  classification: ControlClassification;
  reason: string;
}

test.describe("@ui UI truthfulness and actionable-control inventory", () => {
  test("priority unsupported actions are disabled or routed to real screens", async ({ page }) => {
    await installTruthfulnessApiMocks(page);

    await page.goto("/news", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /read unavailable/i }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: /archive unavailable/i })).toBeDisabled();
    await expect(page.locator("a[href='#']")).toHaveCount(0);

    await seedRouteSession(page, "ADMIN");
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: /live monitoring/i })).toHaveAttribute("href", "/admin/monitoring");
    await expect(page.getByRole("link", { name: /inventory audit/i })).toHaveAttribute("href", "/admin/inventory");
    await expect(page.getByRole("link", { name: /audit logs/i }).first()).toHaveAttribute("href", "/admin/audit-logs");
    await expect(page.getByRole("button", { name: /system settings/i })).toBeDisabled();

    await page.goto("/admin/support", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("note")).toContainText(/reference-only/i);
    await expect(page.getByRole("button", { name: /export unavailable/i })).toBeDisabled();
    await expect(page.getByRole("button", { name: /view unavailable/i }).first()).toBeDisabled();

    await page.goto("/admin/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /delete pricing unavailable/i }).first()).toBeDisabled();

    await seedRouteSession(page, "NURSE");
    await page.goto("/staff/support", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("note")).toContainText(/read-only/i);
    await expect(page.getByRole("button", { name: /request submission unavailable/i })).toBeDisabled();
  });

  test("writes an actionable-control manifest for all route contracts", async ({ browser }) => {
    test.setTimeout(180_000);

    const entries: ControlManifestEntry[] = [];

    for (const route of exhaustiveRouteContracts) {
      const context = await browser.newContext({
        baseURL: process.env.HMS_WEB_URL ?? "http://localhost:3000",
      });
      const page = await context.newPage();
      await seedRouteSession(page, route.role);
      await installTruthfulnessApiMocks(page);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.locator("body").waitFor({ state: "visible", timeout: 10_000 });
      await page.waitForLoadState("networkidle", { timeout: 2_000 }).catch(() => undefined);

      entries.push(...(await collectControls(page, route)));
      await context.close();
    }

    await writeManifest(entries);
    expect(entries.length).toBeGreaterThan(100);
    expect(
      entries.filter((entry) => entry.classification === "bug"),
      "enabled fake or hash-link controls",
    ).toEqual([]);
  });
});

async function installTruthfulnessApiMocks(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;

    if (pathname.endsWith("/api/v1/pricing")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              pricingId: "pricing-1",
              departmentId: "department-1",
              departmentName: "Cardiology",
              serviceName: "CONSULTATION",
              amount: 50,
              effectiveDate: "2026-06-01",
            },
          ],
        }),
      });
      return;
    }

    if (pathname.endsWith("/api/v1/admin/departments")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              departmentId: "department-1",
              name: "Cardiology",
              description: "Heart care",
              imageUrl: null,
              phone: "0900000000",
              active: true,
            },
          ],
        }),
      });
      return;
    }

    if (pathname.endsWith("/api/v1/admin/monitoring")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            generatedAt: "2026-06-01T08:00:00Z",
            uptimeSeconds: 3600,
            healthy: true,
            activeAlerts: 0,
            scheduleAlertCount: 0,
            inventoryAlertCount: 0,
            databaseStatus: "UP",
            queueStatus: "UP",
          },
        }),
      });
      return;
    }

    if (pathname.endsWith("/api/v1/inventory/alerts")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [],
        }),
      });
      return;
    }

    if (pathname.endsWith("/api/v1/admin/audit-logs")) {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              auditLogId: "audit-1",
              actorName: "System Admin",
              actorRole: "ADMIN",
              action: "QUEUE_CALL_PATIENT",
              entityType: "APPOINTMENT",
              entityId: "appointment-1",
              metadata: { room: "Consult 2" },
              createdAt: "2026-06-01T08:00:00Z",
            },
          ],
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: [] }),
    });
  });
}

async function collectControls(page: Page, route: ExhaustiveRouteContract) {
  return page.evaluate(
    ({ pathName, area, routeLabel }) => {
      const controls = Array.from(
        document.querySelectorAll(
          "button, a[href], [role='button'], input[type='submit'], input[type='checkbox'], input[type='radio'], select, input[type='search'], input[type='text'], input[type='date'], textarea",
        ),
      );

      return controls
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
        })
        .map((element) => {
          const controlType =
            element.getAttribute("role") ||
            element.getAttribute("type") ||
            element.tagName.toLowerCase();
          const title = element.getAttribute("title") ?? "";
          const accessibleName = [
            element.getAttribute("aria-label"),
            element.textContent?.replace(/\s+/g, " ").trim(),
            element.getAttribute("placeholder"),
            title,
          ].find((value) => value && value.trim().length > 0) ?? controlType;
          const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") : null;
          const enabled =
            !(element instanceof HTMLButtonElement && element.disabled) &&
            !(element instanceof HTMLInputElement && element.disabled) &&
            !(element instanceof HTMLSelectElement && element.disabled) &&
            !(element instanceof HTMLTextAreaElement && element.disabled) &&
            element.getAttribute("aria-disabled") !== "true";
          const lower = `${accessibleName} ${title}`.toLowerCase();
          let classification: ControlClassification = enabled ? "needs review" : "disabled honestly";
          let reason = enabled ? "visible enabled control requires flow-specific click validation" : "disabled control is visible to the user";

          if (href === "#") {
            classification = "bug";
            reason = "enabled hash link has no meaningful route";
          } else if (enabled && /unavailable|unsupported|not exposed|read-only/.test(lower)) {
            classification = "bug";
            reason = "unsupported action is enabled";
          } else if (enabled && element instanceof HTMLAnchorElement && href && href !== "#") {
            classification = "working";
            reason = "link routes to a concrete target";
          }

          return {
            route: pathName,
            area,
            label: routeLabel,
            controlType,
            accessibleName,
            enabled,
            href,
            title,
            classification,
            reason,
          };
        });
    },
    { pathName: route.path, area: route.area, routeLabel: route.label },
  );
}

async function writeManifest(entries: ControlManifestEntry[]) {
  const outputDir = path.resolve(process.cwd(), "test-results", "actionable-control-manifest");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), totalControls: entries.length, entries }, null, 2),
  );

  const summary = summarize(entries);
  await fs.writeFile(
    path.join(outputDir, "summary.md"),
    [
      "# HMS Actionable-Control Manifest",
      "",
      `Total controls: ${entries.length}`,
      `Working links: ${summary.working}`,
      `Disabled honestly: ${summary.disabled}`,
      `Needs click review: ${summary.needsReview}`,
      `Bugs: ${summary.bugs}`,
      "",
      "| Route | Area | Control | Enabled | Classification | Reason |",
      "| - | - | - | - | - | - |",
      ...entries.map((entry) =>
        [
          codeCell(entry.route),
          entry.area,
          escapeCell(entry.accessibleName),
          entry.enabled ? "yes" : "no",
          entry.classification,
          escapeCell(entry.reason),
        ].join(" | "),
      ).map((row) => `| ${row} |`),
      "",
    ].join("\n"),
  );
}

function summarize(entries: ControlManifestEntry[]) {
  return {
    working: entries.filter((entry) => entry.classification === "working").length,
    disabled: entries.filter((entry) => entry.classification === "disabled honestly").length,
    needsReview: entries.filter((entry) => entry.classification === "needs review").length,
    bugs: entries.filter((entry) => entry.classification === "bug").length,
  };
}

function codeCell(value: string) {
  return `\`${escapeCell(value)}\``;
}

function escapeCell(value: string) {
  return value.replace(/\|/g, "\\|");
}
