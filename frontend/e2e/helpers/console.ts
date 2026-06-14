import type { Page } from "@playwright/test";

const ignoredConsolePatterns = [
  /Download the React DevTools/i,
  /\[HMR\]/i,
  /\[Fast Refresh\]/i,
  /was detected as the Largest Contentful Paint/i,
];

export function collectConsoleProblems(page: Page) {
  const problems: string[] = [];

  page.on("console", (message) => {
    if (!["error", "warning"].includes(message.type())) {
      return;
    }

    const text = message.text();
    if (ignoredConsolePatterns.some((pattern) => pattern.test(text))) {
      return;
    }

    problems.push(`[${message.type()}] ${text}`);
  });

  page.on("pageerror", (error) => {
    problems.push(`[pageerror] ${error.message}`);
  });

  return problems;
}
