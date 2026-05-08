import { type Locator, type Page } from "@playwright/test";

export class QueuePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly board: Locator;
  readonly searchInput: Locator;
  readonly emptyState: Locator;
  readonly queueRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Queue Board" });
    this.board = page.getByTestId("queue-board");
    this.searchInput = page.getByPlaceholder(/FILTER QUEUE/i);
    this.emptyState = page.getByTestId("queue-empty");
    this.queueRows = page.getByTestId("queue-row");
  }

  async goto() {
    await this.page.goto("/staff/queue");
  }

  async filterByTab(tabName: "Waiting" | "Ready" | "In Progress" | "Completed" | "Skipped" | "All") {
    await this.page.getByRole("button", { name: tabName, exact: true }).click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async getQueueRowCount() {
    return await this.queueRows.count();
  }
}
