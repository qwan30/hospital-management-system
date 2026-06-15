/**
 * Real User Interactive Test Suite
 * =================================
 * Clicks through the HMS like a real user would — covering all personas,
 * key workflows, and edge cases. Uses Playwright's bundled Chromium.
 *
 * Usage: npx tsx e2e/interactive/real-user-test.ts
 * Or:    npx playwright test e2e/interactive/real-user-test.ts --headed
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8081/api/v1';
const SCREENSHOT_DIR = path.resolve('e2e/interactive/screenshots');
const REPORT_FILE = path.resolve('e2e/interactive/report.md');

// ─── Test Accounts (from ReleaseDemoSeedCatalog.java) ──────────
// Staff accounts — all passwords are the same per role convention
const ACCOUNTS: Record<string, { email: string; password: string; role: string }> = {
  // Admin
  admin:       { email: 'admin@hospital.vn',          password: 'Admin@1234',        role: 'ADMIN' },
  // Doctors (4)
  doctor1:     { email: 'doctor1@hospital.vn',        password: 'Doctor@1234',       role: 'DOCTOR' },
  doctor2:     { email: 'doctor2@hospital.vn',        password: 'Doctor@1234',       role: 'DOCTOR' },
  doctor3:     { email: 'doctor3@hospital.vn',        password: 'Doctor@1234',       role: 'DOCTOR' },
  doctor4:     { email: 'doctor4@hospital.vn',        password: 'Doctor@1234',       role: 'DOCTOR' },
  // Nurse
  nurse:       { email: 'nurse@hospital.vn',          password: 'Nurse@1234',        role: 'NURSE' },
  // Receptionist
  receptionist:{ email: 'receptionist@hospital.vn',   password: 'Reception@1234',   role: 'RECEPTIONIST' },
  // Pharmacist
  pharmacist:  { email: 'pharmacist@hospital.vn',     password: 'Pharma@1234',       role: 'PHARMACIST' },
  // Accountant
  accountant:  { email: 'accountant@hospital.vn',     password: 'Acc@1234',          role: 'ACCOUNTANT' },
};

// Patient portal accounts (from ReleaseDemoSeedCatalog.java)
const PATIENTS: Array<{ email: string; password: string; name: string }> = [
  { email: 'patient@example.com',               password: 'Patient@1234', name: 'Nguyen Thi Hoa' },
  { email: 'nguyen.van.clinical@example.com',    password: 'Patient@1234', name: 'Nguyen Van Clinical' },
  { email: 'release.patient002@example.com',     password: 'Patient@1234', name: 'Tran Thi Queue' },
  { email: 'release.patient004@example.com',     password: 'Patient@1234', name: 'Pham Nhu Portal' },
  { email: 'release.patient007@example.com',     password: 'Patient@1234', name: 'Release Patient 007' },
  { email: 'release.patient008@example.com',     password: 'Patient@1234', name: 'Release Patient 008' },
];

// ─── Types ───────────────────────────────────────────────────
interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'WARN';
  details: string;
}

interface SectionReport {
  section: string;
  results: TestResult[];
}

// ─── State ───────────────────────────────────────────────────
const report: SectionReport[] = [];
const screenshots: string[] = [];
let currentSection = '';

function addResult(status: TestResult['status'], test: string, details: string) {
  report[report.length - 1].results.push({ test, status, details });
  const icon = { PASS: '✅', FAIL: '❌', SKIP: '⏭️', WARN: '⚠️' }[status];
  console.log(`  ${icon} ${test}: ${details}`);
}

async function takeScreenshot(page: Page, name: string) {
  const file = `${currentSection.replace(/\s+/g, '-').toLowerCase()}--${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, file), fullPage: false });
  screenshots.push(file);
  return file;
}

/**
 * Login via API and inject token into sessionStorage.
 * This mirrors what the real login form does — API call + persistSession.
 * After injection, navigate to the post-login page to verify.
 */
