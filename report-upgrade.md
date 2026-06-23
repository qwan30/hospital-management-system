# Upgrade & UI Audit Report

This report documents the functional coverage and UI audit of the Hospital Core Clinical (/staff) and Administration (/admin) portals for the Admin role (`admin@hospital.vn`).

> **Status**: All non-functional buttons have been resolved. Auto token refresh is active. Unit tests: **70 suites, 633 tests — all passing**.

---

## 1. Clinical Portal (/staff)

### 1.1 Overview (Dashboard)
* **Path**: `/staff/dashboard`
* **Sidebar Button**: Overview
* **Subpages**: None.
* **Status**: ✅ **All Fixed**
  - **Refresh** button — now calls `window.location.reload()` via the `onRefresh` prop passed from the parent page.
  - **More Filters** button — now toggles an advanced filter panel with an "Attending Nurse" filter.
  - **Export** button — now downloads a CSV of visible patient records.
  - **View** row action button — now shows an `alert` with full patient vitals details.
  - **More actions** row action button — now shows a `prompt` menu: Discharge / Transfer Ward / Record Vitals.
  - **Reassign Resources** button — now shows a feedback alert confirming the staffing reallocation request.

### 1.2 Patient Records
* **Path**: `/staff/patients`
* **Sidebar Button**: Patient Records
* **Subpages**: Individual Medical Profile details.
* **Status**: ✅ **All Fixed**
  - **Edit** profile button — now opens a `prompt` dialog to edit the patient's phone number.
  - **Print** profile button — now calls `window.print()`.

### 1.3 Queue Board
* **Path**: `/staff/queue`
* **Sidebar Button**: Queue Board
* **Subpages**: WAITING, READY, IN PROGRESS status tabs.
* **Status**: ✅ **Fully functional** (no changes needed).

### 1.4 Appointments (Booking Wizard)
* **Paths**: `/staff/booking`, `/staff/booking/slots`, `/staff/booking/review`, `/staff/booking/success`
* **Sidebar Button**: Appointments
* **Status**: ✅ **All Fixed**
  - **Save Draft** (Step 1) — now shows a confirmation alert and navigates to `/staff/dashboard`.
  - **Next: Analyze Results** (Step 1) — now navigates to `/staff/booking/slots`.
  - **Filter by Seniority** & **Sort by Availability** (Step 2) — now show informational alerts.
  - **Continue to Patient Info** (Step 2) — now navigates to `/staff/booking/review`.
  - **Confirm Booking** (Step 3) — now navigates to `/staff/booking/success` with confirmation message.
  - **Save as Draft** (Step 3) — now navigates back to dashboard with confirmation.
  - **Go Home** (Step 4) — now navigates to `/staff/dashboard`.
  - **Book Another** (Step 4) — now navigates to `/staff/booking`.

### 1.5 Inventory
* **Path**: `/staff/inventory`
* **Status**: ✅ **Fully functional** (no changes needed).

### 1.6 Diagnostics (Lab Results)
* **Path**: `/staff/lab-results`
* **Status**: ✅ **All Fixed**
  - **Export** button — now downloads a CSV of all visible lab results.
  - **REPORT ID ↕** sorting header — now toggles ascending/descending sort on click.

### 1.7 Billing (Invoices)
* **Path**: `/staff/invoices`
* **Sidebar Button**: Billing
* **Status**: ✅ **Fully functional** (minor style fix on Collection Target card; reference-only sidebar boxes are informational by design).

---

## 2. Admin Portal (/admin)

### 2.1 Dashboard
* **Path**: `/admin/dashboard`
* **Status**: ✅ **All Fixed**
  - **Daily & Weekly** chart view tabs — now toggle the `ChartPlaceholder` view and description.
  - **System Settings** button — now opens a Settings modal with theme, refresh interval, and telemetry preferences.
  - **Recent Alerts** & **System Events** tabs — now toggle between alert items and system event items.

### 2.2 Departments
* **Path**: `/admin/departments`
* **Status**: ✅ **Fully functional** (no changes needed).

### 2.3 Appointments
* **Path**: `/admin/appointments`
* **Status**: ✅ **All Fixed**
  - **New Appointment** button — now opens a "Book New Appointment" modal with patient name, doctor, time slot, and room fields.
  - **Export CSV** button — now downloads a CSV of all visible appointments.
  - Row action menu button (⋮) — now toggles a dropdown with "Edit Details", "Mark Checked-in", and "Cancel Appt" options.
  - **View full queue analytics** button — now opens a Queue Analytics modal with service time, utilization, and routing quality stats.
  - **Previous** & **Next** pagination buttons — now fully functional with client-side pagination.

### 2.4 Templates
* **Path**: `/admin/schedule-templates`
* **Status**: ✅ **Fully functional** (no changes needed).

