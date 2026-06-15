import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "../page-header";

describe("PageHeader", () => {
  it("renders with title only", () => {
    render(<PageHeader title="Dashboard" />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders with title and action button", () => {
    render(
      <PageHeader
        title="Patients"
        action={<button type="button">Add Patient</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Patients" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Patient" })).toBeInTheDocument();
  });

  it("renders with title, description, and action", () => {
    render(
      <PageHeader
        title="Appointments"
        description="Manage all patient appointments"
        action={<button type="button">New Appointment</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Appointments" })).toBeInTheDocument();
    expect(screen.getByText("Manage all patient appointments")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New Appointment" })).toBeInTheDocument();
  });

  it("renders with category label", () => {
    render(
      <PageHeader
        title="Reports"
        categoryLabel="Analytics"
      />,
    );

    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(
      <PageHeader title="Settings" className="custom-class" />,
    );

    const header = screen.getByRole("heading", { name: "Settings" }).closest("header");
    expect(header).toHaveClass("custom-class");
  });

  it("renders without description by default", () => {
    render(<PageHeader title="No Description" />);

    expect(screen.getByRole("heading", { name: "No Description" })).toBeInTheDocument();
  });
});
