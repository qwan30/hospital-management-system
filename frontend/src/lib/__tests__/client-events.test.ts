import { describe, expect, it } from "vitest";
import { redactSensitiveText, sanitizeClientEvent } from "../client-events";

describe("client-events", () => {
  it("accepts sanitized browser event payloads", () => {
    const event = sanitizeClientEvent({
      eventType: "browser_error",
      requestId: "frontend-request-001",
      path: "/admin/users/550e8400-e29b-41d4-a716-446655440000?token=secret",
      message: "Failed for patient@example.com at 0912345678",
    });

    expect(event).toMatchObject({
      eventType: "browser_error",
      requestId: "frontend-request-001",
      path: "/admin/users/{id}",
      message: "Failed for [redacted-email] at [redacted-phone]",
    });
  });

  it("rejects unsupported event types and unsafe request ids", () => {
    expect(sanitizeClientEvent({
      eventType: "debug_payload",
      requestId: "frontend-request-001",
      path: "/admin/monitoring",
    })).toBeNull();

    expect(sanitizeClientEvent({
      eventType: "api_request",
      requestId: "short",
      path: "/admin/monitoring",
    })).toBeNull();
  });

  it("redacts tokens and long numeric identifiers from free text", () => {
    expect(redactSensitiveText("accessToken=secret123 patient=123456789012"))
      .toBe("token=[redacted] patient={id}");
  });
});
