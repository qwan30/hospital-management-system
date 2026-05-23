"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getDepartment,
  listDepartments,
  type DepartmentDetailResponse,
  type DepartmentDoctorSummary,
} from "@/lib/public-api";

import { HcIcon } from "@/components/ui/hc-icon";
import { RouteErrorState } from "@/components/ui/route-error-state";
function formatRouteLabel(value: string) {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function DoctorCard({ doctor }: { doctor: DepartmentDoctorSummary }) {
  return (
    <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-6 flex gap-5 transition-all hover:shadow-md hover:border-slate-300 group">
      <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-slate-100 shrink-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[var(--hc-primary)]">{getInitials(doctor.fullName)}</span>
      </div>
      <div className="flex flex-col justify-center">
        <h4 className="font-bold text-lg leading-tight text-[var(--hc-text)] group-hover:text-[var(--hc-primary)] transition-colors mb-1">
          {doctor.fullName}
        </h4>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          {doctor.specialty || "Specialist"}
        </p>
        <div className="flex flex-wrap gap-2">
          {doctor.qualification ? (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-md px-2.5 py-1 uppercase tracking-widest">
              {doctor.qualification}
            </span>
          ) : null}
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-md px-2.5 py-1 uppercase tracking-widest">
            {doctor.experienceYears == null
              ? "Experience not provided"
              : `${doctor.experienceYears} years`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentDetailPage() {
  const params = useParams<{ id: string }>();
  const departmentId = params.id;
  const [department, setDepartment] = useState<DepartmentDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routeLabel = useMemo(() => formatRouteLabel(departmentId), [departmentId]);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function resolveDepartmentId(id: string): Promise<string> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      return id;
    }
    const depts = await listDepartments();
    const matched = depts.find(
      (d) => slugify(d.name) === id.toLowerCase() || d.id === id
    );
    if (!matched) {
      throw new Error("Department not found");
    }
    return matched.id;
  }

  async function loadDepartment() {
    setIsLoading(true);
    setError(null);

    try {
      const resolvedId = await resolveDepartmentId(departmentId);
      setDepartment(await getDepartment(resolvedId));
    } catch (loadError) {
      setDepartment(null);
      setError(loadError instanceof Error ? loadError.message : "Unable to load department");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    resolveDepartmentId(departmentId)
      .then((resolvedId) => {
        if (!isActive) return;
        return getDepartment(resolvedId);
      })
      .then((nextDepartment) => {
        if (!isActive || !nextDepartment) return;
        setDepartment(nextDepartment);
        setError(null);
      })
      .catch((loadError) => {
        if (!isActive) return;
        setDepartment(null);
        setError(loadError instanceof Error ? loadError.message : "Unable to load department");
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [departmentId]);

  return (
    <main>
      <div className="bg-slate-50 min-h-screen px-6 py-12 md:px-8">
        <div className="max-w-[1440px] mx-auto">
          <nav className="flex items-center gap-3 mb-10 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            <Link className="hover:text-[var(--hc-primary)] transition-colors" href="/departments">
              Departments
            </Link>
            <HcIcon name="chevron_right" className="w-4 h-4" />
            <span className="text-[var(--hc-text)]">
              {department?.name ?? routeLabel}
            </span>
          </nav>

          {isLoading ? (
            <div className="border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-white p-16 flex flex-col items-center justify-center text-center">
              <HcIcon name="hourglass_empty" className="text-4xl text-slate-300 mb-4" />
              <h2 className="text-xl font-bold tracking-tight text-[var(--hc-text)] mb-2">Loading Department</h2>
              <p className="text-sm text-[var(--hc-text-secondary)] font-medium">Loading department from the hospital system...</p>
            </div>
          ) : error ? (
            <RouteErrorState
              title="Department not found"
              description={`${routeLabel} may have been removed, renamed, or temporarily unavailable in the public directory.`}
              primaryHref="/departments"
              primaryLabel="Back to Departments"
              onRetry={() => void loadDepartment()}
            />
          ) : department ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-8 flex flex-col gap-10">
                <h1 className="text-5xl md:text-7xl font-light tracking-tight text-[var(--hc-text)] leading-tight">
                  {department.name}
                </h1>

                <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-8 shadow-sm">
                  <p className="text-lg leading-relaxed text-[var(--hc-text-secondary)] font-medium">
                    {department.description || "No public description has been published."}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-6 shadow-sm flex flex-col items-center text-center">
                    <span className="block text-4xl font-light text-[var(--hc-primary)] mb-2">
                      {department.activeDoctorCount}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Active Doctors
                    </span>
                  </div>
                  <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-6 shadow-sm flex flex-col items-center text-center">
                    <span className="block text-4xl font-light text-[var(--hc-text)] mb-2">
                      {department.phone ? "Yes" : "No"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Public Phone
                    </span>
                  </div>
                </div>

                <section id="doctors" className="mt-4">
                  <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--hc-text)]">
                      Doctors in this department
                    </h2>
                    <Link
                      className="text-[var(--hc-primary)] text-xs font-bold uppercase tracking-widest flex items-center hover:underline"
                      href="/doctors"
                    >
                      View All Staff
                      <HcIcon name="arrow_forward" className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                  {department.doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {department.doctors.map((doctor) => (
                        <DoctorCard doctor={doctor} key={doctor.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-12 text-center text-sm text-[var(--hc-text-secondary)] font-medium shadow-sm">
                      No active doctors are assigned to this department.
                    </div>
                  )}
                </section>
              </div>

              <aside className="lg:col-span-4 sticky top-10">
                <div className="bg-white border border-[var(--hc-border-soft)] border-t-4 border-t-[var(--hc-primary)] rounded-b-[var(--radius-xl)] shadow-sm p-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                    <HcIcon name="info" className="w-4 h-4" />
                    Quick Facts
                  </h2>
                  <div className="space-y-8">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-primary)] mb-2">
                        Direct Phone
                      </span>
                      <p className="text-lg font-bold text-[var(--hc-text)]">
                        {department.phone || "Not published"}
                      </p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Data Source
                      </span>
                      <p className="text-sm text-[var(--hc-text-secondary)] font-medium bg-slate-50 p-3 rounded-[var(--radius-md)] border border-[var(--hc-border-soft)] font-mono text-[11px]">
                        GET /api/v1/departments/{departmentId}
                      </p>
                    </div>
                  </div>
                  <div className="mt-10">
                    <Link
                      className="hc-button-primary w-full flex items-center justify-center gap-3 py-3.5"
                      href={`/booking`}
                    >
                      Book Consultation
                      <HcIcon name="calendar_month" className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
