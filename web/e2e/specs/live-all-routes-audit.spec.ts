import fs from "node:fs/promises";
import path from "node:path";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { apiURL, isBackendHealthy } from "../helpers/backend";
import {
  patientAccessToken,
  resolveLiveSmokeRoutes,
  staffAccessToken,
} from "../helpers/live-routes";
import { releasePatientPersona, staffPersonas } from "../helpers/personas";
import type { RouteCase } from "../helpers/routes";

const expectsReleaseSeed = process.env.HMS_EXPECT_RELEASE_DEMO_SEED === "true";
const desktopViewport = { width: 1920, height: 1080 };
const mobileViewport = { width: 390, height: 844 };
const rawBackendErrorPattern =
  /Invalid request parameter|Department could not be loaded|Lab result could not be loaded/i;

type StaffRole =
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "ACCOUNTANT";

interface AuthTokens {
  staff: Record<StaffRole, string>;
  patient: string;
}

interface AuditEntry {
  index: number;
  label: string;
  path: string;
  statusCode: number | null;
  finalUrl: string;
  result: "Pass" | "Blocker";
  visiblePurpose: string;
  issues: string[];
  screenshot: string;
}

interface MobileEntry extends AuditEntry {
  navigationOpened: boolean;
}

test.describe.configure({ mode: "serial" });

test.describe("@release @live-audit all-route live UI audit", () => {
  test.beforeEach(async ({ request }) => {
    test.skip(!expectsReleaseSeed, "Set HMS_EXPECT_RELEASE_DEMO_SEED=true for live route audit");
    test.skip(!(await isBackendHealthy(request)), `Backend is not healthy at ${apiURL}`);
  });

  test("captures 70 resolved desktop routes at 1920x1080", async ({
    browser,
    request,
  }, testInfo) => {
    test.setTimeout(600_000);

    const routes = await resolveLiveSmokeRoutes(request);
    expect(routes, "all smoke routes should be present").toHaveLength(70);

    const tokens = await buildAuthTokens(request);
    const outputRoot = liveAuditOutputRoot();
    const screenshotsDir = path.join(outputRoot, "screenshots");
    await fs.mkdir(screenshotsDir, { recursive: true });

    const entries: AuditEntry[] = [];

    for (const [index, route] of routes.entries()) {
      const context = await browser.newContext({
        baseURL: webURL(),
        viewport: desktopViewport,
      });
      await context.addInitScript(seedSessionScript, authForRoute(route.path, tokens));
      const page = await context.newPage();
      const problems = collectRuntimeProblems(page);
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 3_000 }).catch(() => undefined);
      await page.locator("main").first().waitFor({ state: "visible", timeout: 10_000 }).catch(
        () => undefined,
      );

      const screenshotPath = path.join(
        screenshotsDir,
        `${String(index + 1).padStart(2, "0")}-${slugify(route.label)}.png`,
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const bodyText = await page.locator("body").innerText({ timeout: 5_000 }).catch(() => "");
      const metrics = await collectLayoutMetrics(page);
      const issues = routeIssues({
        responseStatus: response?.status() ?? null,
        bodyText,
        runtimeIssues: problems.issues(),
        metrics,
        moduleNavigationCount: await desktopModuleNavigationCount(page, route.path),
      });

      entries.push({
        index: index + 1,
        label: route.label,
        path: route.path,
        statusCode: response?.status() ?? null,
        finalUrl: page.url(),
        result: issues.length > 0 ? "Blocker" : "Pass",
        visiblePurpose: summarizeVisibleText(bodyText),
        issues,
        screenshot: toPosix(path.relative(outputRoot, screenshotPath)),
      });

      await context.close();
    }

    await writeDesktopReport(outputRoot, entries, testInfo.project.name);
    const blockers = entries.filter((entry) => entry.result === "Blocker");
    expect(blockers, JSON.stringify(blockers, null, 2)).toEqual([]);
  });

  test("captures requested mobile navigation spot checks at 390x844", async ({
    browser,
    request,
  }, testInfo) => {
    test.setTimeout(180_000);

    const routes = await resolveLiveSmokeRoutes(request);
    const tokens = await buildAuthTokens(request);
    const outputRoot = liveAuditOutputRoot();
    const screenshotsDir = path.join(outputRoot, "mobile-screenshots");
    await fs.mkdir(screenshotsDir, { recursive: true });

    const mobileRoutes = mobileSpotRoutes(routes);
    const entries: MobileEntry[] = [];

    for (const [index, route] of mobileRoutes.entries()) {
      const context = await browser.newContext({
        baseURL: webURL(),
        viewport: mobileViewport,
      });
      await context.addInitScript(seedSessionScript, authForRoute(route.path, tokens));
      const page = await context.newPage();
      const problems = collectRuntimeProblems(page);
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 3_000 }).catch(() => undefined);
      await page.locator("main").first().waitFor({ state: "visible", timeout: 10_000 }).catch(
        () => undefined,
      );

      const navigationOpened = await openMobileNavigation(page, route.path);
      const mobileTargetIssues = navigationOpened
        ? await collectMobileDrawerTargetIssues(page)
        : [];
      const screenshotPath = path.join(
        screenshotsDir,
        `${String(index + 1).padStart(2, "0")}-${slugify(route.label)}.png`,
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const bodyText = await page.locator("body").innerText({ timeout: 5_000 }).catch(() => "");
      const metrics = await collectLayoutMetrics(page);
      const issues = routeIssues({
        responseStatus: response?.status() ?? null,
        bodyText,
        runtimeIssues: problems.issues(),
        metrics,
        moduleNavigationCount: 0,
      });
      issues.push(...mobileTargetIssues);
      if (!navigationOpened) {
        issues.push("mobile navigation did not open");
      }

      entries.push({
        index: index + 1,
        label: route.label,
        path: route.path,
        statusCode: response?.status() ?? null,
        finalUrl: page.url(),
        result: issues.length > 0 ? "Blocker" : "Pass",
        visiblePurpose: summarizeVisibleText(bodyText),
        issues,
        screenshot: toPosix(path.relative(outputRoot, screenshotPath)),
        navigationOpened,
      });

      await context.close();
    }

    await writeMobileReport(outputRoot, entries, testInfo.project.name);
    const blockers = entries.filter((entry) => entry.result === "Blocker");
    expect(blockers, JSON.stringify(blockers, null, 2)).toEqual([]);
  });
});

