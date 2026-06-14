import { expect, type Page } from "@playwright/test";

export class StaffLoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/staff/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: /Log in to Clinical Suite/i }).click();
  }

  async expectError() {
    await expect(this.page.getByRole("alert").filter({ hasText: /./ }).first()).toBeVisible();
  }
}

export class PortalLoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/portal/login");
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: /^Log in/i }).click();
  }

  async expectError() {
    await expect(this.page.getByRole("alert").filter({ hasText: /./ }).first()).toBeVisible();
  }
}
