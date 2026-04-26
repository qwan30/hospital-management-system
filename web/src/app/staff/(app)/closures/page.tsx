
export default function SpecialClosuresPage() {
  return (
    <>
      <main>

{/* TopAppBar */}
<header className="flex justify-between items-center w-full px-6 h-16 bg-white dark:bg-[#171717] sticky top-0 z-30">
<div className="flex items-center gap-8">
<div className="text-xl font-semibold tracking-tighter text-[#1c1b1b] dark:text-white">MED_CORE / ADMIN</div>
<nav className="hidden md:flex gap-6">
<a className="font-['Public_Sans'] text-sm tracking-tight transition-colors duration-150 ease-in-out text-[#1c1b1b] dark:text-[#e5e2e1]" href="#">Overview</a>
<a className="font-['Public_Sans'] text-sm tracking-tight transition-colors duration-150 ease-in-out text-[#0f62fe] font-semibold border-b-2 border-[#0f62fe]" href="#">Closures</a>
<a className="font-['Public_Sans'] text-sm tracking-tight transition-colors duration-150 ease-in-out text-[#1c1b1b] dark:text-[#e5e2e1]" href="#">Staffing</a>
</nav>
</div>
<div className="flex items-center gap-4">
<div className="relative group">
<input className="bg-surface-container-low border-none focus:ring-1 focus:ring-primary px-4 py-1.5 text-sm w-64 font-['Public_Sans']" placeholder="Search operations..." type="text"/>
</div>
<div className="flex items-center gap-2">
<button className="p-2 hover:bg-[#f6f3f2] dark:hover:bg-[#262626] transition-colors"><span className="material-symbols-outlined text-on-surface" data-icon="notifications">notifications</span></button>
<button className="p-2 hover:bg-[#f6f3f2] dark:hover:bg-[#262626] transition-colors"><span className="material-symbols-outlined text-on-surface" data-icon="settings">settings</span></button>
<div className="h-8 w-8 bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary" data-icon="account_circle">account_circle</span>
</div>
</div>
</div>
</header>
<div className="bg-[#f6f3f2] dark:bg-[#262626] h-px w-full"></div>
{/* Page Header */}
<div className="px-8 py-10 bg-surface">
<div className="flex justify-between items-end">
<div>
<h1 className="text-4xl font-light tracking-tight text-on-background mb-2">Special Closures</h1>
<p className="text-sm text-outline font-medium uppercase tracking-[0.2em]">Administration &amp; Lab Suspension Schedules</p>
</div>
<button className="bg-primary-container text-white px-6 py-3 font-semibold text-sm flex items-center gap-3 active:bg-[#004ccd] transition-all">
<span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
                    CREATE_NEW_CLOSURE
                </button>
</div>
</div>
{/* Content Grid */}
<div className="flex-1 grid grid-cols-12 gap-0">
{/* Left Panel: Calendar Monolith */}
<div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 border-r-0 lg:border-r border-outline-variant/15">
<div className="mb-8 flex justify-between items-center">
<h2 className="text-xl font-semibold tracking-tight">Closure Calendar</h2>
<div className="flex gap-1">
<button className="p-2 hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span></button>
<button className="px-4 text-sm font-bold uppercase tracking-widest">October 2023</button>
<button className="p-2 hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span></button>
</div>
</div>
{/* Utility-First Calendar */}
<div className="grid grid-cols-7 gap-px bg-outline-variant/20">
{/* Days Header */}
<div className="bg-surface-container-low py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Sun</div>
<div className="bg-surface-container-low py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Mon</div>
<div className="bg-surface-container-low py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Tue</div>
<div className="bg-surface-container-low py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Wed</div>
<div className="bg-surface-container-low py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Thu</div>
<div className="bg-surface-container-low py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Fri</div>
<div className="bg-surface-container-low py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Sat</div>
{/* Calendar Cells */}
{/* Row 1 */}
<div className="bg-surface-container-lowest p-4 aspect-square text-outline opacity-30">24</div>
<div className="bg-surface-container-lowest p-4 aspect-square text-outline opacity-30">25</div>
<div className="bg-surface-container-lowest p-4 aspect-square text-outline opacity-30">26</div>
<div className="bg-surface-container-lowest p-4 aspect-square text-outline opacity-30">27</div>
<div className="bg-surface-container-lowest p-4 aspect-square text-outline opacity-30">28</div>
<div className="bg-surface-container-lowest p-4 aspect-square text-outline opacity-30">29</div>
<div className="bg-surface-container-lowest p-4 aspect-square text-outline opacity-30">30</div>
{/* Row 2 */}
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">1</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold flex flex-col justify-between">
<span>2</span>
<div className="w-1.5 h-1.5 bg-primary-container"></div>
</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">3</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">4</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">5</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">6</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">7</div>
{/* Row 3 */}
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">8</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">9</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">10</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold flex flex-col justify-between bg-primary-container text-white">
<span>11</span>
<span className="text-[8px] font-bold uppercase">HOLIDAY</span>
</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">12</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">13</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">14</div>
{/* Row 4 */}
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">15</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">16</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold flex flex-col justify-between">
<span>17</span>
<div className="w-1.5 h-1.5 bg-primary-container"></div>
</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">18</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">19</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">20</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">21</div>
{/* Row 5 */}
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">22</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">23</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">24</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">25</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">26</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">27</div>
<div className="bg-surface-container-lowest p-4 aspect-square font-semibold">28</div>
</div>
<div className="mt-8 flex gap-6">
<div className="flex items-center gap-2">
<div className="w-2 h-2 bg-primary-container"></div>
<span className="text-[10px] font-bold uppercase tracking-widest text-outline">Maintenance</span>
</div>
<div className="flex items-center gap-2">
<div className="w-2 h-2 bg-on-surface"></div>
<span className="text-[10px] font-bold uppercase tracking-widest text-outline">Public Holiday</span>
</div>
</div>
</div>
{/* Right Panel: Upcoming Closures */}
<div className="col-span-12 lg:col-span-7 p-8">
<div className="flex justify-between items-center mb-8">
<h2 className="text-xl font-semibold tracking-tight">Active &amp; Upcoming Schedule</h2>
<div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high text-[10px] font-bold uppercase tracking-widest">
                        Total 08 Entries
                    </div>
</div>
<div className="space-y-4">
{/* Closure Card 1 */}
<div className="p-6 bg-surface-container-low group hover:bg-surface-container-lowest transition-colors flex items-start justify-between">
<div className="flex gap-6">
<div className="w-16 h-16 bg-primary-container/10 flex flex-col items-center justify-center text-primary-container shrink-0">
<span className="text-xs font-bold uppercase">Oct</span>
<span className="text-2xl font-black">11</span>
</div>
<div>
<h3 className="font-semibold text-lg leading-tight mb-1 uppercase tracking-tight">National Health Observance Day</h3>
<p className="text-sm text-on-surface-variant mb-3">All clinics and laboratories closed. Emergency ER services remain at 50% capacity.</p>
<div className="flex gap-4">
<span className="text-[10px] font-bold uppercase text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="timer">timer</span> FULL DAY</span>
<span className="text-[10px] font-bold uppercase text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="location_on">location_on</span> CAMPUS_WIDE</span>
</div>
</div>
</div>
<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 hover:bg-surface-container-high"><span className="material-symbols-outlined text-outline" data-icon="edit">edit</span></button>
<button className="p-2 hover:bg-error-container text-error"><span className="material-symbols-outlined" data-icon="delete">delete</span></button>
</div>
</div>
{/* Closure Card 2 */}
<div className="p-6 bg-surface-container-low group hover:bg-surface-container-lowest transition-colors flex items-start justify-between">
<div className="flex gap-6">
<div className="w-16 h-16 bg-primary-container/10 flex flex-col items-center justify-center text-primary-container shrink-0">
<span className="text-xs font-bold uppercase">Oct</span>
<span className="text-2xl font-black">17</span>
</div>
<div>
<h3 className="font-semibold text-lg leading-tight mb-1 uppercase tracking-tight">System Infrastructure Upgrade</h3>
<p className="text-sm text-on-surface-variant mb-3">Electronic Medical Records (EMR) system offline for periodic DB migration.</p>
<div className="flex gap-4">
<span className="text-[10px] font-bold uppercase text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="timer">timer</span> 22:00 - 04:00</span>
<span className="text-[10px] font-bold uppercase text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="biotech">biotech</span> RADIOLOGY_DEPT</span>
</div>
</div>
</div>
<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 hover:bg-surface-container-high"><span className="material-symbols-outlined text-outline" data-icon="edit">edit</span></button>
<button className="p-2 hover:bg-error-container text-error"><span className="material-symbols-outlined" data-icon="delete">delete</span></button>
</div>
</div>
{/* Closure Card 3 */}
<div className="p-6 bg-surface-container-low group hover:bg-surface-container-lowest transition-colors flex items-start justify-between">
<div className="flex gap-6">
<div className="w-16 h-16 bg-primary-container/10 flex flex-col items-center justify-center text-primary-container shrink-0">
<span className="text-xs font-bold uppercase">Oct</span>
<span className="text-2xl font-black">02</span>
</div>
<div>
<h3 className="font-semibold text-lg leading-tight mb-1 uppercase tracking-tight">Staff Professional Development</h3>
<p className="text-sm text-on-surface-variant mb-3">Internal training session. OPD closed for the afternoon session.</p>
<div className="flex gap-4">
<span className="text-[10px] font-bold uppercase text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="timer">timer</span> 13:00 - 18:00</span>
<span className="text-[10px] font-bold uppercase text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" data-icon="medical_services">medical_services</span> OPD_UNIT_B</span>
</div>
</div>
</div>
<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 hover:bg-surface-container-high"><span className="material-symbols-outlined text-outline" data-icon="edit">edit</span></button>
<button className="p-2 hover:bg-error-container text-error"><span className="material-symbols-outlined" data-icon="delete">delete</span></button>
</div>
</div>
</div>
</div>
</div>

</main>
    </>
  );
}
