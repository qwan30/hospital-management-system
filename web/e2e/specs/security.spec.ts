import { test, expect } from '@playwright/test';

test.describe('Security smoke tests (@ui)', () => {
  test('Session tokens not in URL (query params)', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });
    // Check that after loading the dashboard, URL has no token
    await page.goto('/staff/dashboard', { waitUntil: 'domcontentloaded' });

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('token=');
    expect(currentUrl).not.toContain('access_token=');
  });

  test('sessionStorage cleared after logout', async ({ page }) => {
    // Inject mock session
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "mock-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });

    await page.goto('/auth/logout', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/staff\/login/);

    // Expect session storage to be cleared
    const token = await page.evaluate(() => window.sessionStorage.getItem("hms_staff_access_token"));
    expect(token).toBeNull();
  });

  test('No sensitive data in HTML source for public pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const htmlContent = await page.content();

    expect(htmlContent).not.toContain('hms_staff_access_token');
    expect(htmlContent).not.toContain('ADMIN_SECRET');
  });

  test('security headers are present on public pages', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();

    expect(response.ok()).toBeTruthy();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');

  });

  test.skip('HTTPS redirect is verified only against staging or production ingress', async () => {
    // Local Next dev runs over HTTP; validate HTTPS redirects at ingress.
  });
});
