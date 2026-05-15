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
      <header className="border-0 bg-surface-container-lowest px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Institutional Framework
            </p>
            <h1 className="mb-8 text-5xl leading-none tracking-tighter text-on-surface md:text-6xl">
              Core Clinical Departments
            </h1>
            <p className="max-w-2xl text-xl font-normal leading-relaxed text-on-surface-variant">
              Browse active departments from the hospital system. Department details and doctors
              come from the backend API, not static placeholder modules.
            </p>
          </div>
        </div>
      </header>

      <main className="bg-surface px-6 py-20 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 grid grid-cols-1 gap-px bg-outline-variant/10 md:grid-cols-12">
            <label className="bg-surface-container-lowest p-4 md:col-span-9">
              <span className="sr-only">Search departments</span>
              <input
                aria-label="Search departments"
                className="w-full border-0 bg-transparent text-sm outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search department name, phone, or description..."
                type="search"
                value={search}
              />
            </label>
            <button
              className="bg-primary-container p-4 text-xs font-semibold uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
              disabled={isLoading}
              onClick={() => void loadDepartments()}
              type="button"
            >
              {isLoading ? "Loading" : "Refresh Departments"}
            </button>
          </div>

          {isLoading ? (
            <div className="bg-surface-container-lowest p-10 text-center text-sm text-on-surface-variant">
              Loading departments from the hospital system...
            </div>
          ) : error ? (
            <div className="bg-surface-container-lowest p-10 text-center" role="alert">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-on-surface">
                Departments could not be loaded
              </h2>
              <p className="mb-6 text-sm text-on-surface-variant">{error}</p>
              <button
                className="bg-primary-container px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white"
                onClick={() => void loadDepartments()}
                type="button"
              >
                Try Again
              </button>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="bg-surface-container-lowest p-10 text-center">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-on-surface">
                No departments found
              </h2>
              <p className="text-sm text-on-surface-variant">
                The backend returned no matching active departments. Static department cards are not
                shown as fallback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0 bg-outline-variant/10 md:grid-cols-2 xl:grid-cols-4">
              {filteredDepartments.map((department, index) => (
                <article
                  key={department.id}
                  className={`group flex min-h-[360px] flex-col justify-between border-b border-outline-variant/20 bg-surface-container-lowest p-8 transition-colors duration-300 hover:bg-surface-container-high ${
                    index < filteredDepartments.length - 1 ? "xl:border-r" : ""
                  }`}
                >
                  <div>
                    <div className="mb-12">
                      <HcIcon name={getDepartmentIcon(index)} className="text-4xl text-primary" />
                    </div>
                    <h2 className="mb-4 text-2xl font-semibold tracking-tight text-on-surface">
                      {department.name}
                    </h2>
                    <p className="text-sm leading-6 text-on-surface-variant">
                      {department.description || "No public description has been published."}
                    </p>
                    {department.phone ? (
                      <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-outline">
                        {department.phone}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    className="flex items-center justify-between border-t border-outline-variant/30 pt-8"
                    href={`/departments/${encodeURIComponent(department.id)}`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary underline-offset-8 group-hover:underline">
                      Explore Department
                    </span>
                    <HcIcon name="arrow_forward" className="text-primary transition-transform group-hover:translate-x-2" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <section className="overflow-hidden bg-surface-container px-6 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="mb-8 text-5xl/none font-light tracking-tight text-on-surface md:text-4xl">
              Department Data Source
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
              This page renders active departments returned by `GET /api/v1/departments`. If the
              API is unavailable or returns no rows, the UI reports that state directly.
            </p>
          </div>
          <div className="bg-primary-container p-12 text-on-primary-container lg:col-span-5">
            <span className="mb-2 block text-5xl font-light leading-none">
              {departments.length}
            </span>
            <span className="text-xs uppercase tracking-[0.2em]">
              Active departments loaded
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
