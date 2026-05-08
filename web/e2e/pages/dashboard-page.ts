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
    this.kpiCards = page.locator(".bg-hms-surface-container-low").filter({ hasText: "Active" }).first(); // generic matcher for cards
    this.searchInput = page.getByPlaceholder(/Search/i);
    this.tableRows = page.locator("tr.hms-row, tr.hover\\:bg-hms-surface-container-lowest").filter({ hasText: /.*/ });
  }

  async gotoStaffDashboard() {
    await this.page.goto("/staff/dashboard");
  }

  async gotoAdminDashboard() {
    await this.page.goto("/admin/dashboard");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async getKpiCount() {
    return await this.page.locator(".bg-hms-surface-container-low .text-4xl").count();
  }
}
