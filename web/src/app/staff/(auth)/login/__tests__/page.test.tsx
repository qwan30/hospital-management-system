import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StaffLoginPage from "../page";
import { apiRequest, persistSession } from "@/lib/api-client";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>(
    "@/lib/api-client",
  );

  return {
    ...actual,
    apiRequest: vi.fn(),
    persistSession: vi.fn(),
  };
});

describe("StaffLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits entered credentials, persists the staff session, and routes to dashboard", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      data: {
        userId: "staff-1",
        fullName: "Receptionist One",
        role: "RECEPTIONIST",
        tokens: {
          accessToken: "staff-token",
          refreshToken: "refresh-token",
          expiresInSeconds: 3600,
        },
      },
    });

    render(<StaffLoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "frontdesk@hospital.vn");
    await userEvent.type(screen.getByLabelText(/^password$/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /log in to clinical suite/i }));

    await waitFor(() =>
      expect(apiRequest).toHaveBeenCalledWith("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "frontdesk@hospital.vn",
          password: "secret",
        }),
      }),
    );
    expect(persistSession).toHaveBeenCalledWith(
      "staff",
      {
        accessToken: "staff-token",
        refreshToken: "refresh-token",
        expiresInSeconds: 3600,
      },
      "RECEPTIONIST",
    );
    expect(push).toHaveBeenCalledWith("/staff/dashboard");
  });

  it("shows the backend error and does not navigate when login fails", async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<StaffLoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "frontdesk@hospital.vn");
    await userEvent.type(screen.getByLabelText(/^password$/i), "bad-password");
    await userEvent.click(screen.getByRole("button", { name: /log in to clinical suite/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
    expect(persistSession).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("rejects a successful response that does not include a staff session", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

    render(<StaffLoginPage />);

    await userEvent.type(screen.getByLabelText(/email/i), "frontdesk@hospital.vn");
    await userEvent.type(screen.getByLabelText(/^password$/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /log in to clinical suite/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Staff login did not return a session.",
    );
    expect(persistSession).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
