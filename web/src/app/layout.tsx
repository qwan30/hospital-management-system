import type { Metadata } from "next";
import "./globals.css";

/* eslint-disable @next/next/no-page-custom-font */

export const metadata: Metadata = {
  title: "HOSPITAL CORE | Management System",
  description: "Hospital Management System – Precision healthcare operations platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