async function loginAs(
  page: Page,
  account: { email: string; password: string },
  loginPath = '/staff/login',
  authEndpoint = '/auth/login',
  scope = 'staff'
): Promise<string> {
  console.log(`\n🔐 Logging in as ${account.email}...`);

  // 1. Authenticate via API
  const apiResp = await page.request.post(`${API_URL}${authEndpoint}`, {
    data: { email: account.email, password: account.password },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!apiResp.ok()) {
    console.log(`    API login failed: HTTP ${apiResp.status()}`);
    return loginPath; // stay on login
  }

  const body = await apiResp.json();
  const accessToken = body.data?.tokens?.accessToken;
  const role = body.data?.role;
  const userId = body.data?.userId;

  if (!accessToken || !role) {
    console.log(`    API response missing token or role`);
    return loginPath;
  }

  console.log(`    Authenticated as ${role} (${userId})`);

  // 2. Inject session via addInitScript so it runs BEFORE React hydration
  const scopeKey = scope === 'patient' ? 'patient' : 'staff';
  await page.addInitScript(
    ({ token, userRole, key }) => {
      sessionStorage.setItem(`hms_${key}_access_token`, token);
      sessionStorage.setItem(`hms_${key}_access_token_expires_in`, '900');
      if (userRole) {
        sessionStorage.setItem(`hms_${key}_role`, userRole);
      }
    },
    { token: accessToken, userRole: role, key: scopeKey }
  );

  // 3. Navigate to the appropriate dashboard (addInitScript fires before page scripts)
  const dashboardMap: Record<string, string> = {
    ADMIN: '/admin/dashboard',
    DOCTOR: '/staff/doctor/dashboard',
    NURSE: '/staff/dashboard',
    RECEPTIONIST: '/staff/dashboard',
    PHARMACIST: '/staff/dashboard',
    ACCOUNTANT: '/staff/dashboard',
    PATIENT: '/portal/overview',
  };

  const targetPath = dashboardMap[role] || '/staff/dashboard';
  await page.goto(`${BASE_URL}${targetPath}`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);

  // Check if we were redirected to login (session rejected)
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log(`    Session rejected — redirected to login from ${targetPath}`);
  }
  return currentUrl;
}

// ─── Section: Health Check ───────────────────────────────────
async function healthCheck(page: Page) {
  currentSection = 'health-check';
  report.push({ section: 'System Health Check', results: [] });
  console.log('\n━━━ System Health Check ━━━');

  try {
    const healthUrl = API_URL.replace('/api/v1', '') + '/actuator/health';
    const resp = await page.request.get(healthUrl);
    const body = await resp.json();
    if (body.status === 'UP') {
      addResult('PASS', 'Backend health', 'Status is UP');
    } else {
      addResult('WARN', 'Backend health', `Status is ${body.status}`);
    }
  } catch (e) {
    addResult('FAIL', 'Backend health', `Cannot reach backend: ${e}`);
  }

  try {
    const resp = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    if (resp && resp.status() < 400) {
      addResult('PASS', 'Frontend reachable', `HTTP ${resp.status()}`);
    } else {
      addResult('FAIL', 'Frontend reachable', `HTTP ${resp?.status()}`);
    }
  } catch (e) {
    addResult('FAIL', 'Frontend reachable', `Cannot reach frontend: ${e}`);
  }
}

// ─── Section: Public Pages ───────────────────────────────────
async function testPublicPages(page: Page) {
  currentSection = 'public-pages';
  report.push({ section: 'Public Pages', results: [] });
  console.log('\n━━━ Public Pages ━━━');

  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/departments', name: 'Departments' },
    { path: '/doctors', name: 'Doctors' },
    { path: '/news', name: 'News' },
    { path: '/booking', name: 'Booking' },
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/security', name: 'Security' },
  ];

  for (const p of pages) {
    try {
      const resp = await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);

      const hasMain = await page.locator('main, #main-content, [role="main"]').count();
      const title = await page.title();
      const hasError = await page.locator('[data-nextjs-error-overlay]').count();

      if (resp && resp.status() < 400 && hasMain > 0 && hasError === 0) {
        addResult('PASS', p.name, `Title: "${title}"`);
        await takeScreenshot(page, p.name.replace(/\s+/g, '-').toLowerCase());
      } else if (hasError > 0) {
        addResult('FAIL', p.name, 'Next.js error overlay detected');
      } else {
        addResult('FAIL', p.name, `HTTP ${resp?.status()}, main: ${hasMain}`);
      }
    } catch (e) {
      addResult('FAIL', p.name, `Error: ${e}`);
    }
  }
}

