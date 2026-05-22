"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listDoctors, type DoctorResponse } from "@/lib/public-api";

import { HcIcon } from "@/components/ui/hc-icon";
function getSearchText(doctor: DoctorResponse) {
  return [
    doctor.fullName,
    doctor.email,
    doctor.specialty,
    doctor.qualification,
    doctor.experienceYears == null ? "" : `${doctor.experienceYears} years`,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
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

export default function PublicDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDoctors() {
    setIsLoading(true);
    setError(null);

    try {
      setDoctors(await listDoctors());
    } catch (loadError) {
      setDoctors([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load doctors");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    listDoctors()
      .then((nextDoctors) => {
        if (!isActive) {
          return;
        }
        setDoctors(nextDoctors);
        setError(null);
      })
      .catch((loadError) => {
        if (!isActive) {
          return;
        }
        setDoctors([]);
        setError(loadError instanceof Error ? loadError.message : "Unable to load doctors");
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

  const specialties = useMemo(() => {
    return Array.from(
      new Set(
        doctors
          .map((doctor) => doctor.specialty?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch = !normalizedSearch || getSearchText(doctor).includes(normalizedSearch);
      const matchesSpecialty = specialty === "all" || doctor.specialty === specialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, search, specialty]);

  return (
    <main>
      <section className="bg-slate-50 border-b border-[var(--hc-border-soft)] py-16 px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-[var(--hc-primary)] tracking-[0.2em] uppercase mb-4 block">
                Medical Directory
              </span>
              <h1 className="text-5xl lg:text-7xl font-light tracking-tighter leading-none text-[var(--hc-text)] mb-6">
                Expert doctors at your service.
              </h1>
              <p className="text-[var(--hc-text-secondary)] text-lg font-medium leading-relaxed max-w-lg">
                Access our network of specialists. Filter by specialty or search directly to find
                the right care for your needs.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <div className="text-3xl font-light text-[var(--hc-text)]">24/7</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Emergency Support
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--hc-border-soft)] px-6 lg:px-12 py-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <HcIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                aria-label="Search doctors"
                className="hc-input w-full pl-12"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or keyword..."
                type="search"
                value={search}
              />
            </div>
            <div className="md:col-span-4 relative">
              <HcIcon name="filter_list" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                aria-label="Filter doctors by specialty"
                className="hc-input w-full pl-12 appearance-none"
                onChange={(event) => setSpecialty(event.target.value)}
                value={specialty}
              >
                <option value="all">All Specialties</option>
                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="hc-button-secondary md:col-span-3"
              disabled={isLoading}
              onClick={() => void loadDoctors()}
              type="button"
            >
              {isLoading ? "Loading..." : "Refresh Results"}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 lg:px-12 py-16">
        <div className="max-w-[1440px] mx-auto">
          {isLoading ? (
            <div className="border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-slate-50 p-16 flex flex-col items-center justify-center text-center">
              <HcIcon name="hourglass_empty" className="text-4xl text-slate-300 mb-4" />
              <h2 className="text-xl font-bold tracking-tight text-[var(--hc-text)] mb-2">Loading Doctors</h2>
              <p className="text-sm text-[var(--hc-text-secondary)] font-medium">Loading doctors from the hospital system...</p>
            </div>
          ) : error ? (
            <div className="border border-red-200 rounded-[var(--radius-xl)] bg-red-50 p-16 flex flex-col items-center justify-center text-center shadow-sm" role="alert">
              <HcIcon name="error_outline" className="text-4xl text-red-500 mb-4" />
              <h2 className="text-2xl font-bold tracking-tight text-red-900 mb-3">
                Doctors could not be loaded
              </h2>
              <p className="text-sm text-red-700 font-medium mb-6 max-w-md">{error}</p>
              <button
                className="hc-button-secondary border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => void loadDoctors()}
                type="button"
              >
                Try Again
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] bg-slate-50 p-16 flex flex-col items-center justify-center text-center">
              <HcIcon name="search_off" className="text-4xl text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold tracking-tight text-[var(--hc-text)] mb-3">No doctors found</h2>
              <p className="text-sm text-[var(--hc-text-secondary)] font-medium max-w-md">
                Adjust your search or specialty filter. No placeholder doctors are shown when the
                API returns no matches.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              data-testid="doctor-grid"
            >
              {filteredDoctors.map((doctor) => (
                <article
                  className="group bg-white border border-[var(--hc-border-soft)] rounded-[var(--radius-xl)] flex flex-col h-full transition-all duration-150 hover:shadow-md hover:border-slate-300 overflow-hidden"
                  key={doctor.id}
                >
                  <div className="aspect-square bg-slate-50 flex items-center justify-center border-b border-[var(--hc-border-soft)]">
                    <div className="h-28 w-28 rounded-full bg-[var(--hc-primary)] text-white flex items-center justify-center text-4xl font-light">
                      {getInitials(doctor.fullName)}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs font-bold text-[var(--hc-primary)] tracking-[0.2em] uppercase mb-2">
                      {doctor.specialty || "Specialist"}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--hc-text)] mb-2 group-hover:text-[var(--hc-primary)] transition-colors">
                      {doctor.fullName}
                    </h3>
                    <p className="text-sm text-[var(--hc-text-secondary)] font-medium mb-6 line-clamp-2">
                      {[doctor.qualification, doctor.email].filter(Boolean).join(" | ") ||
                        "Qualification details are not available from the doctor profile."}
                    </p>
                    <div className="mt-auto pt-6 border-t border-[var(--hc-border-soft)] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Experience
                        </span>
                        <span className="text-xs font-bold text-[var(--hc-text)]">
                          {doctor.experienceYears == null
                            ? "Not provided"
                            : `${doctor.experienceYears} Years`}
                        </span>
                      </div>
                      <Link
                        className="hc-button-primary py-2 px-4 text-xs"
                        href={`/booking?doctorId=${encodeURIComponent(doctor.id)}`}
                      >
                        Check Slots
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-900 py-24 px-6 lg:px-12 border-t border-[var(--hc-border-soft)]">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-white text-4xl font-light tracking-tighter mb-4">
              Stay informed about your health.
            </h2>
            <p className="text-slate-400 text-lg font-medium mb-8">
              Receive monthly health tips, clinic updates, and news from our specialists directly
              in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                className="hc-input bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:bg-white focus:text-[var(--hc-text)] w-full sm:w-80"
                placeholder="Your email address"
                type="email"
              />
              <button className="hc-button-primary">
                Subscribe
              </button>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-white text-lg font-bold tracking-[0.2em] uppercase mb-4">
              HOSPITAL CORE
            </span>
            <nav className="flex flex-col items-start lg:items-end gap-3">
              <a
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                href="#"
              >
                Contact Administration
              </a>
            </nav>
          </div>
        </div>
      </section>
    </main>
  );
}
