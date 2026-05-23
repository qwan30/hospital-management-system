import { ApiClientError } from "@/lib/api-client";
import type { ClinicalAppointmentResponse } from "@/lib/clinical-api";

export type QueueFilter = "waiting" | "ready" | "in_progress";

export type QueueError = {
  message: string;
  status?: number;
};

export type PhysicianLoad = {
  doctorId: string;
  doctorName: string;
  waiting: number;
  ready: number;
  inProgress: number;
  total: number;
};

export const filterOptions: { value: QueueFilter; label: string }[] = [
  { value: "waiting", label: "Waiting" },
  { value: "ready", label: "Ready" },
  { value: "in_progress", label: "In progress" },
];

export function mergeAppointments(
  primary: ClinicalAppointmentResponse[],
  overrides: ClinicalAppointmentResponse[],
) {
  return [...primary, ...overrides]
    .reduce<ClinicalAppointmentResponse[]>((current, appointment) => {
      const withoutDuplicate = current.filter(
        (candidate) => candidate.appointmentId !== appointment.appointmentId,
      );

      return [...withoutDuplicate, appointment];
    }, [])
    .sort(compareAppointments);
}

export function getQueueFilter(
  appointment: ClinicalAppointmentResponse,
): QueueFilter | null {
  if (appointment.status === "IN_PROGRESS") {
    return "in_progress";
  }

  if (appointment.status === "CHECKED_IN") {
    return "ready";
  }

  if (appointment.status === "CONFIRMED" || appointment.status === "PENDING") {
    return "waiting";
  }

  return null;
}

export function getQueueState(appointment: ClinicalAppointmentResponse) {
  const filter = getQueueFilter(appointment);

  if (filter === "in_progress") {
    return { label: "In progress", dotClass: "bg-hc-primary" };
  }

  if (filter === "ready") {
    return { label: "Ready", dotClass: "bg-hc-secondary" };
  }

  return { label: "Waiting", dotClass: "bg-hc-tertiary" };
}

export function calculatePhysicianLoads(
  appointments: ClinicalAppointmentResponse[],
) {
  return appointments
    .reduce<PhysicianLoad[]>((current, appointment) => {
      const filter = getQueueFilter(appointment);
      const existing = current.find((load) => load.doctorId === appointment.doctorId);
      const increment = {
        waiting: filter === "waiting" ? 1 : 0,
        ready: filter === "ready" ? 1 : 0,
        inProgress: filter === "in_progress" ? 1 : 0,
      };

      if (!existing) {
        return [
          ...current,
          {
            doctorId: appointment.doctorId,
            doctorName: appointment.doctorName,
            total: 1,
            ...increment,
          },
        ];
      }

      return current.map((load) =>
        load.doctorId === appointment.doctorId
          ? {
              ...load,
              waiting: load.waiting + increment.waiting,
              ready: load.ready + increment.ready,
              inProgress: load.inProgress + increment.inProgress,
              total: load.total + 1,
            }
          : load,
      );
    }, [])
    .sort((first, second) => second.total - first.total);
}

export function calculateAverageWaitMinutes(
  appointments: ClinicalAppointmentResponse[],
  now: Date,
) {
  if (appointments.length === 0) {
    return 0;
  }

  const totalMinutes = appointments.reduce(
    (total, appointment) => total + calculateWaitMinutes(appointment, now),
    0,
  );

  return Math.round(totalMinutes / appointments.length);
}

export function calculateWaitMinutes(
  appointment: ClinicalAppointmentResponse,
  now: Date,
) {
  const startedAt = getAppointmentReferenceTime(appointment);
  const minutes = Math.floor((now.getTime() - startedAt.getTime()) / 60_000);

  return Math.max(minutes, 0);
}

export function getWaitBadgeClass(waitMinutes: number) {
  if (waitMinutes >= 40) {
    return "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] border border-[var(--hc-danger)]/20";
  }

  if (waitMinutes >= 20) {
    return "bg-[var(--hc-warning-bg)] text-[var(--hc-warning)] border border-[var(--hc-warning)]/20";
  }

  return "bg-[var(--hc-success-bg)] text-[var(--hc-success)] border border-[var(--hc-success)]/20";
}

export function formatWait(waitMinutes: number) {
  if (waitMinutes < 60) {
    return `${waitMinutes}m`;
  }

  const hours = Math.floor(waitMinutes / 60);
  const minutes = waitMinutes % 60;

  return `${hours}h ${minutes}m`;
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function maskIdentifier(value: string) {
  if (value.length <= 4) {
    return value;
  }

  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

export function toLocalIsoDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
  ].join("");
}

export function toQueueError(error: unknown): QueueError {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return {
        status: error.status,
        message: "Your staff session has expired. Log in again to view the queue.",
      };
    }

    if (error.status === 403) {
      return {
        status: error.status,
        message: "This staff account is not authorized to view the nurse queue.",
      };
    }

    return {
      status: error.status,
      message: error.message,
    };
  }

  return {
    message: getErrorMessage(error),
  };
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to complete the request.";
}

export function removeRecordKey(record: Record<string, string>, keyToRemove: string) {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== keyToRemove),
  );
}

function compareAppointments(
  first: ClinicalAppointmentResponse,
  second: ClinicalAppointmentResponse,
) {
  return (
    getAppointmentReferenceTime(first).getTime() -
      getAppointmentReferenceTime(second).getTime() ||
    first.patientFullName.localeCompare(second.patientFullName)
  );
}

function getAppointmentReferenceTime(appointment: ClinicalAppointmentResponse) {
  if (appointment.checkedInAt) {
    return new Date(appointment.checkedInAt);
  }

  return new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
}
