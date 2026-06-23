"use client";

import { useState, useMemo } from "react";
import { Calendar, CheckCircle, AlertTriangle, Plus, Download, ArrowUp, ArrowDown, Search, Building2, ChevronDown, Clock, Activity, MoreVertical, DoorClosed, HeartPulse, Brain, Bone, ArrowRight, UserCheck, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";

interface AppointmentEntry {
    id: string;
    patient: string;
    doctor: string;
    department: string;
    room: string;
    time: string;
    status: "CONFIRMED" | "CHECK-IN" | "PENDING";
    variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "purple" | "destructive" | "outline" | "ghost" | "link";
    icon: LucideIcon;
    iconColor: string;
}

const upcomingAppointmentsList: AppointmentEntry[] = [
    {
        id: "APT-99214",
        patient: "Ariana M.",
        doctor: "Dr. Nguyen",
        department: "Cardiology",
        room: "C-201",
        time: "09:15",
        status: "CONFIRMED",
        variant: "success",
        icon: HeartPulse,
        iconColor: "text-[var(--hc-teal-600)]"
    },
    {
        id: "APT-99215",
        patient: "Tran V.",
        doctor: "Dr. Patel",
        department: "Neurology",
        room: "N-102",
        time: "09:30",
        status: "CHECK-IN",
        variant: "info",
        icon: Brain,
        iconColor: "text-[var(--hc-purple-600)]"
    },
    {
        id: "APT-99216",
        patient: "Le Q.",
        doctor: "Dr. Kim",
        department: "Orthopedics",
        room: "O-305",
        time: "09:45",
        status: "PENDING",
        variant: "warning",
        icon: Bone,
        iconColor: "text-[var(--hc-green-600)]"
    },
    {
        id: "APT-99217",
        patient: "Hoang T.",
        doctor: "Dr. Alvarez",
        department: "Pulmonology",
        room: "P-110",
        time: "10:00",
        status: "CONFIRMED",
        variant: "success",
        icon: HeartPulse,
        iconColor: "text-[var(--hc-blue-600)]"
    },
    {
        id: "APT-99218",
        patient: "Nguyen K.",
        doctor: "Dr. Nguyen",
        department: "Cardiology",
        room: "C-202",
        time: "10:30",
        status: "CONFIRMED",
        variant: "success",
        icon: HeartPulse,
        iconColor: "text-[var(--hc-teal-600)]"
    },
    {
        id: "APT-99219",
        patient: "Pham D.",
        doctor: "Dr. Patel",
        department: "Neurology",
        room: "N-103",
        time: "11:00",
        status: "PENDING",
        variant: "warning",
        icon: Brain,
        iconColor: "text-[var(--hc-purple-600)]"
    },
    {
        id: "APT-99220",
        patient: "Bui L.",
        doctor: "Dr. Kim",
        department: "Orthopedics",
        room: "O-306",
        time: "11:15",
        status: "CHECK-IN",
        variant: "info",
        icon: Bone,
        iconColor: "text-[var(--hc-green-600)]"
    }
];

const PAGE_SIZE = 4;

export default function AdminAppointmentsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | "CONFIRMED" | "CHECK-IN" | "PENDING">("All");
    const [page, setPage] = useState(1);
    const [showNewApptModal, setShowNewApptModal] = useState(false);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const filteredAppointments = useMemo(() => {
        return upcomingAppointmentsList.filter((a) => {
            const matchesSearch =
                a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All" || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
    const pagedAppointments = useMemo(() => {
        return filteredAppointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    }, [filteredAppointments, page]);

    const handleExportCSV = () => {
        const headers = ["Appointment ID", "Patient", "Doctor", "Department", "Room", "Time", "Status"];
        const csvRows = [
            headers.join(","),
            ...filteredAppointments.map((a) =>
                [
                    `"${a.id}"`,
                    `"${a.patient}"`,
                    `"${a.doctor}"`,
                    `"${a.department}"`,
                    `"${a.room}"`,
                    `"${a.time}"`,
                    `"${a.status}"`,
                ].join(",")
            ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `admin_appointments_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 pb-20 max-w-[1400px] mx-auto">
            <PageHeader
                categoryLabel="CLINICAL OPERATIONS"
                title={
                    <div className="flex items-center gap-4">
                        <span>Appointment Management</span>
                        <Badge variant="outline" className="rounded-full bg-[var(--hc-success-bg)] text-[var(--hc-success)] border-green-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--hc-success)] mr-2"></span>
                            Live queue
                        </Badge>
                    </div>
                }
                description="Monitor queue health, routing status, and same-day utilization across all departments."
                action={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowNewApptModal(true)}
                            className="hc-button-primary flex items-center gap-2 h-10 px-5"
                            type="button"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-bold text-[11px] uppercase tracking-widest">New Appointment</span>
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="hc-button-outline flex items-center gap-2 h-10 px-5 bg-[var(--hc-surface)] hover:bg-[var(--hc-background)]"
                            type="button"
                        >
                            <Download className="w-4 h-4" />
                            <span className="font-bold text-[11px] uppercase tracking-widest">Export CSV</span>
                        </button>
                    </div>
                }
            />

            <div className="hc-kpi-grid mb-6">
                <KpiCard
                    label="Today Total"
                    value="126"
                    icon={Calendar}
                    tone="blue"
                    helper={
                        <span className="flex items-center text-xs">
                            <span className="flex items-center text-[var(--hc-green-600)] font-semibold mr-1">
                                <ArrowUp className="w-3 h-3 mr-0.5" /> 12%
                            </span>
                            <span className="text-[var(--hc-text-secondary)] font-medium">vs yesterday</span>
                        </span>
                    }
                />
                <KpiCard
                    label="Checked-in"
                    value="68"
                    icon={UserCheck}
                    tone="teal"
                    helper={
                        <span className="flex items-center text-xs">
                            <span className="flex items-center text-[var(--hc-green-600)] font-semibold mr-1">
                                <ArrowUp className="w-3 h-3 mr-0.5" /> 8%
                            </span>
                            <span className="text-[var(--hc-text-secondary)] font-medium">vs yesterday</span>
                        </span>
                    }
                />
                <KpiCard
                    label="Pending"
                    value="22"
                    icon={Clock}
                    tone="amber"
                    helper={
                        <span className="flex items-center text-xs">
                            <span className="flex items-center text-[var(--hc-orange-600)] font-semibold mr-1">
                                <ArrowDown className="w-3 h-3 mr-0.5" /> 5%
                            </span>
                            <span className="text-[var(--hc-text-secondary)] font-medium">vs yesterday</span>
                        </span>
                    }
                />
                <KpiCard
                    label="No-show Risk"
                    value="9%"
                    icon={AlertTriangle}
                    tone="red"
                    helper={
                        <span className="flex items-center text-xs">
                            <span className="flex items-center text-[var(--hc-red-600)] font-semibold mr-1">
                                <ArrowUp className="w-3 h-3 mr-0.5" /> 2%
                            </span>
                            <span className="text-[var(--hc-text-secondary)] font-medium">vs yesterday</span>
                        </span>
                    }
                />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6 bg-[var(--hc-surface)] p-3 rounded-xl border border-[var(--hc-border-soft)] shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
                    <input
                        aria-label="Search appointments"
                        type="text"
                        placeholder="Search patient or appointment..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full h-9 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]"
                    />
                </div>

                <div className="flex items-center gap-1 p-0.5 bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-lg">
                    <button
                        onClick={() => { setStatusFilter("All"); setPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === "All" ? "bg-[var(--hc-blue-600)] text-white shadow-sm" : "text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-[var(--hc-surface)]"}`}
                        type="button"
                    >
                        All
                    </button>
                    <button
                        onClick={() => { setStatusFilter("CONFIRMED"); setPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === "CONFIRMED" ? "bg-[var(--hc-blue-600)] text-white shadow-sm" : "text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-[var(--hc-surface)]"}`}
                        type="button"
                    >
                        Confirmed
                    </button>
                    <button
                        onClick={() => { setStatusFilter("CHECK-IN"); setPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === "CHECK-IN" ? "bg-[var(--hc-blue-600)] text-white shadow-sm" : "text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-[var(--hc-surface)]"}`}
                        type="button"
                    >
                        Checked-In
                    </button>
                    <button
                        onClick={() => { setStatusFilter("PENDING"); setPage(1); }}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${statusFilter === "PENDING" ? "bg-[var(--hc-blue-600)] text-white shadow-sm" : "text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-[var(--hc-surface)]"}`}
                        type="button"
                    >
                        Pending
                    </button>
                </div>

                <div className="w-px h-6 bg-[var(--hc-border-soft)] mx-2"></div>

                <button className="flex items-center justify-between gap-3 h-9 px-3 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors min-w-[160px]" type="button">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                        <span className="text-sm font-medium text-[var(--hc-text)]">All Departments</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                </button>

                <button className="flex items-center justify-between gap-3 h-9 px-3 bg-[var(--hc-surface)] border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors min-w-[140px]" type="button">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                        <span className="text-sm font-medium text-[var(--hc-text)]">All Time</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                </button>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

                {/* Left Column: Upcoming Queue */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[var(--hc-blue-600)]" />
                        <h2 className="text-lg font-bold text-[var(--hc-text)]">Upcoming Queue</h2>
                    </div>

                    <div className="bg-[var(--hc-surface)] rounded-xl border border-[var(--hc-border-soft)] overflow-hidden shadow-sm flex flex-col h-full">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-[var(--hc-border-soft)] text-[11px] font-bold text-[var(--hc-text-secondary)] uppercase tracking-widest bg-[var(--hc-background)]">
                                        <th className="px-5 py-4 font-bold">Appointment ID</th>
                                        <th className="px-5 py-4 font-bold">Patient</th>
                                        <th className="px-5 py-4 font-bold">Doctor</th>
                                        <th className="px-5 py-4 font-bold">Department</th>
                                        <th className="px-5 py-4 font-bold">Room</th>
                                        <th className="px-5 py-4 font-bold">Time</th>
                                        <th className="px-5 py-4 font-bold">Status</th>
                                        <th className="px-5 py-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--hc-border-soft)]">
                                    {pagedAppointments.length > 0 ? (
                                        pagedAppointments.map((appointment) => (
                                            <tr key={appointment.id} className="hover:bg-[var(--hc-background)] transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--hc-blue-500)]"></div>
                                                        <span className="font-semibold text-[var(--hc-blue-600)]">{appointment.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 font-medium text-[var(--hc-text)]">{appointment.patient}</td>
                                                <td className="px-5 py-3 text-[var(--hc-text-secondary)]">{appointment.doctor}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <appointment.icon className={`w-4 h-4 ${appointment.iconColor}`} />
                                                        <span className="text-[var(--hc-text-secondary)]">{appointment.department}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-[var(--hc-text-secondary)]">{appointment.room}</td>
                                                <td className="px-5 py-3 font-medium text-[var(--hc-text)]">{appointment.time}</td>
                                                <td className="px-5 py-3">
                                                    <Badge variant={appointment.variant} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold">
                                                        <span className="flex items-center gap-1.5">
                                                            {appointment.status === "CONFIRMED" && <CheckCircle className="w-3 h-3" />}
                                                            {appointment.status === "CHECK-IN" && <UserCheck className="w-3 h-3" />}
                                                            {appointment.status === "PENDING" && <Clock className="w-3 h-3" />}
                                                            {appointment.status}
                                                        </span>
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3 text-right relative">
                                                    <button
                                                        onClick={() => setActiveMenuId(prev => prev === appointment.id ? null : appointment.id)}
                                                        className="p-1.5 rounded-md hover:bg-[var(--hc-border-soft)] text-[var(--hc-text-secondary)] transition-colors"
                                                        type="button"
                                                        aria-label="Actions menu"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    {activeMenuId === appointment.id && (
                                                        <div className="absolute right-5 top-10 bg-white border border-[var(--hc-border-soft)] rounded-lg shadow-lg py-1 z-20 min-w-[120px] text-left">
                                                            <button
                                                                onClick={() => { alert(`Editing ${appointment.id} (simulated)`); setActiveMenuId(null); }}
                                                                className="w-full px-4 py-2 text-xs hover:bg-[var(--hc-surface-soft)] font-medium text-[var(--hc-text)] text-left"
                                                                type="button"
                                                            >
                                                                Edit Details
                                                            </button>
                                                            <button
                                                                onClick={() => { alert(`Checked in ${appointment.patient} (simulated)`); setActiveMenuId(null); }}
                                                                className="w-full px-4 py-2 text-xs hover:bg-[var(--hc-surface-soft)] font-medium text-[var(--hc-text)] text-left"
                                                                type="button"
                                                            >
                                                                Mark Checked-in
                                                            </button>
                                                            <button
                                                                onClick={() => { alert(`Cancelled ${appointment.id} (simulated)`); setActiveMenuId(null); }}
                                                                className="w-full px-4 py-2 text-xs hover:bg-[var(--hc-surface-soft)] font-medium text-[var(--hc-red-600)] text-left"
                                                                type="button"
                                                            >
                                                                Cancel Appt
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-[var(--hc-text-secondary)]">No appointments found matching filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-[var(--hc-border-soft)] flex items-center justify-between mt-auto bg-[var(--hc-surface)]">
                            <p className="text-sm text-[var(--hc-text-secondary)]">Showing {filteredAppointments.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, filteredAppointments.length)} of {filteredAppointments.length} appointments</p>
                            <div className="flex items-center gap-4">
                                <nav aria-label="appointments pagination" className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        className="h-8 rounded-md px-3 text-xs font-medium hover:bg-[var(--hc-background)] disabled:opacity-40 disabled:hover:bg-transparent"
                                        disabled={page <= 1}
                                        type="button"
                                    >
                                        Previous
                                    </button>
                                    <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--hc-blue-600)] text-xs font-medium text-white shadow-sm"
                                    >
                                        {page}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        className="h-8 rounded-md px-3 text-xs font-medium hover:bg-[var(--hc-background)] disabled:opacity-40 disabled:hover:bg-transparent"
                                        disabled={page >= totalPages}
                                        type="button"
                                    >
                                        Next
                                    </button>
                                </nav>

                                <div className="flex items-center gap-2 text-sm text-[var(--hc-text-secondary)] ml-4">
                                    <span>Rows per page</span>
                                    <div className="flex items-center justify-between border border-[var(--hc-border-soft)] rounded bg-[var(--hc-surface)] px-2 py-1 min-w-[60px]">
                                        <span className="font-medium text-[var(--hc-text)]">4</span>
                                        <ChevronDown className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Queue Health */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[var(--hc-blue-600)]" />
                        <div>
                            <h2 className="text-sm font-bold text-[var(--hc-text)] leading-tight">Queue Health</h2>
                            <p className="text-xs text-[var(--hc-text-secondary)]">Real-time overview</p>
                        </div>
                    </div>

                    <div className="bg-[var(--hc-surface)] rounded-xl border border-[var(--hc-border-soft)] p-2 shadow-sm">
                        <div className="flex flex-col gap-2">
                            {/* Average Wait Time */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--hc-border-soft)] hover:bg-[var(--hc-background)] transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--hc-teal-bg)] flex items-center justify-center text-[var(--hc-teal-600)] group-hover:bg-teal-100 transition-colors">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--hc-text-secondary)] mb-0.5">Average Wait Time</p>
                                        <p className="text-lg font-bold text-[var(--hc-text)]">18 min</p>
                                    </div>
                                </div>
                                <Badge variant="success" className="bg-[var(--hc-teal-bg)] text-teal-700 border-none font-medium px-2 py-0.5">Good</Badge>
                            </div>

                            {/* Delayed Appointments */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--hc-border-soft)] hover:bg-[var(--hc-background)] transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--hc-amber-bg)] flex items-center justify-center text-[var(--hc-amber-600)] group-hover:bg-orange-100 transition-colors">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--hc-text-secondary)] mb-0.5">Delayed Appointments</p>
                                        <p className="text-lg font-bold text-[var(--hc-text)]">3</p>
                                    </div>
                                </div>
                                <Badge variant="warning" className="bg-[var(--hc-amber-bg)] text-[var(--hc-amber-700)] border-none font-medium px-2 py-0.5">Attention</Badge>
                            </div>

                            {/* Rooms Available */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--hc-border-soft)] hover:bg-[var(--hc-background)] transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--hc-primary-bg)] flex items-center justify-center text-[var(--hc-primary)] group-hover:bg-blue-100 transition-colors">
                                        <DoorClosed className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--hc-text-secondary)] mb-0.5">Rooms Available</p>
                                        <p className="text-lg font-bold text-[var(--hc-text)]">7 / 24</p>
                                    </div>
                                </div>
                                <Badge variant="success" className="bg-[var(--hc-success-bg)] text-[var(--hc-success)] border-none font-medium px-2 py-0.5">Available</Badge>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAnalyticsModal(true)}
                            className="w-full mt-2 flex items-center justify-between p-3 text-sm font-semibold text-[var(--hc-blue-600)] hover:bg-[var(--hc-primary-bg)] rounded-lg transition-colors"
                            type="button"
                        >
                            View full queue analytics
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Book Appointment Modal */}
            {showNewApptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-xl border border-[var(--hc-border)] shadow-lg max-w-md w-full p-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-[var(--hc-text)] mb-4">Book New Appointment</h3>
                        <div className="space-y-3 text-sm text-[var(--hc-text-secondary)]">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1" htmlFor="patientName">Patient Name</label>
                                <input id="patientName" type="text" className="hc-input w-full" placeholder="e.g. Ariana M." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1" htmlFor="doctor">Doctor</label>
                                <select id="doctor" className="hc-input w-full">
                                    <option>Dr. Nguyen (Cardiology)</option>
                                    <option>Dr. Patel (Neurology)</option>
                                    <option>Dr. Kim (Orthopedics)</option>
                                    <option>Dr. Alvarez (Pulmonology)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" htmlFor="time">Time Slot</label>
                                    <input id="time" type="time" className="hc-input w-full" defaultValue="09:00" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" htmlFor="room">Room</label>
                                    <input id="room" type="text" className="hc-input w-full" defaultValue="C-201" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowNewApptModal(false)}
                                className="px-4 py-2 text-sm border border-[var(--hc-border)] rounded-[var(--radius-md)] hover:bg-[var(--hc-surface-soft)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    alert("Appointment booked successfully (simulated)!");
                                    setShowNewApptModal(false);
                                }}
                                className="hc-button-primary"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Queue Analytics Modal */}
            {showAnalyticsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
                    <div className="bg-white rounded-xl border border-[var(--hc-border)] shadow-lg max-w-lg w-full p-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-[var(--hc-text)] mb-4">Queue Analytics</h3>
                        <div className="space-y-4 text-sm text-[var(--hc-text-secondary)]">
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 border border-[var(--hc-border-soft)] rounded-lg">
                                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Avg Service Time</span>
                                    <span className="text-xl font-bold text-[var(--hc-text)]">12m</span>
                                </div>
                                <div className="p-3 border border-[var(--hc-border-soft)] rounded-lg">
                                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Peak Utilization</span>
                                    <span className="text-xl font-bold text-[var(--hc-text)]">88%</span>
                                </div>
                                <div className="p-3 border border-[var(--hc-border-soft)] rounded-lg">
                                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Routing Quality</span>
                                    <span className="text-xl font-bold text-[var(--hc-text)]">99.2%</span>
                                </div>
                            </div>
                            <div className="border border-[var(--hc-border-soft)] rounded-lg p-4">
                                <h4 className="font-bold text-[var(--hc-text)] mb-2">Hourly Load Trend</h4>
                                <div className="h-24 flex items-end gap-2 border-b border-[var(--hc-border)] pb-1">
                                    {[20, 45, 60, 80, 50, 30, 10].map((h, i) => (
                                        <div key={i} className="flex-1 bg-[var(--hc-blue-500)] rounded-t" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] text-[var(--hc-text-muted)] mt-1">
                                    <span>08:00</span>
                                    <span>12:00</span>
                                    <span>17:00</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAnalyticsModal(false)}
                                    className="hc-button-primary"
                            >
                                Close Analytics
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
