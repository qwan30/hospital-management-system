export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELLED";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type ClinicalAppointment = {
  readonly appointmentId: string;
  readonly confirmationCode: string;
  readonly status: AppointmentStatus;
  readonly appointmentDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly checkedInAt: string | null;
  readonly doctorId: string;
  readonly doctorName: string;
  readonly patientId: string;
  readonly patientFullName: string;
  readonly patientPhone: string;
  readonly patientCccd: string;
};

export type AppointmentDetail = {
  readonly appointmentId: string;
  readonly confirmationCode: string;
  readonly status: AppointmentStatus;
  readonly appointmentDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly checkedInAt: string | null;
  readonly aiDurationMinutes: number;
  readonly symptoms: string | null;
  readonly doctorId: string;
  readonly doctorName: string;
  readonly patientId: string;
  readonly patientFullName: string;
  readonly patientPhone: string;
  readonly patientCccd: string;
  readonly patientEmail: string;
  readonly patientDateOfBirth: string;
  readonly patientGender: Gender;
};

export type DashboardMetric = {
  readonly label: string;
  readonly value: string;
  readonly accent: "blue" | "green" | "slate";
};