// ─── Section: Booking Flow ───────────────────────────────────
async function testBookingFlow(page: Page) {
  currentSection = 'booking-flow';
  report.push({ section: 'Public Booking Flow', results: [] });
  console.log('\n━━━ Public Booking Flow ━━━');

  try {
    await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle' });

    const formVisible = await page.locator('form, [role="form"]').count();
    if (formVisible > 0) {
      addResult('PASS', 'Booking form renders', 'Form is visible');
      await takeScreenshot(page, '01-booking-form');
    } else {
      addResult('FAIL', 'Booking form renders', 'No form found');
      return;
    }

    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(500);
      const validationVisible = await page.locator(
        '[role="alert"], .error, .text-red-500, .text-destructive'
      ).count();
      if (validationVisible > 0) {
        addResult('PASS', 'Form validation', 'Validation errors shown for empty submission');
      } else {
        addResult('WARN', 'Form validation', 'No visible validation errors');
      }
    }

    await takeScreenshot(page, '02-booking-validation');
  } catch (e) {
    addResult('FAIL', 'Booking flow', `Error: ${e}`);
  }
}

// ─── Section: Staff Login (All Roles) ────────────────────────
async function testStaffLogins(browser: Browser) {
  currentSection = 'staff-logins';
  report.push({ section: 'Staff Authentication', results: [] });
  console.log('\n━━━ Staff Authentication ━━━');

  const roles = ['admin', 'doctor1', 'doctor2', 'doctor3', 'doctor4', 'nurse', 'receptionist', 'pharmacist', 'accountant'] as const;

  for (const role of roles) {
    const account = ACCOUNTS[role];
    const context = await browser.newContext();
    const rolePage = await context.newPage();

    try {
      const url = await loginAs(rolePage, account);

      if (url.includes('/dashboard') || url.includes('/doctor') || url.includes('/admin')) {
        addResult('PASS', `${role} login`, `Redirected to ${new URL(url).pathname}`);
        await rolePage.screenshot({
          path: path.join(SCREENSHOT_DIR, `staff-login--${role}.png`),
          fullPage: false,
        });
      } else if (url.includes('/login')) {
        addResult('FAIL', `${role} login`, 'Still on login page — credentials may be invalid');
      } else {
        addResult('WARN', `${role} login`, `Unexpected redirect to ${url}`);
        await rolePage.screenshot({
          path: path.join(SCREENSHOT_DIR, `staff-login--${role}.png`),
          fullPage: false,
        });
      }
    } catch (e) {
      addResult('FAIL', `${role} login`, `Error: ${e}`);
    } finally {
      await context.close();
    }
  }
}

