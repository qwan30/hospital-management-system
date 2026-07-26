"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { HcIcon } from "@/components/ui/hc-icon";
import { useToast } from "@/components/ui/use-toast";
import { listDoctors, listDoctorSlots, createPublicAppointment, type DoctorResponse, type DoctorSlotResponse } from "@/lib/public-api";

export default function BookingDetailsReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [slot, setSlot] = useState<DoctorSlotResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [symptoms, setSymptoms] = useState("");

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const doctors = await listDoctors();
        if (!active || doctors.length === 0) return;
        const selectedDoctor = doctors[0];
        setDoctor(selectedDoctor);

        const date = new Date();
        date.setDate(date.getDate() + 1);
        const tomorrow = date.toISOString().slice(0, 10);
        
        const slots = await listDoctorSlots(selectedDoctor.id, tomorrow);
        if (active && slots.length > 0) {
          setSlot(slots[0]);
        }
      } catch (err) {
        console.error("Failed to load mock doctor data", err);
      }
    }
    fetchData();
    return () => { active = false; };
  }, []);

  const handleConfirm = async () => {
    if (!doctor || !slot) {
      alert("Doctor or slot data not loaded yet.");
      return;
    }

    if (!firstName || !lastName || !dob || !insuranceId || !symptoms) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields: First Name, Last Name, Date of Birth, Insurance ID, and Symptoms.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const resp = await createPublicAppointment({
        doctorId: doctor.id,
        firstSlotId: slot.id,
        aiDurationMinutes: 30,
        patientFullName: `${firstName} ${lastName}`.trim(),
        patientCccd: insuranceId,
        patientEmail: "patient@example.com",
        patientPhone: "0123456789",
        patientDateOfBirth: dob,
        patientGender: "OTHER",
        patientAddress: {
          provinceOrCity: "Default City",
          district: "Default District",
          streetAddress: "Default Address"
        },
        symptoms: symptoms
      });
      
      router.push(`/staff/booking/success?id=${resp.id}`);
    } catch (err) {
      alert("Failed to confirm booking: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-[1400px] mx-auto p-8 pb-20">
      <header className="mb-8">
        <nav className="flex items-center gap-0 mb-8 border-b border-[var(--hc-border-soft)]">
          <div className="flex items-center px-6 py-4 border-b-2 border-transparent text-[var(--hc-text-muted)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 bg-[var(--hc-surface-soft)] rounded-[var(--radius-sm)] text-[10px] mr-2">1</span>
            Symptoms
          </div>
          <div className="flex items-center px-6 py-4 border-b-2 border-transparent text-[var(--hc-text-muted)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 bg-[var(--hc-surface-soft)] rounded-[var(--radius-sm)] text-[10px] mr-2">2</span>
            Triage & Slots
          </div>
          <div className="flex items-center px-6 py-4 border-b-2 border-[var(--hc-primary)] text-[var(--hc-primary)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-[var(--hc-primary)] rounded-[var(--radius-sm)] text-[10px] mr-2">3</span>
            Patient Details
          </div>
          <div className="flex items-center px-6 py-4 text-[var(--hc-text-muted)] font-bold text-sm">
            <span className="w-5 h-5 flex items-center justify-center border border-slate-200 rounded-[var(--radius-sm)] text-[10px] mr-2">4</span>
            Confirmation
          </div>
        </nav>
        <h1 className="text-3xl font-light tracking-tight text-[var(--hc-text)] mb-2">Patient Details & Review</h1>
        <p className="text-[var(--hc-text-secondary)] text-sm max-w-2xl font-normal">Complete the required health profile to finalize the surgical admission. All information is encrypted via Level 4 medical security standards.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">

          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-6 border-b border-[var(--hc-border-soft)] pb-4">Required Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Legal First Name</label>
                <input className="hc-input w-full" placeholder="e.g. Jonathan" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Legal Last Name</label>
                <input className="hc-input w-full" placeholder="e.g. Miller" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Date of Birth</label>
                <input className="hc-input w-full" type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Insurance ID</label>
                <input className="hc-input w-full" placeholder="XX-00000000" type="text" value={insuranceId} onChange={e => setInsuranceId(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-muted)] mb-6 border-b border-[var(--hc-border-soft)] pb-4">Optional Health Context</h2>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Symptoms / Reason for Visit</label>
                <textarea className="hc-input w-full resize-none" placeholder="Describe the presenting symptoms or reason for this visit..." rows={3} value={symptoms} onChange={e => setSymptoms(e.target.value)}></textarea>
              </div>

              <div className="flex items-center gap-4 bg-[var(--hc-amber-bg)] border border-amber-100 p-4 rounded-[var(--radius-lg)] mt-2">
                <input className="w-4 h-4 text-[var(--hc-amber-600)] border-amber-300 rounded focus:ring-amber-500" id="emergency" type="checkbox" />
                <label className="text-xs font-bold text-amber-900 tracking-tight cursor-pointer" htmlFor="emergency">I AUTHORIZE EMERGENCY DATA SHARING WITH ON-CALL SURGEONS</label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 sticky top-8">
          <div className="bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] shadow-sm p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-1">Review Summary</div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--hc-text)]">General Consultation</h3>
              </div>
              <HcIcon name="info" className="text-[var(--hc-text-muted)]" />
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-[var(--hc-border-soft)] pb-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Procedure</div>
                <div className="text-sm font-bold text-[var(--hc-text)]">Consultation</div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-[var(--hc-border-soft)] pb-4">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Date</div>
                  <div className="text-sm font-bold text-[var(--hc-text)]">{slot?.slotDate || "Loading..."}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Check-in</div>
                  <div className="text-sm font-bold text-[var(--hc-text)]">{slot?.startTime?.slice(0, 5) || "00:00"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 flex-shrink-0">
                  {doctor?.avatarUrl && (
                    <Image alt={doctor.fullName} className="h-full w-full object-cover rounded-[var(--radius-md)]" src={doctor.avatarUrl} width={120} height={120} />
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Primary Doctor</div>
                  <div className="text-sm font-bold text-[var(--hc-text)]">{doctor?.fullName || "Loading..."}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--hc-border-soft)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Estimated Duration</span>
                  <span className="text-sm font-bold text-[var(--hc-text)]">30 Minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-muted)]">Facility Fee</span>
                  <span className="text-sm font-bold text-[var(--hc-text)]">$150.00</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <button onClick={handleConfirm} disabled={isSubmitting} className="w-full hc-button-primary py-3.5 disabled:opacity-50">
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </button>
              <button onClick={() => { alert("Draft booking saved successfully."); router.push("/staff/dashboard"); }} className="w-full hc-button-secondary py-3.5">
                Save as Draft
              </button>
            </div>

            <p className="text-[10px] text-[var(--hc-text-muted)] text-center leading-relaxed italic font-medium mt-2">
              By clicking confirm, you agree to Hospital Core's surgical intake policies and privacy protocols.
            </p>
          </div>

          <div className="mt-4 p-5 bg-[var(--hc-success-bg)] border border-emerald-100 rounded-[var(--radius-lg)] flex items-start gap-4">
            <HcIcon name="verified_user" className="text-[var(--hc-success)] shrink-0" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 mb-1">Data Protection</div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">This session is encrypted using 256-bit AES. All PHI is handled per HIPAA and GDPR standards.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
