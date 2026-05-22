import { expect, type Page } from "@playwright/test";

export class BookingPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/booking");
  }

  async submitEmpty() {
    await this.page.getByRole("button", { name: /Confirm Appointment/i }).click();
  }

  async fillValidIntake() {
    await this.selectFirstAvailableSlot();
    const patient = this.syntheticPatient();

    // 2. Fill personal details
    await this.page.locator("#booking-full-name").fill(patient.fullName);
    await this.page.locator("#booking-phone").fill("+84987654321");
    await this.page.locator("#booking-email").fill(patient.email);
    await this.page.locator("#booking-cccd").fill(patient.citizenId);
    await this.page.locator("#booking-dob").fill("1990-05-15");
    await this.page.locator("#booking-gender").selectOption("MALE");
    await this.page.locator("#booking-province").fill("Ho Chi Minh City");
    await this.page.locator("#booking-district").fill("District 1");
    await this.page.locator("#booking-street").fill("1 Nguyen Hue");

    // 3. Fill symptoms
    await this.page.locator("#booking-symptoms").fill("Mild headache and fatigue for two days.");
    await this.page.locator('input[value="Acute fever (>101 F)"]').check();
  }

  private async selectFirstAvailableSlot() {
    await this.page.locator("#booking-doctor").waitFor();
    const doctorSelect = this.page.locator("#booking-doctor");

    await this.page.waitForFunction(() => {
      const select = document.getElementById("booking-doctor") as HTMLSelectElement;
      return select && select.options.length > 1;
    });

    const doctorValues = await this.page.evaluate(() => {
      const select = document.getElementById("booking-doctor") as HTMLSelectElement;
      const values: string[] = [];
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value) {
          values.push(select.options[i].value);
        }
      }
      return values;
    });

    const dates = this.candidateAppointmentDates();
    const slotButton = this.page.getByRole("button", {
      name: /^\d{2}:\d{2}\s+-\s+\d{2}:\d{2}$/,
    });

    for (const doctorValue of doctorValues) {
      await doctorSelect.selectOption(doctorValue);

      for (const date of dates) {
        await this.page.locator("#booking-date").fill(date);
        await this.waitForSlotLoad();

        if ((await slotButton.count()) > 0) {
          await slotButton.first().click();
          return;
        }
      }
    }

    throw new Error("No release-demo doctor has an available appointment slot in the next 14 days.");
  }

  private async waitForSlotLoad() {
    await expect(this.page.getByText(/Loading available slots/i)).toBeHidden({ timeout: 5000 }).catch(() => {});
    await this.page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  }

  private candidateAppointmentDates() {
    return Array.from({ length: 15 }, (_, offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    });
  }

  private syntheticPatient() {
    const uniqueDigits = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`.slice(-10);
    return {
      fullName: `Public Booking ${uniqueDigits}`,
      email: `uat-public-${uniqueDigits}@example.com`,
      citizenId: `98${uniqueDigits}`,
    };
  }

  async submit() {
    await this.page.getByRole("button", { name: /Confirm Appointment/i }).click();
  }

  async expectValidation() {
    await expect(
      this.page.getByText(
        /Select a doctor and an available appointment slot before submitting|Complete all required patient, contact, address, and symptom fields/i,
      ),
    ).toBeVisible();
  }
}
