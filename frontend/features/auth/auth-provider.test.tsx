import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "./auth-provider";

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rebuilds the in-memory session from refresh on bootstrap", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            accessToken: createAccessToken("doctor-1", "Dr. Sarah Chen", "DOCTOR"),
            expiresInSeconds: 900,
            refreshToken: null
          }
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <BootstrapProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/authenticated/i)).toBeTruthy();
      expect(screen.getByText(/Dr. Sarah Chen/i)).toBeTruthy();
    });
  });

  it("logs in and stores the access token only in memory", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            fullName: "Dr. Sarah Chen",
            role: "DOCTOR",
            tokens: {
              accessToken: createAccessToken("doctor-1", "Dr. Sarah Chen", "DOCTOR"),
              expiresInSeconds: 900,
              refreshToken: null
            },
            userId: "doctor-1"
          }
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <LoginProbe />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /trigger login/i }));

    await waitFor(() => {
      expect(screen.getByText(/authenticated/i)).toBeTruthy();
      expect(screen.getByText(/Dr. Sarah Chen/i)).toBeTruthy();
    });
  });
});

function BootstrapProbe() {
  const auth = useAuth();

  useEffect(() => {
    void auth.bootstrap();
  }, []);

  return (
    <div>
      <span>{auth.status}</span>
      <span>{auth.session?.fullName ?? "anonymous"}</span>
    </div>
  );
}

function LoginProbe() {
  const auth = useAuth();

  return (
    <div>
      <button
        onClick={() => {
          void auth.login("doctor1@hospital.vn", "Doctor@1234");
        }}
        type="button"
      >
        Trigger login
      </button>
      <span>{auth.status}</span>
      <span>{auth.session?.fullName ?? "anonymous"}</span>
    </div>
  );
}

function createAccessToken(userId: string, fullName: string, role: string) {
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 900,
      name: fullName,
      role,
      sub: userId
    })
  );
  return `${header}.${payload}.signature`;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
