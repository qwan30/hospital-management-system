import { test, expect } from '@playwright/test';
import { installUiApiMocks } from '../helpers/ui-api-mocks';

test.describe('Admin Pages (@ui)', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as ADMIN
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "admin-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });
    await installUiApiMocks(page);
  });

  test.describe('/admin/dashboard', () => {
    test('renders stats summary correctly', async ({ page }) => {
      await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('heading', { name: /Admin Statistics/i })).toBeVisible();
      await expect(page.getByText('Total Patients')).toBeVisible();
      await expect(page.getByText('12,842')).toBeVisible();

      await expect(page.getByText('Gross Revenue')).toBeVisible();
      await expect(page.getByText('$1.24M')).toBeVisible();

      await expect(page.getByText('Active Staff')).toBeVisible();
      await expect(page.getByText('412')).toBeVisible();
    });

    test('renders charts and performance metrics', async ({ page }) => {
      await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Appointment Velocity').first()).toBeVisible();
      await expect(page.getByText('Pending Confirmations')).toBeVisible();
      await expect(page.getByText('28')).toBeVisible();

      await expect(page.getByText('System Controls')).toBeVisible();
      await expect(page.getByText('Live Monitoring')).toBeVisible();
    });

    test('renders security logs and alerts', async ({ page }) => {
      await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Security & Logs/i })).toBeVisible();
      await expect(page.getByText(/Unauthorized access attempt blocked/i)).toBeVisible();
      await expect(page.getByText(/Server maintenance completed successfully/i)).toBeVisible();
    });
  });

  test.describe('/admin/users', () => {
    test('renders user table with staff members', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Staff Directory/i })).toBeVisible();

      await expect(page.getByText('Sarah Kingston')).toBeVisible();
      await expect(page.getByText('Marcus Bennett')).toBeVisible();
      await expect(page.getByText('Elena Lopez')).toBeVisible();
    });

    test('renders search and filter controls', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      await expect(page.getByPlaceholder(/Search by name/i)).toBeVisible();
      await expect(page.locator('select').first()).toBeVisible();
    });

    test('has create user button', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /Add User/i })).toBeVisible();
    });

    test('renders pagination controls', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(/3 of 3 staff members/i)).toBeVisible();
      await expect(page.getByText(/Passwords are not exposed/i)).toBeVisible();
    });
  });

  test.describe('/admin/users/[id]', () => {
    test('renders user detail view', async ({ page }) => {
      await page.goto('/admin/users/MC-0842', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Staff Directory/i })).toBeVisible();
      await expect(page.getByLabel('Full Name')).toHaveValue('Sarah Jenkins');
      await expect(page.getByLabel('Specialty')).toHaveValue('Interventional Cardiology');
    });

    test('renders API-backed detail form', async ({ page }) => {
      await page.goto('/admin/users/MC-0842', { waitUntil: 'domcontentloaded' });
      await expect(page.getByLabel('Full Name')).toHaveValue('Sarah Jenkins');
      await expect(page.getByLabel('Email')).toHaveValue('sarah.jenkins@hospital-core.test');
      await expect(page.getByText('Cardiology')).toBeVisible();
    });

    test('renders action buttons', async ({ page }) => {
      await page.goto('/admin/users/MC-0842', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /Save User/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Deactivate User/i })).toBeVisible();
    });
  });

  test.describe('/admin/departments', () => {
    test('renders department list and doctor counts', async ({ page }) => {
      await page.goto('/admin/departments', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Departments/i })).toBeVisible();
      // Look for standard departments
      await expect(page.getByText('Cardiology').first()).toBeVisible();
      await expect(page.getByText('Neurology').first()).toBeVisible();
    });

    test('renders search input', async ({ page }) => {
      await page.goto('/admin/departments', { waitUntil: 'domcontentloaded' });
      await expect(page.getByPlaceholder(/Search by name/i)).toBeVisible();
    });
  });

  test.describe('/admin/rooms', () => {
    test('renders room list and availability', async ({ page }) => {
      await page.goto('/admin/rooms', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Room Inventory|Rooms/i })).toBeVisible();
      await expect(page.getByText('Room ID').first()).toBeVisible();
    });

    test('renders create room button', async ({ page }) => {
      await page.goto('/admin/rooms', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /Add Room/i })).toBeVisible();
    });
  });

  test.describe('/admin/news', () => {
    test('renders news list and publish toggles', async ({ page }) => {
      await page.goto('/admin/news', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /News/i })).toBeVisible();
      // Just check if a table or list appears
      await expect(page.getByRole('button', { name: /Create/i })).toBeVisible();
    });
  });
  test.describe('/admin/appointments', () => {
    test('renders appointment queue and stats', async ({ page }) => {
      await page.goto('/admin/appointments', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Appointment Management/i })).toBeVisible();

      await expect(page.getByText('Today Total')).toBeVisible();
      await expect(page.getByText('Checked-in').first()).toBeVisible();

      await expect(page.getByText('APT-99214')).toBeVisible();
      await expect(page.getByText('Ariana M.')).toBeVisible();
    });

    test('renders create appointment button', async ({ page }) => {
      await page.goto('/admin/appointments', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /New Appointment/i })).toBeVisible();
    });
  });

  test.describe('/admin/public-content', () => {
    test('renders public content list and controls', async ({ page }) => {
      await page.goto('/admin/public-content', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Public Content/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Create Section/i })).toBeVisible();
      await expect(page.getByPlaceholder(/Search sections.../i)).toBeVisible();
    });
  });
});
