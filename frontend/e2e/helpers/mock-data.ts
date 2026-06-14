export const mockPatientQueue = [
  {
    id: "APT-1001",
    patientName: "Arthur Morgan",
    status: "in-progress",
    time: "09:00 AM",
    doctor: "Dr. Adler",
    type: "Post-Op Follow-up"
  },
  {
    id: "APT-1002",
    patientName: "John Marston",
    status: "checked-in",
    time: "09:30 AM",
    doctor: "Dr. Miller",
    type: "Triage Routine"
  },
  {
    id: "APT-1003",
    patientName: "Sadie Miller",
    status: "waiting",
    time: "10:00 AM",
    doctor: "Triage 1",
    type: "Emergency Chest Pain"
  }
];

export const mockStaffDashboardStats = {
  activeRounds: 12,
  criticalAlerts: 3,
  waitTimeAvg: 18,
  resolvedToday: 45
};

export const mockMedicalRecord = {
  id: "REC-2049",
  patientId: "PAT-001",
  patientName: "Kerrigan, Sarah",
  primaryDiagnosis: "Hypertension",
  vitals: {
    heartRate: 72,
    bloodPressure: "120/80"
  },
  prescriptions: [
    { name: "Levetiracetam (Keppra) 500mg", status: "Active" },
    { name: "Sumatriptan 50mg", status: "Active" }
  ]
};

export const mockVitalSigns = {
  patientId: "PAT-002",
  patientName: "Harrison Wells",
  bloodPressure: "120/80",
  heartRate: 72,
  spo2: 98,
  temperature: 36.6,
  respiratoryRate: 16
};

// Add more admin/portal mocks as needed
export const mockAdminUsers = [
  { id: "USR-001", name: "Admin User", role: "ADMIN", status: "Active" },
  { id: "USR-002", name: "Dr. Gregory House", role: "DOCTOR", status: "Active" },
  { id: "USR-003", name: "Nurse Jackie", role: "NURSE", status: "Active" }
];
