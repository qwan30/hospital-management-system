import { test, expect } from '@playwright/test';

test.describe('Portal Pages (@ui)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as PATIENT
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_patient_access_token", "patient-token");
      window.sessionStorage.setItem("hms_patient_role", "PATIENT");
    });
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
      await expect(page.getByText('Total YTD Appointments')).toBeVisible();
      await expect(page.getByText('Telehealth Ready')).toBeVisible();
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
});
