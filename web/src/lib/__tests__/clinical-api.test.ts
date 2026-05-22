import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ApiClientError,
} from "@/lib/api-client";
import {
  getTodayQueue,
  getTodayAppointments,
  listAppointments,
  checkInAppointment,
  updateAppointmentStatus,
  callQueuePatient,
  skipQueuePatient,
  assignQueueRoom,
  startQueueConsultation,
  completeQueueVisit,
  getAppointmentVitalSigns,
  getMySchedule,
  recordAppointmentVitalSigns,
  saveAppointmentVitalSigns,
  updateAppointmentVitalSigns,
  type ClinicalAppointmentResponse,
} from "../clinical-api";
import { apiRequest } from "@/lib/api-client";

vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>(
    "@/lib/api-client",
  );

  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

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

    it("returns empty array if no data", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(getTodayAppointments()).resolves.toEqual([]);
    });
  });

  describe("listAppointments", () => {
    it("lists staff appointments with supported filters", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [mockAppointment] });

      const result = await listAppointments({
        status: "CHECKED_IN",
        date: "2026-05-15",
        page: 0,
        size: 50,
      });

      expect(apiRequest).toHaveBeenCalledWith(
        "/appointments?status=CHECKED_IN&date=2026-05-15&page=0&size=50",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual([mockAppointment]);
    });

    it("uses default paging when no filters are supplied", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [] });

      await expect(listAppointments()).resolves.toEqual([]);
      expect(apiRequest).toHaveBeenCalledWith(
        "/appointments?page=0&size=100",
        {},
        { authScope: "staff" },
      );
    });

    it("includes doctor filter and falls back to an empty list", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(listAppointments({ doctorId: "doctor-1" })).resolves.toEqual([]);
      expect(apiRequest).toHaveBeenCalledWith(
        "/appointments?doctorId=doctor-1&page=0&size=100",
        {},
        { authScope: "staff" },
      );
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

  describe("updateAppointmentStatus", () => {
    it("sends status update request and returns appointment", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockAppointment });

      const result = await updateAppointmentStatus("123", "IN_PROGRESS");

      expect(apiRequest).toHaveBeenCalledWith(
        "/appointments/123/status",
        {
          method: "PUT",
          body: JSON.stringify({ status: "IN_PROGRESS" }),
        },
        { authScope: "staff" },
      );
      expect(result).toEqual(mockAppointment);
    });

    it("throws if status update returns no appointment", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(updateAppointmentStatus("123", "IN_PROGRESS")).rejects.toThrow(
        "Appointment status update did not return an appointment",
      );
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

    it("skipQueuePatient throws if no appointment is returned", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      await expect(skipQueuePatient("123")).rejects.toThrow(
        "Queue action did not return an appointment",
      );
    });
  });

  describe("vital signs", () => {
    const vitals = {
      id: "vital-1",
      appointmentId: "123",
      bloodPressure: "120/80",
      temperature: 37,
      weight: 70,
      height: 170,
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      recordedAt: "2026-05-22T08:00:00Z",
    };

    it("records, reads, and updates vital signs", async () => {
      vi.mocked(apiRequest)
        .mockResolvedValueOnce({ data: vitals })
        .mockResolvedValueOnce({ data: vitals })
        .mockResolvedValueOnce({ data: vitals });

      await expect(recordAppointmentVitalSigns("123", { temperature: 37 })).resolves.toEqual(vitals);
      await expect(getAppointmentVitalSigns("123")).resolves.toEqual(vitals);
      await expect(updateAppointmentVitalSigns("vital-1", { heartRate: 72 })).resolves.toEqual(vitals);

      expect(apiRequest).toHaveBeenNthCalledWith(
        1,
        "/appointments/123/vital-signs",
        { method: "POST", body: JSON.stringify({ temperature: 37 }) },
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/appointments/123/vital-signs",
        {},
        { authScope: "staff" },
      );
      expect(apiRequest).toHaveBeenNthCalledWith(
        3,
        "/vital-signs/vital-1",
        { method: "PUT", body: JSON.stringify({ heartRate: 72 }) },
        { authScope: "staff" },
      );
    });

    it.each([
      ["recordAppointmentVitalSigns", () => recordAppointmentVitalSigns("123", { temperature: 37 }), "Vital signs save did not return a record"],
      ["getAppointmentVitalSigns", () => getAppointmentVitalSigns("123"), "Vital signs lookup did not return a record"],
      ["updateAppointmentVitalSigns", () => updateAppointmentVitalSigns("vital-1", { heartRate: 72 }), "Vital signs update did not return a record"],
    ] satisfies Array<[string, () => Promise<unknown>, string]>)(
      "%s throws when the backend returns no data",
      async (_name, action, message) => {
        vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

        await expect(action()).rejects.toThrow(message);
      },
    );

    it("updates existing vital signs when lookup succeeds", async () => {
      vi.mocked(apiRequest)
        .mockResolvedValueOnce({ data: vitals })
        .mockResolvedValueOnce({ data: { ...vitals, temperature: 36.8 } });

      await expect(saveAppointmentVitalSigns("123", { temperature: 36.8 })).resolves.toMatchObject({
        temperature: 36.8,
      });

      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/vital-signs/vital-1",
        { method: "PUT", body: JSON.stringify({ temperature: 36.8 }) },
        { authScope: "staff" },
      );
    });

    it("creates vital signs when lookup returns 404", async () => {
      vi.mocked(apiRequest)
        .mockRejectedValueOnce(new ApiClientError("Missing", 404))
        .mockResolvedValueOnce({ data: vitals });

      await expect(saveAppointmentVitalSigns("123", { temperature: 37 })).resolves.toEqual(vitals);

      expect(apiRequest).toHaveBeenNthCalledWith(
        2,
        "/appointments/123/vital-signs",
        { method: "POST", body: JSON.stringify({ temperature: 37 }) },
        { authScope: "staff" },
      );
    });

    it("rethrows non-404 lookup failures while saving vital signs", async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new ApiClientError("Forbidden", 403));

      await expect(saveAppointmentVitalSigns("123", { temperature: 37 })).rejects.toThrow("Forbidden");
    });
  });

  describe("listLabResultsByAppointment", () => {
    it("fetches lab results for an appointment", async () => {
      const mockLabResults = [
        {
          labResultId: "lr-1",
          appointmentId: "123",
          testName: "CBC",
          status: "Reviewed",
          resultSummary: "Normal",
          doctorComment: null,
          attachmentUrl: null,
          collectedAt: "2026-05-10T08:00:00Z",
        },
      ];
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockLabResults });

      const { listLabResultsByAppointment } = await import("../clinical-api");
      const result = await listLabResultsByAppointment("123");

      expect(apiRequest).toHaveBeenCalledWith(
        "/appointments/123/lab-results",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual(mockLabResults);
    });

    it("returns empty array if no data", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const { listLabResultsByAppointment } = await import("../clinical-api");
      const result = await listLabResultsByAppointment("123");
      expect(result).toEqual([]);
    });
  });

  describe("getLabResult", () => {
    it("fetches a single lab result", async () => {
      const mockResult = {
        labResultId: "lr-1",
        appointmentId: "123",
        testName: "CBC",
        status: "Reviewed",
        resultSummary: "Normal",
        doctorComment: "All good",
        attachmentUrl: null,
        collectedAt: "2026-05-10T08:00:00Z",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockResult });

      const { getLabResult } = await import("../clinical-api");
      const result = await getLabResult("lr-1");

      expect(apiRequest).toHaveBeenCalledWith(
        "/lab-results/lr-1",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual(mockResult);
    });

    it("throws if lab result not found", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const { getLabResult } = await import("../clinical-api");
      await expect(getLabResult("lr-missing")).rejects.toThrow("Lab result not found");
    });
  });

  describe("createLabResult", () => {
    it("creates a lab result", async () => {
      const mockResult = {
        labResultId: "lr-new",
        appointmentId: "123",
        testName: "Lipid Panel",
        status: "Pending",
        resultSummary: null,
        doctorComment: null,
        attachmentUrl: null,
        collectedAt: "2026-05-15T10:00:00Z",
      };
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: mockResult });

      const request = { appointmentId: "123", testName: "Lipid Panel" };
      const { createLabResult } = await import("../clinical-api");
      const result = await createLabResult(request);

      expect(apiRequest).toHaveBeenCalledWith(
        "/lab-results",
        { method: "POST", body: JSON.stringify(request) },
        { authScope: "staff" },
      );
      expect(result).toEqual(mockResult);
    });

    it("throws if creation returns no data", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const { createLabResult } = await import("../clinical-api");
      await expect(
        createLabResult({ appointmentId: "123", testName: "CBC" }),
      ).rejects.toThrow("Lab result creation did not return a result");
    });
  });

  describe("deleteLabResult", () => {
    it("deletes a lab result", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const { deleteLabResult } = await import("../clinical-api");
      await deleteLabResult("lr-1");

      expect(apiRequest).toHaveBeenCalledWith(
        "/lab-results/lr-1",
        { method: "DELETE" },
        { authScope: "staff" },
      );
    });
  });

  describe("getMySchedule", () => {
    it("fetches schedule by date", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [mockAppointment] });

      const { getMySchedule } = await import("../clinical-api");
      const result = await getMySchedule({ date: "2026-05-15" });

      expect(apiRequest).toHaveBeenCalledWith(
        "/me/schedule?date=2026-05-15",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual([mockAppointment]);
    });

    it("fetches schedule by week", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [mockAppointment] });

      const result = await getMySchedule({ week: "2026-W20" });

      expect(apiRequest).toHaveBeenCalledWith(
        "/me/schedule?week=2026-W20",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual([mockAppointment]);
    });

    it("fetches schedule with no params", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [] });

      const result = await getMySchedule();

      expect(apiRequest).toHaveBeenCalledWith(
        "/me/schedule",
        {},
        { authScope: "staff" },
      );
      expect(result).toEqual([]);
    });

    it("returns empty array if no data", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: undefined });

      const result = await getMySchedule({ date: "2026-05-15" });
      expect(result).toEqual([]);
    });

    it("combines date and week filters when both are supplied", async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce({ data: [mockAppointment] });

      await expect(getMySchedule({ date: "2026-05-22", week: "2026-W21" })).resolves.toEqual([
        mockAppointment,
      ]);
      expect(apiRequest).toHaveBeenCalledWith(
        "/me/schedule?date=2026-05-22&week=2026-W21",
        {},
        { authScope: "staff" },
      );
    });
  });
});
