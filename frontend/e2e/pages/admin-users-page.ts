import { type Locator, type Page } from "@playwright/test";

export class AdminUsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addUserButton: Locator;
  readonly searchInput: Locator;
  readonly tableRows: Locator;
  readonly roleFilter: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Staff Directory" });
    this.addUserButton = page.getByRole("button", { name: /Add User/i });
    this.searchInput = page.getByPlaceholder(/Search by name/i);
    this.tableRows = page.locator("tbody tr");
    this.roleFilter = page.locator("select").filter({ hasText: /Role:/i });
    this.statusFilter = page.locator("select").filter({ hasText: /Status:/i });
  }

  async goto() {
    await this.page.goto("/admin/users");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async getTableRowCount() {
    return await this.tableRows.count();
  }
}
