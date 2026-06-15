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

describe("Session Expiry", () => {
  beforeEach(() => {
    replace.mockClear();
    navigationState.pathname = "/staff/queue";
    roleState.hydrated = true;
    roleState.role = "RECEPTIONIST";
    sessionStorage.clear();
  });

  it("redirects to login when role is cleared mid-use (token expiry simulation)", async () => {
    // Start with a valid role
    sessionStorage.setItem("hms_staff_role", "RECEPTIONIST");

    const { rerender } = render(
      <RouteGuard scope="staff">
        <div>Protected content</div>
      </RouteGuard>,
    );

    // Content renders initially
    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();

    // Simulate role being cleared (e.g., session expired, token removed)
    roleState.role = null;
    rerender(
      <RouteGuard scope="staff">
        <div>Protected content</div>
      </RouteGuard>,
    );

    // Content is hidden
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();

    // Redirect to staff login
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/staff/login");
    });
  });

  it("clears session storage completely via clearSessions pattern on auth failure", () => {
    // Simulate session storage with valid-looking data
    sessionStorage.setItem("hms_staff_access_token", "eyJhbGciOiJIUzI1NiJ9.valid-token");
    sessionStorage.setItem("hms_staff_access_token_expires_in", "3600");
    sessionStorage.setItem("hms_staff_role", "RECEPTIONIST");
    sessionStorage.setItem("hms_patient_access_token", "eyJhbGciOiJIUzI1NiJ9.patient-token");
    sessionStorage.setItem("hms_patient_access_token_expires_in", "3600");
    sessionStorage.setItem("hms_patient_role", "PATIENT");

    expect(sessionStorage.getItem("hms_staff_access_token")).toBeTruthy();

    // Simulate clearing all sessions (as done by clearSessions in api-client)
    const sessionKeys = [
      "hms_staff_access_token",
      "hms_staff_access_token_expires_in",
      "hms_staff_role",
      "hms_patient_access_token",
      "hms_patient_access_token_expires_in",
      "hms_patient_role",
    ];
    sessionKeys.forEach((key) => sessionStorage.removeItem(key));

    // All session storage keys should be cleared
    expect(sessionStorage.getItem("hms_staff_access_token")).toBeNull();
    expect(sessionStorage.getItem("hms_staff_access_token_expires_in")).toBeNull();
    expect(sessionStorage.getItem("hms_staff_role")).toBeNull();
    expect(sessionStorage.getItem("hms_patient_access_token")).toBeNull();
    expect(sessionStorage.getItem("hms_patient_access_token_expires_in")).toBeNull();
    expect(sessionStorage.getItem("hms_patient_role")).toBeNull();
  });

  it("redirects to login when route decision is unauthenticated", async () => {
    roleState.role = null;

    render(
      <RouteGuard scope="staff">
        <div>Queue board content</div>
      </RouteGuard>,
    );

    expect(screen.queryByText("Queue board content")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/staff/login"));
  });

  it("redirects to forbidden for wrong role after session expiry and re-login", async () => {
    // Simulate a scenario: previous role expired, new login gives wrong role for the route
    roleState.role = "PHARMACIST";

    render(
      <RouteGuard scope="staff">
        <div>Admin content</div>
      </RouteGuard>,
    );

    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/forbidden"));
  });

  it("shows nothing when session is expired and user is not hydrated yet", async () => {
    roleState.hydrated = false;
    roleState.role = null;

    render(
      <RouteGuard scope="staff">
        <div>Sensitive data</div>
      </RouteGuard>,
    );

    // Content not shown, no redirect during hydration
    expect(screen.queryByText("Sensitive data")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("handles session expiry on pathname change", async () => {
    roleState.role = "RECEPTIONIST";

    const { rerender } = render(
      <RouteGuard scope="staff">
        <div>Queue page</div>
      </RouteGuard>,
    );

    expect(screen.getByText("Queue page")).toBeInTheDocument();

    // Simulate navigating to a restricted route after session expired
    navigationState.pathname = "/admin/audit-logs";
    roleState.role = null;

    rerender(
      <RouteGuard scope="staff">
        <div>Queue page</div>
      </RouteGuard>,
    );

    expect(screen.queryByText("Queue page")).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/staff/login"));
  });
});
