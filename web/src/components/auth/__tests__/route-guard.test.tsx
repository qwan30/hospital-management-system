import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouteGuard } from "../route-guard";

const replace = vi.fn();
const navigationState = vi.hoisted(() => ({
  pathname: "/staff/queue",
}));
const roleState = vi.hoisted(() => ({
  hydrated: true,
  role: "RECEPTIONIST" as string | null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/use-stored-role", () => ({
  useHydrated: () => roleState.hydrated,
  useStoredRole: () => roleState.role,
}));

describe("RouteGuard", () => {
  beforeEach(() => {
    replace.mockClear();
    navigationState.pathname = "/staff/queue";
    roleState.hydrated = true;
    roleState.role = "RECEPTIONIST";
  });

  it("renders protected content when the stored role is allowed", () => {
    render(
      <RouteGuard scope="staff">
        <div>Queue board content</div>
      </RouteGuard>,
    );

    expect(screen.getByText("Queue board content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated staff users to staff login", async () => {
    roleState.role = null;

    render(
      <RouteGuard scope="staff">
        <div>Queue board content</div>
      </RouteGuard>,
    );

    expect(screen.queryByText("Queue board content")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/staff/login"));
  });

  it("redirects unauthorized roles to forbidden", async () => {
    roleState.role = "PHARMACIST";

    render(
      <RouteGuard scope="staff">
        <div>Queue board content</div>
      </RouteGuard>,
    );

    expect(screen.queryByText("Queue board content")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/forbidden"));
  });

  it("renders nothing before hydration completes", () => {
    roleState.hydrated = false;

    render(
      <RouteGuard scope="staff">
        <div>Queue board content</div>
      </RouteGuard>,
    );

    expect(screen.queryByText("Queue board content")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
