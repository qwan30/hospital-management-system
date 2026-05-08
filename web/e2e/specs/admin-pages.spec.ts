import { test, expect } from '@playwright/test';

test.describe('Admin Pages (@ui)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as ADMIN
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "admin-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });
  });

  test.describe('/admin/dashboard', () => {
    test('renders stats summary correctly', async ({ page }) => {
      await page.goto('/admin/dashboard');
      
      await expect(page.getByRole('heading', { name: /Admin Statistics/i })).toBeVisible();
      await expect(page.getByText('Total Patients')).toBeVisible();
      await expect(page.getByText('12,842')).toBeVisible();
      
      await expect(page.getByText('Gross Revenue')).toBeVisible();
      await expect(page.getByText('$1.24M')).toBeVisible();
      
      await expect(page.getByText('Active Staff')).toBeVisible();
      await expect(page.getByText('412')).toBeVisible();
    });

    test('renders charts and performance metrics', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page.getByText('Appointment Velocity')).toBeVisible();
      await expect(page.getByText('Pending Confirmations')).toBeVisible();
      await expect(page.getByText('28')).toBeVisible();
      
      await expect(page.getByText('System Controls')).toBeVisible();
      await expect(page.getByText('Real-time Monitoring')).toBeVisible();
    });

    test('renders security logs and alerts', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page.getByRole('heading', { name: /Security & Logs/i })).toBeVisible();
      await expect(page.getByText(/Unauthorized access attempt blocked/i)).toBeVisible();
      await expect(page.getByText(/Server maintenance completed successfully/i)).toBeVisible();
    });
  });

  test.describe('/admin/users', () => {
    test('renders user table with staff members', async ({ page }) => {
      await page.goto('/admin/users');
      await expect(page.getByRole('heading', { name: /Staff Directory/i })).toBeVisible();
      
      await expect(page.getByText('Sarah Kingston')).toBeVisible();
      await expect(page.getByText('Marcus Bennett')).toBeVisible();
      await expect(page.getByText('Elena Lopez')).toBeVisible();
    });

    test('renders search and filter controls', async ({ page }) => {
      await page.goto('/admin/users');
      await expect(page.getByPlaceholder(/Search by name, email or ID/i)).toBeVisible();
      await expect(page.locator('select').first()).toBeVisible();
    });

    test('has create user button', async ({ page }) => {
      await page.goto('/admin/users');
      await expect(page.getByRole('button', { name: /Add User/i })).toBeVisible();
    });

    test('renders pagination controls', async ({ page }) => {
      await page.goto('/admin/users');
      await expect(page.getByText(/Showing 1-10 of 142 Staff members/i)).toBeVisible();
      await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible();
    });
  });

  test.describe('/admin/users/[id]', () => {
    test('renders user detail view', async ({ page }) => {
      await page.goto('/admin/users/MC-0842');
      await expect(page.getByRole('heading', { name: /Staff Directory/i })).toBeVisible();
      await expect(page.getByText('Sarah Jenkins')).toBeVisible();
      await expect(page.getByText('Marcus Vance')).toBeVisible();
    });

    test('renders detail grid bento style', async ({ page }) => {
      await page.goto('/admin/users/MC-0842');
      await expect(page.getByText('TOTAL STAFF')).toBeVisible();
      await expect(page.getByText('128')).toBeVisible();
      await expect(page.getByText('ON SHIFT')).toBeVisible();
      await expect(page.getByText('SYSTEM UPTIME')).toBeVisible();
      await expect(page.getByText('99.98%')).toBeVisible();
    });

    test('renders action buttons', async ({ page }) => {
      await page.goto('/admin/users/MC-0842');
      await expect(page.getByRole('button', { name: /EXPORT CSV/i })).toBeVisible();
      const editBtns = page.getByRole('button', { name: /EDIT/i });
      await expect(editBtns.first()).toBeVisible();
    });
  });
});