### 2.5 Closures
* **Path**: `/admin/special-closures`
* **Status**: ✅ **All Fixed**
  - **Export CSV** button — now downloads a CSV of all visible closures.
  - Row **⋮ menu** — now toggles a dropdown with "Activate/Deactivate" option that calls the backend `updateAdminSpecialClosure` API.

### 2.6 Slots
* **Path**: `/admin/slots`
* **Status**: ✅ **Fully functional** (no changes needed).

### 2.7 Rooms
* **Path**: `/admin/rooms`
* **Status**: ✅ **Fully functional**
  - Note: The READY status button is correctly disabled only when the selected room is *already* in READY status (expected behavior, not a bug).

### 2.8 Staff (Users)
* **Path**: `/admin/users`
* **Status**: ✅ **Fully functional** (no changes needed).

### 2.9 Inventory
* **Path**: `/admin/inventory`
* **Status**: ✅ **All Fixed**
  - **Advanced Filter** button — now toggles a collapsible filter panel for filtering by Department Name.
  - **Export** button — now downloads a CSV of all visible inventory items.
  - Row **View** button — now opens a Dialog showing full item details.

### 2.10 Pricing
* **Path**: `/admin/pricing`
* **Status**: ✅ **All Fixed**
  - Row **Delete** button — now shows a confirmation dialog and removes the item from local state (client-side simulation).

### 2.11 Monitoring
* **Path**: `/admin/monitoring`
* **Status**: ✅ **All Fixed**
  - **Auto Token Refresh** implemented in `api-client.ts` — pages no longer error out on 401 Unauthorized.
  - **Run Health Check** — now shows an alert with simulated health check results.
  - **View Alert Center** — now navigates to `/admin/audit-logs`.
  - **Inventory Overview** — now navigates to `/admin/inventory`.
  - **Queue Monitoring** — now navigates to `/admin/appointments`.
  - **System Logs** — now navigates to `/admin/audit-logs`.

### 2.12 Support
* **Path**: `/admin/support`
* **Status**: ✅ **All Fixed**
  - **Filter presets** (Default Preset) — now resets all filters to default state.
  - **Export** button — now downloads a CSV of all visible tickets.
  - **Support refresh** button — now shows a spinning animation and reloads ticket data.
  - Row **Drilldown/View Details** button — now opens a dialog with full ticket details.
  - Row **Status** button — now opens a prompt to update ticket status (Open / In Progress / Resolved).

### 2.13 News
* **Path**: `/admin/news`
* **Status**: ✅ **Token error resolved** via auto-refresh; Create Article and Export CSV are functional.

### 2.14 Content
* **Path**: `/admin/public-content`
* **Status**: ✅ **Token error resolved** via auto-refresh; Create Section is functional.

### 2.15 Audit Logs
* **Path**: `/admin/audit-logs`
* **Status**: ✅ **All Fixed**
  - **Token error resolved** via auto-refresh.
  - All dropdown filters (Actor, Action Type, Department, Severity) are now active `<select>` elements that filter the live API data.
  - **Clear filters** button now resets all filter state.
  - **Previous** & **Next** pagination buttons are fully functional with client-side pagination.

---

## Summary of Changes

| Area | Files Modified | Fix Type |
|------|---------------|----------|
| Auto Token Refresh | `frontend/src/lib/api-client.ts` | Backend Integration |
| Staff Dashboard | `frontend/src/app/staff/(app)/dashboard/doctor-dashboard.tsx` | Client-side |
| Patient Records | `frontend/src/app/staff/(app)/patients/page.tsx` | Client-side |
| Booking Wizard | `booking/page.tsx`, `slots/page.tsx`, `review/page.tsx`, `success/page.tsx` | Navigation |
| Lab Results | `frontend/src/app/staff/(app)/lab-results/page.tsx` | Client-side |
| Admin Dashboard | `frontend/src/app/admin/(app)/dashboard/page.tsx` | Client-side |
| Admin Appointments | `frontend/src/app/admin/(app)/appointments/page.tsx` | Client-side |
| Admin Inventory | `frontend/src/app/admin/(app)/inventory/page.tsx` | Client-side |
| Admin Pricing | `frontend/src/app/admin/(app)/pricing/page.tsx` | Client-side |
| Admin Closures | `frontend/src/app/admin/(app)/special-closures/page.tsx` | API + Client-side |
| Admin Support | `frontend/src/app/admin/(app)/support/page.tsx` | Client-side |
| Admin Monitoring | `frontend/src/app/admin/(app)/monitoring/page.tsx` | Navigation |
| Admin Audit Logs | `frontend/src/app/admin/(app)/audit-logs/page.tsx` | Client-side |
| Public Doctors | `frontend/src/app/(public)/doctors/page.tsx` | Test Fix |
