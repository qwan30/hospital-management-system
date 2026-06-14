"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listDepartments, type DepartmentResponse } from "@/lib/public-api";

import { HcIcon } from "@/components/ui/hc-icon";
function getDepartmentIcon(index: number) {
  const icons = ["local_hospital", "monitor_heart", "biotech", "medical_services"];
  return icons[index % icons.length];
}

function getSearchText(department: DepartmentResponse) {
  return [department.name, department.description, department.phone]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function PublicDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDepartments() {
    setIsLoading(true);
    setError(null);

    try {
      setDepartments(await listDepartments());
    } catch (loadError) {
      setDepartments([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load departments");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    listDepartments()
      .then((nextDepartments) => {
        if (!isActive) {
          return;
        }
        setDepartments(nextDepartments);
        setError(null);
      })
      .catch((loadError) => {
        if (!isActive) {
          return;
        }
        setDepartments([]);
        setError(loadError instanceof Error ? loadError.message : "Unable to load departments");
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredDepartments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return departments;
    }

    return departments.filter((department) =>
      getSearchText(department).includes(normalizedSearch),
    );
  }, [departments, search]);

  return (
    <>
      <header className="bg-slate-50 border-b border-[var(--hc-border-soft)] px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[var(--hc-primary)]">
              Institutional Framework
            </p>
            <h1 className="mb-8 text-5xl font-light tracking-tight text-[var(--hc-text)] md:text-6xl">
              Core Clinical Departments
            </h1>
            <p className="max-w-2xl text-xl font-medium leading-relaxed text-[var(--hc-text-secondary)]">
              Browse active departments from the hospital system. Department details and doctors
              come from the backend API, not static placeholder modules.
            </p>
          </div>
        </div>
      </header>

      <main className="bg-white px-6 py-20 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-12 items-center">
            <div className="md:col-span-9 relative">
              <HcIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                aria-label="Search departments"
                className="hc-input w-full pl-12"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search department name, phone, or description..."
                type="search"
                value={search}
              />
            </div>
            <button
              className="hc-button-primary md:col-span-3 py-3"
              disabled={isLoading}
              onClick={() => void loadDepartments()}
              type="button"
            >
              {isLoading ? "Loading..." : "Refresh Departments"}
            </button>
          </div>

          {isLoading ? (
            <div className="border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-slate-50 p-16 flex flex-col items-center justify-center text-center">
              <HcIcon name="hourglass_empty" className="text-4xl text-slate-300 mb-4" />
              <h2 className="text-xl font-bold tracking-tight text-[var(--hc-text)] mb-2">Loading Departments</h2>
              <p className="text-sm text-[var(--hc-text-secondary)] font-medium">Loading departments from the hospital system...</p>
            </div>
          ) : error ? (
            <div className="border border-red-200 rounded-[var(--radius-xl)] bg-red-50 p-16 flex flex-col items-center justify-center text-center" role="alert">
              <HcIcon name="error_outline" className="text-4xl text-red-500 mb-4" />
              <h2 className="mb-2 text-xl font-bold tracking-tight text-red-900">
                Departments could not be loaded
              </h2>
              <p className="mb-6 text-sm text-red-700 font-medium max-w-md">{error}</p>
              <button
                className="hc-button-secondary border-red-200 text-red-700 hover:bg-red-100 px-6 py-2"
                onClick={() => void loadDepartments()}
                type="button"
              >
                Try Again
              </button>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-slate-50 p-16 flex flex-col items-center justify-center text-center">
              <HcIcon name="search_off" className="text-4xl text-slate-300 mb-4" />
              <h2 className="mb-2 text-xl font-bold tracking-tight text-[var(--hc-text)]">
                No departments found
              </h2>
              <p className="text-sm text-[var(--hc-text-secondary)] font-medium max-w-md">
                The backend returned no matching active departments. Static department cards are not
                shown as fallback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {filteredDepartments.map((department, index) => (
                <article
                  key={department.id}
                  className="group flex min-h-[320px] flex-col justify-between border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-white p-8 transition-all hover:shadow-md hover:border-slate-300"
                >
                  <div>
                    <div className="mb-8 w-16 h-16 flex items-center justify-center rounded-[var(--radius-lg)] bg-blue-50 text-[var(--hc-primary)] group-hover:scale-105 transition-transform">
                      <HcIcon name={getDepartmentIcon(index)} className="text-3xl" />
                    </div>
                    <h2 className="mb-3 text-xl font-bold tracking-tight text-[var(--hc-text)] group-hover:text-[var(--hc-primary)] transition-colors">
                      {department.name}
                    </h2>
                    <p className="text-sm leading-relaxed text-[var(--hc-text-secondary)] font-medium line-clamp-3">
                      {department.description || "No public description has been published."}
                    </p>
                    {department.phone ? (
                      <div className="mt-4 flex items-center gap-2 text-slate-500">
                        <HcIcon name="phone" className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest">{department.phone}</span>
                      </div>
                    ) : null}
                  </div>
                  <Link
                    className="flex items-center justify-between border-t border-[var(--hc-border-soft)] pt-6 mt-8"
                    href={`/departments/${encodeURIComponent(department.id)}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--hc-primary)] underline-offset-8 group-hover:underline">
                      Explore Department
                    </span>
                    <HcIcon name="arrow_forward" className="text-[var(--hc-primary)] transition-transform group-hover:translate-x-2" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <section className="bg-slate-50 border-t border-[var(--hc-border-soft)] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-[1440px] flex flex-col lg:flex-row items-center justify-between gap-12 bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-2xl)] p-12 shadow-sm">
          <div className="lg:max-w-xl">
            <h2 className="mb-4 text-3xl font-light tracking-tight text-[var(--hc-text)]">
              Department Data Source
            </h2>
            <p className="text-[var(--hc-text-secondary)] leading-relaxed font-medium">
              This page renders active departments returned by `GET /api/v1/departments`. If the
              API is unavailable or returns no rows, the UI reports that state directly.
            </p>
          </div>
          <div className="bg-[var(--hc-surface-soft)] border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] p-10 min-w-[280px] flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-light text-[var(--hc-primary)] mb-3">
              {departments.length}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Active departments loaded
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
