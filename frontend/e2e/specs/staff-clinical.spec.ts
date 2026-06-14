import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import { apiURL } from '../helpers/backend';
import { staffPersonas } from '../helpers/personas';

test.describe('Staff Clinical Pages (@ui)', () => {
  test.beforeEach(async ({ page, request }) => {
    await seedStaffSession(page, request);
  });

  test.describe('/staff/dashboard', () => {
    test('renders KPI stats cards correctly', async ({ page }) => {
      await page.goto('/staff/dashboard', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Clinical Operations Dashboard')).toBeVisible();
      await expect(page.getByText('Active Rounds')).toBeVisible();
      await expect(page.getByText('Critical Alerts')).toBeVisible();
      await expect(page.getByText('Wait Time Avg')).toBeVisible();
      await expect(page.getByText('Pending Lab Reports')).toBeVisible();
    });

    test('loads the dashboard charts/visualization layer', async ({ page }) => {
      await page.goto('/staff/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Laboratory Queue Trends')).toBeVisible();
      await expect(page.getByRole('combobox', { name: /Laboratory queue trend range/i })).toBeVisible();
      await expect(page.getByText('Staffing Overview')).toBeVisible();
    });

    test('renders the recent activity / high density table', async ({ page }) => {
      await page.goto('/staff/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Elena Rodriguez').first()).toBeVisible();
      await expect(page.getByText('James T. Kendrick').first()).toBeVisible();
    });
  });

  test.describe('/staff/medical-records/[id]/edit', () => {
    test('loads the record editor with patient details', async ({ page, request }) => {
      await page.goto(await medicalRecordPath(request), { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'Patient Record Entry' })).toBeVisible();
      await expect(page.getByText('Primary Diagnosis')).toBeVisible();
      await expect(page.getByText('Subject Profile')).toBeVisible();
      await expect(page.getByText('Doctor')).toBeVisible();
    });

    test('displays the vitals section and clinical notes', async ({ page, request }) => {
      await page.goto(await medicalRecordPath(request), { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Blood Pressure')).toBeVisible();
      await expect(page.getByText('Temperature')).toBeVisible();
      await expect(page.getByText('Clinical Observation & Subjective Notes')).toBeVisible();
    });

    test('displays active prescriptions table', async ({ page, request }) => {
      await page.goto(await medicalRecordPath(request), { waitUntil: 'domcontentloaded' });
      await expect(page.getByText('Active Prescriptions & Medication Orders')).toBeVisible();
      await expect(page.getByRole('button', { name: /ADD MEDICATION/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Medication' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Dosage' })).toBeVisible();
    });

    test('allows interacting with the save/commit action', async ({ page, request }) => {
      await page.goto(await medicalRecordPath(request), { waitUntil: 'domcontentloaded' });
      const commitBtn = page.getByRole('button', { name: /Commit Record/i });
      await expect(commitBtn).toBeVisible();
      await commitBtn.hover();
    });
  });

  test.describe('/staff/nurse-intake', () => {
    test('renders the intake board and KPIs', async ({ page }) => {
      await page.goto('/staff/nurse-intake', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Intake Board/i })).toBeVisible();
      await expect(page.getByText('Waiting For Intake')).toBeVisible();
      await expect(page.getByText('In Consultation')).toBeVisible();
      await expect(page.getByText('Physicians Covered')).toBeVisible();
    });

    test('renders the patient queue groups', async ({ page }) => {
      await page.goto('/staff/nurse-intake', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: "Today's Intake Queue" })).toBeVisible();
      await expect(page.getByText(/Nguyen Van Clinical|Tran Thi Queue|Le Van Imaging|No checked-in/i).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Selected Patient' })).toBeVisible();
    });

    test('renders the triage form/selected patient card', async ({ page }) => {
      await page.goto('/staff/nurse-intake', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'Selected Patient' })).toBeVisible();
      await expect(page.getByRole('link', { name: /Open Vitals Recording/i })).toBeVisible();
      await expect(page.getByText('Vitals are saved through the appointment vital-signs API.')).toBeVisible();
    });
  });

  test.describe('/staff/vital-signs', () => {
    test('renders the vital signs editor with patient context', async ({ page }) => {
      await page.goto('/staff/vital-signs', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: 'Vital Signs Recording' })).toBeVisible();
      await expect(page.getByText('Eligible Patients')).toBeVisible();
      await expect(page.getByText('Current Patient')).toBeVisible();
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

async function seedStaffSession(page: Page, request: APIRequestContext) {
  const token = await staffToken(request);
  await page.addInitScript((accessToken) => {
    window.sessionStorage.setItem("hms_staff_access_token", accessToken);
    window.sessionStorage.setItem("hms_staff_role", "ADMIN");
  }, token);
}

async function medicalRecordPath(request: APIRequestContext) {
  const token = await staffToken(request);
  const response = await request.get(`${apiURL}/appointments/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBe(true);

  const payload = await response.json();
  const appointment = payload.data.find((item: { appointmentId: string; status: string }) =>
    ["CHECKED_IN", "IN_PROGRESS", "DONE"].includes(item.status),
  );
  expect(appointment, "recordable release-demo appointment").toBeTruthy();

  return `/staff/medical-records/${appointment.appointmentId}/edit`;
}

async function staffToken(request: APIRequestContext) {
  const response = await request.post(`${apiURL}/auth/login`, {
    data: {
      email: staffPersonas.admin.email,
      password: staffPersonas.admin.password,
    },
  });
  expect(response.ok()).toBe(true);
  const payload = await response.json();
  return payload.data.tokens.accessToken as string;
}
