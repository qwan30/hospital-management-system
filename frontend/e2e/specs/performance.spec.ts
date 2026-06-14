import { test, expect } from '@playwright/test';

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

test.describe.skip('Performance metrics exploratory (@exploratory)', () => {
  // Using Playwright's built-in performance APIs to get basic metrics
  // Full Lighthouse runs usually require @playwright/lighthouse

  test('Public home - LCP < 3s', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Evaluate LCP using PerformanceObserver
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcpValue = lastEntry.startTime;
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Timeout to resolve if event doesn't fire immediately
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 3000);
      });
    });

    expect(lcp).toBeGreaterThan(0);
    expect(lcp).toBeLessThan(3000);
  });

  test('Staff dashboard navigation completes under local smoke threshold', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_staff_access_token", "staff-token");
      window.sessionStorage.setItem("hms_staff_role", "ADMIN");
    });

    const startTime = Date.now();
    await page.goto('/staff/dashboard', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(4000); // Including network roundtrip overhead locally
  });

  test('Portal overview navigation completes under local smoke threshold', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("hms_patient_access_token", "patient-token");
      window.sessionStorage.setItem("hms_patient_role", "PATIENT");
    });

    const startTime = Date.now();
    await page.goto('/portal/overview', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(4000);
  });

  test('No layout shift on public home (CLS < 0.1)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as LayoutShiftEntry;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 2000);
      });
    });

    expect(cls).toBeLessThan(0.1);
  });
});
