"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getPatientRecordDetail,
  searchPatientRecords,
  type PatientRecordDetailResponse,
  type PatientRecordListItemResponse,
} from "@/lib/patient-records-api";

import { HcIcon } from "@/components/ui/hc-icon";
import { PageHeader } from "@/components/ui/page-header";

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) {
    return "Unknown";
  }

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) {
    return "Unknown";
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return `${age}y`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function getStatusTone(status: string) {
  if (["DONE", "CANCELLED"].includes(status)) {
    return "bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)]";
  }
  if (["CHECKED_IN", "IN_PROGRESS"].includes(status)) {
    return "bg-[var(--hc-primary)] text-white";
  }
  return "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)]";
}

export default function PatientsPage() {
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<PatientRecordListItemResponse[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<PatientRecordDetailResponse | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function loadPatients(nextQuery = query) {
    setIsSearching(true);
    setSearchError(null);

    try {
      const nextPatients = await searchPatientRecords(nextQuery);
      setPatients(nextPatients);
      if (!nextPatients.some((patient) => patient.patientId === selectedPatientId)) {
        setSelectedPatientId("");
        setSelectedDetail(null);
      }
    } catch (loadError) {
      setPatients([]);
      setSelectedPatientId("");
      setSelectedDetail(null);
      setSearchError(loadError instanceof Error ? loadError.message : "Unable to search patients");
    } finally {
      setIsSearching(false);
    }
  }

  async function loadPatientDetail(patientId: string) {
    setSelectedPatientId(patientId);
    setIsLoadingDetail(true);
    setDetailError(null);

    try {
      setSelectedDetail(await getPatientRecordDetail(patientId));
    } catch (loadError) {
      setSelectedDetail(null);
      setDetailError(loadError instanceof Error ? loadError.message : "Unable to load patient detail");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    searchPatientRecords()
      .then((nextPatients) => {
        if (!isActive) {
          return;
        }
        setPatients(nextPatients);
        setSearchError(null);
      })
      .catch((loadError) => {
        if (!isActive) {
          return;
        }
        setPatients([]);
        setSearchError(loadError instanceof Error ? loadError.message : "Unable to search patients");
      })
      .finally(() => {
        if (isActive) {
          setIsSearching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const selectedSummary = useMemo(
    () => patients.find((patient) => patient.patientId === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadPatients(query);
  }

  return (
    <div className="flex bg-[var(--hc-background)] h-[calc(100vh-[var(--hc-topbar-height)])] overflow-hidden">
      <div className="w-[41.66%] bg-[var(--hc-surface)] border-r border-[var(--hc-border)] flex flex-col h-full z-10">
        <form className="p-8 pb-6 border-b border-[var(--hc-border-soft)] space-y-6" onSubmit={handleSearchSubmit}>
          <PageHeader
            title="Search Records"
            description="Patient Directory"
            className="mb-0"
          />
          <div className="hc-search relative group">
            <HcIcon name="search" className="text-[var(--hc-text-placeholder)] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              aria-label="Search patients"
              className="w-full bg-[var(--hc-surface)] border border-[var(--hc-border)] rounded-[var(--radius-md)] p-3 pl-12 pr-12 focus:ring-2 focus:ring-[var(--hc-primary)] transition-all text-sm placeholder:text-[var(--hc-text-placeholder)] outline-none"
              id="patient-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, phone, email, or CCCD..."
              type="search"
              value={query}
            />
            <button
              aria-label="Submit patient search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)]"
              disabled={isSearching}
              type="submit"
            >
              <HcIcon name="arrow_forward" />
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--hc-surface-soft)]">
          {isSearching ? (
            <div className="p-6 text-sm text-[var(--hc-text-secondary)] text-center">
              Searching patient records...
            </div>
          ) : searchError ? (
            <div className="p-6 bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] text-sm rounded-[var(--radius-md)]" role="alert">
              {searchError}
            </div>
          ) : patients.length === 0 ? (
            <div className="p-6 text-sm text-[var(--hc-text-secondary)] text-center">
              No patients found.
            </div>
          ) : (
            patients.map((patient) => (
              <button
                className={`w-full p-5 text-left rounded-[var(--radius-lg)] transition-all border ${
                  selectedPatientId === patient.patientId
                    ? "bg-[var(--hc-surface)] border-[var(--hc-primary)] shadow-[var(--shadow-card)] ring-1 ring-[var(--hc-primary)]"
                    : "bg-[var(--hc-surface)] border-[var(--hc-border)] hover:border-[var(--hc-border-hover)] hover:shadow-sm"
                }`}
                key={patient.patientId}
                onClick={() => void loadPatientDetail(patient.patientId)}
                type="button"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="font-bold text-[var(--hc-text)] text-base leading-tight">
                      {patient.fullName}
                    </h2>
                    <p className="text-[11px] font-medium text-[var(--hc-text-secondary)] mt-1 font-mono">
                      {patient.patientId}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {patient.totalAppointments} visits
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="block text-[10px] text-[var(--hc-text-placeholder)] font-bold uppercase">Age</span>
                    <span className="text-[13px] font-semibold text-[var(--hc-text)]">{calculateAge(patient.dateOfBirth)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[var(--hc-text-placeholder)] font-bold uppercase">Last Visit</span>
                    <span className="text-[13px] font-semibold text-[var(--hc-text)]">{formatDate(patient.latestAppointmentDate)}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[var(--hc-background)] p-8">
        <div className="max-w-5xl mx-auto">
          {!selectedPatientId ? (
            <div className="bg-[var(--hc-surface)] rounded-[var(--radius-xl)] border border-[var(--hc-border)] p-12 text-center shadow-[var(--shadow-card)] flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-[var(--hc-surface-soft)] text-[var(--hc-text-placeholder)] flex items-center justify-center mb-6">
                 <HcIcon name="person_search" className="text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--hc-text)]">
                Select a patient record
              </h2>
              <p className="mt-2 text-sm text-[var(--hc-text-secondary)] max-w-sm mx-auto">
                Search results are loaded from the backend. Select a patient row to load their comprehensive medical profile.
              </p>
            </div>
          ) : isLoadingDetail ? (
            <div className="bg-[var(--hc-surface)] rounded-[var(--radius-xl)] border border-[var(--hc-border)] p-12 text-center text-sm text-[var(--hc-text-secondary)]">
              Loading patient detail...
            </div>
          ) : detailError ? (
            <div className="bg-[var(--hc-danger-bg)] rounded-[var(--radius-xl)] p-8 text-sm text-[var(--hc-danger)]" role="alert">
              {detailError}
            </div>
          ) : selectedDetail ? (
            <div className="space-y-6">
              <div className="bg-[var(--hc-surface)] rounded-[var(--radius-xl)] border border-[var(--hc-border)] shadow-[var(--shadow-card)] p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <Badge variant="info">Active Record</Badge>
                       <span className="text-[11px] font-mono font-medium text-[var(--hc-text-secondary)]">ID: {selectedDetail.patientId}</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--hc-text)]">
                      {selectedDetail.fullName}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    {["edit", "print"].map((icon) => (
                      <button
                        className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--hc-border)] text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] transition-colors opacity-60 cursor-not-allowed"
                        disabled
                        key={icon}
                        title="Unsupported by current flow"
                        type="button"
                      >
                        <HcIcon name={icon} className="text-xl" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-[var(--hc-border-soft)]">
                  <div>
                    <span className="block text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-1">
                      Date of Birth
                    </span>
                    <p className="text-sm font-semibold text-[var(--hc-text)]">{formatDate(selectedDetail.dateOfBirth)}</p>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-1">
                      Blood Type
                    </span>
                    <p className="text-sm font-semibold text-[var(--hc-text)]">{selectedDetail.bloodType || "Not recorded"}</p>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-1">
                      Contact
                    </span>
                    <p className="text-sm font-semibold text-[var(--hc-text)]">{selectedDetail.phone || "Not recorded"}</p>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-1">
                      Insurance
                    </span>
                    <p className="text-sm font-semibold text-[var(--hc-text)] font-mono">
                      {selectedDetail.insuranceNumber || "Not recorded"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[var(--hc-surface)] rounded-[var(--radius-xl)] border border-[var(--hc-border)] shadow-[var(--shadow-card)] p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--hc-border-soft)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--hc-surface-soft)] flex items-center justify-center text-[var(--hc-text-secondary)]">
                       <HcIcon name="medical_information" className="text-lg" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--hc-text)]">
                      Conditions & Allergies
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[var(--hc-text-secondary)] uppercase tracking-widest">
                        Medical History
                      </span>
                      <p className="text-[13px] text-[var(--hc-text)] leading-relaxed">
                        {selectedDetail.medicalHistory || "No medical history recorded."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[var(--hc-danger)] uppercase tracking-widest">
                        Allergies
                      </span>
                      <div className="bg-[var(--hc-danger-bg)] p-3 rounded-[var(--radius-md)] border border-[var(--hc-danger)] border-opacity-20">
                         <p className="text-[13px] text-[var(--hc-danger)] font-medium">
                           {selectedDetail.drugAllergies || "No drug allergies recorded."}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--hc-surface)] rounded-[var(--radius-xl)] border border-[var(--hc-border)] shadow-[var(--shadow-card)] p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--hc-border-soft)]">
                    <div className="w-8 h-8 rounded-lg bg-[var(--hc-surface-soft)] flex items-center justify-center text-[var(--hc-text-secondary)]">
                       <HcIcon name="history" className="text-lg" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--hc-text)]">
                      Recent Appointments
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {selectedDetail.appointments.length > 0 ? (
                      selectedDetail.appointments.slice(0, 5).map((appointment) => (
                        <div className="flex gap-4 p-4 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] hover:bg-[var(--hc-surface-soft)] transition-colors" key={appointment.appointmentId}>
                          <div className="w-10 h-10 bg-[var(--hc-surface)] border border-[var(--hc-border)] rounded-full flex items-center justify-center flex-shrink-0 text-[var(--hc-primary)]">
                            <HcIcon name="calendar_month" className="text-lg" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                               <h4 className="text-[13px] font-bold text-[var(--hc-text)]">{appointment.doctorName}</h4>
                               <span className={`hc-badge ${getStatusTone(appointment.status)}`}>
                                 {appointment.status}
                               </span>
                            </div>
                            <p className="text-xs text-[var(--hc-text-secondary)] mt-1 font-medium">
                              {formatDate(appointment.appointmentDate)} • {formatTimeRange(appointment.startTime, appointment.endTime)}
                            </p>
                            {appointment.medicalRecord ? (
                              <div className="mt-3 text-[13px] text-[var(--hc-text)] bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] p-3 rounded-[var(--radius-md)]">
                                <span className="font-bold block mb-1">Diagnosis:</span>
                                {appointment.medicalRecord.diagnosis}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--hc-text-secondary)] text-center py-4">
                        No appointments are recorded for this patient.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedSummary ? (
            <div className="bg-[var(--hc-surface)] rounded-[var(--radius-xl)] border border-[var(--hc-border)] p-12 text-center text-sm text-[var(--hc-text-secondary)]">
              Select {selectedSummary.fullName} again to retry detail loading.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
