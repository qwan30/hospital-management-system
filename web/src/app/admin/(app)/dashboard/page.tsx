export default function AdminDashboardPage() {
  return (
    <div className="p-8 pb-20">
      {/* Header Section */}
      <header className="mb-12">
        <span className="text-xs font-semibold text-hms-primary uppercase tracking-[0.2em] mb-2 block">
          System Overview
        </span>
        <h1 className="text-5xl font-light text-hms-on-background tracking-tight leading-none mb-4">
          Admin Statistics
        </h1>
        <div className="flex items-center gap-4 text-sm text-hms-outline">
          <span>Real-time HMS Performance Data</span>
          <span className="w-1 h-1 bg-hms-outline-variant rounded-full" />
          <span>Last Updated: 12 Oct 2023, 08:45 AM</span>
        </div>
      </header>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 mb-16">
        <div className="bg-hms-surface-container-highest p-8 flex flex-col justify-between h-48 group hover:bg-white transition-colors duration-200">
          <span className="text-[10px] font-semibold text-hms-on-surface uppercase tracking-widest">
            Total Patients
          </span>
          <div>
            <div className="text-4xl font-light text-hms-on-surface">12,842</div>
            <div className="text-xs text-hms-primary font-semibold mt-1">
              ↑ 4.2% VS LAST MONTH
            </div>
          </div>
        </div>
        <div className="bg-hms-surface-container p-8 flex flex-col justify-between h-48 hover:bg-white transition-colors duration-200">
          <span className="text-[10px] font-semibold text-hms-on-surface uppercase tracking-widest">
            Gross Revenue
          </span>
          <div>
            <div className="text-4xl font-light text-hms-on-surface">$1.24M</div>
            <div className="text-xs text-hms-primary font-semibold mt-1">
              ↑ 12% FISCAL YTD
            </div>
          </div>
        </div>
        <div className="bg-hms-surface-container-low p-8 flex flex-col justify-between h-48 hover:bg-white transition-colors duration-200">
          <span className="text-[10px] font-semibold text-hms-on-surface uppercase tracking-widest">
            Bed Occupancy
          </span>
          <div>
            <div className="text-4xl font-light text-hms-on-surface">92.4%</div>
            <div className="text-xs text-hms-tertiary font-semibold mt-1">
              CRITICAL CAPACITY
            </div>
          </div>
        </div>
        <div className="bg-hms-surface-container-highest p-8 flex flex-col justify-between h-48 hover:bg-white transition-colors duration-200">
          <span className="text-[10px] font-semibold text-hms-on-surface uppercase tracking-widest">
            Active Staff
          </span>
          <div>
            <div className="text-4xl font-light text-hms-on-surface">412</div>
            <div className="text-xs text-hms-outline font-semibold mt-1">
              98 ON CALL
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Appointments Module */}
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-2xl font-light tracking-tight">
              Appointment Velocity
            </h3>
            <div className="flex gap-4">
              <button className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-hms-primary-container pb-1 text-hms-on-surface">
                Daily
              </button>
              <button className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-transparent pb-1 text-hms-outline hover:text-hms-on-surface">
                Weekly
              </button>
            </div>
          </div>
          <div className="bg-hms-surface-container-low aspect-[16/7] w-full flex items-end px-8 pb-8 gap-4">
            {/* Faux Bar Chart for Editorial Aesthetic */}
            <div className="flex-1 bg-hms-primary-container opacity-20 h-[40%]" />
            <div className="flex-1 bg-hms-primary-container opacity-40 h-[65%]" />
            <div className="flex-1 bg-hms-primary-container opacity-60 h-[55%]" />
            <div className="flex-1 bg-hms-primary-container opacity-80 h-[85%]" />
            <div className="flex-1 bg-hms-primary-container h-[95%]" />
            <div className="flex-1 bg-hms-primary-container opacity-50 h-[45%]" />
            <div className="flex-1 bg-hms-primary-container opacity-30 h-[30%]" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="p-6 bg-hms-surface-container-highest">
              <span className="text-[10px] font-semibold uppercase tracking-widest block mb-4">
                Pending Confirmations
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-light">28</span>
                <span className="material-symbols-outlined text-hms-primary">
                  pending_actions
                </span>
              </div>
            </div>
            <div className="p-6 bg-hms-surface-container-highest">
              <span className="text-[10px] font-semibold uppercase tracking-widest block mb-4">
                Emergency Slots
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-light">04</span>
                <span className="material-symbols-outlined text-hms-tertiary">
                  emergency
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Actions & Logs */}
        <div className="space-y-12">
          {/* Quick Link Tiles */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
              System Controls
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center justify-between p-4 bg-white hover:bg-hms-primary-container hover:text-white transition-all group">
                <span className="font-semibold text-sm">Real-time Monitoring</span>
                <span className="material-symbols-outlined text-hms-outline group-hover:text-white">
                  monitoring
                </span>
              </button>
              <button className="flex items-center justify-between p-4 bg-white hover:bg-hms-primary-container hover:text-white transition-all group">
                <span className="font-semibold text-sm">Inventory Audit</span>
                <span className="material-symbols-outlined text-hms-outline group-hover:text-white">
                  inventory_2
                </span>
              </button>
              <button className="flex items-center justify-between p-4 bg-white hover:bg-hms-primary-container hover:text-white transition-all group">
                <span className="font-semibold text-sm">Audit Log Export</span>
                <span className="material-symbols-outlined text-hms-outline group-hover:text-white">
                  receipt_long
                </span>
              </button>
            </div>
          </div>

          {/* Module Summaries (Inventory) */}
          <div className="bg-hms-surface-container p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">
              Critical Inventory
            </h3>
            <ul className="space-y-6">
              <li className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Surgical Masks</span>
                  <span className="text-hms-tertiary font-bold">12%</span>
                </div>
                <div className="w-full bg-hms-outline-variant h-1">
                  <div className="bg-hms-tertiary h-full w-[12%]" />
                </div>
              </li>
              <li className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Oxygen Cylinders</span>
                  <span className="text-hms-on-surface font-bold">45%</span>
                </div>
                <div className="w-full bg-hms-outline-variant h-1">
                  <div className="bg-hms-primary-container h-full w-[45%]" />
                </div>
              </li>
              <li className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Saline Solution</span>
                  <span className="text-hms-on-surface font-bold">88%</span>
                </div>
                <div className="w-full bg-hms-outline-variant h-1">
                  <div className="bg-hms-primary-container h-full w-[88%]" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Asymmetric Bottom Section: Recent Alerts */}
      <section className="mt-20 border-t border-hms-outline-variant pt-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <h3 className="text-2xl font-light tracking-tight mb-4">
              Security & Logs
            </h3>
            <p className="text-sm text-hms-outline leading-relaxed">
              Automated monitoring of all system interactions. Discrepancies are
              flagged and held for manual administrator review within 24 hours.
            </p>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 gap-1">
            <div className="bg-hms-surface-container-low p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-hms-outline uppercase">
                  08:42
                </span>
                <span className="text-sm">
                  Unauthorized access attempt blocked - Node IP 192.168.1.42
                </span>
              </div>
              <span className="text-[10px] font-bold text-hms-tertiary uppercase">
                High Alert
              </span>
            </div>
            <div className="bg-hms-surface-container-low p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-hms-outline uppercase">
                  08:15
                </span>
                <span className="text-sm">
                  Inventory depletion: Type B- Blood Units below threshold
                </span>
              </div>
              <span className="text-[10px] font-bold text-hms-on-surface uppercase">
                System
              </span>
            </div>
            <div className="bg-hms-surface-container-low p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-hms-outline uppercase">
                  07:55
                </span>
                <span className="text-sm">
                  Server maintenance completed successfully on Primary Cluster
                </span>
              </div>
              <span className="text-[10px] font-bold text-hms-outline uppercase">
                Success
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
