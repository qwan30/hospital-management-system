import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ApiClientError } from "./hms-api";
import { LoginScreen } from "./login-screen";

const replaceMock = vi.fn();
const loginMock = vi.fn();
const logoutMock = vi.fn();
const bootstrapMock = vi.fn();

let redirectTarget = "/doctor-dashboard";
let authState = {
  bootstrap: bootstrapMock,
  bootstrapped: false,
  claimPatient: vi.fn(),
  login: loginMock,
  logout: logoutMock,
  session: null,
  status: "idle"
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "redirect" ? redirectTarget : null)
  })
}));

vi.mock("./auth-provider", () => ({
  useAuth: () => authState
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    loginMock.mockReset();
    logoutMock.mockReset();
    bootstrapMock.mockReset();
    redirectTarget = "/doctor-dashboard";
    authState = {
      bootstrap: bootstrapMock,
      bootstrapped: false,
      claimPatient: vi.fn(),
      login: loginMock,
      logout: logoutMock,
      session: null,
      status: "idle"
    };
  });

  it("boots unresolved auth state and shows the redirect destination", () => {
    render(<LoginScreen />);

    expect(bootstrapMock).toHaveBeenCalled();
    expect(screen.getByText(/continue to \/doctor-dashboard/i)).toBeTruthy();
  });

  it("submits credentials and redirects to the requested route", async () => {
    redirectTarget = "/medical-record-editor";
    authState = {
      ...authState,
      bootstrapped: true,
      status: "unauthenticated"
    };
    loginMock.mockResolvedValue({
      role: "DOCTOR"
    });

    render(<LoginScreen />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "doctor2@hospital.vn" }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Doctor@4567" }
    });
    fireEvent.click(screen.getByRole("button", { name: /continue to workspace/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("doctor2@hospital.vn", "Doctor@4567", "staff");
      expect(replaceMock).toHaveBeenCalledWith("/medical-record-editor");
    });
  });

  it("shows a role mismatch message when the route rejects the returned role", async () => {
    authState = {
      ...authState,
      bootstrapped: true,
      status: "unauthenticated"
    };
    loginMock.mockResolvedValue({
      role: "NURSE"
    });
    logoutMock.mockResolvedValue(undefined);

    render(<LoginScreen />);
    fireEvent.click(screen.getByRole("button", { name: /continue to workspace/i }));

    expect((await screen.findByRole("alert")).textContent).toMatch(
      /only doctor sessions can enter/i
    );
    expect(logoutMock).toHaveBeenCalled();
  });

  it("renders API failures from the auth endpoint", async () => {
    authState = {
      ...authState,
      bootstrapped: true,
      status: "unauthenticated"
    };
    loginMock.mockRejectedValue(
      new ApiClientError(401, "Invalid doctor credentials", "invalid_credentials")
    );

    render(<LoginScreen />);
    fireEvent.click(screen.getByRole("button", { name: /continue to workspace/i }));

    expect(await screen.findByText(/invalid doctor credentials/i)).toBeTruthy();
  });
});
