"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, clearSessions } from "@/lib/api-client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function logout() {
      try {
        await apiRequest("/auth/logout", { method: "POST" });
      } finally {
        clearSessions();

        if (isMounted) {
          router.replace("/staff/login");
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
      <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
        Signing out...
      </p>
    </main>
  );
}
