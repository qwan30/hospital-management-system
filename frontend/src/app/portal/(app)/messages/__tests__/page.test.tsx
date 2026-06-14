import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PatientMessagesPage from "../page";
import {
  listPatientPortalMessages,
  type PatientPortalMessageThreadResponse,
} from "@/lib/operations-api";

vi.mock("@/lib/operations-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/operations-api")>(
    "@/lib/operations-api",
  );

  return {
    ...actual,
    listPatientPortalMessages: vi.fn(),
  };
});

const threads: PatientPortalMessageThreadResponse[] = [
  {
    threadId: "thread-1",
    subject: "Care plan update",
    channel: "Clinical Communication",
    unreadCount: 1,
    lastMessagePreview: "Please continue your medication.",
    updatedAt: "2026-05-15T09:00:00Z",
    messages: [
      {
        messageId: "message-1",
        senderRole: "DOCTOR",
        body: "Please continue your medication.",
        createdAt: "2026-05-15T09:00:00Z",
      },
    ],
  },
  {
    threadId: "thread-2",
    subject: "Billing notice",
    channel: "Administrative",
    unreadCount: 0,
    lastMessagePreview: "Your invoice is available.",
    updatedAt: "2026-05-14T09:00:00Z",
    messages: [],
  },
];

describe("PatientMessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listPatientPortalMessages).mockResolvedValue(threads);
  });

  it("loads real message threads without static fallback", async () => {
    render(<PatientMessagesPage />);

    expect(screen.getByText(/loading patient messages/i)).toBeInTheDocument();
    expect(await screen.findAllByText("Care plan update")).toHaveLength(2);
    expect(screen.getAllByText("Please continue your medication.")).toHaveLength(2);
    expect(screen.queryByText("Dr. Alistair Vance")).not.toBeInTheDocument();
  });

  it("selects and filters real threads", async () => {
    render(<PatientMessagesPage />);

    await screen.findAllByText("Care plan update");
    await userEvent.click(screen.getByRole("button", { name: /billing notice/i }));

    expect(await screen.findAllByRole("heading", { name: "Billing notice" })).toHaveLength(2);

    await userEvent.type(screen.getByRole("searchbox", { name: /filter messages/i }), "clinical");

    expect(screen.getAllByText("Care plan update")).toHaveLength(2);
    expect(screen.queryByText("Billing notice")).not.toBeInTheDocument();
  });

  it("shows honest empty and error states", async () => {
    vi.mocked(listPatientPortalMessages).mockResolvedValueOnce([]);

    render(<PatientMessagesPage />);

    expect(await screen.findByText(/no messages are available/i)).toBeInTheDocument();
  });

  it("shows API errors without mock fallback", async () => {
    vi.mocked(listPatientPortalMessages).mockRejectedValueOnce(
      new Error("Patient message access denied"),
    );

    render(<PatientMessagesPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Patient message access denied");
    expect(screen.queryByText("Follow-up: Lab results review")).not.toBeInTheDocument();
  });
});
