import { render, screen } from "@testing-library/react";
import { defaultPublicHomePageContent } from "./public-home.content";
import { PublicHomePage } from "./public-home-page";

describe("PublicHomePage", () => {
  it("renders the Pencil hero and primary sections", () => {
    render(<PublicHomePage content={defaultPublicHomePageContent} />);

    expect(
      screen.getByRole("heading", {
        name: /a sanctuary of\s+clinical precision/i
      })
    ).toBeTruthy();

    expect(
      screen.getByRole("heading", {
        name: /centers of excellence/i
      })
    ).toBeTruthy();

    expect(
      screen.getByRole("heading", {
        name: /our leading practitioners/i
      })
    ).toBeTruthy();

    expect(
      screen.getByRole("heading", {
        name: /latest from the atelier\s+journal/i
      })
    ).toBeTruthy();

    expect(
      screen.getByRole("img", { name: /clinical atelier care interior/i })
    ).toBeTruthy();
  });

  it("renders all designed department and practitioner cards", () => {
    render(<PublicHomePage content={defaultPublicHomePageContent} />);

    expect(screen.getByRole("heading", { name: /cardiology/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /pediatrics/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /neurology/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /orthopedics/i })).toBeTruthy();

    expect(
      screen.getByRole("heading", { name: /dr\. sarah chen/i })
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /dr\. julian vane/i })
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: /dr\. elena rossi/i })
    ).toBeTruthy();

    expect(screen.getByRole("img", { name: /dr\. sarah chen/i })).toBeTruthy();
    expect(screen.getByRole("img", { name: /dr\. julian vane/i })).toBeTruthy();
    expect(screen.getByRole("img", { name: /dr\. elena rossi/i })).toBeTruthy();
  });
});