async function buildAuthTokens(request: APIRequestContext): Promise<AuthTokens> {
  const staffEntries = await Promise.all(
    (Object.keys(staffPersonas) as Array<keyof typeof staffPersonas>).map(async (key) => {
      const persona = staffPersonas[key];
      return [
        key.toUpperCase(),
        await staffAccessToken(request, persona.email, persona.password),
      ] as const;
    }),
  );

  return {
    staff: Object.fromEntries(staffEntries) as AuthTokens["staff"],
    patient: await patientAccessToken(
      request,
      releasePatientPersona.email,
      releasePatientPersona.password,
    ),
  };
}

function authForRoute(pathname: string, tokens: AuthTokens) {
  if (pathname.startsWith("/portal/") && !pathname.startsWith("/portal/login") && !pathname.startsWith("/portal/claim")) {
    return { scope: "patient" as const, token: tokens.patient };
  }

  if (pathname.startsWith("/admin/")) {
    return { scope: "staff" as const, token: tokens.staff.ADMIN, role: "ADMIN" as StaffRole };
  }

  if (pathname.startsWith("/staff/") && pathname !== "/staff/login") {
    const role = staffRoleForRoute(pathname);
    return { scope: "staff" as const, token: tokens.staff[role], role };
  }

  return { scope: "public" as const };
}

function staffRoleForRoute(pathname: string): StaffRole {
  if (pathname.startsWith("/staff/schedule")) {
    return "DOCTOR";
  }
  if (
    pathname.startsWith("/staff/queue") ||
    pathname.startsWith("/staff/nurse-intake") ||
    pathname.startsWith("/staff/vital-signs")
  ) {
    return "NURSE";
  }
  if (pathname.startsWith("/staff/booking")) {
    return "RECEPTIONIST";
  }
  if (pathname.startsWith("/staff/inventory")) {
    return "PHARMACIST";
  }
  if (
    pathname.startsWith("/staff/invoices") ||
    pathname.startsWith("/staff/pricing") ||
    pathname.startsWith("/staff/revenue")
  ) {
    return "ACCOUNTANT";
  }
  if (
    pathname.startsWith("/staff/patients") ||
    pathname.startsWith("/staff/lab-results") ||
    pathname.startsWith("/staff/medical-records") ||
    pathname.startsWith("/staff/doctor") ||
    pathname.startsWith("/staff/prescriptions")
  ) {
    return "DOCTOR";
  }
  return "ADMIN";
}

