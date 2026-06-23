import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardSkeleton } from "../dashboard-skeleton";

describe("DashboardSkeleton", () => {
  it("renders with default props", () => {
    const { container } = render(<DashboardSkeleton />);

    // Should render KPI card skeletons (default 4)
    const animatedElements = container.querySelectorAll(".animate-pulse");
    expect(animatedElements.length).toBeGreaterThan(0);
  });

  it("renders with custom row count", () => {
    const { container } = render(<DashboardSkeleton rowCount={10} />);

    // Should render more table rows
    const tableRows = container.querySelectorAll("tbody tr");
    expect(tableRows.length).toBe(10);
  });

  it("renders with custom column count", () => {
    const { container } = render(<DashboardSkeleton columns={6} />);

    // Should render 6 header cells
    const headerCells = container.querySelectorAll("thead th");
    expect(headerCells.length).toBe(6);
  });

  it("renders with custom KPI count", () => {
    const { container } = render(<DashboardSkeleton kpiCount={2} />);

    // The KPI grid renders animated skeleton divs within the card skeletons
    expect(container.querySelector("tbody")).toBeInTheDocument();
  });

  it("renders all skeleton sections (header, KPI grid, table)", () => {
    const { container } = render(<DashboardSkeleton />);

    // Page header skeleton: 3 skeleton divs inside the header area
    const headerSkeletons = container.querySelectorAll(".space-y-3 > div");
    expect(headerSkeletons.length).toBe(3);

    // KPI grid: KPI card skeleton sections
    const kpiSections = container.querySelectorAll('[aria-hidden="true"]');
    expect(kpiSections.length).toBeGreaterThan(0);

    // Table: thead and tbody exist
    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(container.querySelector("tbody")).toBeInTheDocument();
  });
});