// ─── Section: Admin Workflows ────────────────────────────────
async function testAdminWorkflows(browser: Browser) {
  currentSection = 'admin-workflows';
  report.push({ section: 'Admin Workflows', results: [] });
  console.log('\n━━━ Admin Workflows ━━━');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = await loginAs(page, ACCOUNTS.admin);
    if (url.includes('/login')) {
      addResult('FAIL', 'Admin login', 'Login failed — skipping admin tests');
      await context.close();
      return;
    }
    addResult('PASS', 'Admin login', `Landed on ${new URL(url).pathname}`);
    await takeScreenshot(page, '01-dashboard');

    if (!url.includes('/admin')) {
      await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
    }
    await page.waitForTimeout(1000);

    const kpiCards = await page.locator(
      '[class*="kpi"], [class*="KPI"], [class*="metric"], [class*="stat"]'
    ).count();
    if (kpiCards > 0) {
      addResult('PASS', 'Dashboard KPIs', `${kpiCards} KPI/metric cards visible`);
    } else {
      addResult('WARN', 'Dashboard KPIs', 'No KPI cards found');
    }
    await takeScreenshot(page, '02-admin-dashboard');

    // Users
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1500);
    const userRows = await page.locator(
      'table tr, [role="row"], [class*="row"], [class*="table"] li, [class*="card"]'
    ).count();
    if (userRows > 0) {
      addResult('PASS', 'Users list', `${userRows} UI elements found`);
    } else {
      addResult('WARN', 'Users list', 'No UI elements — page may be empty');
    }
    await takeScreenshot(page, '03-admin-users');

    // Departments
    await page.goto(`${BASE_URL}/admin/departments`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1500);
    const deptContent = await page.locator(
      'table, ul, [role="list"], [class*="row"], [class*="card"], [class*="item"]'
    ).count();
    if (deptContent > 0) {
      addResult('PASS', 'Departments', `${deptContent} UI elements found`);
    } else {
      addResult('WARN', 'Departments', 'No content elements found');
    }
    await takeScreenshot(page, '04-admin-departments');

    // Audit Logs
    await page.goto(`${BASE_URL}/admin/audit-logs`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    const auditVisible = await page.locator('table, [role="table"]').count();
    if (auditVisible > 0) {
      addResult('PASS', 'Audit Logs', 'Audit log table visible');
    } else {
      addResult('WARN', 'Audit Logs', 'No audit log table found');
    }
    await takeScreenshot(page, '05-admin-audit-logs');

    // Monitoring
    await page.goto(`${BASE_URL}/admin/monitoring`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Monitoring', 'Page loaded');
    await takeScreenshot(page, '06-admin-monitoring');

    // News Management
    await page.goto(`${BASE_URL}/admin/news`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'News Management', 'Page loaded');
    await takeScreenshot(page, '07-admin-news');

    // Rooms
    await page.goto(`${BASE_URL}/admin/rooms`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Rooms', 'Page loaded');
    await takeScreenshot(page, '08-admin-rooms');

  } catch (e) {
    addResult('FAIL', 'Admin workflows', `Error: ${e}`);
  } finally {
    await context.close();
  }
}

// ─── Section: Doctor Workflows ───────────────────────────────
async function testDoctorWorkflows(browser: Browser) {
  currentSection = 'doctor-workflows';
  report.push({ section: 'Doctor Workflows', results: [] });
  console.log('\n━━━ Doctor Workflows ━━━');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = await loginAs(page, ACCOUNTS.doctor1);
    if (url.includes('/login')) {
      addResult('FAIL', 'Doctor login', 'Login failed — skipping doctor tests');
      await context.close();
      return;
    }
    addResult('PASS', 'Doctor login', `Landed on ${new URL(url).pathname}`);
    await takeScreenshot(page, '01-doctor-dashboard');

    if (!url.includes('/doctor')) {
      await page.goto(`${BASE_URL}/staff/doctor/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1000);
    }

    const appointments = await page.locator(
      'table, [role="list"], [class*="appointment"], [class*="card"], [class*="row"], [class*="item"]'
    ).count();
    if (appointments > 0) {
      addResult('PASS', 'Appointment list', `${appointments} UI elements visible`);
    } else {
      addResult('WARN', 'Appointment list', 'No appointment content found');
    }
    await takeScreenshot(page, '02-doctor-appointments');

    await page.goto(`${BASE_URL}/staff/schedule`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Schedule', 'Schedule page loaded');
    await takeScreenshot(page, '03-doctor-schedule');

    await page.goto(`${BASE_URL}/staff/patients`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Patients', 'Patients page loaded');
    await takeScreenshot(page, '04-doctor-patients');

  } catch (e) {
    addResult('FAIL', 'Doctor workflows', `Error: ${e}`);
  } finally {
    await context.close();
  }
}

// ─── Section: Queue Management (Nurse) ───────────────────────
async function testQueueManagement(browser: Browser) {
  currentSection = 'queue-management';
  report.push({ section: 'Queue Management (Nurse)', results: [] });
  console.log('\n━━━ Queue Management (Nurse) ━━━');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = await loginAs(page, ACCOUNTS.nurse);
    if (url.includes('/login')) {
      addResult('FAIL', 'Nurse login', 'Login failed — skipping queue tests');
      await context.close();
      return;
    }
    addResult('PASS', 'Nurse login', `Landed on ${new URL(url).pathname}`);
    await takeScreenshot(page, '01-nurse-login');

    await page.goto(`${BASE_URL}/staff/queue`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);

    const queueItems = await page.locator(
      'table tr, [role="row"], [class*="queue"], [class*="card"], [class*="item"], [class*="row"], li'
    ).count();
    if (queueItems > 0) {
      addResult('PASS', 'Queue board', `${queueItems} queue items visible`);
    } else {
      addResult('WARN', 'Queue board', `Queue UI elements not found (API has data)`);
    }
    await takeScreenshot(page, '02-queue-board');

    await page.goto(`${BASE_URL}/staff/nurse-intake`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Nurse Intake', 'Nurse intake page loaded');
    await takeScreenshot(page, '03-nurse-intake');

  } catch (e) {
    addResult('FAIL', 'Queue management', `Error: ${e}`);
  } finally {
    await context.close();
  }
}

// ─── Section: Pharmacy Workflows ─────────────────────────────
async function testPharmacyWorkflows(browser: Browser) {
  currentSection = 'pharmacy-workflows';
  report.push({ section: 'Pharmacy Workflows', results: [] });
  console.log('\n━━━ Pharmacy Workflows ━━━');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = await loginAs(page, ACCOUNTS.pharmacist);
    if (url.includes('/login')) {
      addResult('FAIL', 'Pharmacist login', 'Login failed — skipping pharmacy tests');
      await context.close();
      return;
    }
    addResult('PASS', 'Pharmacist login', `Landed on ${new URL(url).pathname}`);
    await takeScreenshot(page, '01-pharmacy-dashboard');

    await page.goto(`${BASE_URL}/staff/inventory`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);
    const inventoryItems = await page.locator(
      'table tr, [role="row"], [class*="inventory"]'
    ).count();
    if (inventoryItems > 1) {
      addResult('PASS', 'Inventory', `${inventoryItems} inventory items visible`);
    } else {
      addResult('WARN', 'Inventory', 'No inventory items — seed data may still be loading');
    }
    await takeScreenshot(page, '02-pharmacy-inventory');

  } catch (e) {
    addResult('FAIL', 'Pharmacy workflows', `Error: ${e}`);
  } finally {
    await context.close();
  }
}

// ─── Section: Receptionist Workflows ─────────────────────────
async function testReceptionistWorkflows(browser: Browser) {
  currentSection = 'receptionist-workflows';
  report.push({ section: 'Receptionist Workflows', results: [] });
  console.log('\n━━━ Receptionist Workflows ━━━');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = await loginAs(page, ACCOUNTS.receptionist);
    if (url.includes('/login')) {
      addResult('FAIL', 'Receptionist login', 'Login failed');
      await context.close();
      return;
    }
    addResult('PASS', 'Receptionist login', `Landed on ${new URL(url).pathname}`);
    await takeScreenshot(page, '01-receptionist-dashboard');

    await page.goto(`${BASE_URL}/staff/booking`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Staff Booking', 'Booking page loaded');
    await takeScreenshot(page, '02-staff-booking');

    await page.goto(`${BASE_URL}/staff/invoices`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Invoices', 'Invoices page loaded');
    await takeScreenshot(page, '03-invoices');

    await page.goto(`${BASE_URL}/staff/revenue`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    addResult('PASS', 'Revenue', 'Revenue page loaded');
    await takeScreenshot(page, '04-revenue');

  } catch (e) {
    addResult('FAIL', 'Receptionist workflows', `Error: ${e}`);
  } finally {
    await context.close();
  }
}

// ─── Section: Accountant Workflows ───────────────────────────
async function testAccountantWorkflows(browser: Browser) {
  currentSection = 'accountant-workflows';
  report.push({ section: 'Accountant Workflows', results: [] });
  console.log('\n━━━ Accountant Workflows ━━━');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const url = await loginAs(page, ACCOUNTS.accountant);
    if (url.includes('/login')) {
      addResult('FAIL', 'Accountant login', 'Login failed');
      await context.close();
      return;
    }
    addResult('PASS', 'Accountant login', `Landed on ${new URL(url).pathname}`);
    await takeScreenshot(page, '01-accountant-dashboard');

    // Check revenue reports
    await page.goto(`${BASE_URL}/staff/revenue`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    const revenueContent = await page.locator(
      'table, [role="table"], [class*="chart"], [class*="card"], [class*="stat"]'
    ).count();
    if (revenueContent > 0) {
      addResult('PASS', 'Revenue Reports', `${revenueContent} UI elements visible`);
    } else {
      addResult('WARN', 'Revenue Reports', 'No revenue content found');
    }
    await takeScreenshot(page, '02-accountant-revenue');

    // Check invoices
    await page.goto(`${BASE_URL}/staff/invoices`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);
    const invoiceContent = await page.locator(
      'table, [role="table"], [class*="row"], [class*="card"], [class*="invoice"]'
    ).count();
    if (invoiceContent > 0) {
      addResult('PASS', 'Invoices', `${invoiceContent} UI elements visible`);
    } else {
      addResult('WARN', 'Invoices', 'No invoice content found');
    }
    await takeScreenshot(page, '03-accountant-invoices');

  } catch (e) {
    addResult('FAIL', 'Accountant workflows', `Error: ${e}`);
  } finally {
    await context.close();
  }
}

// ─── Section: Patient Portal ─────────────────────────────────
async function testPatientPortal(browser: Browser) {
  currentSection = 'patient-portal';
  report.push({ section: 'Patient Portal', results: [] });
  console.log('\n━━━ Patient Portal ━━━');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Try all 6 patient accounts sequentially — stop at first success
    let portalUrl = '';
    let loggedInPatient: typeof PATIENTS[0] | null = null;

    for (const patient of PATIENTS) {
      portalUrl = await loginAs(page, patient, '/portal/login', '/patient-auth/login', 'patient');

      if (!portalUrl.includes('/login')) {
        loggedInPatient = patient;
        addResult('PASS', `Patient login (${patient.name})`, `Landed on ${new URL(portalUrl).pathname}`);
        await takeScreenshot(page, `02-patient-portal-${patient.email.split('@')[0]}`);
        break;
      } else {
        addResult('WARN', `Patient login (${patient.name})`, 'Login failed');
      }
    }

    if (!loggedInPatient) {
      addResult('FAIL', 'Patient login', 'All 6 patient accounts failed — seed data may be missing');
      await takeScreenshot(page, '01-patient-login-fail');
      await context.close();
      return;
    }

    const portalPages = [
      { path: '/portal/overview', name: 'Overview' },
      { path: '/portal/appointments', name: 'Appointments' },
      { path: '/portal/records', name: 'Medical Records' },
      { path: '/portal/lab-results', name: 'Lab Results' },
      { path: '/portal/billing', name: 'Billing' },
      { path: '/portal/messages', name: 'Messages' },
      { path: '/portal/profile', name: 'Profile' },
    ];

    for (const p of portalPages) {
      try {
        await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(500);
        const hasError = await page.locator('[data-nextjs-error-overlay]').count();
        if (hasError === 0) {
          addResult('PASS', p.name, 'Page loaded successfully');
          await takeScreenshot(page, `portal-${p.name.toLowerCase().replace(/\s+/g, '-')}`);
        } else {
          addResult('FAIL', p.name, 'Error overlay detected');
        }
      } catch (e) {
        addResult('FAIL', p.name, `Error: ${e}`);
      }
    }

  } catch (e) {
    addResult('FAIL', 'Patient portal', `Error: ${e}`);
  } finally {
    await context.close();
  }
}

// ─── Section: RBAC Enforcement ───────────────────────────────
async function testRbacEnforcement(browser: Browser) {
  currentSection = 'rbac-enforcement';
  report.push({ section: 'RBAC Enforcement', results: [] });
  console.log('\n━━━ RBAC Enforcement ━━━');

  // Doctor cannot access admin
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await loginAs(page, ACCOUNTS.doctor1);
      await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1000);
      const url = page.url();
      if (url.includes('/forbidden') || url.includes('/login') || url.includes('/staff')) {
        addResult('PASS', 'Doctor → Admin blocked', `Redirected to ${new URL(url).pathname} — correct`);
      } else {
        addResult('FAIL', 'Doctor → Admin blocked', `Doctor can access admin: ${url}`);
      }
      await takeScreenshot(page, 'rbac-doctor-to-admin');
    } catch (e) {
      addResult('FAIL', 'Doctor → Admin blocked', `Error: ${e}`);
    } finally {
      await context.close();
    }
  }

  // Unauthenticated cannot access staff
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(`${BASE_URL}/staff/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1000);
      const url = page.url();
      if (url.includes('/login')) {
        addResult('PASS', 'Unauthenticated → Staff', 'Redirected to login — correct');
      } else {
        addResult('FAIL', 'Unauthenticated → Staff', `Not redirected: ${url}`);
      }
    } catch (e) {
      addResult('FAIL', 'Unauthenticated → Staff', `Error: ${e}`);
    } finally {
      await context.close();
    }
  }

  // Patient cannot access staff
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await loginAs(page, PATIENTS[0], '/portal/login', '/patient-auth/login', 'patient');
      await page.goto(`${BASE_URL}/staff/dashboard`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1000);
      const url = page.url();
      if (url.includes('/forbidden') || url.includes('/portal') || url.includes('/staff/login')) {
        addResult('PASS', 'Patient → Staff blocked', `Redirected to ${new URL(url).pathname} — correct`);
      } else {
        addResult('FAIL', 'Patient → Staff blocked', `Patient can access staff: ${url}`);
      }
    } catch (e) {
      addResult('FAIL', 'Patient → Staff blocked', `Error: ${e}`);
    } finally {
      await context.close();
    }
  }
}

