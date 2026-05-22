import { test, expect } from '@playwright/test';
import { installUiApiMocks } from '../helpers/ui-api-mocks';

test.describe('Staff Operations Pages (@ui)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });
    await installUiApiMocks(page);
  });

  test.describe('/staff/closures', () => {
    test('renders calendar and closures', async ({ page }) => {
      await page.goto('/staff/closures', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Special Closures/i })).toBeVisible();
    });

    test('renders closure entries', async ({ page }) => {
      await page.goto('/staff/closures', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('National Health Observance Day')).toBeVisible();
    });

    test('add closure form', async ({ page }) => {
      await page.goto('/staff/closures', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /CREATE_NEW_CLOSURE/i })).toBeVisible();
    });
  });

  test.describe('/staff/schedule', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        window.sessionStorage.setItem("hms_staff_role", "DOCTOR");
      });
    });
    test('renders schedule heading and day/week selector', async ({ page }) => {
      await page.goto('/staff/schedule', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /My Schedule/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /DAY/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /WEEK/i })).toBeVisible();
    });

    test('renders schedule appointments from API', async ({ page }) => {
      await page.goto('/staff/schedule', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Alexander Vance')).toBeVisible();
      await expect(page.getByText('Maria Chen')).toBeVisible();
    });

    test('renders date input for day view', async ({ page }) => {
      await page.goto('/staff/schedule', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('input[type="date"]')).toBeVisible();
    });
  });

  test.describe('/staff/lab-results', () => {
    test('renders lab results heading', async ({ page }) => {
      await page.goto('/staff/lab-results', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Laboratory Results/i })).toBeVisible();
    });

    test('renders lab result rows from API', async ({ page }) => {
      await page.goto('/staff/lab-results', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Complete Blood Count')).toBeVisible();
      await expect(page.getByText('Alexander Vance')).toBeVisible();
    });

    test('renders Record New Result button for admin', async ({ page }) => {
      await page.goto('/staff/lab-results', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('link', { name: /Record New Result/i })).toBeVisible();
    });

    test('review link navigates to detail', async ({ page }) => {
      await page.goto('/staff/lab-results', { waitUntil: 'domcontentloaded' });
      const reviewLink = page.getByRole('link', { name: /Review/i }).first();
      await expect(reviewLink).toBeVisible();
      await expect(reviewLink).toHaveAttribute('href', /\/staff\/lab-results\/staff-lr-1/);
    });
  });

  test.describe('/staff/slots', () => {
    test('renders slot operations', async ({ page }) => {
      await page.goto('/staff/slots', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Generate Service Slots/i })).toBeVisible();
    });

    test('renders slot generation form', async ({ page }) => {
      await page.goto('/staff/slots', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Start Date')).toBeVisible();
    });

    test('bulk generate action', async ({ page }) => {
      await page.goto('/staff/slots', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /EXECUTE GENERATION/i })).toBeVisible();
    });
  });

  test.describe('/staff/pricing', () => {
    test('renders pricing table', async ({ page }) => {
      await page.goto('/staff/pricing', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Pricing/i })).toBeVisible();
    });

    test('edit action', async ({ page }) => {
      await page.goto('/staff/pricing', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /Edit/i }).first()).toBeVisible();
    });
  });

  test.describe('/staff/revenue', () => {
    test('renders revenue dashboard charts', async ({ page }) => {
      await page.goto('/staff/revenue', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Revenue Monitor/i })).toBeVisible();
    });

    test('date filter', async ({ page }) => {
      await page.goto('/staff/revenue', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /DAILY/i })).toBeVisible();
    });
  });

  test.describe('/staff/invoices', () => {
    test('renders invoice list', async ({ page }) => {
      await page.goto('/staff/invoices', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Financial Ledger/i })).toBeVisible();
    });

    test('status filter', async ({ page }) => {
      await page.goto('/staff/invoices', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('combobox').first()).toBeVisible();
    });

    test('detail view', async ({ page }) => {
      await page.goto('/staff/invoices', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /Create Invoice/i })).toBeVisible();
    });
  });
});
