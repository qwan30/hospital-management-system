"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/portal/overview");
  };

  return (
    <div className="bg-hms-surface text-hms-on-surface flex min-h-screen items-center justify-center overflow-hidden">
      {/* Portal Themed Background Texture */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          alt="Modern medical facility interior with clinical clean lines and soft daylight"
          className="w-full h-full object-cover opacity-15 grayscale"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvBHEq86VCvjE9waCtk89foGtvC7hJUwiD699_L1LLP2BkubUqc1QAL8vPoo2a47FKBM7pfgWmgV-E5LEc0MNt83CYrEBSJXMcPxqoJDYIKLFHdJV2sSaNAA1Ar8JaCH7x5dzvtelyGgTxazCzT5_YItOUqbxhSnAGpyF3fu18k5gflhOpFfryg4YmjEtJMAzaYV-D_5FBRfE8faJnj5dMIgVj4HoAS5iCIGiFdbwk6yAUJVroHuFMo4AsPlmnCvwZrVu7sqTyOg"
          fill
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-hms-surface via-hms-surface/90 to-hms-surface-container-low/50"></div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-[420px] flex flex-col gap-12 p-4 md:p-0">
        {/* Brand Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-hms-primary p-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">medical_services</span>
            </span>
            <h1 className="text-xl font-bold tracking-widest text-neutral-900 uppercase">MEDCORE OS</h1>
          </div>
          <p className="text-[3.5rem] leading-[0.9] font-light tracking-tighter text-hms-on-surface">Patient Portal</p>
        </header>

        {/* Login Container: IBM Carbon Stylized Monolith */}
        <section className="bg-hms-surface-container-lowest border-t-4 border-hms-primary p-12 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-hms-outline">Log in</h2>
          </div>
          <form className="flex flex-col gap-8" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="group flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant" htmlFor="email">Email</label>
              <div className="relative">
                <input
                  className="w-full bg-hms-surface-container-low border-0 border-b-2 border-hms-outline-variant py-4 px-0 placeholder:text-hms-outline/40 focus:ring-0 focus:border-hms-primary focus:bg-hms-surface-container transition-all duration-200 outline-none"
                  id="email"
                  placeholder="name@hospital.com"
                  type="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-hms-surface-container-low border-0 border-b-2 border-hms-outline-variant py-4 px-0 placeholder:text-hms-outline/40 focus:ring-0 focus:border-hms-primary focus:bg-hms-surface-container transition-all duration-200 outline-none"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>
            </div>

            {/* Login CTA */}
            <button className="group relative flex items-center justify-between w-full bg-hms-primary-container text-white py-5 px-8 font-semibold transition-all duration-200 hover:bg-hms-primary active:translate-y-[2px]" type="submit">
              <span className="tracking-widest uppercase text-sm">Log in</span>
              <span className="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
            </button>
          </form>

          <footer className="flex flex-col gap-4">
            <div className="h-[1px] w-full bg-hms-outline-variant opacity-20"></div>
            <div className="flex justify-between items-center">
              <Link className="text-xs font-semibold text-hms-primary hover:underline underline-offset-4 tracking-wide" href="#">
                Forgot password?
              </Link>
              <Link className="text-xs font-semibold text-hms-on-surface-variant hover:text-hms-on-surface tracking-wide flex items-center gap-1 group" href="#">
                Need access? <span className="text-hms-primary group-hover:underline underline-offset-4">Claim portal</span>
              </Link>
            </div>
          </footer>
        </section>

        {/* Auxiliary Branding */}
        <div className="flex items-center justify-between opacity-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">HOSPITAL ADMIN</span>
            <span className="text-[8px] font-medium tracking-widest">V.2.4.0-STABLE</span>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-sm">security</span>
            <span className="material-symbols-outlined text-sm">language</span>
          </div>
        </div>
      </main>

      {/* Floating Technical Metadata (Architectural Flourish) */}
      <div className="fixed bottom-8 left-8 hidden lg:block">
        <div className="flex flex-col gap-1 border-l border-hms-outline-variant pl-4">
          <span className="text-[10px] font-bold text-hms-outline uppercase tracking-widest">System Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-hms-primary"></div>
            <span className="text-[10px] font-medium text-hms-on-surface-variant">OPERATIONAL // NODE_S7</span>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 hidden lg:block">
        <button className="bg-hms-surface-container-high px-4 py-2 flex items-center gap-3 hover:bg-hms-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-lg">help</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Support</span>
        </button>
      </div>
    </div>
  );
}