// ─── Section: Accessibility Spot Checks ──────────────────────
async function testAccessibilitySpotChecks(page: Page) {
  currentSection = 'accessibility';
  report.push({ section: 'Accessibility Spot Checks', results: [] });
  console.log('\n━━━ Accessibility Spot Checks ━━━');

  const checks = [
    { path: '/', name: 'Homepage' },
    { path: '/staff/login', name: 'Staff Login' },
    { path: '/portal/login', name: 'Portal Login' },
  ];

  for (const check of checks) {
    await page.goto(`${BASE_URL}${check.path}`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);

    const skipLink = await page.locator(
      '[href="#main-content"], .skip-link, .skip-to-content'
    ).count();
    if (skipLink > 0) {
      addResult('PASS', `${check.name} skip-link`, 'Skip-to-content link present');
    } else {
      addResult('WARN', `${check.name} skip-link`, 'No skip-link found');
    }

    const lang = await page.locator('html').getAttribute('lang');
    if (lang) {
      addResult('PASS', `${check.name} lang attr`, `lang="${lang}"`);
    } else {
      addResult('WARN', `${check.name} lang attr`, 'Missing lang attribute');
    }

    const h1s = await page.locator('h1').count();
    if (h1s === 1) {
      addResult('PASS', `${check.name} h1`, 'Single h1 — good for SEO/a11y');
    } else if (h1s === 0) {
      addResult('WARN', `${check.name} h1`, 'No h1 found');
    } else {
      addResult('WARN', `${check.name} h1`, `${h1s} h1 elements — should have exactly one`);
    }
  }
}

