import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataPanel } from "../data-panel";

describe("DataPanel", () => {
  it("renders optional title, action, filters, footer, and custom classes", () => {
    render(
      <DataPanel
        title="Inventory"
        action={<button type="button">Add item</button>}
        filters={<label htmlFor="q">Search</label>}
        footer={<span>Showing 1 result</span>}
        className="custom-panel"
      >
        <p>Bandage</p>
      </DataPanel>,
    );

    expect(screen.getByRole("heading", { name: "Inventory" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 result")).toBeInTheDocument();
    expect(screen.getByText("Bandage").closest("section")).toHaveClass("custom-panel");
  });

  it("supports action-only and body-only panel variants", () => {
    const { rerender } = render(
      <DataPanel action={<button type="button">Refresh</button>}>
        <p>Operational data</p>
      </DataPanel>,
    );

    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();

    rerender(
      <DataPanel>
        <p>Body only</p>
      </DataPanel>,
    );

    expect(screen.getByText("Body only")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refresh" })).not.toBeInTheDocument();
  });
});
