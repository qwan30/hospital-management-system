import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("Tabs", () => {
  it("renders all tab triggers", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
          <TabsTrigger value="tab3">Tab Three</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content one</TabsContent>
        <TabsContent value="tab2">Content two</TabsContent>
        <TabsContent value="tab3">Content three</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Tab One")).toBeInTheDocument();
    expect(screen.getByText("Tab Two")).toBeInTheDocument();
    expect(screen.getByText("Tab Three")).toBeInTheDocument();
  });

  it("shows default tab content on initial render", () => {
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content one</TabsContent>
        <TabsContent value="tab2">Content two</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Content two")).toBeInTheDocument();
  });

  it("switches active tab on trigger click", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content one</TabsContent>
        <TabsContent value="tab2">Content two</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Content one")).toBeInTheDocument();
    expect(screen.queryByText("Content two")).not.toBeInTheDocument();

    await user.click(screen.getByText("Tab Two"));

    expect(screen.getByText("Content two")).toBeInTheDocument();
    expect(screen.queryByText("Content one")).not.toBeInTheDocument();
  });

  it("handles single tab gracefully", () => {
    render(
      <Tabs defaultValue="only">
        <TabsList>
          <TabsTrigger value="only">Only Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="only">Only content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Only Tab")).toBeInTheDocument();
    expect(screen.getByText("Only content")).toBeInTheDocument();
  });

  it("renders without crashing when defaultValue is not in the content list", () => {
    render(
      <Tabs defaultValue="nonexistent">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content one</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Tab One")).toBeInTheDocument();
  });

  it("renders with custom className on tabs root", () => {
    render(
      <Tabs className="custom-class" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );

    const root = document.querySelector('[data-slot="tabs"]');
    expect(root).toHaveClass("custom-class");
  });

  it("renders with line variant", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList variant="line">
          <TabsTrigger value="tab1">Line Tab</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>,
    );

    const list = document.querySelector('[data-slot="tabs-list"]');
    expect(list).toHaveAttribute("data-variant", "line");
  });
});
