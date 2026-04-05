import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ClinicalRecordsRouteGuard } from "./clinical-records-route-guard";

const replaceMock = vi.fn();
const bootstrapMock = vi.fn();

let authState = {
  bootstrap: bootstrapMock,
  bootstrapped: true,
  session: {
    accessToken: "token",
    expiresAt: Date.now() + 60_000,
    fullName: "Mia Torres",
    role: "NURSE" as const,
    scope: "staff" as const,
    userId: "nurse-1"
  },
  status: "authenticated" as const
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/patient-records-management",
  useRouter: () => ({
    replace: replaceMock
  })
}));

vi.mock("./auth-provider", () => ({
  useAuth: () => authState
}));

describe("ClinicalRecordsRouteGuard", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    bootstrapMock.mockReset();
    authState = {
      bootstrap: bootstrapMock,
      bootstrapped: true,
      session: {
        accessToken: "token",
        expiresAt: Date.now() + 60_000,
        fullName: "Mia Torres",
        role: "NURSE",
        scope: "staff",
        userId: "nurse-1"
      },
      status: "authenticated"
    };
  });

  it("allows nurse staff into clinical records routes", async () => {
    render(
      <ClinicalRecordsRouteGuard fallback={<p>Loading protected route</p>}>
        <p>Protected content</p>
      </ClinicalRecordsRouteGuard>
    );

    expect(screen.getByText(/protected content/i)).toBeTruthy();
    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});
