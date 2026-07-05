"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, clearSessions } from "@/lib/api-client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function logout() {
      const isPatient = typeof window !== "undefined" && 
        (!!sessionStorage.getItem("hms_patient_role") || 
         !!sessionStorage.getItem("hms_patient_access_token_expires_in"));

      try {
        const endpoint = isPatient ? "/patient-auth/logout" : "/auth/logout";
        await apiRequest(endpoint, { method: "POST" });
      } catch {
        // Local UI logout must clear client state even when the API is unavailable.
      } finally {
        clearSessions();

        if (isMounted) {
          router.replace(isPatient ? "/portal/login" : "/staff/login");
        }
      }
    }

    void logout();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--hc-text-secondary)]">
        Signing out...
      </p>
    </main>
  );
}
