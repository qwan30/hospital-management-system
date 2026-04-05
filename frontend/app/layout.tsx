import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope } from "next/font/google";
import { AuthProvider } from "../features/auth/auth-provider";
import "./globals.css";

const displayFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display"
});

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Clinical Atelier",
  description: "Updated public home page translated from the Pencil design."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
