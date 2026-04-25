export default function DoctorDashboardPage() {
  return (
    <div className="min-h-screen">

{/* SideNavBar Shell */}
<aside className="bg-[#f8f9ff] flex flex-col h-screen p-4 space-y-2 docked left-0 h-full w-64 transition-all duration-300 ease-in-out">
<div className="mb-8 px-2 flex items-center gap-3">
<div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
<span className="material-symbols-outlined text-white text-sm" data-icon="clinical_notes">clinical_notes</span>
</div>
<h1 className="text-lg font-light tracking-[-1.4px] text-[#061B31]">Clinical Curator</h1>
</div>
<div className="flex-1 space-y-1">
<a className="flex items-center gap-3 px-3 py-2 bg-white text-[#533AFD] rounded-lg shadow-sm font-semibold transition-all" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-['Inter'] text-sm tracking-normal">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 text-[#64748D] hover:bg-white/50 hover:text-[#533AFD] transition-all" href="#">
<span className="material-symbols-outlined" data-icon="personal_injury">personal_injury</span>
<span className="font-['Inter'] text-sm tracking-normal">Patient Records</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 text-[#64748D] hover:bg-white/50 hover:text-[#533AFD] transition-all" href="#">
<span className="material-symbols-outlined" data-icon="event_upcoming">event_upcoming</span>
<span className="font-['Inter'] text-sm tracking-normal">Surgical Schedule</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 text-[#64748D] hover:bg-white/50 hover:text-[#533AFD] transition-all" href="#">
<span className="material-symbols-outlined" data-icon="microbiology">microbiology</span>
<span className="font-['Inter'] text-sm tracking-normal">Diagnostics</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 text-[#64748D] hover:bg-white/50 hover:text-[#533AFD] transition-all" href="#">
<span className="material-symbols-outlined" data-icon="medication">medication</span>
<span className="font-['Inter'] text-sm tracking-normal">Pharmacy</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 text-[#64748D] hover:bg-white/50 hover:text-[#533AFD] transition-all" href="#">
<span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
<span className="font-['Inter'] text-sm tracking-normal">Analytics</span>
</a>
</div>
<div className="pt-4 border-t border-[#eff3ff] space-y-1">
<button className="w-full mb-4 bg-primary-container text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
<span className="material-symbols-outlined text-base" data-icon="add">add</span>
                New Entry
            </button>
<a className="flex items-center gap-3 px-3 py-2 text-[#64748D] hover:text-[#533AFD]" href="#">
<span className="material-symbols-outlined" data-icon="help">help</span>
<span className="font-['Inter'] text-sm tracking-normal">Support</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 text-[#64748D] hover:text-[#533AFD]" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-['Inter'] text-sm tracking-normal">Settings</span>
</a>
</div>
</aside>
{/* Main Workspace */}
<main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface">
{/* Top Navigation */}
<header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center w-full px-8 py-4 shadow-[0_7px_14px_0_rgba(50,50,93,0.1)]">
<div className="flex items-center gap-4">
<h2 className="editorial-header text-2xl text-[#061B31]">Dashboard</h2>
<span className="text-secondary text-sm font-light">Monday, Oct 24</span>
</div>
<div className="flex items-center gap-6">
<div className="relative flex items-center bg-surface-container-highest px-3 py-1.5 rounded-lg w-64 group transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-container">
<span className="material-symbols-outlined text-secondary text-lg" data-icon="search">search</span>
<input className="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-secondary" placeholder="Search clinical files..." type="text"/>
</div>
<div className="flex items-center gap-3">
<button className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<div className="flex items-center gap-2 border-l border-surface-container-high pl-4">
<img alt="Staff Profile" className="w-8 h-8 rounded-full object-cover" data-alt="Close-up portrait of a professional male doctor with short dark hair in a clinical white coat" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4DYJwurnKMLFuOhXXr5EdB81H3YR8TzWphnf2rzJtySvllE_gIgO38oHJVo_dH1rTC4oiNVYlx7eYRtCpaoC0NOutdMlodk-Ek40ZN7xXfAcIpO1fPejAzW19tfpcyCN3bMRoaMOuwaAuIipgPYl-LdahjC4oJjVBzU_u9u1lgtnXilzvE4yWa1N8kYg5vKJ2D2pOkwtGhmBJD0w-64MFBL7zhBPHSSgXAmKTi9y1RjUXQJdGX9Ofe78_RUvO2Z-SStIye6x0jg"/>
<div className="hidden lg:block">
<p className="text-xs font-semibold text-[#061B31]">Dr. Aris Thorne</p>
<p className="text-[10px] text-secondary uppercase tracking-wider">On-Duty: Surgery</p>
</div>
</div>
</div>
</div>
</header>
{/* Content Area */}
<div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
{/* KPI Bento Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border-l-4 border-primary-container">
<div className="flex justify-between items-start mb-2">
<span className="data-label text-secondary">Today's Total</span>
<span className="material-symbols-outlined text-primary-container bg-primary-container/10 p-1 rounded" data-icon="calendar_today">calendar_today</span>
</div>
<div className="flex items-baseline gap-2">
<h3 className="editorial-header text-3xl text-on-surface">32</h3>
<span className="text-[10px] text-green-600 font-medium">+4 from yesterday</span>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border-l-4 border-error">
<div className="flex justify-between items-start mb-2">
<span className="data-label text-secondary">Waiting Room</span>
<span className="material-symbols-outlined text-error bg-error/10 p-1 rounded" data-icon="hourglass_empty">hourglass_empty</span>
</div>
<div className="flex items-baseline gap-2">
<h3 className="editorial-header text-3xl text-on-surface">08</h3>
<span className="text-[10px] text-secondary font-medium">Avg wait: 14m</span>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border-l-4 border-on-secondary-container">
<div className="flex justify-between items-start mb-2">
<span className="data-label text-secondary">In Progress</span>
<span className="material-symbols-outlined text-on-secondary-container bg-secondary-container p-1 rounded" data-icon="vital_signs">vital_signs</span>
</div>
<div className="flex items-baseline gap-2">
<h3 className="editorial-header text-3xl text-on-surface">04</h3>
<span className="text-[10px] text-secondary font-medium">Active sessions</span>
</div>
</div>
</div>
{/* Sticky Filter Bar & Actions */}
<div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md py-2 flex flex-col sm:flex-row justify-between items-center gap-4">
<div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
<button className="px-4 py-1.5 rounded-full bg-primary-container text-white text-xs font-medium whitespace-nowrap">Today</button>
<button className="px-4 py-1.5 rounded-full bg-surface-container-high text-secondary text-xs hover:bg-surface-container-highest whitespace-nowrap transition-colors">Tomorrow</button>
<button className="px-4 py-1.5 rounded-full bg-surface-container-high text-secondary text-xs hover:bg-surface-container-highest whitespace-nowrap transition-colors">Weekly</button>
<div className="h-4 w-px bg-surface-container-highest mx-2"></div>
<select className="bg-surface-container-high border-none text-xs rounded-full py-1.5 pl-3 pr-8 text-secondary focus:ring-1 focus:ring-primary-container transition-all">
<option>Status: All</option>
<option>Confirmed</option>
<option>In-Progress</option>
<option>Completed</option>
</select>
</div>
<div className="flex items-center gap-2">
<button className="p-2 text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="filter_list">filter_list</span>
</button>
<button className="p-2 text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined text-lg" data-icon="file_download">file_download</span>
</button>
</div>
</div>
{/* Dense Data Table Container */}
<div className="bg-surface-container-lowest rounded-xl shadow-[0_7px_14px_0_rgba(50,50,93,0.1)] overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low">
<th className="px-6 py-4 data-label text-secondary">Time</th>
<th className="px-6 py-4 data-label text-secondary">Patient</th>
<th className="px-6 py-4 data-label text-secondary">Department</th>
<th className="px-6 py-4 data-label text-secondary">Reason</th>
<th className="px-6 py-4 data-label text-secondary">Status</th>
<th className="px-6 py-4 data-label text-secondary"></th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-low">
{/* Table Row 1 */}
<tr className="hover:bg-surface/50 transition-colors group">
<td className="px-6 py-4">
<div className="text-sm font-semibold text-on-surface">09:00</div>
<div className="text-[10px] text-secondary">AM</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-secondary-container">ES</div>
<div>
<div className="text-sm font-medium text-on-surface">Elias Sterling</div>
<div className="text-[10px] text-secondary">#PAT-4421 • 42M</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs text-secondary bg-surface-container px-2 py-1 rounded">Cardiology</span>
</td>
<td className="px-6 py-4">
<div className="text-xs text-on-surface truncate max-w-[200px]">Post-Op Heart Valve Replacement Review</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5">
<div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
<span className="text-[11px] font-medium text-on-surface">Confirmed</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="opacity-0 group-hover:opacity-100 text-primary-container p-1 rounded hover:bg-primary-container/10 transition-all">
<span className="material-symbols-outlined text-xl" data-icon="chevron_right">chevron_right</span>
</button>
</td>
</tr>
{/* Table Row 2 */}
<tr className="hover:bg-surface/50 transition-colors group bg-surface-container-low/20">
<td className="px-6 py-4">
<div className="text-sm font-semibold text-on-surface">09:30</div>
<div className="text-[10px] text-secondary">AM</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-secondary-container">MR</div>
<div>
<div className="text-sm font-medium text-on-surface">Mina Rossi</div>
<div className="text-[10px] text-secondary">#PAT-9833 • 29F</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs text-secondary bg-surface-container px-2 py-1 rounded">Oncology</span>
</td>
<td className="px-6 py-4">
<div className="text-xs text-on-surface truncate max-w-[200px]">Biopsy Lab Result Discussion</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5">
<div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
<span className="text-[11px] font-medium text-on-surface">In-Progress</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="opacity-0 group-hover:opacity-100 text-primary-container p-1 rounded hover:bg-primary-container/10 transition-all">
<span className="material-symbols-outlined text-xl" data-icon="chevron_right">chevron_right</span>
</button>
</td>
</tr>
{/* Table Row 3 */}
<tr className="hover:bg-surface/50 transition-colors group">
<td className="px-6 py-4">
<div className="text-sm font-semibold text-on-surface">10:15</div>
<div className="text-[10px] text-secondary">AM</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-secondary-container">JW</div>
<div>
<div className="text-sm font-medium text-on-surface">Julian Weaver</div>
<div className="text-[10px] text-secondary">#PAT-1120 • 65M</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs text-secondary bg-surface-container px-2 py-1 rounded">Orthopedics</span>
</td>
<td className="px-6 py-4">
<div className="text-xs text-on-surface truncate max-w-[200px]">Chronic Knee Pain Management</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5">
<div className="w-1.5 h-1.5 rounded-full bg-error"></div>
<span className="text-[11px] font-medium text-on-surface">Waiting</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="opacity-0 group-hover:opacity-100 text-primary-container p-1 rounded hover:bg-primary-container/10 transition-all">
<span className="material-symbols-outlined text-xl" data-icon="chevron_right">chevron_right</span>
</button>
</td>
</tr>
{/* Table Row 4 */}
<tr className="hover:bg-surface/50 transition-colors group">
<td className="px-6 py-4">
<div className="text-sm font-semibold text-on-surface">11:00</div>
<div className="text-[10px] text-secondary">AM</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-secondary-container">AA</div>
<div>
<div className="text-sm font-medium text-on-surface">Amara Adebayo</div>
<div className="text-[10px] text-secondary">#PAT-5602 • 12F</div>
</div>
</div>
</td>
<td className="px-6 py-4">
<span className="text-xs text-secondary bg-surface-container px-2 py-1 rounded">Pediatrics</span>
</td>
<td className="px-6 py-4">
<div className="text-xs text-on-surface truncate max-w-[200px]">Routine Vaccination &amp; Wellness</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5">
<div className="w-1.5 h-1.5 rounded-full bg-error"></div>
<span className="text-[11px] font-medium text-on-surface">Waiting</span>
</div>
</td>
<td className="px-6 py-4 text-right">
<button className="opacity-0 group-hover:opacity-100 text-primary-container p-1 rounded hover:bg-primary-container/10 transition-all">
<span className="material-symbols-outlined text-xl" data-icon="chevron_right">chevron_right</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Dashboard Footer/Copyright */}
<footer className="w-full py-8 border-t border-[#eff3ff] flex flex-col md:flex-row justify-between items-center gap-4">
<p className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D]">© 2024 Clinical Curator HMS. Editorial Excellence in Medicine.</p>
<div className="flex gap-6">
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">Privacy Policy</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">Accessibility</a>
</div>
</footer>
</div>
</main>
{/* Collapsed Right Panel (The Assistant) */}
<aside className="w-16 h-screen bg-surface-container-low border-l border-surface-container-high flex flex-col items-center py-6 gap-6">
<button className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center shadow-lg">
<span className="material-symbols-outlined" data-icon="bolt">bolt</span>
</button>
<div className="flex flex-col gap-4 mt-8">
<button className="text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
</button>
<button className="text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="clinical_notes">clinical_notes</span>
</button>
<button className="text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="psychology">psychology</span>
</button>
</div>
<div className="mt-auto mb-6">
<button className="text-secondary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="expand_more">expand_more</span>
</button>
</div>
</aside>

    </div>
  );
}
