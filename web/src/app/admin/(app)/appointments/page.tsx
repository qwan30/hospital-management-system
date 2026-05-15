import { Calendar, CheckCircle, AlertTriangle, Users, Plus, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataPanel } from "@/components/ui/data-panel";

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
        <div className="p-8 pb-20">
            <PageHeader
                title="Appointment Management"
                description="Clinical Operations • Monitor queue health, routing status, and same-day utilization across all departments"
                action={
                    <button className="hc-button-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="font-bold text-[11px] uppercase tracking-widest">New Appointment</span>
                    </button>
                }
            />

            <div className="hc-kpi-grid mb-8">
                <KpiCard label="Today Total" value="126" icon={Calendar} tone="blue" />
                <KpiCard label="Checked-in" value="68" icon={CheckCircle} tone="green" />
                <KpiCard label="Pending" value="22" icon={Users} tone="teal" />
                <KpiCard label="No-show Risk" value="9%" icon={AlertTriangle} tone="red" />
            </div>

            <DataPanel
                title="Upcoming Queue"
                action={
                    <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] hover:text-[var(--hc-primary)] transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="hc-table">
                        <thead>
                            <tr>
                                <th>Appointment ID</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Department</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td className="font-semibold text-[var(--hc-text)]">{appointment.id}</td>
                                    <td>{appointment.patient}</td>
                                    <td className="text-[var(--hc-text-secondary)]">{appointment.doctor}</td>
                                    <td className="text-[var(--hc-text-secondary)]">{appointment.department}</td>
                                    <td>{appointment.time}</td>
                                    <td>
                                        <span className="hc-badge bg-[var(--hc-surface-soft)] text-[var(--hc-text)] border-[var(--hc-border-soft)]">
                                            {appointment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DataPanel>
        </div>
    );
}