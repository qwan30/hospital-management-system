import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "../../features/auth/login-screen";

export const metadata: Metadata = {
  title: "Staff Login | Clinical Atelier",
  description: "Secure sign-in for the doctor dashboard vertical slice."
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
