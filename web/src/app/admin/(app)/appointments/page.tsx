import { Calendar, CheckCircle, AlertTriangle, Users, Plus, Download, ArrowUp, ArrowDown, Search, Building2, ChevronDown, Clock, Activity, MoreVertical, DoorClosed, HeartPulse, Brain, Bone, ArrowRight, UserCheck, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";

const upcomingAppointments: {
    id: string;
    patient: string;
    doctor: string;
    department: string;
    room: string;
    time: string;
    status: string;
    variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" | "purple" | "destructive" | "outline" | "ghost" | "link";
    icon: LucideIcon;
    iconColor: string;
}[] = [
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
];

export default function AdminAppointmentsPage() {
    return (
        <div className="p-8 pb-20 max-w-[1400px] mx-auto">
            <PageHeader
                categoryLabel="CLINICAL OPERATIONS"
                title={
                    <div className="flex items-center gap-4">
                        <span>Appointment Management</span>
                        <Badge variant="outline" className="rounded-full bg-green-50 text-green-700 border-green-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                            Live queue
                        </Badge>
                    </div>
                }
                description="Monitor queue health, routing status, and same-day utilization across all departments."
                action={
                    <div className="flex items-center gap-3">
                        <button className="hc-button-primary flex items-center gap-2 h-10 px-5">
                            <Plus className="w-4 h-4" />
                            <span className="font-bold text-[11px] uppercase tracking-widest">New Appointment</span>
                        </button>
                        <button className="hc-button-outline flex items-center gap-2 h-10 px-5 bg-white hover:bg-[var(--hc-background)]">
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
            <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-[var(--hc-border-soft)] shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hc-text-secondary)]" />
                    <input type="text" placeholder="Search patient or appointment..." className="w-full h-9 pl-9 pr-4 text-sm bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-md focus:outline-none focus:border-[var(--hc-blue-500)] focus:ring-1 focus:ring-[var(--hc-blue-500)]" />
                </div>

                <div className="flex items-center gap-1 p-0.5 bg-[var(--hc-background)] border border-[var(--hc-border-soft)] rounded-lg">
                    <button className="px-4 py-1.5 rounded-md text-xs font-semibold bg-[var(--hc-blue-600)] text-white shadow-sm">All</button>
                    <button className="px-4 py-1.5 rounded-md text-xs font-medium text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-white transition-colors">Confirmed</button>
                    <button className="px-4 py-1.5 rounded-md text-xs font-medium text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-white transition-colors">Checked-In</button>
                    <button className="px-4 py-1.5 rounded-md text-xs font-medium text-[var(--hc-text-secondary)] hover:text-[var(--hc-text)] hover:bg-white transition-colors">Pending</button>
                    <button className="px-4 py-1.5 rounded-md text-xs font-medium text-[var(--hc-red-600)] hover:bg-red-50 hover:text-[var(--hc-red-700)] transition-colors">High Risk</button>
                </div>

                <div className="w-px h-6 bg-[var(--hc-border-soft)] mx-2"></div>

                <button className="flex items-center justify-between gap-3 h-9 px-3 bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors min-w-[160px]">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                        <span className="text-sm font-medium text-[var(--hc-text)]">All Departments</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[var(--hc-text-secondary)]" />
                </button>

                <button className="flex items-center justify-between gap-3 h-9 px-3 bg-white border border-[var(--hc-border-soft)] rounded-md hover:bg-[var(--hc-background)] transition-colors min-w-[140px]">
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

                    <div className="bg-white rounded-xl border border-[var(--hc-border-soft)] overflow-hidden shadow-sm flex flex-col h-full">
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
                                    {upcomingAppointments.map((appointment) => (
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
                                            <td className="px-5 py-3 text-right">
                                                <button className="p-1.5 rounded-md hover:bg-[var(--hc-border-soft)] text-[var(--hc-text-secondary)] transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-[var(--hc-border-soft)] flex items-center justify-between mt-auto bg-white">
                            <p className="text-sm text-[var(--hc-text-secondary)]">Showing 4 of 4 appointments</p>
                            <div className="flex items-center gap-4">
                                <Pagination className="justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious href="#" size="default" className="h-8 px-3 text-xs" />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink href="#" isActive size="icon" className="h-8 w-8 text-xs bg-[var(--hc-blue-600)] text-white hover:bg-[var(--hc-blue-700)] hover:text-white">1</PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext href="#" size="default" className="h-8 px-3 text-xs" />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>

                                <div className="flex items-center gap-2 text-sm text-[var(--hc-text-secondary)] ml-4">
                                    <span>Rows per page</span>
                                    <div className="flex items-center justify-between border border-[var(--hc-border-soft)] rounded bg-white px-2 py-1 min-w-[60px]">
                                        <span className="font-medium text-[var(--hc-text)]">10</span>
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

                    <div className="bg-white rounded-xl border border-[var(--hc-border-soft)] p-2 shadow-sm">
                        <div className="flex flex-col gap-2">
                            {/* Average Wait Time */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--hc-border-soft)] hover:bg-[var(--hc-background)] transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--hc-text-secondary)] mb-0.5">Average Wait Time</p>
                                        <p className="text-lg font-bold text-[var(--hc-text)]">18 min</p>
                                    </div>
                                </div>
                                <Badge variant="success" className="bg-teal-50 text-teal-700 border-none font-medium px-2 py-0.5">Good</Badge>
                            </div>

                            {/* Delayed Appointments */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--hc-border-soft)] hover:bg-[var(--hc-background)] transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--hc-text-secondary)] mb-0.5">Delayed Appointments</p>
                                        <p className="text-lg font-bold text-[var(--hc-text)]">3</p>
                                    </div>
                                </div>
                                <Badge variant="warning" className="bg-orange-50 text-orange-700 border-none font-medium px-2 py-0.5">Attention</Badge>
                            </div>

                            {/* Rooms Available */}
                            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--hc-border-soft)] hover:bg-[var(--hc-background)] transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <DoorClosed className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--hc-text-secondary)] mb-0.5">Rooms Available</p>
                                        <p className="text-lg font-bold text-[var(--hc-text)]">7 / 24</p>
                                    </div>
                                </div>
                                <Badge variant="success" className="bg-green-50 text-green-700 border-none font-medium px-2 py-0.5">Available</Badge>
                            </div>
                        </div>

                        <button className="w-full mt-2 flex items-center justify-between p-3 text-sm font-semibold text-[var(--hc-blue-600)] hover:bg-blue-50 rounded-lg transition-colors">
                            View full queue analytics
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}