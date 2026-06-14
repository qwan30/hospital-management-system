import { test, expect } from '@playwright/test';
import { installUiApiMocks } from '../helpers/ui-api-mocks';

test.describe('Portal Pages (@ui)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as PATIENT
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_patient_access_token", "patient-token");
      window.sessionStorage.setItem("hms_patient_role", "PATIENT");
    });
    await installUiApiMocks(page);
  });

  test.describe('/portal/appointments', () => {
    test('renders appointment list', async ({ page }) => {
      await page.goto('/portal/appointments');
      await expect(page.getByRole('heading', { name: /Patient Appointments/i })).toBeVisible();

      await expect(page.getByText('Dr. Sarah Jenkins')).toBeVisible();
      await expect(page.getByText('Dr. Michael Chen')).toBeVisible();
      await expect(page.getByText('Dr. Elena Rodriguez')).toBeVisible();
    });

    test('renders upcoming and past badges/filters', async ({ page }) => {
      await page.goto('/portal/appointments');
      await expect(page.getByRole('button', { name: /UPCOMING/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /PAST/i })).toBeVisible();
      await expect(page.getByText('CONFIRMED').first()).toBeVisible();
    });

    test('renders contextual data monoliths', async ({ page }) => {
      await page.goto('/portal/appointments');
      await expect(page.getByText('Summary Metrics')).toBeVisible();
      await expect(page.getByText('Upcoming Visits')).toBeVisible();
      await expect(page.getByText('Total Appointments')).toBeVisible();
      await expect(page.getByText('Actions Unavailable')).toBeVisible();
    });
  });

  test.describe('/portal/appointments/2', () => {
    test('renders alternative appointment detail/list layout', async ({ page }) => {
      await page.goto('/portal/appointments/2');
      await expect(page.getByRole('heading', { name: /Patient Appointments/i })).toBeVisible();

      await expect(page.getByText('Dr. Sarah Kensington')).toBeVisible();
      await expect(page.getByText('Dr. Michael Chen')).toBeVisible();
    });

    test('renders statuses and actions', async ({ page }) => {
      await page.goto('/portal/appointments/2');
      await expect(page.getByText('Confirmed').first()).toBeVisible();
      await expect(page.getByText('Pending Lab')).toBeVisible();
      const detailsButtons = page.getByRole('button', { name: /View details/i });
      await expect(detailsButtons.first()).toBeVisible();
    });
  });

  test.describe('/portal/records', () => {
    // Records page triggers TurboPack recompilation; run serially to avoid dev-server panics
    test.describe.configure({ mode: 'serial' });
    test.setTimeout(90_000);

    test('renders medical records search and list', async ({ page }) => {
      await page.goto('/portal/records', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(page.getByRole('heading', { name: /Search Records/i })).toBeVisible();

      await expect(page.getByText('Sarah J. Miller').first()).toBeVisible();
      await expect(page.getByText('Marcus V. Thorne')).toBeVisible();
      await expect(page.getByText('Elena Rodriguez')).toBeVisible();
    });

    test('renders active patient record detail view', async ({ page }) => {
      await page.goto('/portal/records', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(page.getByText('Active Patient Record')).toBeVisible();
      await expect(page.getByText('Dr. Julian Vance')).toBeVisible();
      await expect(page.getByText('BlueShield PPO')).toBeVisible();
    });

    test('renders conditions, allergies and snapshot data', async ({ page }) => {
      await page.goto('/portal/records', { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await expect(page.getByText('Type 1 Diabetes')).toBeVisible();
      await expect(page.getByText('Penicillin')).toBeVisible();
      await expect(page.getByText('Vitals & Labs Snapshot')).toBeVisible();
      await expect(page.getByText('118/76')).toBeVisible();
    });
  });

  test.describe('/portal/billing', () => {
    test('renders billing and invoice list', async ({ page }) => {
      await page.goto('/portal/billing', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'Billing', exact: true })).toBeVisible();

      await expect(page.getByText('Invoice HMS').first()).toBeVisible();
      await expect(page.getByText('Open Balance').first()).toBeVisible();
    });

    test('renders payment status', async ({ page }) => {
      await page.goto('/portal/billing', { waitUntil: 'domcontentloaded' });
      // Might say Paid or Pending
      await expect(page.locator('body')).toContainText(/Paid|Pending|Due/i);
    });
  });

  test.describe('/portal/lab-results', () => {
    test('renders lab results list', async ({ page }) => {
      await page.goto('/portal/lab-results', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Lab Results/i })).toBeVisible();
      // Should show test names or status
      await expect(page.locator('body')).toContainText(/Status/i);
    });
  });

  test.describe('/portal/messages', () => {
    test('renders inbox thread list', async ({ page }) => {
      await page.goto('/portal/messages', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
      await expect(page.getByText('Dr. Alistair Vance').first()).toBeVisible();
      await expect(page.getByText('System Administrator')).toBeVisible();
    });

    test('renders active message preview', async ({ page }) => {
      await page.goto('/portal/messages', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Follow-up: Lab results review/i }).first()).toBeVisible();
      await expect(page.getByText('Internal Medicine').first()).toBeVisible();
    });

    test('renders data monolith', async ({ page }) => {
      await page.goto('/portal/messages', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Messages are read-only')).toBeVisible();
      await expect(page.getByText(/Reply\/archive\/flag actions are not supported/i)).toBeVisible();
    });
  });

  test.describe('/portal/support', () => {
    test('renders support heading and guidance', async ({ page }) => {
      await page.goto('/portal/support', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Support/i })).toBeVisible();
    });

    test('renders honesty copy for appointment changes', async ({ page }) => {
      await page.goto('/portal/support', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByText(/contact the scheduling desk or call the hospital reception/i),
      ).toBeVisible();
    });

    test('does NOT render cancel or reschedule buttons', async ({ page }) => {
      await page.goto('/portal/support', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /cancel/i })).not.toBeVisible();
      await expect(page.getByRole('button', { name: /reschedule/i })).not.toBeVisible();
    });

    test('renders emergency guidance', async ({ page }) => {
      await page.goto('/portal/support', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(/not monitored for emergencies/i)).toBeVisible();
    });
  });

  test.describe('/portal/profile', () => {
    test('renders personal info form', async ({ page }) => {
      await page.goto('/portal/profile', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Patient Profile/i })).toBeVisible();
      await expect(page.getByText('Full Name')).toBeVisible();
      await expect(page.getByLabel('Full Name')).toHaveValue('Alexander Vance');
    });

    test('renders security settings', async ({ page }) => {
      await page.goto('/portal/profile', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Security Settings/i })).toBeVisible();
      await expect(page.getByText('Two-Factor Authentication')).toBeVisible();
    });

    test('renders emergency contact card', async ({ page }) => {
      await page.goto('/portal/profile', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Emergency Contact/i })).toBeVisible();
      await expect(page.getByText(/Emergency contact editing is not exposed/i)).toBeVisible();
    });

    test('renders global action footer', async ({ page }) => {
      await page.goto('/portal/profile', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /Save Changes/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Discard changes/i })).toBeVisible();
    });
  });
});
