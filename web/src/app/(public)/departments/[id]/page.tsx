"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getDepartment,
  type DepartmentDetailResponse,
  type DepartmentDoctorSummary,
} from "@/lib/public-api";

import { HcIcon } from "@/components/ui/hc-icon";
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
    <div className="bg-surface-container-lowest p-6 flex gap-4 transition-colors hover:bg-white group">
      <div className="w-20 h-20 bg-surface-container-high shrink-0 flex items-center justify-center">
        <span className="text-xl font-light text-primary">{getInitials(doctor.fullName)}</span>
      </div>
      <div className="flex flex-col justify-center">
        <h4 className="font-headline font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
          {doctor.fullName}
        </h4>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-outline mb-2">
          {doctor.specialty || "Specialist"}
        </p>
        <div className="flex flex-wrap gap-2">
          {doctor.qualification ? (
            <span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">
              {doctor.qualification}
            </span>
          ) : null}
          <span className="text-[10px] bg-surface-container-highest px-2 py-0.5 font-medium">
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

  async function loadDepartment() {
    setIsLoading(true);
    setError(null);

    try {
      setDepartment(await getDepartment(departmentId));
    } catch (loadError) {
      setDepartment(null);
      setError(loadError instanceof Error ? loadError.message : "Unable to load department");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    getDepartment(departmentId)
      .then((nextDepartment) => {
        if (!isActive) {
          return;
        }
        setDepartment(nextDepartment);
        setError(null);
      })
      .catch((loadError) => {
        if (!isActive) {
          return;
        }
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
      <div className="bg-surface-container-low px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 mb-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
            <Link className="hover:text-primary transition-colors" href="/departments">
              Departments
            </Link>
            <HcIcon name="chevron_right" className="text-[12px]" />
            <span className="text-on-surface">
              {department?.name ?? routeLabel}
            </span>
          </nav>

          {isLoading ? (
            <div className="bg-surface-container-lowest p-10 text-center text-sm text-on-surface-variant">
              Loading department from the hospital system...
            </div>
          ) : error ? (
            <div className="bg-surface-container-lowest p-10 text-center" role="alert">
              <h1 className="mb-4 text-4xl font-light tracking-tight text-on-surface">
                Department could not be loaded: {routeLabel}
              </h1>
              <p className="mb-6 text-sm text-on-surface-variant">{error}</p>
              <p className="mb-8 text-sm text-on-surface-variant">
                Department detail routes require the backend department UUID. Legacy static slugs are
                not mapped to fake department data.
              </p>
              <button
                className="mr-3 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white"
                onClick={() => void loadDepartment()}
                type="button"
              >
                Try Again
              </button>
              <Link
                className="inline-block bg-surface-container-high px-6 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface"
                href="/departments"
              >
                Back To Departments
              </Link>
            </div>
          ) : department ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8">
                <h1 className="text-6xl md:text-8xl font-light font-headline tracking-tighter text-on-surface mb-8 leading-[0.9]">
                  {department.name}
                </h1>
                <div className="bg-surface-container-lowest p-8 relative mb-12">
                  <p className="text-xl font-body leading-relaxed text-on-surface-variant font-light">
                    {department.description || "No public description has been published."}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                  <div className="bg-surface-container-highest p-6">
                    <span className="block text-4xl font-headline font-light mb-1">
                      {department.activeDoctorCount}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-outline">
                      Active Doctors
                    </span>
                  </div>
                  <div className="bg-surface-container-highest p-6">
                    <span className="block text-4xl font-headline font-light mb-1">
                      {department.phone ? "Yes" : "No"}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-outline">
                      Public Phone
                    </span>
                  </div>
                </div>

                <section id="doctors">
                  <div className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl font-headline font-semibold tracking-tight">
                      Doctors in this department
                    </h2>
                    <Link
                      className="text-primary text-xs font-semibold uppercase tracking-widest flex items-center hover:underline"
                      href="/doctors"
                    >
                      View All Staff
                      <HcIcon name="arrow_forward" className="ml-2" />
                    </Link>
                  </div>
                  {department.doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline-variant/10">
                      {department.doctors.map((doctor) => (
                        <DoctorCard doctor={doctor} key={doctor.id} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest p-8 text-sm text-on-surface-variant">
                      No active doctors are assigned to this department.
                    </div>
                  )}
                </section>
              </div>

              <aside className="lg:col-span-4">
                <div className="sticky top-20">
                  <div className="bg-surface-container-lowest p-8 border-t-4 border-primary">
                    <h2 className="text-sm font-semibold uppercase tracking-widest mb-8 flex items-center">
                      <HcIcon name="info" className="mr-2" />
                      Quick Facts
                    </h2>
                    <div className="space-y-8">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">
                          Direct Phone
                        </span>
                        <p className="text-xl font-headline font-medium">
                          {department.phone || "Not published"}
                        </p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-widest text-outline mb-1">
                          Data Source
                        </span>
                        <p className="text-sm text-on-surface-variant font-light">
                          `GET /api/v1/departments/{departmentId}`
                        </p>
                      </div>
                    </div>
                    <div className="mt-12 space-y-3">
                      <Link
                        className="flex w-full items-center justify-center gap-3 bg-primary py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-surface-tint"
                        href={`/booking`}
                      >
                        Book Consultation
                        <HcIcon name="calendar_month" className="text-sm" />
                      </Link>
                    </div>
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
