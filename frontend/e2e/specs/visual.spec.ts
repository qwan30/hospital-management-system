import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { visualRoutes } from "../helpers/routes";
import {
  installExhaustiveApiMocks,
  seedRouteSession,
  type SeededRole,
} from "../helpers/exhaustive-route-contracts";

const VISUAL_BASELINE_TIME = new Date("2026-05-13T09:06:00+07:00");

test.describe("@visual visual baselines", () => {
  for (const route of visualRoutes) {
    test(`${route.label} visual baseline`, async ({ page }) => {
      await page.clock.setFixedTime(VISUAL_BASELINE_TIME);
      await installVisualStabilizers(page);
      await seedRouteSession(page, roleForVisualRoute(route.path));
      await installExhaustiveApiMocks(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route.path);
      await hideDevelopmentDiagnostics(page);
      await expect(page).toHaveScreenshot(`${route.label.replace(/\s+/g, "-")}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
});

function roleForVisualRoute(path: string): SeededRole | undefined {
  if (path.startsWith("/admin")) {
    return "ADMIN";
  }

  if (path === "/staff/schedule") {
    return "DOCTOR";
  }

  if (path.startsWith("/staff")) {
    return "ADMIN";
  }

  if (path.startsWith("/portal")) {
    return "PATIENT";
  }

  return undefined;
}

async function installVisualStabilizers(page: Page) {
  await page.addInitScript(() => {
    const hideElement = (element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.setProperty("display", "none", "important");
        element.style.setProperty("visibility", "hidden", "important");
        element.style.setProperty("opacity", "0", "important");
        element.style.setProperty("pointer-events", "none", "important");
      }
    };

    const shouldHideElement = (element: Element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      const label = element.getAttribute("aria-label") ?? "";
      const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
      const rect = element.getBoundingClientRect();
      const isLowerLeftBadge = rect.left < 180 && window.innerHeight - rect.bottom < 90;

      return (
        element.tagName.toLowerCase() === "nextjs-portal" ||
        element.hasAttribute("data-nextjs-toast") ||
        element.hasAttribute("data-nextjs-dialog") ||
        element.hasAttribute("data-nextjs-dev-tools-button") ||
        label.includes("Next.js") ||
        label.includes("Dev Tools") ||
        (isLowerLeftBadge && /Issue/i.test(text))
      );
    };

    const stabilizeTree = (root: Document | ShadowRoot) => {
      const styleId = "hms-visual-stabilizers";
      const styleHost = root instanceof Document ? document.head : root;
      const existingStyle = root instanceof Document ? document.getElementById(styleId) : root.getElementById(styleId);

      if (styleHost && !existingStyle) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          nextjs-portal,
          [data-nextjs-toast],
          [data-nextjs-dialog],
          [data-nextjs-dev-tools-button],
          [data-nextjs-dev-overlay],
          [data-nextjs-route-announcer],
          button[aria-label*="Next.js"],
          button[aria-label*="Dev Tools"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          * {
            caret-color: transparent !important;
          }
        `;
        styleHost.appendChild(style);
      }

      for (const element of Array.from(root.querySelectorAll("*"))) {
        if (shouldHideElement(element)) {
          hideElement(element);
        }

        const shadowRoot = (element as HTMLElement).shadowRoot;
        if (shadowRoot) {
          stabilizeTree(shadowRoot);
        }
      }
    };

    const run = () => stabilizeTree(document);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }

    const observer = new MutationObserver(run);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
}

async function hideDevelopmentDiagnostics(page: Page) {
  await page.evaluate(() => {
    const hideElement = (element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.setProperty("display", "none", "important");
        element.style.setProperty("visibility", "hidden", "important");
        element.style.setProperty("opacity", "0", "important");
        element.style.setProperty("pointer-events", "none", "important");
      }
    };

    const visit = (root: Document | ShadowRoot) => {
      for (const element of Array.from(root.querySelectorAll("*"))) {
        const label = element.getAttribute("aria-label") ?? "";
        const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
        const rect = element.getBoundingClientRect();
        const isLowerLeftBadge = rect.left < 180 && window.innerHeight - rect.bottom < 90;
        const isDevelopmentElement =
          element.tagName.toLowerCase() === "nextjs-portal" ||
          element.hasAttribute("data-nextjs-toast") ||
          element.hasAttribute("data-nextjs-dialog") ||
          element.hasAttribute("data-nextjs-dev-tools-button") ||
          label.includes("Next.js") ||
          label.includes("Dev Tools") ||
          (isLowerLeftBadge && /Issue/i.test(text));

        if (isDevelopmentElement) {
          hideElement(element);
        }

        const shadowRoot = (element as HTMLElement).shadowRoot;
        if (shadowRoot) {
          visit(shadowRoot);
        }
      }
    };

    visit(document);
  });
}
