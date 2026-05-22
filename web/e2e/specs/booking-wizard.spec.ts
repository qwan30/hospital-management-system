import { test, expect } from '@playwright/test';

test.describe('Staff booking page smoke (@ui)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as RECEPTIONIST for booking wizard
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "RECEPTIONIST");
    });
  });

  test('Symptoms entry page renders the primary action', async ({ page }) => {
    await page.goto('/staff/booking', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Booking/i }).first()).toBeVisible();

    await expect(page.getByRole('button', { name: /Next:/i })).toBeVisible();
  });

  test('Symptoms intake page renders required input', async ({ page }) => {
    await page.goto('/staff/booking/symptoms', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Symptoms/i })).toBeVisible();

    // Expect form inputs
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  test('Slot selection page renders available choices', async ({ page }) => {
    await page.goto('/staff/booking/slots', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Schedule Appointment|Slots|Select/i })).toBeVisible();

    // Expect some calendar or slot view
    await expect(page.getByText(/Available/i).first()).toBeVisible();
  });

  test('Review page renders confirmation action', async ({ page }) => {
    await page.goto('/staff/booking/review', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Review/i })).toBeVisible();

    // Check confirmation action
    await expect(page.getByRole('button', { name: /Confirm/i })).toBeVisible();
  });

  test('Success page renders return action', async ({ page }) => {
    await page.goto('/staff/booking/success', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Booking confirmed|Success/i })).toBeVisible();

    // Check action to return
    await expect(page.getByRole('button', { name: /Return|Back|Done|Go Home/i })).toBeVisible();
  });
});
