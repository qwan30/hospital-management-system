import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { DoctorRouteGuard } from "./doctor-route-guard";

const replaceMock = vi.fn();
const bootstrapMock = vi.fn();

let authState = {
  bootstrap: bootstrapMock,
  bootstrapped: false,
  session: null,
  status: "idle"
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/doctor-dashboard",
  useRouter: () => ({
    replace: replaceMock
  })
}));

vi.mock("./auth-provider", () => ({
  useAuth: () => authState
}));

describe("DoctorRouteGuard", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    bootstrapMock.mockReset();
  });

  it("boots the auth session and shows the fallback while unresolved", () => {
    authState = {
      bootstrap: bootstrapMock,
      bootstrapped: false,
      session: null,
      status: "idle"
    };

    render(
      <DoctorRouteGuard fallback={<p>Loading protected route</p>}>
        <p>Protected content</p>
      </DoctorRouteGuard>
    );

    expect(screen.getByText(/Loading protected route/i)).toBeTruthy();
    expect(bootstrapMock).toHaveBeenCalled();
  });

  it("redirects unauthenticated users to login", async () => {
    authState = {
      bootstrap: bootstrapMock,
      bootstrapped: true,
      session: null,
      status: "unauthenticated"
    };

    render(
      <DoctorRouteGuard fallback={<p>Loading protected route</p>}>
        <p>Protected content</p>
      </DoctorRouteGuard>
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login?redirect=%2Fdoctor-dashboard");
    });
  });
});