function seedSessionScript(auth: ReturnType<typeof authForRoute>) {
  window.sessionStorage.clear();

  if (auth.scope === "patient") {
    window.sessionStorage.setItem("hms_patient_access_token", auth.token);
    window.sessionStorage.setItem("hms_patient_role", "PATIENT");
    return;
  }

  if (auth.scope === "staff") {
    window.sessionStorage.setItem("hms_staff_access_token", auth.token);
    window.sessionStorage.setItem("hms_staff_role", auth.role);
  }
}

function collectRuntimeProblems(page: Page) {
  const consoleProblems: string[] = [];
  const pageErrors: string[] = [];
  const responseProblems: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }
    const text = message.text();
    if (!isBenignConsoleProblem(text)) {
      consoleProblems.push(text);
    }
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("response", (response) => {
    const status = response.status();
    if (status >= 400 && response.url().includes("/api/v1/")) {
      responseProblems.push(`${status} ${response.url()}`);
    }
  });

  return {
    issues: () => [
      ...consoleProblems.map((item) => `console error: ${item}`),
      ...pageErrors.map((item) => `page error: ${item}`),
      ...responseProblems.map((item) => `HTTP problem: ${item}`),
    ],
  };
}

function isBenignConsoleProblem(text: string) {
  return /AbortError|ERR_ABORTED|Failed to fetch RSC payload/i.test(text);
}

async function collectLayoutMetrics(page: Page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const visibleControls = Array.from(
      document.querySelectorAll("button, a, input, select, textarea"),
    ).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none"
      );
    });

    return {
      horizontalOverflow: documentElement.scrollWidth - documentElement.clientWidth,
      bodyHorizontalOverflow: body.scrollWidth - body.clientWidth,
      tinyControls: visibleControls.filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width < 16 || rect.height < 16;
      }).length,
    };
  });
}

async function desktopModuleNavigationCount(page: Page, pathname: string) {
  if (!isAuthenticatedAppRoute(pathname)) {
    return 0;
  }
  return page.getByRole("navigation", { name: "Module navigation" }).count();
}

function routeIssues({
  responseStatus,
  bodyText,
  runtimeIssues,
  metrics,
  moduleNavigationCount,
}: {
  responseStatus: number | null;
  bodyText: string;
  runtimeIssues: string[];
  metrics: Awaited<ReturnType<typeof collectLayoutMetrics>>;
  moduleNavigationCount: number;
}) {
  const issues = [...runtimeIssues];

  if (responseStatus === null || responseStatus >= 400) {
    issues.push(`document status ${responseStatus ?? "missing"}`);
  }
  if (rawBackendErrorPattern.test(bodyText)) {
    issues.push("raw backend error text is visible");
  }
  if (/Unhandled Runtime Error|Build Error|Application error/i.test(bodyText)) {
    issues.push("Next.js error overlay text is visible");
  }
  if (metrics.horizontalOverflow > 2 || metrics.bodyHorizontalOverflow > 2) {
    issues.push(
      `horizontal overflow document=${metrics.horizontalOverflow} body=${metrics.bodyHorizontalOverflow}`,
    );
  }
  if (moduleNavigationCount > 0) {
    issues.push("authenticated desktop module navigation is duplicated in topbar");
  }

  return issues;
}

async function openMobileNavigation(page: Page, pathname: string) {
  const buttonName = isAuthenticatedAppRoute(pathname)
    ? /Open navigation menu/i
    : /Open public navigation/i;
  const dialogName = isAuthenticatedAppRoute(pathname)
    ? /Mobile navigation/i
    : /Public mobile navigation/i;

  const button = page.getByRole("button", { name: buttonName });
  if ((await button.count()) === 0) {
    return false;
  }

  await button.first().click();
  await expect(page.getByRole("dialog", { name: dialogName })).toBeVisible();
  return true;
}

async function collectMobileDrawerTargetIssues(page: Page) {
  return page.getByRole("dialog").evaluate((dialog) => {
    return Array.from(dialog.querySelectorAll("a, button"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const label =
          element.getAttribute("aria-label") ||
          element.textContent?.replace(/\s+/g, " ").trim() ||
          element.tagName.toLowerCase();
        return { label, width: rect.width, height: rect.height };
      })
      .filter((target) => target.width < 44 || target.height < 44)
      .map(
        (target) =>
          `mobile target below 44px: ${target.label} (${Math.round(target.width)}x${Math.round(target.height)})`,
      );
  });
}

