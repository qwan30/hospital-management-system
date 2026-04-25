import Image from "next/image";
import Link from "next/link";

export default function PatientPortalOverviewPage() {
  return (
    <>
      <main>

<div className="max-w-7xl mx-auto">
{/* Header Section */}
<header className="mb-8 flex items-baseline justify-between border-b border-outline-variant/10 pb-4">
<h1 className="text-4xl font-light tracking-tight text-on-surface">Patient Portal Overview</h1>
<span className="text-xs font-bold uppercase tracking-widest text-outline">Ref: 2938-SYS-2024</span>
</header>
{/* Hero Section: Data Monolith */}
<div className="bg-surface-container-low mb-8 relative flex flex-col md:flex-row items-stretch border-0">
<div className="p-12 flex-1 flex flex-col justify-center">
<p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Welcome back, Sarah Jenkins</p>
<h2 className="text-5xl font-light leading-tight mb-6">Your health summary is updated for <span className="font-semibold text-primary">October 2024</span>.</h2>
<div className="flex gap-4">
<button className="px-6 h-12 bg-primary-container text-on-primary font-semibold hover:bg-primary transition-all">View Full Record</button>
<button className="px-6 h-12 bg-on-surface text-surface font-semibold hover:bg-surface-dim transition-all">Download PDF</button>
</div>
</div>
<div className="w-full md:w-1/3 min-h-[300px] relative overflow-hidden">
<img alt="Hospital Interior" className="absolute inset-0 w-full h-full object-cover" data-alt="Modern medical facility interior with minimalist architecture, glass surfaces, and clean lines under bright cool-toned lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsQ0LIOPXRV_ZDrz2fYyPvKj_-L3TAtd3OE-hzu1A3aZUSoDJcW0ycaisCXOaF3eKPc6e_JdfyfYitolzn963XSsS_hR8TsSw4S77ncpz5O7KfrALQk65Ex8N94LXjsBQOMDf1wifx9hTATtMyxRSUzTvCJEA6DbYODmqJslrsGkFrGPhVgrB3si0R4i5jabf1XjCVKr9uYj1rctTOICc5BA2B5BYATureevWSrPX8nD1ovFd9nHYH-9lS-6IReqfDJ72j9vadEA"/>
</div>
</div>
{/* Bento Grid Stats */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
{/* Data Monolith 1: Unread Messages */}
<div className="bg-surface-container-highest p-6 flex flex-col justify-between h-48 hover:bg-surface-container-lowest transition-colors cursor-pointer">
<span className="material-symbols-outlined text-primary" >mail</span>
<div>
<div className="text-4xl font-light text-on-surface">04</div>
<div className="text-[11px] font-semibold uppercase tracking-widest text-outline">Unread Messages</div>
</div>
</div>
{/* Data Monolith 2: Lab Results */}
<div className="bg-surface-container-highest p-6 flex flex-col justify-between h-48 hover:bg-surface-container-lowest transition-colors cursor-pointer">
<span className="material-symbols-outlined text-primary">biotech</span>
<div>
<div className="text-4xl font-light text-on-surface">12</div>
<div className="text-[11px] font-semibold uppercase tracking-widest text-outline">Lab Results</div>
</div>
</div>
{/* Data Monolith 3: Upcoming */}
<div className="bg-primary-container p-6 flex flex-col justify-between h-48 text-on-primary transition-all cursor-pointer">
<span className="material-symbols-outlined" >calendar_month</span>
<div>
<div className="text-4xl font-light">02</div>
<div className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Pending Consultations</div>
</div>
</div>
{/* Data Monolith 4: Prescriptions */}
<div className="bg-surface-container-highest p-6 flex flex-col justify-between h-48 hover:bg-surface-container-lowest transition-colors cursor-pointer">
<span className="material-symbols-outlined text-primary">medication</span>
<div>
<div className="text-4xl font-light text-on-surface">06</div>
<div className="text-[11px] font-semibold uppercase tracking-widest text-outline">Active Prescriptions</div>
</div>
</div>
</div>
{/* Asymmetric Secondary Layout */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
{/* Recent Lab Results (Detailed List) */}
<div className="lg:col-span-2">
<div className="flex items-center justify-between mb-6">
<h3 className="text-xl font-semibold text-on-surface">Recent Laboratory Reports</h3>
<a className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary" href="#">View All</a>
</div>
<div className="space-y-4">
<div className="bg-surface-container-low p-6 flex items-center justify-between hover:bg-surface-container-highest transition-colors">
<div className="flex items-center gap-6">
<div className="w-1 bg-primary h-12"></div>
<div>
<div className="text-[11px] font-bold uppercase tracking-widest text-outline mb-1">Oct 14, 2024</div>
<h4 className="font-semibold text-on-surface">Comprehensive Metabolic Panel (CMP)</h4>
</div>
</div>
<div className="text-right">
<div className="text-sm font-bold text-primary">COMPLETED</div>
<div className="text-xs text-outline">Dr. Aris Thorne</div>
</div>
</div>
<div className="bg-surface-container-low p-6 flex items-center justify-between hover:bg-surface-container-highest transition-colors">
<div className="flex items-center gap-6">
<div className="w-1 bg-tertiary h-12"></div>
<div>
<div className="text-[11px] font-bold uppercase tracking-widest text-outline mb-1">Oct 12, 2024</div>
<h4 className="font-semibold text-on-surface">Lipid Profile &amp; Glucose</h4>
</div>
</div>
<div className="text-right">
<div className="text-sm font-bold text-tertiary">ACTION REQUIRED</div>
<div className="text-xs text-outline">Diagnostic Lab B</div>
</div>
</div>
<div className="bg-surface-container-low p-6 flex items-center justify-between hover:bg-surface-container-highest transition-colors">
<div className="flex items-center gap-6">
<div className="w-1 bg-primary h-12"></div>
<div>
<div className="text-[11px] font-bold uppercase tracking-widest text-outline mb-1">Oct 08, 2024</div>
<h4 className="font-semibold text-on-surface">Vitamin D, 25-Hydroxy</h4>
</div>
</div>
<div className="text-right">
<div className="text-sm font-bold text-primary">COMPLETED</div>
<div className="text-xs text-outline">Dr. Aris Thorne</div>
</div>
</div>
</div>
</div>
{/* Sidebar Content */}
<div className="flex flex-col gap-8">
<div>
<h3 className="text-xl font-semibold text-on-surface mb-6">Upcoming Care</h3>
<div className="bg-surface-container-highest p-6 relative overflow-hidden">
<div className="relative z-10">
<div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Tomorrow at 09:30 AM</div>
<h4 className="text-2xl font-light mb-2">Annual Physical Examination</h4>
<p className="text-sm text-on-surface-variant mb-6">Building A, Suite 402 with Dr. Thorne</p>
<button className="w-full h-12 border-2 border-primary text-primary font-bold hover:bg-primary-fixed transition-colors">Confirm Attendance</button>
</div>
</div>
</div>
<div>
<h3 className="text-xl font-semibold text-on-surface mb-6">Health Insights</h3>
<div className="bg-on-background text-white p-8">
<p className="text-lg font-light italic mb-4">"Precision in treatment begins with precision in data."</p>
<div className="text-[11px] font-bold uppercase tracking-widest opacity-60">Clinical Methodology V.2.4</div>
</div>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
