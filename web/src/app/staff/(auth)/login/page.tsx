"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiRequest,
  persistSession,
  type StaffLoginResponse,
} from "@/lib/api-client";

import { HcIcon } from "@/components/ui/hc-icon";
export default function StaffLoginPage() {
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
      const response = await apiRequest<StaffLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.data?.tokens?.accessToken || !response.data.role) {
        throw new Error("Staff login did not return a session.");
      }

      persistSession("staff", response.data.tokens, response.data.role);
      router.push("/staff/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-[420px] bg-surface-container-lowest p-8 flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-container flex items-center justify-center">
              <HcIcon name="clinical_notes" className="text-white text-[20px]" />
            </div>
            <span className="text-[12px] font-semibold tracking-[1px] text-primary uppercase">
              HOSPITAL CORE
            </span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-on-surface">
            Staff Login
          </h1>
          <p className="text-[14px] tracking-[0.16px] text-on-surface-variant">
            Enter your clinical credentials to access the suite.
          </p>
        </header>

        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label
                className="text-[12px] font-semibold tracking-[0.16px] text-on-surface-variant"
                htmlFor="staff-email"
              >
                Email
              </label>
              <div className="ibm-input-container border-b-2 border-outline h-[40px] flex items-center px-4 transition-all duration-150 focus-within:border-primary-container">
                <input
                  className="bg-transparent border-none w-full text-[14px] tracking-[0.16px] text-on-surface placeholder:text-outline focus:ring-0 px-0"
                  id="staff-email"
                  name="email"
                  placeholder="admin@hospital.vn"
                  type="email"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label
                  className="text-[12px] font-semibold tracking-[0.16px] text-on-surface-variant"
                  htmlFor="staff-password"
                >
                  Password
                </label>
                <a className="text-[12px] text-primary font-medium hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="ibm-input-container border-b-2 border-outline h-[40px] flex items-center px-4 transition-all duration-150 focus-within:border-primary-container">
                <input
                  className="bg-transparent border-none w-full text-[14px] tracking-[0.16px] text-on-surface placeholder:text-outline focus:ring-0 px-0"
                  id="staff-password"
                  name="password"
                  placeholder="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
                <HcIcon name="visibility" className="text-on-surface-variant cursor-pointer text-[18px]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {error ? (
              <p className="bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <button
              className="w-full h-[48px] bg-primary-container text-on-primary text-[14px] font-semibold flex items-center justify-between px-4 transition-all duration-150 hover:bg-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? "Authenticating..." : "Log in to Clinical Suite"}</span>
              <HcIcon name="arrow_forward" />
            </button>
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-grow bg-surface-container-high" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-outline">
                Emergency Access
              </span>
              <div className="h-[1px] flex-grow bg-surface-container-high" />
            </div>
            <button
              className="w-full h-[48px] bg-surface-container-low text-on-surface text-[14px] font-semibold flex items-center justify-between px-4 hover:bg-surface-container-high transition-colors"
              type="button"
            >
              <span>One-Time Emergency Code</span>
              <HcIcon name="emergency" />
            </button>
          </div>
        </form>

        <footer className="flex flex-col gap-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container p-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                Status
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#24a148]" />
                <span className="text-[12px] font-semibold">Systems Nominal</span>
              </div>
            </div>
            <div className="bg-surface-container p-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                Version
              </span>
              <span className="text-[12px] font-semibold">v4.2.0-Core</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