function mobileSpotRoutes(routes: RouteCase[]) {
  const labels = new Set([
    "public department detail",
    "staff lab result detail",
    "staff medical record edit",
    "admin user detail",
  ]);
  const staticPaths = new Set(["/", "/booking", "/portal/appointments", "/staff/dashboard", "/admin/support"]);

  return routes.filter((route) => staticPaths.has(route.path) || labels.has(route.label));
}

function isAuthenticatedAppRoute(pathname: string) {
  return (
    (pathname.startsWith("/staff/") && pathname !== "/staff/login") ||
    pathname.startsWith("/admin/") ||
    (pathname.startsWith("/portal/") &&
      !pathname.startsWith("/portal/login") &&
      !pathname.startsWith("/portal/claim"))
  );
}

async function writeDesktopReport(outputRoot: string, entries: AuditEntry[], projectName: string) {
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(
    path.join(outputRoot, "all-routes-live-manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), projectName, entries }, null, 2),
  );
  await fs.writeFile(path.join(outputRoot, "route-ux-audit.md"), desktopMarkdown(entries));
}

async function writeMobileReport(outputRoot: string, entries: MobileEntry[], projectName: string) {
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(
    path.join(outputRoot, "mobile-spot-checks.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), projectName, entries }, null, 2),
  );
  await fs.writeFile(path.join(outputRoot, "mobile-spot-checks.md"), mobileMarkdown(entries));
}

function desktopMarkdown(entries: AuditEntry[]) {
  const passCount = entries.filter((entry) => entry.result === "Pass").length;
  const blockerCount = entries.length - passCount;
  const rows = entries.map((entry) =>
    [
      entry.index,
      codeCell(entry.path),
      escapeCell(entry.label),
      entry.statusCode ?? "missing",
      entry.result,
      escapeCell(entry.visiblePurpose),
      escapeCell(entry.issues.join("; ") || "Clean browser render"),
      `[png](${entry.screenshot})`,
    ].join(" | "),
  );

  return [
    "# HMS All-Route Live UI Audit",
    "",
    `Viewport: ${desktopViewport.width}x${desktopViewport.height}`,
    `Result: ${passCount}/${entries.length} pass, ${blockerCount} blocker(s)`,
    "",
    "| # | Route | Label | Status | Result | Visible purpose | Notes | Screenshot |",
    "| - | - | - | - | - | - | - | - |",
    ...rows.map((row) => `| ${row} |`),
    "",
  ].join("\n");
}

function mobileMarkdown(entries: MobileEntry[]) {
  const passCount = entries.filter((entry) => entry.result === "Pass").length;
  const blockerCount = entries.length - passCount;
  const rows = entries.map((entry) =>
    [
      entry.index,
      codeCell(entry.path),
      entry.result,
      entry.navigationOpened ? "Yes" : "No",
      escapeCell(entry.issues.join("; ") || "Mobile navigation opened without overflow"),
      `[png](${entry.screenshot})`,
    ].join(" | "),
  );

  return [
    "# HMS Mobile Navigation Spot Checks",
    "",
    `Viewport: ${mobileViewport.width}x${mobileViewport.height}`,
    `Result: ${passCount}/${entries.length} pass, ${blockerCount} blocker(s)`,
    "",
    "| # | Route | Result | Menu opened | Notes | Screenshot |",
    "| - | - | - | - | - | - |",
    ...rows.map((row) => `| ${row} |`),
    "",
  ].join("\n");
}

function liveAuditOutputRoot() {
  if (process.env.HMS_LIVE_AUDIT_DIR) {
    return path.resolve(process.env.HMS_LIVE_AUDIT_DIR);
  }

  const repoRoot = path.basename(process.cwd()) === "web"
    ? path.resolve(process.cwd(), "..")
    : process.cwd();
  return path.join(
    repoRoot,
    "docs",
    "06-testing",
    "artifacts",
    "all-routes-live-ui-audit-2026-05-23-responsive-shell-fix",
  );
}

function webURL() {
  return process.env.HMS_WEB_URL ?? "http://localhost:3000";
}

function summarizeVisibleText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function escapeCell(value: string) {
  return value.replace(/\|/g, "\\|");
}

function codeCell(value: string) {
  return `\`${escapeCell(value)}\``;
}

function toPosix(value: string) {
  return value.split(path.sep).join("/");
}
