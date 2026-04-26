import { expect, type Page } from "@playwright/test";

export class BookingPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/booking");
  }

  async submitEmpty() {
    await this.page.getByRole("button", { name: /Continue To Slot Selection/i }).click();
  }

  async fillValidIntake() {
    await this.page.getByLabel("Full Name").fill("Nguyen Van Clinical");
    await this.page.getByLabel("Contact Number").fill("0901234567");
    await this.page.getByLabel("Email Address").fill("nguyen.van.clinical@example.com");
    await this.page
      .getByLabel("Primary Symptom Description")
      .fill("Mild headache and fatigue for two days.");
    await this.page.getByLabel("Acute fever").check();
  }

  async submit() {
    await this.page.getByRole("button", { name: /Continue To Slot Selection/i }).click();
  }

  async expectValidation() {
    await expect(
      this.page.getByText(
        /Full name, contact number, email address, and symptom description are required/i,
      ),
    ).toBeVisible();
  }
}
