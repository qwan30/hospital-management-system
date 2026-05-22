const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname);

const publicPages = [
  { url: '/', name: 'public_home.png' },
  { url: '/home-classic', name: 'public_home-classic.png' },
  { url: '/home-variant', name: 'public_home-variant.png' },
  { url: '/departments', name: 'public_departments.png' },
  { url: '/doctors', name: 'public_doctors.png' },
  { url: '/booking', name: 'public_booking.png' },
  { url: '/news', name: 'public_news.png' },
  { url: '/privacy', name: 'public_privacy.png' },
  { url: '/terms', name: 'public_terms.png' },
  { url: '/security', name: 'public_security.png' },
  { url: '/session-expired', name: 'public_session-expired.png' },
  { url: '/forbidden', name: 'public_forbidden.png' },
  { url: '/staff/login', name: 'staff_login.png' },
  { url: '/portal/login', name: 'portal_login.png' },
  { url: '/portal/claim', name: 'portal_claim.png' }
];

const roles = [
  {
    role: 'Admin',
    email: 'admin@hospital.vn',
    password: 'Admin@1234',
    loginUrl: '/staff/login',
    pages: [
      { url: '/admin/dashboard', name: 'admin_dashboard.png' },
      { url: '/admin/users', name: 'admin_users.png' },
      { url: '/admin/audit-logs', name: 'admin_audit-logs.png' },
      { url: '/admin/appointments', name: 'admin_appointments.png' },
      { url: '/admin/departments', name: 'admin_departments.png' },
      { url: '/admin/knowledge', name: 'admin_knowledge.png' },
      { url: '/admin/monitoring', name: 'admin_monitoring.png' },
      { url: '/admin/news', name: 'admin_news.png' },
      { url: '/admin/public-content', name: 'admin_public-content.png' },
      { url: '/admin/rooms', name: 'admin_rooms.png' },
      { url: '/admin/schedule-templates', name: 'admin_schedule-templates.png' },
      { url: '/admin/slots', name: 'admin_slots.png' },
      { url: '/admin/special-closures', name: 'admin_special-closures.png' },
      { url: '/staff/dashboard', name: 'admin_staff-dashboard.png' },
      { url: '/staff/booking', name: 'admin_staff-booking.png' },
      { url: '/staff/queue', name: 'admin_staff-queue.png' },
      { url: '/staff/nurse-intake', name: 'admin_staff-nurse-intake.png' },
      { url: '/staff/vital-signs', name: 'admin_staff-vital-signs.png' },
      { url: '/staff/patients', name: 'admin_staff-patients.png' },
      { url: '/staff/doctor/dashboard', name: 'admin_staff-doctor-dashboard.png' },
      { url: '/staff/inventory', name: 'admin_staff-inventory.png' },
      { url: '/staff/invoices', name: 'admin_staff-invoices.png' },
      { url: '/staff/pricing', name: 'admin_staff-pricing.png' },
      { url: '/staff/revenue', name: 'admin_staff-revenue.png' },
      { url: '/staff/closures', name: 'admin_staff-closures.png' },
      { url: '/staff/slots', name: 'admin_staff-slots.png' },
      { url: '/staff/support', name: 'admin_staff-support.png' },
      { url: '/staff/assistant', name: 'admin_staff-assistant.png' },
      { url: '/staff/lab-results', name: 'admin_staff-lab-results.png' },
      { url: '/staff/prescriptions/preview', name: 'admin_staff-prescriptions-preview.png' },
    ]
  },
  {
    role: 'Doctor',
    email: 'doctor1@hospital.vn',
    password: 'Doctor@1234',
    loginUrl: '/staff/login',
    pages: [
      { url: '/staff/dashboard', name: 'doctor_dashboard.png' },
      { url: '/staff/doctor/dashboard', name: 'doctor_doctor-dashboard.png' },
      { url: '/staff/schedule', name: 'doctor_schedule.png' },
      { url: '/staff/patients', name: 'doctor_patients.png' },
      { url: '/staff/vital-signs', name: 'doctor_vital-signs.png' },
      { url: '/staff/lab-results', name: 'doctor_lab-results.png' },
      { url: '/staff/prescriptions/preview', name: 'doctor_prescriptions-preview.png' },
      { url: '/staff/support', name: 'doctor_support.png' },
      { url: '/staff/assistant', name: 'doctor_assistant.png' }
    ]
  },
  {
    role: 'Nurse',
    email: 'nurse@hospital.vn',
    password: 'Nurse@1234',
    loginUrl: '/staff/login',
    pages: [
      { url: '/staff/dashboard', name: 'nurse_dashboard.png' },
      { url: '/staff/booking', name: 'nurse_booking.png' },
      { url: '/staff/queue', name: 'nurse_queue.png' },
      { url: '/staff/nurse-intake', name: 'nurse_nurse-intake.png' },
      { url: '/staff/vital-signs', name: 'nurse_vital-signs.png' },
      { url: '/staff/lab-results', name: 'nurse_lab-results.png' },
      { url: '/staff/support', name: 'nurse_support.png' }
    ]
  },
  {
    role: 'Receptionist',
    email: 'receptionist@hospital.vn',
    password: 'Reception@1234',
    loginUrl: '/staff/login',
    pages: [
      { url: '/staff/dashboard', name: 'receptionist_dashboard.png' },
      { url: '/staff/booking', name: 'receptionist_booking.png' },
      { url: '/staff/queue', name: 'receptionist_queue.png' },
      { url: '/staff/support', name: 'receptionist_support.png' }
    ]
  },
  {
    role: 'Pharmacist',
    email: 'pharmacist@hospital.vn',
    password: 'Pharma@1234',
    loginUrl: '/staff/login',
    pages: [
      { url: '/staff/dashboard', name: 'pharmacist_dashboard.png' },
      { url: '/staff/inventory', name: 'pharmacist_inventory.png' },
      { url: '/staff/prescriptions/preview', name: 'pharmacist_prescriptions-preview.png' },
      { url: '/staff/support', name: 'pharmacist_support.png' }
    ]
  },
  {
    role: 'Accountant',
    email: 'accountant@hospital.vn',
    password: 'Acc@1234',
    loginUrl: '/staff/login',
    pages: [
      { url: '/staff/dashboard', name: 'accountant_dashboard.png' },
      { url: '/staff/invoices', name: 'accountant_invoices.png' },
      { url: '/staff/pricing', name: 'accountant_pricing.png' },
      { url: '/staff/revenue', name: 'accountant_revenue.png' },
      { url: '/admin/audit-logs', name: 'accountant_audit-logs.png' },
      { url: '/staff/support', name: 'accountant_support.png' }
    ]
  },
  {
    role: 'Patient',
    email: 'patient@example.com',
    password: 'Patient@1234',
    loginUrl: '/portal/login',
    pages: [
      { url: '/portal/overview', name: 'patient_overview.png' },
      { url: '/portal/appointments', name: 'patient_appointments.png' },
      { url: '/portal/scheduling', name: 'patient_scheduling.png' },
      { url: '/portal/records', name: 'patient_records.png' },
      { url: '/portal/lab-results', name: 'patient_lab-results.png' },
      { url: '/portal/diagnostics', name: 'patient_diagnostics.png' },
      { url: '/portal/messages', name: 'patient_messages.png' },
      { url: '/portal/billing', name: 'patient_billing.png' },
      { url: '/portal/pharmacy', name: 'patient_pharmacy.png' },
      { url: '/portal/inventory', name: 'patient_inventory.png' },
      { url: '/portal/patients', name: 'patient_patients.png' },
      { url: '/portal/staff', name: 'patient_staff.png' },
      { url: '/portal/profile', name: 'patient_profile.png' },
      { url: '/portal/support', name: 'patient_support.png' },
      { url: '/portal/admit', name: 'patient_admit.png' }
    ]
  }
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  console.log('Capturing Public Pages...');
  for (const p of publicPages) {
    try {
      console.log(`Navigating to ${p.url} -> ${p.name}`);
      await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle', timeout: 30000 });
      // Add a small delay for any animations
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(OUT_DIR, p.name), fullPage: true });
    } catch (err) {
      console.error(`Failed to capture ${p.url}: ${err.message}`);
    }
  }

  // Iterate over roles
  for (const r of roles) {
    console.log(`\nLogging in as ${r.role} (${r.email})...`);

    // Clear cookies/state for new login
    await context.clearCookies();

    try {
      await page.goto(`${BASE_URL}${r.loginUrl}`, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for email and password inputs
      await page.fill('input[type="email"], input[name="email"]', r.email);
      await page.fill('input[type="password"], input[name="password"]', r.password);
      await page.click('button[type="submit"]');

      // Wait for navigation after login
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(e => {
        // sometimes no navigation happens immediately or it's a client-side route
        console.log(`Wait for navigation timed out for ${r.role}, continuing...`);
      });
      await page.waitForTimeout(2000);

      console.log(`Capturing pages for ${r.role}...`);
      for (const p of r.pages) {
        console.log(`Navigating to ${p.url} -> ${p.name}`);
        await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(OUT_DIR, p.name), fullPage: true });
      }

      // Attempt to logout or clear cookies instead
      console.log(`Logging out ${r.role}...`);
      await context.clearCookies();
    } catch (err) {
      console.error(`Failed during role ${r.role}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Done!');
}

captureScreenshots().catch(console.error);
