import Image from "next/image";

export default function PatientsPage() {
  return (
    <div className="flex bg-hms-surface-container-low h-[calc(100vh-48px)] overflow-hidden">
      {/* Left Pane: Search and List (5/12 columns equivalent) */}
      <div className="w-[41.66%] bg-white border-r border-hms-outline-variant flex flex-col h-full z-10">
        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-hms-outline">Patient Directory</label>
            <h1 className="text-3xl font-light tracking-tight text-hms-on-background">Search Records</h1>
          </div>
          <div className="relative group">
            <input
              className="w-full bg-hms-surface-container-low border-0 border-b-2 border-hms-outline p-4 pr-12 focus:ring-0 focus:border-hms-primary transition-all font-body text-sm placeholder:text-hms-outline placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest outline-none"
              placeholder="Search by name, ID or DOB..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-hms-outline group-focus-within:text-hms-primary">search</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="whitespace-nowrap px-3 py-1 bg-hms-primary-container text-white text-[10px] font-bold uppercase tracking-widest">Active</button>
            <button className="whitespace-nowrap px-3 py-1 bg-hms-surface-container-highest text-hms-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-hms-surface-container-high transition-colors">Inpatient</button>
            <button className="whitespace-nowrap px-3 py-1 bg-hms-surface-container-highest text-hms-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-hms-surface-container-high transition-colors">Emergency</button>
            <button className="whitespace-nowrap px-3 py-1 bg-hms-surface-container-highest text-hms-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-hms-surface-container-high transition-colors">Follow-up</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4">
          {/* Patient Card Active */}
          <div className="p-6 bg-hms-surface-container-lowest border-l-4 border-hms-primary transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-hms-on-background text-lg leading-tight">Sarah J. Miller</h3>
                <p className="text-[10px] font-bold text-hms-outline uppercase tracking-widest mt-1">ID: #MC-902341</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-hms-error-container text-hms-on-error-container uppercase">Critical</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-hms-surface-container-low p-2">
                <span className="block text-[9px] text-hms-outline font-bold uppercase">Age / Sex</span>
                <span className="text-xs font-semibold">34 / Female</span>
              </div>
              <div className="bg-hms-surface-container-low p-2">
                <span className="block text-[9px] text-hms-outline font-bold uppercase">Last Visit</span>
                <span className="text-xs font-semibold">Oct 12, 2023</span>
              </div>
            </div>
          </div>

          {/* Patient Card */}
          <div className="p-6 bg-hms-surface-container-high hover:bg-hms-surface-container-lowest transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-hms-on-background text-lg leading-tight group-hover:text-hms-primary">Marcus V. Thorne</h3>
                <p className="text-[10px] font-bold text-hms-outline uppercase tracking-widest mt-1">ID: #MC-902352</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-hms-surface-container-highest text-hms-outline uppercase">Stable</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-2">
                <span className="block text-[9px] text-hms-outline font-bold uppercase">Age / Sex</span>
                <span className="text-xs font-semibold">58 / Male</span>
              </div>
              <div className="bg-white/50 p-2">
                <span className="block text-[9px] text-hms-outline font-bold uppercase">Last Visit</span>
                <span className="text-xs font-semibold">Oct 08, 2023</span>
              </div>
            </div>
          </div>

          {/* Patient Card */}
          <div className="p-6 bg-hms-surface-container-high hover:bg-hms-surface-container-lowest transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-hms-on-background text-lg leading-tight group-hover:text-hms-primary">Elena Rodriguez</h3>
                <p className="text-[10px] font-bold text-hms-outline uppercase tracking-widest mt-1">ID: #MC-902364</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-hms-surface-container-highest text-hms-outline uppercase">Stable</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-2">
                <span className="block text-[9px] text-hms-outline font-bold uppercase">Age / Sex</span>
                <span className="text-xs font-semibold">27 / Female</span>
              </div>
              <div className="bg-white/50 p-2">
                <span className="block text-[9px] text-hms-outline font-bold uppercase">Last Visit</span>
                <span className="text-xs font-semibold">Sep 29, 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Details (7/12 columns equivalent) */}
      <div className="flex-1 overflow-y-auto bg-hms-surface-container-low p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Identity Section */}
          <div className="bg-white p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 bg-hms-surface-container-highest flex-shrink-0">
                  <Image
                    alt="Sarah J. Miller"
                    className="w-full h-full object-cover grayscale"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsjvD3G_nUqQ3p-O7i9bGyRfSjfTpbqjwqWZUc4p_TmnHUfq7z_VgiWWlnCtcSS_L-4zmtN1rX3iikTdunpacJvyHD-j82s-BgXDa0TYEqG0BotqoeTJPjFGmcCNGuWAYEy5MzfdIQxgJbFiB81g8nPF-lFWxQGKufqdJmPntnZQLfHpyxeJaklYmCx6QG92dki0JI8KiIfn1OoLfeGJnnsQdWS2gFwT9EeQ1dlwNHEsCndQJeXTtmk5piC3eSlHRSkuGRr9GFCw"
                    width={96}
                    height={96}
                    unoptimized
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-hms-primary uppercase tracking-[0.2em]">Active Patient Record</span>
                  <h2 className="text-4xl font-light tracking-tighter text-hms-on-background mt-1">Sarah J. Miller</h2>
                  <p className="text-sm text-hms-outline mt-2 font-medium">Primary Physician: <span className="text-hms-on-background">Dr. Julian Vance</span></p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-hms-surface-container-highest p-3 hover:bg-hms-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-hms-on-surface">edit</span>
                </button>
                <button className="bg-hms-surface-container-highest p-3 hover:bg-hms-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-hms-on-surface">print</span>
                </button>
                <button className="bg-hms-primary-container text-white px-6 py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-hms-primary transition-colors">
                  Update Record
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
              <div>
                <span className="block text-[10px] font-bold text-hms-outline uppercase tracking-widest mb-2">Date of Birth</span>
                <p className="text-sm font-semibold">May 14, 1989 (34y)</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-hms-outline uppercase tracking-widest mb-2">Blood Type</span>
                <p className="text-sm font-semibold">O Positive (O+)</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-hms-outline uppercase tracking-widest mb-2">Contact</span>
                <p className="text-sm font-semibold">+1 (555) 012-9934</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-hms-outline uppercase tracking-widest mb-2">Insurance</span>
                <p className="text-sm font-semibold">BlueShield PPO</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Conditions & Allergies */}
            <div className="bg-white p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-hms-surface-container-highest pb-4 mb-6">Conditions &amp; Allergies</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-hms-outline uppercase tracking-widest">Medical History</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-hms-surface-container-low text-hms-on-surface text-[11px] font-medium border-l-2 border-hms-outline">Type 1 Diabetes</span>
                    <span className="px-3 py-1.5 bg-hms-surface-container-low text-hms-on-surface text-[11px] font-medium border-l-2 border-hms-outline">Hypothyroidism</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-hms-error uppercase tracking-widest">Allergies (High Severity)</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-hms-error-container text-hms-on-error-container text-[11px] font-bold border-l-2 border-hms-error">Penicillin</span>
                    <span className="px-3 py-1.5 bg-hms-error-container text-hms-on-error-container text-[11px] font-bold border-l-2 border-hms-error">Latex</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment History */}
            <div className="bg-white p-8">
              <div className="flex justify-between items-center border-b-2 border-hms-surface-container-highest pb-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest">Recent Activity</h3>
                <button className="text-[10px] font-bold text-hms-primary uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-hms-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-hms-primary">calendar_month</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Endocrinology Check-up</h4>
                    <p className="text-xs text-hms-outline">Oct 12, 2023 • Dr. Vance</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-hms-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-hms-primary">biotech</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Comprehensive Metabolic Panel</h4>
                    <p className="text-xs text-hms-outline">Oct 05, 2023 • LabCorp HQ</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-hms-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-hms-primary">pill</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Insulin Prescription Refill</h4>
                    <p className="text-xs text-hms-outline">Sep 28, 2023 • CVS Pharmacy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Labs Snapshot (Bento Style) */}
          <div className="bg-white p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-hms-surface-container-highest pb-4 mb-6">Vitals &amp; Labs Snapshot</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-hms-surface-container-low p-6">
                <span className="text-[10px] font-bold text-hms-outline uppercase tracking-widest block mb-4">Glucose</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-light text-hms-on-background">112</span>
                  <span className="text-xs font-medium text-hms-outline">mg/dL</span>
                </div>
                <div className="mt-4 h-1 bg-hms-surface-container-highest relative">
                  <div className="absolute inset-y-0 left-0 bg-hms-primary w-[70%]"></div>
                </div>
              </div>
              <div className="bg-hms-surface-container-low p-6">
                <span className="text-[10px] font-bold text-hms-outline uppercase tracking-widest block mb-4">A1C</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-light text-hms-error">7.1</span>
                  <span className="text-xs font-medium text-hms-outline">%</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-hms-error uppercase">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> Elevated
                </div>
              </div>
              <div className="bg-hms-surface-container-low p-6">
                <span className="text-[10px] font-bold text-hms-outline uppercase tracking-widest block mb-4">BP</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-light text-hms-on-background">118/76</span>
                  <span className="text-xs font-medium text-hms-outline">mmHg</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-hms-primary uppercase">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Normal
                </div>
              </div>
              <div className="bg-hms-surface-container-low p-6">
                <span className="text-[10px] font-bold text-hms-outline uppercase tracking-widest block mb-4">Weight</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-light text-hms-on-background">142</span>
                  <span className="text-xs font-medium text-hms-outline">lbs</span>
                </div>
                <p className="mt-4 text-[10px] font-bold text-hms-outline uppercase">-2 lbs since last visit</p>
              </div>
            </div>
          </div>

          {/* Footer-like action area */}
          <div className="flex justify-end pt-4 pb-12">
            <div className="flex gap-4">
              <button className="bg-hms-surface-container-highest text-hms-on-surface px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-hms-surface-container-high transition-colors">
                Archive Record
              </button>
              <button className="bg-hms-on-background text-white px-12 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
