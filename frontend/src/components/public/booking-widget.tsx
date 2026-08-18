"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useCachedData } from "@/lib/use-cached-data";
import {
  listDepartments,
  listDoctors,
  type DepartmentResponse,
  type DoctorResponse,
} from "@/lib/public-api";

export function BookingWidget() {
  const router = useRouter();
  const { data: fetchedDepts } = useCachedData<DepartmentResponse[]>(
    "public:departments",
    listDepartments,
    { ttlMs: 300000, persistKey: "departments" }
  );
  const { data: fetchedDocs } = useCachedData<DoctorResponse[]>(
    "public:doctors",
    listDoctors,
    { ttlMs: 300000, persistKey: "doctors" }
  );
  const departments = fetchedDepts ?? [];
  const doctors = fetchedDocs ?? [];
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const filteredDoctors = selectedDepartmentId
    ? doctors.filter((doc) => doc.departmentId === selectedDepartmentId)
    : doctors;

  function handleBook() {
    const params = new URLSearchParams();
    if (selectedDoctorId) params.set("doctorId", selectedDoctorId);
    if (selectedDepartmentId) params.set("departmentId", selectedDepartmentId);
    if (selectedDate) params.set("date", selectedDate);

    const query = params.toString();
    router.push(query ? `/booking?${query}` : "/booking");
  }

  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-hc-primary">
        Fast-track clinical intake
      </h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label
            htmlFor="widget-dept"
            className="block text-[11px] font-semibold text-slate-600 mb-1"
          >
            Department
          </label>
          <select
            id="widget-dept"
            value={selectedDepartmentId}
            onChange={(e) => {
              setSelectedDepartmentId(e.target.value);
              setSelectedDoctorId("");
            }}
            className="h-10 w-full rounded-[6px] border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-hc-primary focus:ring-1 focus:ring-hc-primary cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="widget-doc"
            className="block text-[11px] font-semibold text-slate-600 mb-1"
          >
            Doctor
          </label>
          <select
            id="widget-doc"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="h-10 w-full rounded-[6px] border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-hc-primary focus:ring-1 focus:ring-hc-primary cursor-pointer"
          >
            <option value="">Any Available Doctor</option>
            {filteredDoctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.fullName} {doc.specialty ? `- ${doc.specialty}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="widget-date"
            className="block text-[11px] font-semibold text-slate-600 mb-1"
          >
            Appointment Date
          </label>
          <input
            id="widget-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 w-full rounded-[6px] border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-hc-primary focus:ring-1 focus:ring-hc-primary cursor-pointer"
          />
        </div>

        <div>
          <label
            htmlFor="widget-time"
            className="block text-[11px] font-semibold text-slate-600 mb-1"
          >
            Preferred Time
          </label>
          <select
            id="widget-time"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
            className="h-10 w-full rounded-[6px] border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-hc-primary focus:ring-1 focus:ring-hc-primary cursor-pointer"
          >
            <option value="">Morning (08:00 - 12:00)</option>
            <option value="afternoon">Afternoon (13:00 - 17:00)</option>
            <option value="evening">Evening (17:30 - 20:00)</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBook}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] bg-hc-primary text-sm font-semibold text-white transition hover:bg-hc-blue-500 shadow-sm active:scale-[0.99] cursor-pointer"
      >
        Book Appointment
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
