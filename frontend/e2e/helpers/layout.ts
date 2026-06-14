import { expect, type Page } from "@playwright/test";

export async function expectStableLayout(page: Page) {
  const metrics = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const visibleControls = Array.from(
      document.querySelectorAll("button, a, input, select, textarea"),
    ).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none"
      );
    });

    const tinyControls = visibleControls.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width < 16 || rect.height < 16;
    });

    return {
      horizontalOverflow:
        documentElement.scrollWidth - documentElement.clientWidth,
      bodyHorizontalOverflow: body.scrollWidth - body.clientWidth,
      tinyControls: tinyControls.length,
    };
  });

  expect(metrics.horizontalOverflow, "document horizontal overflow").toBeLessThanOrEqual(2);
  expect(metrics.bodyHorizontalOverflow, "body horizontal overflow").toBeLessThanOrEqual(2);
  expect(metrics.tinyControls, "visible controls smaller than 16px").toBe(0);
}

export async function expectNoNextErrorOverlay(page: Page) {
  await expect(page.getByText(/Unhandled Runtime Error|Build Error|Application error/i)).toHaveCount(0);
}
