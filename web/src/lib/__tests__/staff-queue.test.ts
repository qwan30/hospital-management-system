import { describe, it, expect, vi } from "vitest";
import {
  mergeAppointments,
  getQueueFilter,
  getQueueState,
  calculatePhysicianLoads,
  calculateAverageWaitMinutes,
  calculateWaitMinutes,
  getWaitBadgeClass,
  formatWait,
  formatTime,
  maskIdentifier,
  toLocalIsoDateTime,
  toQueueError,
  getErrorMessage,
  removeRecordKey,
} from "../staff-queue";
import type { ClinicalAppointmentResponse } from "@/lib/clinical-api";
import { ApiClientError } from "@/lib/api-client";

describe("staff-queue", () => {
  const baseAppointment: ClinicalAppointmentResponse = {
    appointmentId: "1",
    confirmationCode: "ABC",
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

  describe("mergeAppointments", () => {
    it("merges and overrides existing appointments, sorting by time", () => {
      const appt1 = { ...baseAppointment, appointmentId: "1", startTime: "10:00" };
      const appt2 = { ...baseAppointment, appointmentId: "2", startTime: "09:00" };
      const override1 = { ...baseAppointment, appointmentId: "1", startTime: "11:00", status: "CHECKED_IN" as const };
      
      const primary = [appt1, appt2];
      const overrides = [override1];

      const result = mergeAppointments(primary, overrides);

      expect(result).toHaveLength(2);
      expect(result[0].appointmentId).toBe("2"); // 09:00 comes first
      expect(result[1].appointmentId).toBe("1"); // 11:00 comes second
      expect(result[1].status).toBe("CHECKED_IN"); // Overridden values applied
    });
  });

  describe("getQueueFilter", () => {
    it("returns in_progress for IN_PROGRESS", () => {
      expect(getQueueFilter({ ...baseAppointment, status: "IN_PROGRESS" })).toBe("in_progress");
    });
    it("returns ready for CHECKED_IN", () => {
      expect(getQueueFilter({ ...baseAppointment, status: "CHECKED_IN" })).toBe("ready");
    });
    it("returns waiting for CONFIRMED or PENDING", () => {
      expect(getQueueFilter({ ...baseAppointment, status: "CONFIRMED" })).toBe("waiting");
      expect(getQueueFilter({ ...baseAppointment, status: "PENDING" })).toBe("waiting");
    });
    it("returns null for other statuses", () => {
      expect(getQueueFilter({ ...baseAppointment, status: "DONE" })).toBeNull();
      expect(getQueueFilter({ ...baseAppointment, status: "CANCELLED" })).toBeNull();
    });
  });

  describe("getQueueState", () => {
    it("returns in_progress state", () => {
      expect(getQueueState({ ...baseAppointment, status: "IN_PROGRESS" })).toEqual({
        label: "In progress",
        dotClass: "bg-hms-primary",
      });
    });
    it("returns ready state", () => {
      expect(getQueueState({ ...baseAppointment, status: "CHECKED_IN" })).toEqual({
        label: "Ready",
        dotClass: "bg-hms-secondary",
      });
    });
    it("returns waiting state by default", () => {
      expect(getQueueState({ ...baseAppointment, status: "PENDING" })).toEqual({
        label: "Waiting",
        dotClass: "bg-hms-tertiary",
      });
    });
  });

  describe("calculatePhysicianLoads", () => {
    it("calculates loads correctly and sorts by total", () => {
      const appts: ClinicalAppointmentResponse[] = [
        { ...baseAppointment, doctorId: "doc-1", doctorName: "Dr. One", status: "PENDING" },
        { ...baseAppointment, doctorId: "doc-1", doctorName: "Dr. One", status: "CHECKED_IN" },
        { ...baseAppointment, doctorId: "doc-2", doctorName: "Dr. Two", status: "IN_PROGRESS" },
      ];

      const result = calculatePhysicianLoads(appts);

      expect(result).toHaveLength(2);
      expect(result[0].doctorId).toBe("doc-1");
      expect(result[0].total).toBe(2);
      expect(result[0].waiting).toBe(1);
      expect(result[0].ready).toBe(1);
      
      expect(result[1].doctorId).toBe("doc-2");
      expect(result[1].total).toBe(1);
      expect(result[1].inProgress).toBe(1);
    });
  });

  describe("calculateWaitMinutes", () => {
    it("calculates wait based on checkedInAt if available", () => {
      const checkedInAt = new Date("2023-10-27T09:00:00Z");
      const appt = { ...baseAppointment, checkedInAt: checkedInAt.toISOString() };
      const now = new Date("2023-10-27T09:15:00Z");

      expect(calculateWaitMinutes(appt, now)).toBe(15);
    });

    it("calculates wait based on appointmentDate and startTime if no checkedInAt", () => {
      const appt = { ...baseAppointment, appointmentDate: "2023-10-27", startTime: "09:00", checkedInAt: null };
      const now = new Date("2023-10-27T09:15:00");

      expect(calculateWaitMinutes(appt, now)).toBe(15);
    });

    it("returns 0 if wait is negative (future appointment)", () => {
      const checkedInAt = new Date("2023-10-27T09:00:00Z");
      const appt = { ...baseAppointment, checkedInAt: checkedInAt.toISOString() };
      const now = new Date("2023-10-27T08:00:00Z");

      expect(calculateWaitMinutes(appt, now)).toBe(0);
    });
  });

  describe("calculateAverageWaitMinutes", () => {
    it("returns 0 for empty array", () => {
      expect(calculateAverageWaitMinutes([], new Date())).toBe(0);
    });

    it("calculates average correctly", () => {
      const checkedInAt1 = new Date("2023-10-27T09:00:00Z");
      const checkedInAt2 = new Date("2023-10-27T09:10:00Z");
      const now = new Date("2023-10-27T09:30:00Z");

      const appts = [
        { ...baseAppointment, checkedInAt: checkedInAt1.toISOString() }, // 30 mins
        { ...baseAppointment, checkedInAt: checkedInAt2.toISOString() }, // 20 mins
      ];

      expect(calculateAverageWaitMinutes(appts, now)).toBe(25);
    });
  });

  describe("getWaitBadgeClass", () => {
    it("returns error class for >= 30 mins", () => {
      expect(getWaitBadgeClass(30)).toContain("error");
    });
    it("returns tertiary class for >= 15 mins", () => {
      expect(getWaitBadgeClass(15)).toContain("tertiary");
      expect(getWaitBadgeClass(29)).toContain("tertiary");
    });
    it("returns secondary class for < 15 mins", () => {
      expect(getWaitBadgeClass(14)).toContain("secondary");
    });
  });

  describe("formatWait", () => {
    it("formats minutes < 60", () => {
      expect(formatWait(45)).toBe("45m");
    });
    it("formats hours and minutes >= 60", () => {
      expect(formatWait(125)).toBe("2h 5m");
    });
  });

  describe("formatTime", () => {
    it("formats a date string to localized time", () => {
      // Mocking Intl.DateTimeFormat might be tricky, so we just check if it returns a string with colon
      const timeStr = formatTime("2023-10-27T09:00:00Z");
      expect(typeof timeStr).toBe("string");
      expect(timeStr).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("maskIdentifier", () => {
    it("does not mask strings <= 4 chars", () => {
      expect(maskIdentifier("1234")).toBe("1234");
    });
    it("masks correctly for longer strings", () => {
      expect(maskIdentifier("0123456789")).toBe("012***789");
    });
  });

  describe("toLocalIsoDateTime", () => {
    it("formats a Date to local ISO string without timezone", () => {
      const date = new Date(2023, 9, 27, 9, 15, 30); // Months are 0-indexed in JS Date
      expect(toLocalIsoDateTime(date)).toBe("2023-10-27T09:15:30");
    });
  });

  describe("toQueueError", () => {
    it("handles ApiClientError 401", () => {
      const error = new ApiClientError("Expired", 401);
      const queueError = toQueueError(error);
      expect(queueError.status).toBe(401);
      expect(queueError.message).toContain("staff session has expired");
    });

    it("handles ApiClientError 403", () => {
      const error = new ApiClientError("Forbidden", 403);
      const queueError = toQueueError(error);
      expect(queueError.status).toBe(403);
      expect(queueError.message).toContain("not authorized");
    });

    it("handles generic ApiClientError", () => {
      const error = new ApiClientError("Something went wrong", 500);
      const queueError = toQueueError(error);
      expect(queueError.status).toBe(500);
      expect(queueError.message).toBe("Something went wrong");
    });

    it("handles standard Error", () => {
      const error = new Error("Network issue");
      const queueError = toQueueError(error);
      expect(queueError.status).toBeUndefined();
      expect(queueError.message).toBe("Network issue");
    });

    it("handles unknown error", () => {
      const queueError = toQueueError("string error");
      expect(queueError.status).toBeUndefined();
      expect(queueError.message).toBe("Unable to complete the request.");
    });
  });

  describe("getErrorMessage", () => {
    it("returns message from Error", () => {
      expect(getErrorMessage(new Error("Test error"))).toBe("Test error");
    });
    it("returns generic message for non-Error", () => {
      expect(getErrorMessage("Test error")).toBe("Unable to complete the request.");
    });
  });

  describe("removeRecordKey", () => {
    it("removes specified key from record", () => {
      const record = { a: "1", b: "2", c: "3" };
      const result = removeRecordKey(record, "b");
      expect(result).toEqual({ a: "1", c: "3" });
    });
  });
});
