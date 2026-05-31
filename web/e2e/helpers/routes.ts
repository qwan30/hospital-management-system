export interface RouteCase {
  path: string;
  label: string;
}

export const mockMedicalRecordAppointmentId = "11111111-1111-1111-1111-111111111111";
export const mockAdminUserId = "22222222-2222-2222-2222-222222222222";

export const publicRoutes: RouteCase[] = [
  { path: "/", label: "public home" },
  { path: "/departments", label: "public departments" },
  { path: "/departments/cardiology", label: "public department detail" },
  { path: "/doctors", label: "public doctors" },
  { path: "/news", label: "public news" },
  { path: "/booking", label: "public booking" },
  { path: "/privacy", label: "privacy" },
  { path: "/terms", label: "terms" },
  { path: "/security", label: "security" },
  { path: "/session-expired", label: "session expired" },
  { path: "/forbidden", label: "forbidden" },
];

export const staffRoutes: RouteCase[] = [
  { path: "/staff/login", label: "staff login" },
  { path: "/staff/dashboard", label: "staff dashboard" },
  { path: "/staff/closures", label: "staff closures" },
  { path: "/staff/patients", label: "staff patients" },
  { path: "/staff/queue", label: "staff queue" },
  { path: "/staff/schedule", label: "staff schedule" },
  { path: "/staff/booking", label: "staff booking" },
  { path: "/staff/booking/review", label: "staff booking review" },
  { path: "/staff/booking/slots", label: "staff booking slots" },
  { path: "/staff/booking/success", label: "staff booking success" },
  { path: "/staff/booking/symptoms", label: "staff booking symptoms" },
  { path: "/staff/inventory", label: "staff inventory" },
  { path: "/staff/invoices", label: "staff invoices" },
  { path: "/staff/lab-results", label: "staff lab results" },
  { path: "/staff/lab-results/new", label: "staff lab result create" },
  { path: "/staff/lab-results/1", label: "staff lab result detail" },
  { path: `/staff/medical-records/${mockMedicalRecordAppointmentId}/edit`, label: "staff medical record edit" },
  { path: "/staff/nurse-intake", label: "staff nurse intake" },
  { path: "/staff/doctor/1", label: "staff doctor detail" },
  { path: "/staff/doctor/dashboard", label: "staff doctor dashboard" },
  { path: "/staff/prescriptions/preview", label: "staff prescription preview" },
  { path: "/staff/pricing", label: "staff pricing" },
  { path: "/staff/revenue", label: "staff revenue" },
  { path: "/staff/slots", label: "staff slots" },
  { path: "/staff/support", label: "staff support" },
  { path: "/staff/vital-signs", label: "staff vital signs" },
];

export const portalRoutes: RouteCase[] = [
  { path: "/portal/login", label: "portal login" },
  { path: "/portal/overview", label: "portal overview" },
  { path: "/portal/records", label: "portal records" },
  { path: "/portal/appointments", label: "portal appointments" },
  { path: "/portal/appointments/2", label: "portal appointment detail" },
  { path: "/portal/lab-results", label: "portal lab results" },
  { path: "/portal/messages", label: "portal messages" },
  { path: "/portal/profile", label: "portal profile" },
  { path: "/portal/claim", label: "portal claim" },
  { path: "/portal/billing", label: "portal billing" },
  { path: "/portal/diagnostics", label: "portal diagnostics" },
  { path: "/portal/inventory", label: "portal inventory" },
  { path: "/portal/patients", label: "portal patients" },
  { path: "/portal/pharmacy", label: "portal pharmacy" },
  { path: "/portal/scheduling", label: "portal scheduling" },
  { path: "/portal/staff", label: "portal staff" },
  { path: "/portal/support", label: "portal support" },
  { path: "/portal/admit", label: "portal admit" },
];

export const adminRoutes: RouteCase[] = [
  { path: "/admin/dashboard", label: "admin dashboard" },
  { path: "/admin/appointments", label: "admin appointments" },
  { path: "/admin/audit-logs", label: "admin audit logs" },
  { path: "/admin/departments", label: "admin departments" },
  { path: "/admin/monitoring", label: "admin monitoring" },
  { path: "/admin/news", label: "admin news" },
  { path: "/admin/public-content", label: "admin public content" },
  { path: "/admin/rooms", label: "admin rooms" },
  { path: "/admin/users", label: "admin users" },
  { path: `/admin/users/${mockAdminUserId}`, label: "admin user detail" },
  { path: "/admin/inventory", label: "admin inventory" },
  { path: "/admin/pricing", label: "admin pricing" },
  { path: "/admin/schedule-templates", label: "admin schedule templates" },
  { path: "/admin/slots", label: "admin slots" },
  { path: "/admin/special-closures", label: "admin special closures" },
  { path: "/admin/support", label: "admin support" },
];

export const smokeRoutes = [
  ...publicRoutes,
  ...staffRoutes,
  ...portalRoutes,
  ...adminRoutes,
];

export const sideEffectRoutes: RouteCase[] = [
  { path: "/auth/logout", label: "staff logout" },
];

export const responsiveRoutes: RouteCase[] = [
  { path: "/", label: "home" },
  { path: "/booking", label: "booking" },
  { path: "/staff/dashboard", label: "staff dashboard" },
  { path: "/staff/doctor/dashboard", label: "doctor dashboard" },
  { path: "/staff/nurse-intake", label: "nurse intake" },
  { path: `/staff/medical-records/${mockMedicalRecordAppointmentId}/edit`, label: "medical record edit" },
  { path: "/portal/overview", label: "portal overview" },
  { path: "/admin/users", label: "admin users" },
  { path: "/staff/login", label: "staff login" },
  { path: "/portal/login", label: "portal login" },
  { path: "/staff/queue", label: "staff queue" },
  { path: "/staff/inventory", label: "staff inventory" },
  { path: "/portal/appointments", label: "portal appointments" },
  { path: "/admin/dashboard", label: "admin dashboard" },
];

export const visualRoutes = responsiveRoutes;
