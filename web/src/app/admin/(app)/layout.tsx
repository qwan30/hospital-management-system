import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hms-surface text-hms-on-background min-h-screen overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full h-12 bg-white dark:bg-neutral-900 flex items-center justify-between px-4 z-50 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-8">
          <span className="text-lg font-semibold uppercase tracking-widest text-neutral-900 dark:text-white">
            MedCore Portal
          </span>
          <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-800 px-3 py-1 gap-2">
            <span className="material-symbols-outlined text-neutral-500 text-sm">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-xs w-64 p-0 outline-none"
              placeholder="Search Portal..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors scale-100 active:bg-neutral-200" aria-label="Open admin notifications">
            <span className="material-symbols-outlined text-neutral-600 dark:text-neutral-400">
              notifications
            </span>
          </button>
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors scale-100 active:bg-neutral-200" aria-label="Open admin settings">
            <span className="material-symbols-outlined text-neutral-600 dark:text-neutral-400">
              settings
            </span>
          </button>
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors scale-100 active:bg-neutral-200" aria-label="Open admin help">
            <span className="material-symbols-outlined text-neutral-600 dark:text-neutral-400">
              help
            </span>
          </button>
          <div className="ml-2 w-8 h-8 bg-hms-primary-container flex items-center justify-center">
            <Image
              alt="User profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjAYIbY4I5-EUie4nTj2n6PiaseM-o8ovE368eXIz5AhFkeP3qcTdNELB1TdpJeVoJuriAFTE8K-JiXn2Jgde9pRlUObn2vl9O-AllRxPysYm9IFnL4CGmkeesz1ey4n7EA2XodaOciwaYBAIcqnw8Tj7F0iBYkNU0ISjUKSUZppzQdvro_N-P5QB3NAIiT1rPj0gGlxiddtTILT1hEKzm7OkrSNZJJJ-23bOrQJii9SubRup8l017ROUNa8g2RyCoUtmKVtphxA"
             width={1200} height={800}/>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-12 h-[calc(100vh-48px)] w-64 bg-neutral-50 dark:bg-neutral-950 hidden md:flex flex-col z-40 border-r border-neutral-200 dark:border-neutral-800">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="font-public-sans text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Clinical Operations
          </h2>
          <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
            Staff Portal v1.0
          </p>
        </div>
        <nav className="flex-1 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-6 py-3 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-public-sans text-xs font-medium uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link
            href="/admin/departments"
            className="flex items-center gap-3 px-6 py-3 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-public-sans text-xs font-medium uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined">apartment</span>
            Departments
          </Link>
          <Link
            href="/admin/appointments"
            className="flex items-center gap-3 px-6 py-3 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-public-sans text-xs font-medium uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined">calendar_today</span>
            Appointments
          </Link>
          <Link
            href="/admin/rooms"
            className="flex items-center gap-3 px-6 py-3 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-public-sans text-xs font-medium uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined">meeting_room</span>
            Rooms
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-900 text-blue-600 border-l-4 border-blue-600 font-bold font-public-sans text-xs uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined">badge</span>
            Staff
          </Link>
          <Link
            href="/admin/audit-logs"
            className="flex items-center gap-3 px-6 py-3 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-public-sans text-xs font-medium uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined">history</span>
            Audit Logs
          </Link>
        </nav>
        <div className="p-4 bg-neutral-100 dark:bg-neutral-900 m-4">
          <button className="w-full bg-hms-primary-container text-white py-2 font-public-sans text-xs font-bold uppercase tracking-wider transition-all active:opacity-80">
            New Entry
          </button>
        </div>
        <div className="mt-auto border-t border-neutral-200 dark:border-neutral-800 py-4">
          <Link
            href="/admin/monitoring"
            className="flex items-center gap-3 px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-public-sans text-[10px] font-bold uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">
              contact_support
            </span>
            Monitoring
          </Link>
          <Link
            href="/auth/logout"
            className="flex items-center gap-3 px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-public-sans text-[10px] font-bold uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="pt-12 min-h-screen md:ml-64 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
