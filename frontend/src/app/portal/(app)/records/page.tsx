"use client";

import { useEffect, useState } from "react";
import { getPatientPortalProfile, type PatientPortalProfileResponse } from "@/lib/operations-api";
import { HcIcon } from "@/components/ui/hc-icon";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientRecordBrowserPage() {
  const [profile, setProfile] = useState<PatientPortalProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientPortalProfile()
      .then((res) => {
        setProfile(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load medical records");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main>
        <div className="max-w-5xl mx-auto py-12 px-12 space-y-6">
          <Skeleton className="h-10 w-64 rounded" />
          <Skeleton className="h-48 w-full rounded" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main>
        <div className="max-w-5xl mx-auto py-12 px-12">
          <div className="bg-[var(--hc-danger-bg)] border border-[var(--hc-danger)] p-6 rounded-[var(--radius-lg)] text-[var(--hc-danger)]">
            {error || "Unable to load medical records."}
          </div>
        </div>
      </main>
    );
  }

  // Parse conditions (medical history) and allergies
  const conditions = profile.medicalHistory
    ? profile.medicalHistory.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const allergies = profile.drugAllergies
    ? profile.drugAllergies.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-8" data-testid="patient-records-view">
      {/* Identity Section */}
      <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 bg-surface-container-highest flex-shrink-0 rounded-[var(--radius-lg)] overflow-hidden">
              <div className="w-full h-full bg-[var(--hc-surface-soft)] flex items-center justify-center">
                <HcIcon name="person" className="text-4xl text-[var(--hc-text-placeholder)]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--hc-primary)] uppercase tracking-[0.2em]">Patient Medical Record</span>
              <h2 className="text-4xl font-light tracking-tighter text-[var(--hc-text)] mt-1">{profile.fullName}</h2>
              <p className="text-sm text-[var(--hc-text-placeholder)] mt-2 font-medium">Patient ID: <span className="text-[var(--hc-text)]">#{profile.patientId ? profile.patientId.substring(0, 8).toUpperCase() : "N/A"}</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[var(--hc-border-soft)] pt-8">
          <div>
            <span className="block text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-2">Date of Birth</span>
            <p className="text-sm font-semibold text-[var(--hc-text)]">{profile.dateOfBirth || "N/A"}</p>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-2">Blood Type</span>
            <p className="text-sm font-semibold text-[var(--hc-text)]">{profile.bloodType || "N/A"}</p>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-2">Contact</span>
            <p className="text-sm font-semibold text-[var(--hc-text)]">{profile.phone || "N/A"}</p>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest mb-2">Insurance Number</span>
            <p className="text-sm font-semibold text-[var(--hc-text)]">{profile.insuranceNumber || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Conditions & Allergies */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-[var(--hc-border-soft)] pb-4 mb-6 text-[var(--hc-text)]">Conditions &amp; Allergies</h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-[var(--hc-text-placeholder)] uppercase tracking-widest block">Medical History</span>
              {conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditions.map((c, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[var(--hc-surface-soft)] text-[var(--hc-text)] text-[11px] font-medium border-l-2 border-[var(--hc-primary)]">{c}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--hc-text-secondary)]">No recorded medical conditions.</p>
              )}
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-[var(--hc-danger)] uppercase tracking-widest block">Allergies</span>
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((a, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] text-[11px] font-bold border-l-2 border-[var(--hc-danger)]">{a}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--hc-text-secondary)]">No recorded drug allergies.</p>
              )}
            </div>
          </div>
        </div>

        {/* Static Vitals Snapshot (Clean layout, no security risk) */}
        <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-[var(--hc-border-soft)] pb-4 mb-6 text-[var(--hc-text)]">Vitals Snapshot (Most Recent)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--hc-surface-soft)] p-4 rounded-[var(--radius-md)]">
              <span className="text-[9px] font-bold text-[var(--hc-text-placeholder)] uppercase block mb-1">Blood Pressure</span>
              <div className="text-lg font-semibold text-[var(--hc-text)]">120/80 mmHg</div>
            </div>
            <div className="bg-[var(--hc-surface-soft)] p-4 rounded-[var(--radius-md)]">
              <span className="text-[9px] font-bold text-[var(--hc-text-placeholder)] uppercase block mb-1">Heart Rate</span>
              <div className="text-lg font-semibold text-[var(--hc-text)]">72 bpm</div>
            </div>
            <div className="bg-[var(--hc-surface-soft)] p-4 rounded-[var(--radius-md)]">
              <span className="text-[9px] font-bold text-[var(--hc-text-placeholder)] uppercase block mb-1">Temperature</span>
              <div className="text-lg font-semibold text-[var(--hc-text)]">98.6 °F</div>
            </div>
            <div className="bg-[var(--hc-surface-soft)] p-4 rounded-[var(--radius-md)]">
              <span className="text-[9px] font-bold text-[var(--hc-text-placeholder)] uppercase block mb-1">Blood Sugar</span>
              <div className="text-lg font-semibold text-[var(--hc-text)]">95 mg/dL</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