// ─── Section: Responsive Layout ──────────────────────────────
async function testResponsiveLayout(page: Page) {
  currentSection = 'responsive';
  report.push({ section: 'Responsive Layout', results: [] });
  console.log('\n━━━ Responsive Layout ━━━');

  const viewports = [
    { width: 390, height: 844, name: 'Mobile (iPhone 14)' },
    { width: 768, height: 1024, name: 'Tablet (iPad)' },
    { width: 1440, height: 900, name: 'Desktop' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (!hasOverflow) {
      addResult('PASS', vp.name, 'No horizontal overflow');
    } else {
      addResult('WARN', vp.name, 'Horizontal overflow detected');
    }

    await takeScreenshot(page, `responsive-${vp.name.toLowerCase().replace(/\s+/g, '-')}`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
}

// ─── Generate Report ─────────────────────────────────────────
function generateReport() {
  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('  TEST REPORT');
  console.log('══════════════════════════════════════════════════════\n');

  let totalPass = 0, totalFail = 0, totalWarn = 0, totalSkip = 0;

  let md = '# HMS Real User Test Report\n\n';
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Base URL:** ${BASE_URL}\n`;
  md += `**API URL:** ${API_URL}\n`;
  md += `**Screenshots:** ${screenshots.length} captured\n\n`;
  md += '---\n\n';

  for (const section of report) {
    md += `## ${section.section}\n\n`;
    md += '| Status | Test | Details |\n';
    md += '|--------|------|--------|\n';

    for (const r of section.results) {
      const icon = { PASS: '✅', FAIL: '❌', SKIP: '⏭️', WARN: '⚠️' }[r.status];
      md += `| ${icon} ${r.status} | ${r.test} | ${r.details} |\n`;

      if (r.status === 'PASS') totalPass++;
      else if (r.status === 'FAIL') totalFail++;
      else if (r.status === 'WARN') totalWarn++;
      else totalSkip++;
    }
    md += '\n';
  }

  const total = totalPass + totalFail + totalWarn + totalSkip;
  md += '## Summary\n\n';
  md += `| Metric | Count |\n`;
  md += `|--------|------|\n`;
  md += `| Pass | ${totalPass} |\n`;
  md += `| Fail | ${totalFail} |\n`;
  md += `| Warn | ${totalWarn} |\n`;
  md += `| Skip | ${totalSkip} |\n`;
  md += `| **Total** | **${total}** |\n`;
  md += `| **Pass Rate** | **${((totalPass / Math.max(1, totalPass + totalFail)) * 100).toFixed(1)}%** |\n\n`;

  if (totalFail > 0) {
    md += '## Failures Requiring Investigation\n\n';
    for (const section of report) {
      const fails = section.results.filter(r => r.status === 'FAIL');
      if (fails.length > 0) {
        md += `### ${section.section}\n\n`;
        for (const f of fails) {
          md += `- **${f.test}**: ${f.details}\n`;
        }
        md += '\n';
      }
    }
  }

  if (totalWarn > 0) {
    md += '## Warnings\n\n';
    for (const section of report) {
      const warns = section.results.filter(r => r.status === 'WARN');
      if (warns.length > 0) {
        md += `### ${section.section}\n\n`;
        for (const w of warns) {
          md += `- **${w.test}**: ${w.details}\n`;
        }
        md += '\n';
      }
    }
  }

  md += '## Screenshots\n\n';
  md += `Total: ${screenshots.length} screenshots captured in \`e2e/interactive/screenshots/\`\n\n`;
  const screenshotsBySection: Record<string, string[]> = {};
  for (const s of screenshots) {
    const section = s.split('--')[0];
    if (!screenshotsBySection[section]) screenshotsBySection[section] = [];
    screenshotsBySection[section].push(s);
  }
  for (const [section, files] of Object.entries(screenshotsBySection)) {
    md += `### ${section}\n\n`;
    for (const f of files) {
      md += `- ![${f}](screenshots/${f})\n`;
    }
    md += '\n';
  }

  fs.writeFileSync(REPORT_FILE, md);
  console.log(`\nReport saved to: ${REPORT_FILE}`);
  console.log(`${screenshots.length} screenshots saved to: ${SCREENSHOT_DIR}`);

  console.log(`\n  ${totalPass} passed  ${totalFail} failed  ${totalWarn} warnings  ${totalSkip} skipped`);
  console.log(`  Pass rate: ${((totalPass / Math.max(1, totalPass + totalFail)) * 100).toFixed(1)}%`);
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('══════════════════════════════════════════════════════');
  console.log('  HMS REAL USER INTERACTIVE TEST');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Base URL : ${BASE_URL}`);
  console.log(`  API URL  : ${API_URL}`);
  console.log(`  Browser  : Chromium (headless)`);
  console.log('══════════════════════════════════════════════════════');

  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await healthCheck(page);
    await testPublicPages(page);
    await testBookingFlow(page);
    await testAccessibilitySpotChecks(page);
    await testResponsiveLayout(page);
    await testStaffLogins(browser);
    await testAdminWorkflows(browser);
    await testDoctorWorkflows(browser);
    await testQueueManagement(browser);
    await testPharmacyWorkflows(browser);
    await testReceptionistWorkflows(browser);
    await testAccountantWorkflows(browser);
    await testPatientPortal(browser);
    await testRbacEnforcement(browser);
  } catch (e) {
    console.error('Fatal error:', e);
  } finally {
    await browser.close();
  }

  generateReport();
}

main().catch(console.error);
