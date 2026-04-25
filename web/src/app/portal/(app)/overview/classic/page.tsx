export default function PatientPortalOverviewPage() {
  return (
    <div className="min-h-screen">

{/* TopNavBar Shell */}
<header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl docked full-width top-0 sticky z-50 shadow-[0_7px_14px_0_rgba(50,50,93,0.1)] flex justify-between items-center w-full px-8 py-4">
<div className="text-xl font-light tracking-tighter text-[#061B31] dark:text-white">Clinical Curator</div>
<nav className="hidden md:flex items-center space-x-8">
<a className="font-['Inter'] font-light tracking-[-0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">Services</a>
<a className="font-['Inter'] font-light tracking-[-0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">Find a Doctor</a>
<a className="font-['Inter'] font-medium border-b-2 border-[#533AFD] text-[#533AFD] transition-colors" href="#">Patient Portal</a>
<a className="font-['Inter'] font-light tracking-[-0.5px] text-[#64748D] hover:text-[#061B31] transition-colors" href="#">About Us</a>
</nav>
<div className="flex items-center gap-4">
<button className="bg-[#533AFD] text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-[#3904e7] transition-all duration-200 scale-95 active:scale-90">Book Appointment</button>
</div>
</header>
<div className="flex h-[calc(100vh-76px)] overflow-hidden">
{/* SideNavBar Shell */}
<aside className="hidden md:flex flex-col h-full w-64 bg-[#f8f9ff] dark:bg-slate-950 p-4 space-y-2 bg-[#eff3ff] dark:bg-slate-900 shadow-none border-none">
<div className="px-4 py-6">
<h2 className="text-lg font-light tracking-[-1.4px] text-[#061B31] dark:text-white">Clinical Curator</h2>
<p className="text-xs text-[#64748D] tracking-wide uppercase mt-1">Staff Workspace</p>
</div>
<div className="flex-1 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 text-[#533AFD] rounded-lg shadow-sm font-semibold transition-all duration-300" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="text-sm">Overview</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-[#64748D] dark:text-slate-400 hover:text-[#533AFD] hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-300" href="#">
<span className="material-symbols-outlined">event_upcoming</span>
<span className="text-sm">Appointments</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-[#64748D] dark:text-slate-400 hover:text-[#533AFD] hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-300" href="#">
<span className="material-symbols-outlined">microbiology</span>
<span className="text-sm">Labs</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-[#64748D] dark:text-slate-400 hover:text-[#533AFD] hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-300" href="#">
<span className="material-symbols-outlined">person</span>
<span className="text-sm">Profile</span>
</a>
</div>
<div className="pt-4 mt-4 border-t border-[#eff3ff] dark:border-slate-800 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 text-[#64748D] hover:text-[#533AFD] transition-all duration-300" href="#">
<span className="material-symbols-outlined">help</span>
<span className="text-sm">Support</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-[#64748D] hover:text-[#533AFD] transition-all duration-300" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="text-sm">Settings</span>
</a>
</div>
</aside>
{/* Main Canvas */}
<main className="flex-1 overflow-y-auto p-8 lg:p-12">
<div className="max-w-6xl mx-auto space-y-12">
{/* Header Section */}
<header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#533AFD] block mb-2">Welcome Back, Alexander</span>
<h1 className="editorial-headline text-5xl text-[#061B31] leading-none">Your Health Overview</h1>
</div>
<div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-[#eff3ff]">
<div className="w-10 h-10 rounded-lg bg-[#533AFD]/10 flex items-center justify-center text-[#533AFD]">
<span className="material-symbols-outlined">calendar_today</span>
</div>
<div className="pr-4">
<p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Date</p>
<p className="text-sm font-semibold text-[#061B31]">October 24, 2024</p>
</div>
</div>
</header>
{/* Hero Section: Next Appointment */}
<section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#3904e7] to-[#533AFD] text-white p-8 md:p-12 shadow-[0_20px_40px_rgba(83,58,253,0.15)]">
<div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
<div className="space-y-6">
<div>
<span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium mb-4">Confirmed Appointment</span>
<h2 className="text-3xl font-light tracking-tight mb-2">Cardiac Screening with <br/> Dr. Eleanor Vance</h2>
<p className="text-white/80 text-lg">Your next check-up is scheduled for Tuesday morning. Please remember to fast for at least 8 hours.</p>
</div>
<div className="flex flex-wrap gap-4">
<div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg min-w-[140px]">
<p className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-1">Date &amp; Time</p>
<p className="font-semibold text-lg">Oct 29 • 09:15 AM</p>
</div>
<div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg min-w-[140px]">
<p className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-1">Location</p>
<p className="font-semibold text-lg">Main Clinic, Wing B</p>
</div>
</div>
<button className="bg-white text-[#533AFD] px-8 py-3 rounded-lg font-semibold hover:bg-[#f8f9ff] transition-all">Preparation Guide</button>
</div>
<div className="hidden md:block">
<img alt="Modern doctor office" className="w-full h-80 object-cover rounded-lg shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500" data-alt="Modern clean hospital interior with soft natural lighting and abstract medical equipment in soft focus" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1wXKEpWAzE8zFXZ3JK17FkpJZUV9cTDCZO_eZ-pypWTTxo9jyCy1xPP_mZ788-5-xsd1uVlZcdwHusFeuZo0D_cjOyfx4wTGfAaYiEUyhaMcQldrIaR25kevdPkv8MI3xfCk-eJB0xQROkYvm7FK-B1HhldtWY3LECoNaa3wYCccVBdCgyU8UGR7_cqe6o8hLDHLnTX_wWZon8eXhIsSUjIeFVp-iw4jXmqa-54GUbqrwku3vcCRObuKDAyquu3VOPHJCa0rx7A"/>
</div>
</div>
{/* Abstract Background Element */}
<div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
</section>
{/* Summary Cards Grid */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-8">
{/* Card 1: Pending Labs */}
<div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
<div className="flex justify-between items-start mb-6">
<div className="w-12 h-12 rounded-lg bg-[#eff3ff] flex items-center justify-center text-[#533AFD] group-hover:bg-[#533AFD] group-hover:text-white transition-colors">
<span className="material-symbols-outlined">biotech</span>
</div>
<span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded">Processing</span>
</div>
<h3 className="text-xl font-medium text-[#061B31] mb-2">Pending Lab Results</h3>
<p className="text-[#64748D] text-sm mb-6 leading-relaxed">Your Comprehensive Blood Panel from Oct 21 is currently being analyzed by our lab partners.</p>
<div className="pt-4 border-t border-[#eff3ff] flex items-center justify-between">
<span className="text-xs font-semibold text-[#061B31]">Est. Completion: 24h</span>
<span className="material-symbols-outlined text-[#533AFD] text-lg">arrow_forward_ios</span>
</div>
</div>
{/* Card 2: Unread Messages */}
<div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
<div className="flex justify-between items-start mb-6">
<div className="w-12 h-12 rounded-lg bg-[#eff3ff] flex items-center justify-center text-[#533AFD] group-hover:bg-[#533AFD] group-hover:text-white transition-colors">
<span className="material-symbols-outlined">mail</span>
</div>
<span className="text-[10px] font-bold uppercase tracking-widest text-[#533AFD] bg-[#533AFD]/10 px-2 py-1 rounded">2 New</span>
</div>
<h3 className="text-xl font-medium text-[#061B31] mb-2">Unread Messages</h3>
<p className="text-[#64748D] text-sm mb-6 leading-relaxed">You have new communications from the Billing Department and Dr. Vance's assistant.</p>
<div className="pt-4 border-t border-[#eff3ff] flex items-center justify-between">
<span className="text-xs font-semibold text-[#061B31]">View Inbox</span>
<span className="material-symbols-outlined text-[#533AFD] text-lg">arrow_forward_ios</span>
</div>
</div>
{/* Card 3: Vitals Sparkline */}
<div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
<div className="flex justify-between items-start mb-6">
<div className="w-12 h-12 rounded-lg bg-[#eff3ff] flex items-center justify-center text-[#533AFD] group-hover:bg-[#533AFD] group-hover:text-white transition-colors">
<span className="material-symbols-outlined">favorite</span>
</div>
<span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Normal</span>
</div>
<h3 className="text-xl font-medium text-[#061B31] mb-2">Resting Heart Rate</h3>
<div className="flex items-end gap-2 mb-4">
<span className="text-3xl font-light text-[#061B31]">68</span>
<span className="text-sm font-medium text-[#64748D] pb-1">BPM</span>
</div>
{/* Mini Trend Placeholder */}
<div className="h-10 w-full flex items-end gap-1">
<div className="bg-[#533AFD]/20 w-full h-1/2 rounded-sm"></div>
<div className="bg-[#533AFD]/20 w-full h-3/4 rounded-sm"></div>
<div className="bg-[#533AFD]/40 w-full h-2/3 rounded-sm"></div>
<div className="bg-[#533AFD]/60 w-full h-5/6 rounded-sm"></div>
<div className="bg-[#533AFD] w-full h-4/5 rounded-sm"></div>
</div>
<p className="text-[10px] text-center mt-2 font-bold uppercase tracking-widest text-slate-400">7 Day Trend</p>
</div>
</section>
{/* Activity / History Section - Asymmetric Bento Style */}
<section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
<div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm">
<div className="flex items-center justify-between mb-8">
<h3 className="text-2xl font-light text-[#061B31]">Recent Medical History</h3>
<button className="text-[#533AFD] text-xs font-bold uppercase tracking-widest hover:underline">Download All</button>
</div>
<div className="space-y-6">
<div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-lg">
<div className="flex items-center gap-4">
<div className="p-3 bg-white rounded-lg shadow-sm">
<span className="material-symbols-outlined text-[#533AFD]">description</span>
</div>
<div>
<p className="font-semibold text-[#061B31]">Annual Physical Examination</p>
<p className="text-xs text-[#64748D]">Dr. Michael Thorne • Aug 12, 2024</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 hover:text-[#533AFD] cursor-pointer">download</span>
</div>
<div className="flex items-center justify-between p-4 bg-[#f8f9ff] rounded-lg">
<div className="flex items-center gap-4">
<div className="p-3 bg-white rounded-lg shadow-sm">
<span className="material-symbols-outlined text-[#533AFD]">vaccines</span>
</div>
<div>
<p className="font-semibold text-[#061B31]">Seasonal Flu Vaccination</p>
<p className="text-xs text-[#64748D]">Nurse Station 4 • Oct 05, 2024</p>
</div>
</div>
<span className="material-symbols-outlined text-slate-400 hover:text-[#533AFD] cursor-pointer">download</span>
</div>
</div>
</div>
<div className="lg:col-span-2 space-y-8">
<div className="bg-white p-8 rounded-xl shadow-sm h-full flex flex-col justify-between">
<div>
<h3 className="text-xl font-medium text-[#061B31] mb-4">Quick Actions</h3>
<div className="grid grid-cols-2 gap-4">
<button className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#eff3ff] hover:bg-[#533AFD] hover:text-white transition-all text-[#533AFD] gap-2">
<span className="material-symbols-outlined text-3xl">medication</span>
<span className="text-xs font-bold uppercase tracking-tight">Refill Rx</span>
</button>
<button className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#eff3ff] hover:bg-[#533AFD] hover:text-white transition-all text-[#533AFD] gap-2">
<span className="material-symbols-outlined text-3xl">payments</span>
<span className="text-xs font-bold uppercase tracking-tight">Pay Bill</span>
</button>
<button className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#eff3ff] hover:bg-[#533AFD] hover:text-white transition-all text-[#533AFD] gap-2">
<span className="material-symbols-outlined text-3xl">chat_bubble</span>
<span className="text-xs font-bold uppercase tracking-tight">Care Team</span>
</button>
<button className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#eff3ff] hover:bg-[#533AFD] hover:text-white transition-all text-[#533AFD] gap-2">
<span className="material-symbols-outlined text-3xl">summarize</span>
<span className="text-xs font-bold uppercase tracking-tight">Reports</span>
</button>
</div>
</div>
</div>
</div>
</section>
</div>
</main>
</div>
{/* Footer Shell */}
<footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#f8f9ff] dark:bg-slate-950 border-t border-[#eff3ff] dark:border-slate-800">
<div className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D]">
            © 2024 Clinical Curator HMS. Editorial Excellence in Medicine.
        </div>
<div className="flex gap-8">
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Privacy Policy</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Terms of Service</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Cookie Settings</a>
<a className="font-['Inter'] text-[12px] uppercase tracking-[0.5px] text-[#64748D] hover:text-[#061B31] dark:hover:text-white transition-colors" href="#">Accessibility</a>
</div>
</footer>

    </div>
  );
}
