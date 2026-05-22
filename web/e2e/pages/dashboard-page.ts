import { type Locator, type Page } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly kpiCards: Locator;
  readonly searchInput: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading");
    this.kpiCards = page.locator(".bg-hc-surface-container-low").filter({ hasText: "Active" }).first(); // generic matcher for cards
    this.searchInput = page.getByPlaceholder(/Search/i);
    this.tableRows = page.locator("tr.hc-row, tr.hover\\:bg-hc-surface-container-lowest").filter({ hasText: /.*/ });
  }

  async gotoStaffDashboard() {
    await this.page.goto("/staff/dashboard", { waitUntil: "domcontentloaded" });
  }

  async gotoAdminDashboard() {
    await this.page.goto("/admin/dashboard", { waitUntil: "domcontentloaded" });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async getKpiCount() {
    return await this.page.locator(".bg-hc-surface-container-low .text-4xl").count();
  }
}
