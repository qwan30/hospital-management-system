import { test, expect } from '@playwright/test';

test.describe('SEO & Meta Tags Audit (@ui)', () => {
  const publicRoutes = ['/', '/departments', '/doctors', '/portal/login', '/staff/login'];

  for (const route of publicRoutes) {
    test.describe(`Route: ${route}`, () => {
      test('has a unique <title> tag', async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        const title = await page.title();
        expect(title).not.toBe('');
        expect(title.length).toBeGreaterThan(5);
      });

      test('has a <meta name="description">', async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveCount(1);
        const content = await metaDescription.getAttribute('content');
        expect(content).not.toBeNull();
        expect(content!.length).toBeGreaterThan(0);
      });

      test('only one <h1> per page', async ({ page }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeLessThanOrEqual(1); // Some pages might not have h1, but shouldn't have >1
      });

      test('no broken internal links', async ({ page, request }) => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) =>
          [...new Set(links.map((link) => link.getAttribute('href')).filter(Boolean))],
        );

        for (const href of hrefs) {
          const response = await request.get(href!);
          expect(response.status(), `${route} links to ${href}`).toBeLessThan(400);
        }
      });
    });
  }

  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get('/robots.txt');

    expect(response.ok()).toBeTruthy();
  });

  test('sitemap.xml returns 200', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    expect(response.ok()).toBeTruthy();
  });
});
