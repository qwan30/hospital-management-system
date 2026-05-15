"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiRequest,
  persistSession,
  type PatientLoginResponse,
} from "@/lib/api-client";

import { HcIcon } from "@/components/ui/hc-icon";
export default function PortalLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const response = await apiRequest<PatientLoginResponse>("/patient-auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      persistSession("patient", response.data?.tokens, response.data?.role);
      router.push("/portal/overview");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-hc-surface text-hc-on-surface flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          alt="Modern medical facility interior with clinical clean lines and soft daylight"
          className="w-full h-full object-cover opacity-15 grayscale"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvBHEq86VCvjE9waCtk89foGtvC7hJUwiD699_L1LLP2BkubUqc1QAL8vPoo2a47FKBM7pfgWmgV-E5LEc0MNt83CYrEBSJXMcPxqoJDYIKLFHdJV2sSaNAA1Ar8JaCH7x5dzvtelyGgTxazCzT5_YItOUqbxhSnAGpyF3fu18k5gflhOpFfryg4YmjEtJMAzaYV-D_5FBRfE8faJnj5dMIgVj4HoAS5iCIGiFdbwk6yAUJVroHuFMo4AsPlmnCvwZrVu7sqTyOg"
          fill
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-hc-surface via-hc-surface/90 to-hc-surface-container-low/50" />
      </div>

      <main className="relative z-10 w-full max-w-[420px] flex flex-col gap-12 p-4 md:p-0">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-hc-primary p-1 flex items-center justify-center">
              <HcIcon name="medical_services" className="text-white text-lg" />
            </span>
            <h1 className="text-xl font-bold tracking-widest text-neutral-900 uppercase">
              HOSPITAL CORE
            </h1>
          </div>
          <p className="text-[3.5rem] leading-[0.9] font-light tracking-tighter text-hc-on-surface">
            Patient Portal
          </p>
        </header>

        <section className="bg-hc-surface-container-lowest border-t-4 border-hc-primary p-12 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-hc-outline">
              Log in
            </h2>
          </div>
          <form className="flex flex-col gap-8" onSubmit={handleLogin}>
            <div className="group flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-hc-on-surface-variant" htmlFor="email">
                Email
              </label>
              <input
                className="w-full bg-hc-surface-container-low border-0 border-b-2 border-hc-outline-variant py-4 px-0 placeholder:text-hc-outline/40 focus:ring-0 focus:border-hc-primary focus:bg-hc-surface-container transition-all duration-200 outline-none"
                id="email"
                name="email"
                placeholder="name@hospital.com"
                type="email"
                required
              />
            </div>

            <div className="group flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-hc-on-surface-variant" htmlFor="password">
                Password
              </label>
              <input
                className="w-full bg-hc-surface-container-low border-0 border-b-2 border-hc-outline-variant py-4 px-0 placeholder:text-hc-outline/40 focus:ring-0 focus:border-hc-primary focus:bg-hc-surface-container transition-all duration-200 outline-none"
                id="password"
                name="password"
                placeholder="Password"
                type="password"
                required
              />
            </div>

            {error ? (
              <p className="bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="group relative flex items-center justify-between w-full bg-hc-primary-container text-white py-5 px-8 font-semibold transition-all duration-200 hover:bg-hc-primary active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              <span className="tracking-widest uppercase text-sm">
                {isSubmitting ? "Authenticating..." : "Log in"}
              </span>
              <HcIcon name="arrow_forward" className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </form>

          <footer className="flex flex-col gap-4">
            <div className="h-[1px] w-full bg-hc-outline-variant opacity-20" />
            <div className="flex justify-between items-center">
              <Link className="text-xs font-semibold text-hc-primary hover:underline underline-offset-4 tracking-wide" href="#">
                Forgot password?
              </Link>
              <Link
                className="text-xs font-semibold text-hc-on-surface-variant hover:text-hc-on-surface tracking-wide flex items-center gap-1 group"
                href="/portal/claim"
              >
                Need access? <span className="text-hc-primary group-hover:underline underline-offset-4">Claim portal</span>
              </Link>
            </div>
          </footer>
        </section>

        <div className="flex items-center justify-between opacity-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">HOSPITAL ADMIN</span>
            <span className="text-[8px] font-medium tracking-widest">V.2.4.0-STABLE</span>
          </div>
          <div className="flex gap-4">
            <HcIcon name="security" className="text-sm" />
            <HcIcon name="language" className="text-sm" />
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 left-8 hidden lg:block">
        <div className="flex flex-col gap-1 border-l border-hc-outline-variant pl-4">
          <span className="text-[10px] font-bold text-hc-outline uppercase tracking-widest">
            System Status
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-hc-primary" />
            <span className="text-[10px] font-medium text-hc-on-surface-variant">
              OPERATIONAL // NODE_S7
            </span>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 hidden lg:block">
        <button
          className="bg-hc-surface-container-high px-4 py-2 flex items-center gap-3 hover:bg-hc-surface-container-highest transition-colors"
          aria-label="Open support"
        >
          <HcIcon name="help" className="text-lg" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Support</span>
        </button>
      </div>
    </div>
  );
}
