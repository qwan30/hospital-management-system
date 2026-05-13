import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTodayQueue,
  getTodayAppointments,
  checkInAppointment,
  callQueuePatient,
  skipQueuePatient,
  assignQueueRoom,
  startQueueConsultation,
  completeQueueVisit,
  type ClinicalAppointmentResponse,
} from "../clinical-api";
import { apiRequest } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiRequest: vi.fn(),
}));

describe("clinical-api", () => {
  const mockAppointment: ClinicalAppointmentResponse = {
    appointmentId: "123",
    confirmationCode: "ABC-123",
    status: "PENDING",
    appointmentDate: "2023-10-27",
    startTime: "09:00",
    endTime: "09:30",
    checkedInAt: null,
    doctorId: "doc-1",
    doctorName: "Dr. Smith",
    patientId: "pat-1",
    patientFullName: "Jane Doe",
    patientPhone: "555-1234",
    patientCccd: "0123456789",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTodayQueue", () => {
    it("returns queue from API", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [mockAppointment] });

      const result = await getTodayQueue();

      expect(apiRequest).toHaveBeenCalledWith("/queue/today", {}, { authScope: "staff" });
      expect(result).toEqual([mockAppointment]);
    });

    it("returns empty array if no data", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });
      const result = await getTodayQueue();
      expect(result).toEqual([]);
    });
  });

  describe("getTodayAppointments", () => {
    it("returns appointments from API", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [mockAppointment] });

      const result = await getTodayAppointments();

      expect(apiRequest).toHaveBeenCalledWith("/appointments/today", {}, { authScope: "staff" });
      expect(result).toEqual([mockAppointment]);
    });
  });

  describe("checkInAppointment", () => {
    it("sends checkin request and returns appointment", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointment });

      const request = { checkedInAt: "2023-10-27T08:50:00Z" };
      const result = await checkInAppointment("123", request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/appointments/123/checkin",
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        { authScope: "staff" },
      );
      expect(result).toEqual(mockAppointment);
    });

    it("throws error if no data returned", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(checkInAppointment("123", { checkedInAt: "now" })).rejects.toThrow("Check-in did not return an appointment");
    });
  });

  describe("queue actions", () => {
    it("callQueuePatient calls the correct endpoint", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointment });
      const result = await callQueuePatient("123");
      expect(apiRequest).toHaveBeenCalledWith("/queue/123/call", { method: "POST" }, { authScope: "staff" });
      expect(result).toEqual(mockAppointment);
    });

    it("skipQueuePatient calls the correct endpoint", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointment });
      const result = await skipQueuePatient("123");
      expect(apiRequest).toHaveBeenCalledWith("/queue/123/skip", { method: "POST" }, { authScope: "staff" });
      expect(result).toEqual(mockAppointment);
    });

    it("startQueueConsultation calls the correct endpoint", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointment });
      const result = await startQueueConsultation("123");
      expect(apiRequest).toHaveBeenCalledWith("/queue/123/start-consultation", { method: "POST" }, { authScope: "staff" });
      expect(result).toEqual(mockAppointment);
    });

    it("completeQueueVisit calls the correct endpoint", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointment });
      const result = await completeQueueVisit("123");
      expect(apiRequest).toHaveBeenCalledWith("/queue/123/complete", { method: "POST" }, { authScope: "staff" });
      expect(result).toEqual(mockAppointment);
    });

    it("assignQueueRoom calls the correct endpoint", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointment });
      const request = { roomName: "Room 101" };
      const result = await assignQueueRoom("123", request);
      expect(apiRequest).toHaveBeenCalledWith(
        "/queue/123/assign-room",
        { method: "POST", body: JSON.stringify(request) },
        { authScope: "staff" },
      );
      expect(result).toEqual(mockAppointment);
    });

    it("assignQueueRoom throws if no appointment is returned", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(
        assignQueueRoom("123", { roomName: "Room 101" }),
      ).rejects.toThrow("Room assignment did not return an appointment");
    });

    it.each([
      ["startQueueConsultation", startQueueConsultation],
      ["completeQueueVisit", completeQueueVisit],
    ])("%s throws if no appointment is returned", async (_name, action) => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(action("123")).rejects.toThrow(
        "Queue action did not return an appointment",
      );
    });

    it("throws error if queue action returns no data", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });
      await expect(callQueuePatient("123")).rejects.toThrow("Queue action did not return an appointment");
    });
  });
});
