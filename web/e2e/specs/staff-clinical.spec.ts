import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard-page';

test.describe('Staff Clinical Pages (@ui)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });
  });

  test.describe('/staff/dashboard', () => {
    test('renders KPI stats cards correctly', async ({ page }) => {
      const dashboard = new DashboardPage(page);
      await dashboard.gotoStaffDashboard();
      
      await expect(page.getByText('Doctor Dashboard')).toBeVisible();
      await expect(page.getByText('Active Rounds')).toBeVisible();
      await expect(page.getByText('Critical Alerts')).toBeVisible();
      await expect(page.getByText('Wait Time Avg')).toBeVisible();
      
      expect(await dashboard.getKpiCount()).toBeGreaterThan(0);
    });

    test('loads the dashboard charts/visualization layer', async ({ page }) => {
      await page.goto('/staff/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Laboratory Queue Trends')).toBeVisible();
      await expect(page.getByText('DATA_STREAM_VISUALIZATION_LAYER')).toBeVisible();
    });

    test('renders the recent activity / high density table', async ({ page }) => {
      await page.goto('/staff/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('cell', { name: /Elena Rodriguez/i })).toBeVisible();
      await expect(page.getByRole('cell', { name: /James T. Kendrick/i })).toBeVisible();
    });
  });

  test.describe('/staff/medical-records/[id]/edit', () => {
    test('loads the record editor with patient details', async ({ page }) => {
      await page.goto('/staff/medical-records/1/edit', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'Patient Record Entry' })).toBeVisible();
      await expect(page.getByText('Kerrigan, Sarah')).toBeVisible();
      await expect(page.getByText('Primary Diagnosis')).toBeVisible();
    });

    test('displays the vitals section and patient history', async ({ page }) => {
      await page.goto('/staff/medical-records/1/edit', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Heart Rate')).toBeVisible();
      await expect(page.getByText('BP (Sys/Dia)')).toBeVisible();
      await expect(page.getByText('Recent Clinical Activity')).toBeVisible();
    });

    test('displays active prescriptions table', async ({ page }) => {
      await page.goto('/staff/medical-records/1/edit', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Levetiracetam (Keppra) 500mg')).toBeVisible();
      await expect(page.getByText('Sumatriptan 50mg')).toBeVisible();
    });

    test('allows interacting with the save/commit action', async ({ page }) => {
      await page.goto('/staff/medical-records/1/edit', { waitUntil: 'domcontentloaded' });
      const commitBtn = page.getByRole('button', { name: /Commit Record/i });
      await expect(commitBtn).toBeVisible();
      await commitBtn.hover();
    });
  });

  test.describe('/staff/nurse-intake', () => {
    test('renders the intake board and KPIs', async ({ page }) => {
      await page.goto('/staff/nurse-intake', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Daily Intake Schedule/i })).toBeVisible();
      await expect(page.getByText('Waiting Room')).toBeVisible();
      await expect(page.getByText('Currently Checked-in')).toBeVisible();
    });

    test('renders the patient queue groups', async ({ page }) => {
      await page.goto('/staff/nurse-intake', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('09:00 AM')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Arthur Morgan' }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Sadie Miller' }).first()).toBeVisible();
    });

    test('renders the triage form/selected patient card', async ({ page }) => {
      await page.goto('/staff/nurse-intake', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /Complete Intake Check-in/i })).toBeVisible();
      await expect(page.getByText('Quick Vitals')).toBeVisible();
      await expect(page.getByText('Clinical Handoff Insight')).toBeVisible();
    });
  });

  test.describe('/staff/vital-signs', () => {
    test('renders the vital signs editor with patient context', async ({ page }) => {
      await page.goto('/staff/vital-signs', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'Vital Signs Recording' })).toBeVisible();
      await expect(page.getByText('DRS. HARRISON WELLS')).toBeVisible();
    });

    test('displays all required form inputs', async ({ page }) => {
      await page.goto('/staff/vital-signs', { waitUntil: 'domcontentloaded' });
      await expect(page.getByPlaceholder('120/80')).toBeVisible();
      await expect(page.getByPlaceholder('72')).toBeVisible();
      await expect(page.getByPlaceholder('98')).toBeVisible();
      await expect(page.getByPlaceholder('36.6')).toBeVisible();
      await expect(page.getByPlaceholder('16')).toBeVisible();
    });

    test('has a working save action button', async ({ page }) => {
      await page.goto('/staff/vital-signs', { waitUntil: 'domcontentloaded' });
      const saveBtn = page.getByRole('button', { name: /Save Vitals/i });
      await expect(saveBtn).toBeVisible();
    });
  });
});
