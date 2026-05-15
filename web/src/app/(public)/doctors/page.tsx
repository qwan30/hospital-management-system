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
      <section className="bg-surface py-16 px-6 lg:px-12 border-b border-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase mb-4 block">
                Medical Directory
              </span>
              <h1 className="text-5xl lg:text-7xl font-light tracking-tighter leading-none text-on-surface mb-6">
                Expert doctors at your service.
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed font-normal max-w-lg">
                Access our network of specialists. Filter by specialty or search directly to find
                the right care for your needs.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <div className="text-3xl font-light">24/7</div>
              <div className="text-xs font-bold uppercase tracking-widest text-outline">
                Emergency Support
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-12 z-40 bg-surface-container-low px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-outline-variant bg-opacity-20">
            <label className="md:col-span-5 bg-white p-4 flex items-center">
              <HcIcon name="search" className="text-outline mr-3" />
              <span className="sr-only">Search doctors</span>
              <input
                aria-label="Search doctors"
                className="w-full border-none focus:ring-0 text-sm p-0 placeholder:text-outline-variant"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or keyword..."
                type="search"
                value={search}
              />
            </label>
            <label className="md:col-span-4 bg-white p-4 flex items-center border-l border-surface-container-low">
              <HcIcon name="filter_list" className="text-outline mr-3" />
              <span className="sr-only">Filter doctors by specialty</span>
              <select
                aria-label="Filter doctors by specialty"
                className="w-full border-none focus:ring-0 text-sm p-0 appearance-none bg-transparent"
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
            </label>
            <button
              className="md:col-span-3 bg-primary-container p-4 flex items-center justify-center active:bg-primary transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              onClick={() => void loadDoctors()}
              type="button"
            >
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                {isLoading ? "Loading" : "Refresh Results"}
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 lg:px-12 pb-24">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="bg-surface p-10 text-center text-sm text-on-surface-variant">
              Loading doctors from the hospital system...
            </div>
          ) : error ? (
            <div className="bg-surface p-10 text-center" role="alert">
              <h2 className="text-2xl font-semibold text-on-surface mb-3">
                Doctors could not be loaded
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">{error}</p>
              <button
                className="bg-primary-container text-white px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary"
                onClick={() => void loadDoctors()}
                type="button"
              >
                Try Again
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="bg-surface p-10 text-center">
              <h2 className="text-2xl font-semibold text-on-surface mb-3">No doctors found</h2>
              <p className="text-sm text-on-surface-variant">
                Adjust your search or specialty filter. No placeholder doctors are shown when the
                API returns no matches.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              data-testid="doctor-grid"
            >
              {filteredDoctors.map((doctor) => (
                <article
                  className="group bg-surface flex flex-col h-full transition-all duration-150 hover:translate-y-[-4px]"
                  key={doctor.id}
                >
                  <div className="aspect-[4/5] bg-surface-container-highest overflow-hidden flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-primary-container text-white flex items-center justify-center text-3xl font-light">
                      {getInitials(doctor.fullName)}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase mb-1">
                      {doctor.specialty || "Specialist"}
                    </span>
                    <h3 className="text-xl font-semibold text-on-surface mb-2">
                      {doctor.fullName}
                    </h3>
                    <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                      {[doctor.qualification, doctor.email].filter(Boolean).join(" | ") ||
                        "Qualification details are not available from the doctor profile."}
                    </p>
                    <div className="mt-auto pt-6 border-t border-surface-container-low flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-outline">
                          Experience
                        </span>
                        <span className="text-xs font-semibold">
                          {doctor.experienceYears == null
                            ? "Not provided"
                            : `${doctor.experienceYears} Years`}
                        </span>
                      </div>
                      <Link
                        className="bg-primary-container text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary active:scale-95 transition-all"
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

      <section className="bg-on-surface py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-white text-4xl font-light tracking-tighter mb-4">
              Stay informed about your health.
            </h2>
            <p className="text-surface-container-highest opacity-60 text-lg mb-8">
              Receive monthly health tips, clinic updates, and news from our specialists directly
              in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-px bg-outline-variant bg-opacity-20">
              <input
                className="bg-white border-none focus:ring-0 p-4 text-sm w-full sm:w-80"
                placeholder="Your email address"
                type="email"
              />
              <button className="bg-primary-container text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">
                Subscribe
              </button>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-white text-lg font-bold tracking-tighter uppercase mb-4">
              HOSPITAL CORE
            </span>
            <nav className="flex flex-col items-start lg:items-end gap-2">
              <a
                className="text-surface-container-highest opacity-60 hover:opacity-100 text-sm transition-opacity"
                href="#"
              >
                Privacy Policy
              </a>
              <a
                className="text-surface-container-highest opacity-60 hover:opacity-100 text-sm transition-opacity"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-surface-container-highest opacity-60 hover:opacity-100 text-sm transition-opacity"
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
