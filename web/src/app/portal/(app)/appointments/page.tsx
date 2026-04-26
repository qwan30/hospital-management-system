
export default function PatientAppointmentsPage() {
  return (
    <>
      <main>

<div className="max-w-6xl mx-auto">
{/* Editorial Header */}
<header className="mb-12">
<span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase block mb-2">Health Management</span>
<h1 className="text-5xl font-light tracking-tighter text-on-surface mb-6">Patient Appointments</h1>
{/* Segmented Control */}
<div className="flex items-center gap-0 bg-surface-container-low w-fit p-1">
<button className="px-8 py-2 text-xs font-bold bg-white text-primary shadow-sm">UPCOMING</button>
<button className="px-8 py-2 text-xs font-bold text-neutral-500 hover:bg-surface-container-high transition-colors">PAST</button>
</div>
</header>
{/* Appointments Content - Asymmetric Layout */}
<div className="grid grid-cols-12 gap-8">
{/* Left Column: Primary List */}
<div className="col-span-12 lg:col-span-8 space-y-4">
{/* Appointment Card 1 */}
<div className="group bg-surface-container-lowest p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white transition-all cursor-pointer relative overflow-hidden">
<div className="flex gap-6 items-start">
<div className="flex flex-col items-center bg-surface-container-high p-3 min-w-[80px]">
<span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">OCT</span>
<span className="text-2xl font-bold text-on-surface leading-none">24</span>
</div>
<div>
<div className="flex items-center gap-2 mb-1">
<span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">CONFIRMED</span>
<span className="text-neutral-400 text-xs tracking-tighter">09:30 AM — 45 mins</span>
</div>
<h3 className="text-xl font-semibold text-on-surface">Dr. Sarah Jenkins</h3>
<p className="text-sm text-neutral-500 font-medium uppercase tracking-tight">Cardiology • Diagnostic Consultation</p>
</div>
</div>
<div className="mt-4 md:mt-0 flex items-center gap-4">
<button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Reschedule</button>
<span className="material-symbols-outlined text-neutral-300 group-hover:text-primary transition-colors">arrow_forward_ios</span>
</div>
</div>
{/* Appointment Card 2 */}
<div className="group bg-surface-container-lowest p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white transition-all cursor-pointer relative overflow-hidden">
<div className="flex gap-6 items-start">
<div className="flex flex-col items-center bg-surface-container-high p-3 min-w-[80px]">
<span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">NOV</span>
<span className="text-2xl font-bold text-on-surface leading-none">02</span>
</div>
<div>
<div className="flex items-center gap-2 mb-1">
<span className="bg-secondary-container text-on-secondary-container text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">PENDING</span>
<span className="text-neutral-400 text-xs tracking-tighter">02:15 PM — 30 mins</span>
</div>
<h3 className="text-xl font-semibold text-on-surface">Dr. Michael Chen</h3>
<p className="text-sm text-neutral-500 font-medium uppercase tracking-tight">Dermatology • Routine Skin Check</p>
</div>
</div>
<div className="mt-4 md:mt-0 flex items-center gap-4">
<button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Review Info</button>
<span className="material-symbols-outlined text-neutral-300 group-hover:text-primary transition-colors">arrow_forward_ios</span>
</div>
</div>
{/* Appointment Card 3 */}
<div className="group bg-surface-container-lowest p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white transition-all cursor-pointer relative overflow-hidden">
<div className="flex gap-6 items-start">
<div className="flex flex-col items-center bg-surface-container-high p-3 min-w-[80px]">
<span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">NOV</span>
<span className="text-2xl font-bold text-on-surface leading-none">15</span>
</div>
<div>
<div className="flex items-center gap-2 mb-1">
<span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">CONFIRMED</span>
<span className="text-neutral-400 text-xs tracking-tighter">11:00 AM — 60 mins</span>
</div>
<h3 className="text-xl font-semibold text-on-surface">Dr. Elena Rodriguez</h3>
<p className="text-sm text-neutral-500 font-medium uppercase tracking-tight">Physical Therapy • Initial Assessment</p>
</div>
</div>
<div className="mt-4 md:mt-0 flex items-center gap-4">
<button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Reschedule</button>
<span className="material-symbols-outlined text-neutral-300 group-hover:text-primary transition-colors">arrow_forward_ios</span>
</div>
</div>
</div>
{/* Right Column: Contextual Data */}
<div className="col-span-12 lg:col-span-4 space-y-8">
{/* Data Monolith: Health Summary */}
<div className="bg-surface-container-highest p-8">
<h4 className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-8">Summary Metrics</h4>
<div className="space-y-8">
<div>
<span className="text-5xl font-light tracking-tighter text-primary">03</span>
<span className="text-[10px] font-bold block uppercase tracking-widest mt-2 text-neutral-600">Upcoming Visits</span>
</div>
<div>
<span className="text-5xl font-light tracking-tighter text-on-surface">12</span>
<span className="text-[10px] font-bold block uppercase tracking-widest mt-2 text-neutral-600">Total YTD Appointments</span>
</div>
<div>
<span className="text-5xl font-light tracking-tighter text-on-surface">98%</span>
<span className="text-[10px] font-bold block uppercase tracking-widest mt-2 text-neutral-600">Attendance Rate</span>
</div>
</div>
</div>
{/* Quick Action Card */}
<div className="bg-primary-container p-8 text-white">
<h4 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 opacity-80">Telehealth Ready</h4>
<p className="text-xl font-medium mb-6 leading-tight">You have a virtual visit available in your clinical history.</p>
<button className="w-full bg-white text-primary py-4 font-bold text-xs uppercase tracking-widest hover:bg-surface-container-low transition-colors">
                            Check Connection
                        </button>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
