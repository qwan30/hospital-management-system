const upcomingAppointments = [
    {
        id: "APT-99214",
        patient: "Ariana M.",
        doctor: "Dr. Nguyen",
        department: "Cardiology",
        time: "09:15",
        status: "Confirmed",
    },
    {
        id: "APT-99215",
        patient: "Tran V.",
        doctor: "Dr. Patel",
        department: "Neurology",
        time: "09:30",
        status: "Check-in",
    },
    {
        id: "APT-99216",
        patient: "Le Q.",
        doctor: "Dr. Kim",
        department: "Orthopedics",
        time: "09:45",
        status: "Pending",
    },
    {
        id: "APT-99217",
        patient: "Hoang T.",
        doctor: "Dr. Alvarez",
        department: "Pulmonology",
        time: "10:00",
        status: "Confirmed",
    },
];

export default function AdminAppointmentsPage() {
    return (
        <div className="max-w-[1200px] p-10">
            <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-hms-primary">
                        Clinical Operations
                    </p>
                    <h1 className="text-4xl font-light tracking-tighter text-hms-on-background md:text-5xl">
                        Appointment Management
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-hms-on-surface-variant">
                        Monitor queue health, routing status, and same-day utilization across
                        all departments.
                    </p>
                </div>
                <button className="bg-hms-primary-container px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-hms-primary">
                    New Appointment
                </button>
            </header>

            <section className="mb-8 grid grid-cols-1 gap-px bg-hms-surface-container md:grid-cols-4">
                <div className="bg-hms-surface p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline">
                        Today Total
                    </p>
                    <p className="mt-2 text-4xl font-light tracking-tight">126</p>
                </div>
                <div className="bg-hms-surface p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline">
                        Checked-in
                    </p>
                    <p className="mt-2 text-4xl font-light tracking-tight">68</p>
                </div>
                <div className="bg-hms-surface p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline">
                        Pending
                    </p>
                    <p className="mt-2 text-4xl font-light tracking-tight">22</p>
                </div>
                <div className="bg-hms-surface p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-hms-outline">
                        No-show Risk
                    </p>
                    <p className="mt-2 text-4xl font-light tracking-tight">9%</p>
                </div>
            </section>

            <section className="overflow-hidden border border-hms-outline-variant/25 bg-hms-surface">
                <div className="flex items-center justify-between border-b border-hms-outline-variant/25 bg-hms-surface-container-low p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-hms-on-surface">
                        Upcoming Queue
                    </p>
                    <button className="text-xs font-bold uppercase tracking-widest text-hms-primary hover:underline">
                        Export CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-hms-surface-container-highest">
                            <tr>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                                    Appointment ID
                                </th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                                    Patient
                                </th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                                    Doctor
                                </th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                                    Department
                                </th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                                    Time
                                </th>
                                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hms-outline-variant/20">
                            {upcomingAppointments.map((appointment) => (
                                <tr
                                    key={appointment.id}
                                    className="transition-colors hover:bg-hms-surface-container-low"
                                >
                                    <td className="px-5 py-4 text-sm font-semibold tracking-tight text-hms-on-surface">
                                        {appointment.id}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-hms-on-surface">
                                        {appointment.patient}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-hms-on-surface-variant">
                                        {appointment.doctor}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-hms-on-surface-variant">
                                        {appointment.department}
                                    </td>
                                    <td className="px-5 py-4 text-sm text-hms-on-surface">
                                        {appointment.time}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="bg-hms-surface-container-high px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface">
                                            {appointment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}