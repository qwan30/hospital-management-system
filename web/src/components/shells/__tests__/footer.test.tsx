import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HmsFooter } from "../footer";

describe("HmsFooter", () => {
  it("renders policy and security links", () => {
    render(<HmsFooter />);

    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(screen.getByRole("link", { name: /security audit/i })).toHaveAttribute(
      "href",
      "/security",
    );
  });
});
