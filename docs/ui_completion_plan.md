# Hospital Core — UI Completion Plan

This document outlines the detailed screen-by-screen visual and functional audit comparing the target UI design screenshots (located in `web/screenshot-each-page/UI-after-updated`) against the current live Next.js implementation (located in `web/src/app` and audited in `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-22/`).

---

## 1. Executive Summary

This plan provides a blueprint for bringing the live Next.js application in `web/` to parity with the design aesthetics, layouts, and interactive capabilities defined in the target screenshots. 

### Core Objectives
*   **Aesthetic Alignment:** Implement the **dark navy top navigation + light clinical sidebar + white workspace + dense operational tables** hierarchy across all pages.
*   **Functional Parity:** Restore missing controls (date-range filters, export buttons, overflow menu actions, interactive modals) and nested navigation flows.
*   **API & Flow Safety:** Verify that every added field, button, and status transition aligns with the active Spring Boot REST endpoints (`docs/API_ENDPOINTS_COMPREHENSIVE.md`) and core hospital flows (`docs/reference/current-system-flows.md`).
*   **P1 & P2 Blocker Resolution:** Fix immediate data contract issues (invalid route parameters like ID `1`) and role-context render bugs discovered during the live route audit.

> [!IMPORTANT]
> **Out-of-Scope AI Features:** Pursuant to the Spring Boot database migration `V11` and `docs/design_brief.md`, all AI Assistant (`/staff/assistant`), symptom analysis models, and knowledge document screens are deprecated and skipped. The chatbot component on the public side must remain a deterministic helper.

---

## 2. Global UI Rules

To ensure visual consistency, all developers must adhere to the following layout and token rules defined in `docs/design_system.md`:

### App Shell Structure
*   **Topbar (`hc-topbar`):** Height `64px`, background `var(--hc-navy-950)` (#061735). Contains system brand, role switchers, notifications, and user profiles.
*   **Sidebar (`hc-sidebar`):** Width `280px`, background `var(--hc-sidebar-bg)` (#FBFCFE), border-right `1px solid var(--hc-border)`. Serves as module-specific contextual navigation.
*   **Workspace Content Padding:** Spacing `32px` (`padding: var(--space-8)`) around all sides.
*   **Page Elements Hierarchy:**
    1.  Category label + Page Title + Short Description + Primary Actions.
    2.  KPI Cards Row (3-4 columns).
    3.  Filter Toolbar (Search box, dropdowns, date pickers, secondary buttons).
    4.  Dense Data Table or Grid.
    5.  Pagination Footer.

### Token & Spacing Matrix
*   **Primary Action Button:** Background `var(--hc-blue-600)` (#0F62FE), text white, radius `var(--radius-md)` (10px).
*   **Borders:** Fine gray borders (`var(--hc-border-soft)` #EEF2F7 or `var(--hc-border)` #E2E8F0).
*   **Dense Tables:** Row height `46px–52px`. Text size `13px` for contents, `11px` uppercase tracking for headers. Hover background `#FAFCFF`.
*   **Badges:** Height `22px`, font size `10px` uppercase bold, background matching semantic tones (`--hc-success-bg`, `--hc-warning-bg`, `--hc-danger-bg`, etc.).

---

## 3. Screen-by-Screen Analysis (79 Target Screenshots)

The following sections analyze every screenshot in the target design directory `web/screenshot-each-page/UI-after-updated/` compared with the current implementation.

### Section A: Accountant Workspace (Finance)

#### 1. accountant_dashboard.png
*   **Route:** `/staff/dashboard` (Accountant Role)
*   **Target Image:** `accountant_dashboard.png`
*   **Live Audit Image:** None (currently renders generic Doctor Dashboard)
*   **Missing UI Elements:** Accountant KPIs (Daily Collection, Billing SLA Status, Delinquent Counts) and financial summary charts.
*   **Buttons to Add:** "Generate Daily Reconciliation", "View Financial Ledger".
*   **Input Fields/Filters:** Date switcher dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Accountant views total billing collection stats.
*   **Recommended Implementation Plan:** Integrate RBAC conditional layout switcher in dashboard route to render an Accountant-specific KPI widget panel.
*   **Business-Flow Validation:** Maps to billing stats APIs.

#### 2. accountant_invoices.png
*   **Route:** `/staff/invoices`
*   **Target Image:** `accountant_invoices.png`
*   **Live Audit Image:** `24-staff-invoices.png`
*   **Missing UI Elements:** Export options, collection progress bar achievements, and date-range filters.
*   **Buttons to Add:** "Export CSV", "New Invoice", "Void Invoice".
*   **Input Fields/Filters:** Invoice status dropdown (Paid, Unpaid, Voided), date range selector, search bar.
*   **Subpages/Nested Flows:** Link to details drawer.
*   **Expandable Behaviors:** Hover rows highlight.
*   **Missing E2E Flows:** Accountant reviews unpaid invoices list.
*   **Recommended Implementation Plan:** Apply the IBM style dense layout to the existing invoices table; wire the search and status filter inputs to query state.
*   **Business-Flow Validation:** Supported by `/api/v1/invoices`.

#### 3. accountant_invoices (2).png
*   **Route:** `/staff/invoices` (Detail Panel)
*   **Target Image:** `accountant_invoices (2).png`
*   **Live Audit Image:** `24-staff-invoices.png` (missing side drawer)
*   **Missing UI Elements:** Slide-out details drawer showing fee breakdowns and inline payment capture form.
*   **Buttons to Add:** "Capture Payment", "Download PDF Invoice".
*   **Input Fields/Filters:** Payment method select dropdown (Cash, Card, Transfer), transaction code field.
*   **Subpages/Nested Flows:** Print Preview dialog.
*   **Expandable Behaviors:** Drawer slides out from right on row click.
*   **Missing E2E Flows:** Voiding an invoice and recording payment captures.
*   **Recommended Implementation Plan:** Create an overlay side panel component activated by selecting a row item in `/staff/invoices`.
*   **Business-Flow Validation:** Uses `/api/v1/invoices/{id}/payments`.

#### 4. accountant_pricing.png
*   **Route:** `/staff/pricing` (or `/admin/pricing`)
*   **Target Image:** `accountant_pricing.png`
*   **Live Audit Image:** `32-staff-pricing.png`
*   **Missing UI Elements:** Dynamic service pricing tables separated by category, and update action trigger cells.
*   **Buttons to Add:** "Add Service Price Item", "Update Price".
*   **Input Fields/Filters:** Department category tabs, item name search box, numeric price input.
*   **Subpages/Nested Flows:** Edit Price modal overlay.
*   **Expandable Behaviors:** Status switch toggle.
*   **Missing E2E Flows:** Modifying a clinical service price item.
*   **Recommended Implementation Plan:** Standardize pricing table design; bind row clicks to a simple slide-up form modal.
*   **Business-Flow Validation:** Maps to `POST` and `PUT` `/api/v1/pricing`.

#### 5. accountant_revenue.png
*   **Route:** `/staff/revenue`
*   **Target Image:** `accountant_revenue.png`
*   **Live Audit Image:** `33-staff-revenue.png`
*   **Missing UI Elements:** Visual bar/line revenue graphs showing month-over-month comparisons.
*   **Buttons to Add:** "Export PDF Report", "Reconcile Ledger".
*   **Input Fields/Filters:** Month selector dropdown, department filter checklist.
*   **Subpages/Nested Flows:** Breakdown lists.
*   **Expandable Behaviors:** Hover chart nodes to view numbers.
*   **Missing E2E Flows:** Fetching statistical revenue summaries.
*   **Recommended Implementation Plan:** Use standard CSS grid components or chart canvas placeholders to render revenue summaries.
*   **Business-Flow Validation:** Maps to `/api/v1/reports/revenue/daily`.

#### 6. accountant_revenue (2).png
*   **Route:** `/staff/revenue` (Reconciliation Modal)
*   **Target Image:** `accountant_revenue (2).png`
*   **Live Audit Image:** `33-staff-revenue.png` (missing modal)
*   **Missing UI Elements:** Monthly ledger reconciliation grid overlay showing differences.
*   **Buttons to Add:** "Confirm Reconciliation", "Cancel".
*   **Input Fields/Filters:** Adjustment notes text area.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Submitting adjustment entries.
*   **Recommended Implementation Plan:** Add a reconciliation confirmation modal using standard portal layouts.
*   **Business-Flow Validation:** Reconciliations are simulated only.

#### 7. accountant_audit-logs.png
*   **Route:** `/staff/audit-logs` (or `/admin/audit-logs`)
*   **Target Image:** `accountant_audit-logs.png`
*   **Live Audit Image:** None (shared with admin route)
*   **Missing UI Elements:** Accountant event filters (e.g. Invoice mutations, pricing catalog updates).
*   **Buttons to Add:** "Export Financial Logs".
*   **Input Fields/Filters:** Audit event type filter, date picker.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click row to expand json block.
*   **Missing E2E Flows:** Auditing invoice modifications.
*   **Recommended Implementation Plan:** Mirror the admin logs table layout but restrict rows scope.
*   **Business-Flow Validation:** Uses `/api/v1/admin/audit-logs` data structures.

#### 8. accountant_support.png
*   **Route:** `/staff/support` (Accountant View)
*   **Target Image:** `accountant_support.png`
*   **Live Audit Image:** `35-staff-support.png`
*   **Missing UI Elements:** Financial support hotline blocks, ticketing log table.
*   **Buttons to Add:** "Open Ticket", "Submit Query".
*   **Input Fields/Filters:** Urgency level select dropdown, ticket categories search.
*   **Subpages/Nested Flows:** Support submission dialog.
*   **Expandable Behaviors:** FAQ accordions.
*   **Missing E2E Flows:** Accountant registers help request.
*   **Recommended Implementation Plan:** Refactor support page with clear card links and standard mock ticket forms.
*   **Business-Flow Validation:** Simulated client-side flow.

---

### Section B: Admin Operations Workspace

#### 9. admin_dashboard.png
*   **Route:** `/admin/dashboard`
*   **Target Image:** `admin_dashboard.png`
*   **Live Audit Image:** `55-admin-dashboard.png`
*   **Missing UI Elements:** Live clinical metrics grids (CPU, RAM, API response latency, slot utilization charts).
*   **Buttons to Add:** "Trigger System Health Audit", "Clear System Cache".
*   **Input Fields/Filters:** Period dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Incorporate real-time metric gauges using React layout variables.
*   **Business-Flow Validation:** Connects to `/api/v1/admin/stats` and Actuator.

#### 10. admin_appointments.png
*   **Route:** `/admin/appointments`
*   **Target Image:** `admin_appointments.png`
*   **Live Audit Image:** `56-admin-appointments.png`
*   **Missing UI Elements:** Detailed sorting by status column (Confirmed, Scheduled, In Progress, Checked In).
*   **Buttons to Add:** "Bulk Cancel", "Reallocate Specialists".
*   **Input Fields/Filters:** Doctor filter, department select, slot date range.
*   **Subpages/Nested Flows:** Appointment detail sidebar.
*   **Expandable Behaviors:** Click row to reveal patient profile.
*   **Missing E2E Flows:** Admin overrides slot reservation.
*   **Recommended Implementation Plan:** Enhance the tables with detailed filters and sorting hooks.
*   **Business-Flow Validation:** Maps to appointments endpoints.

#### 11. admin_users_v2.png
*   **Route:** `/admin/users`
*   **Target Image:** `admin_users_v2.png`
*   **Live Audit Image:** `63-admin-users.png`
*   **Missing UI Elements:** Add User side drawer and activate/deactivate action toggles.
*   **Buttons to Add:** "Add User", "Deactivate User", "Change Role".
*   **Input Fields/Filters:** Role filter, status filter, name search.
*   **Subpages/Nested Flows:** Links to user profile details page.
*   **Expandable Behaviors:** Click row action ellipsis menu to show dropdown actions.
*   **Missing E2E Flows:** Creating or editing staff members.
*   **Recommended Implementation Plan:** Replace basic table layout with the updated user directory view.
*   **Business-Flow Validation:** Maps to `/api/v1/admin/users`.

#### 12. admin_staff-patients.png
*   **Route:** `/admin/users/[id]` (Patient Details drawer)
*   **Target Image:** `admin_staff-patients.png`
*   **Live Audit Image:** `64-admin-users-1.png`
*   **Missing UI Elements:** Profile cards displaying active clinical roles, assigned clinic rooms, and status badges.
*   **Buttons to Add:** "Reset Password", "Update Permissions".
*   **Input Fields/Filters:** User fields form.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Tab switcher (Info, Roles, Activity logs).
*   **Missing E2E Flows:** Block parameter validation crash fixes.
*   **Recommended Implementation Plan:** Add slug/id validation rules and render a friendly RouteErrorState fallback on invalid ID parameter.
*   **Business-Flow Validation:** Uses `/api/v1/admin/users/{id}`.

#### 13. admin_departments.png
*   **Route:** `/admin/departments`
*   **Target Image:** `admin_departments.png`
*   **Live Audit Image:** `58-admin-departments.png`
*   **Missing UI Elements:** Physician allocation numbers, room capacities, and Lead Doctor assignments.
*   **Buttons to Add:** "Create Department", "Assign Doctor".
*   **Input Fields/Filters:** Search by name.
*   **Subpages/Nested Flows:** Add Department modal dialog.
*   **Expandable Behaviors:** Click department card to slide open doctor listings.
*   **Missing E2E Flows:** Updating department attributes.
*   **Recommended Implementation Plan:** Reformat department layouts into card collections.
*   **Business-Flow Validation:** Maps to departments endpoints.

#### 14. admin_inventory.png
*   **Route:** `/admin/inventory`
*   **Target Image:** `admin_inventory.png`
*   **Live Audit Image:** `65-admin-inventory.png`
*   **Missing UI Elements:** System stock alert summaries and bulk reconciliations.
*   **Buttons to Add:** "Export Catalog", "New Stock Shipment".
*   **Input Fields/Filters:** Stock levels filter dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click item to see movement logs.
*   **Missing E2E Flows:** Checking admin inventory.
*   **Recommended Implementation Plan:** Build expandable list containers.
*   **Business-Flow Validation:** Connects to inventory REST endpoints.

#### 15. admin_pricing.png
*   **Route:** `/admin/pricing`
*   **Target Image:** `admin_pricing.png`
*   **Live Audit Image:** `66-admin-pricing.png`
*   **Missing UI Elements:** Edit service price forms and active statuses toggle switch.
*   **Buttons to Add:** "Add Service Price Item", "Update Price".
*   **Input Fields/Filters:** Department category tabs, search input.
*   **Subpages/Nested Flows:** Edit price modal.
*   **Expandable Behaviors:** Price adjustment triggers.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Align spacing with accountant pricing catalog.
*   **Business-Flow Validation:** Uses pricing catalog APIs.

#### 16. admin_rooms.png
*   **Route:** `/admin/rooms`
*   **Target Image:** `admin_rooms.png`
*   **Live Audit Image:** `62-admin-rooms.png`
*   **Missing UI Elements:** Occupancy status cards (Vacant, Occupied, Out of Service) and Room Type badges.
*   **Buttons to Add:** "Add Room", "Change Room Status".
*   **Input Fields/Filters:** Floor level dropdown filter, room category switcher.
*   **Subpages/Nested Flows:** Room detail card.
*   **Expandable Behaviors:** Click card to view list of allocated doctors.
*   **Missing E2E Flows:** Booking rooms.
*   **Recommended Implementation Plan:** Format the list into grid cells mimicking the screenshot.
*   **Business-Flow Validation:** Maps to `/api/v1/admin/rooms`.

#### 17. admin_rooms (2).png
*   **Route:** `/admin/rooms` (Occupancy Grid Modal)
*   **Target Image:** `admin_rooms (2).png`
*   **Live Audit Image:** `62-admin-rooms.png` (missing detail modal)
*   **Missing UI Elements:** Detailed occupancy lists grid and room allocation overlay panel.
*   **Buttons to Add:** "Save Changes", "Cancel".
*   **Input Fields/Filters:** Select attending physician dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Updating room parameters.
*   **Recommended Implementation Plan:** Add the allocation modal to card grids.
*   **Business-Flow Validation:** Uses `/api/v1/admin/rooms` updates.

#### 18. admin_schedule-templates.png
*   **Route:** `/admin/schedule-templates`
*   **Target Image:** `admin_schedule-templates.png`
*   **Live Audit Image:** `67-admin-schedule-templates.png`
*   **Missing UI Elements:** Weekly template scheduler table and template lists.
*   **Buttons to Add:** "Create Template", "Apply Template to Doctor".
*   **Input Fields/Filters:** Weekday checkboxes, slot duration dropdown.
*   **Subpages/Nested Flows:** Add template form.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Defining default slot generation guidelines.
*   **Recommended Implementation Plan:** Integrate week templates selectors.
*   **Business-Flow Validation:** Maps to templates APIs.

#### 19. admin_schedule-templates (2).png
*   **Route:** `/admin/schedule-templates` (Matrix Modal)
*   **Target Image:** `admin_schedule-templates (2).png`
*   **Live Audit Image:** `67-admin-schedule-templates.png` (missing modal)
*   **Missing UI Elements:** Hour-by-hour slot matrix table and doctor assignment card list.
*   **Buttons to Add:** "Save Grid Configuration", "Cancel".
*   **Input Fields/Filters:** Start/End time selectors.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Configuring week time blocks.
*   **Recommended Implementation Plan:** Design hour grids component.
*   **Business-Flow Validation:** Simulated matrix configuration.

#### 20. admin_slots.png
*   **Route:** `/admin/slots`
*   **Target Image:** `admin_slots.png`
*   **Live Audit Image:** `68-admin-slots.png`
*   **Missing UI Elements:** Bulk slot generator progress indicators and conflict detection warnings.
*   **Buttons to Add:** "Bulk Generate Slots", "Block Selected Slots".
*   **Input Fields/Filters:** Start/End date, physician, slot duration.
*   **Subpages/Nested Flows:** Generator settings forms.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Generating new appointment slots.
*   **Recommended Implementation Plan:** Build parameter input panels and wire check-overlaps.
*   **Business-Flow Validation:** Connects to `/api/v1/admin/slots/generate`.

#### 21. admin_special-closures.png
*   **Route:** `/admin/special-closures`
*   **Target Image:** `admin_special-closures.png`
*   **Live Audit Image:** `69-admin-special-closures.png`
*   **Missing UI Elements:** Calendar layouts representing closures and list tables.
*   **Buttons to Add:** "Add Special Closure", "Cancel Scheduled Closure".
*   **Input Fields/Filters:** Date range calendar, description.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Hover closures to reveal description tooltip.
*   **Missing E2E Flows:** Declaring holidays.
*   **Recommended Implementation Plan:** Build clean tables and calendar components.
*   **Business-Flow Validation:** Maps to closures APIs.

#### 22. admin_closures.png
*   **Route:** `/admin/closures`
*   **Target Image:** `admin_closures.png`
*   **Live Audit Image:** `14-staff-closures.png`
*   **Missing UI Elements:** Color-coded department calendars and active closure list blocks.
*   **Buttons to Add:** "Create Closure Event".
*   **Input Fields/Filters:** Search department.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Accordions.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Integrate department closures.
*   **Business-Flow Validation:** Maps to `/api/v1/admin/special-closures`.

#### 23. admin_audit-logs.png
*   **Route:** `/admin/audit-logs`
*   **Target Image:** `admin_audit-logs.png`
*   **Live Audit Image:** `57-admin-audit-logs.png`
*   **Missing UI Elements:** Raw json viewer block.
*   **Buttons to Add:** "Export Logs (CSV)", "Clear Filter Options".
*   **Input Fields/Filters:** Search input, date selector, category dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click row to reveal details drawer.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Standardize table.
*   **Business-Flow Validation:** Read-only audit logs.

#### 24. admin_audit-logs (2).png
*   **Route:** `/admin/audit-logs` (Filters Panel Expanded)
*   **Target Image:** `admin_audit-logs (2).png`
*   **Live Audit Image:** `57-admin-audit-logs.png` (filters collapsed)
*   **Missing UI Elements:** Detailed search tags and expanded multiselect role checkboxes.
*   **Buttons to Add:** "Apply Filters", "Save Preset".
*   **Input Fields/Filters:** Actor name search, action categories checkboxes.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Toggle buttons.
*   **Missing E2E Flows:** Advanced logs filtering.
*   **Recommended Implementation Plan:** Build out drawer/accordion filters block.
*   **Business-Flow Validation:** Restrict inputs scope.

#### 25. admin_audit-logs-2.png
*   **Route:** `/admin/audit-logs` (Detail Inspect Panel)
*   **Target Image:** `admin_audit-logs-2.png`
*   **Live Audit Image:** `57-admin-audit-logs.png` (missing inspect drawer)
*   **Missing UI Elements:** JSON inspector detail modal.
*   **Buttons to Add:** "Copy JSON", "Close Details".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Modal triggers.
*   **Missing E2E Flows:** Inspecting transaction payload logs.
*   **Recommended Implementation Plan:** Add overlay portal popup.
*   **Business-Flow Validation:** JSON formats align with logger database.

#### 26. admin_staff-booking_v2.png
*   **Route:** `/admin/appointments` (Booking verification overlay)
*   **Target Image:** `admin_staff-booking_v2.png`
*   **Live Audit Image:** `56-admin-appointments.png` (missing overlay modal)
*   **Missing UI Elements:** Overlay booking check sheet showing conflicts.
*   **Buttons to Add:** "Confirm Force Booking", "Cancel Booking".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Booking confirmation under overrides.
*   **Recommended Implementation Plan:** Implement confirm overlay card.
*   **Business-Flow Validation:** Uses appointment force flags.

#### 27. admin_monitoring.png
*   **Route:** `/admin/monitoring`
*   **Target Image:** `admin_monitoring.png`
*   **Live Audit Image:** `59-admin-monitoring.png`
*   **Missing UI Elements:** System performance charts, RAM/CPU indicators.
*   **Buttons to Add:** "Clear System Cache".
*   **Input Fields/Filters:** Service selectors.
*   **Subpages/Nested Flows:** Details log.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Visual components.
*   **Business-Flow Validation:** Uses backend system health logs.

#### 28. admin_news.png
*   **Route:** `/admin/news`
*   **Target Image:** `admin_news.png`
*   **Live Audit Image:** `60-admin-news.png`
*   **Missing UI Elements:** Rich text editor, article list summaries.
*   **Buttons to Add:** "Publish Article", "Save Draft".
*   **Input Fields/Filters:** Headline, author, content blocks.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Managing news articles.
*   **Recommended Implementation Plan:** Standard form components.
*   **Business-Flow Validation:** Connects to public content.

#### 29. admin_public_content.png
*   **Route:** `/admin/public-content`
*   **Target Image:** `admin_public_content.png`
*   **Live Audit Image:** `61-admin-public-content.png`
*   **Missing UI Elements:** Layout page structure modifiers.
*   **Buttons to Add:** "Save Configurations".
*   **Input Fields/Filters:** Content boxes.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Updating static assets.
*   **Recommended Implementation Plan:** Dashboard editors.
*   **Business-Flow Validation:** Maps to home configs.

#### 30. admin_support.png
*   **Route:** `/admin/support`
*   **Target Image:** `admin_support.png`
*   **Live Audit Image:** `70-admin-support.png` (renders Queue Board layout)
*   **Missing UI Elements:** P2 Blocker: Renders duplicate Queue Board. Needs complete helpdesk log view table, status checkboxes, and urgency indicators.
*   **Buttons to Add:** "Submit Support Ticket", "Assign Ticket to Agent".
*   **Input Fields/Filters:** Urgency level dropdown, search bar.
*   **Subpages/Nested Flows:** Ticket details drawer.
*   **Expandable Behaviors:** Click row to reveal details drawer.
*   **Missing E2E Flows:** Ticket status updates.
*   **Recommended Implementation Plan:** Redefine the route to load helpdesk tables rather than queue boards.
*   **Business-Flow Validation:** Simulated helpdesk flow.

---

### Section C: Doctor Clinical Workspace

#### 31. doctor_dashboard.png
*   **Route:** `/staff/dashboard` (Doctor view)
*   **Target Image:** `doctor_dashboard.png`
*   **Live Audit Image:** `30-staff-doctor-dashboard.png`
*   **Missing UI Elements:** Clinical KPIs (Active Consultation, Followups Today, Unsigned Prescriptions) and today's consultation patient list table.
*   **Buttons to Add:** "Start Consultation", "View Vitals".
*   **Input Fields/Filters:** Search by name, status tabs (Waiting, In Room, Completed).
*   **Subpages/Nested Flows:** Links to `/staff/medical-records/[id]/edit`.
*   **Expandable Behaviors:** Row click slides out timeline.
*   **Missing E2E Flows:** Starting patient consultation.
*   **Recommended Implementation Plan:** Add doctor overview cards.
*   **Business-Flow Validation:** Uses appointment status API.

#### 32. doctor_dashboard (2).png
*   **Route:** `/staff/dashboard` (Active Consultation Tab)
*   **Target Image:** `doctor_dashboard (2).png`
*   **Live Audit Image:** `30-staff-doctor-dashboard.png` (missing active panel)
*   **Missing UI Elements:** Inline medical notes writing card, ICD-10 search tool, and prescription line items entry grid.
*   **Buttons to Add:** "Add Drug Item", "Finalize & Sign".
*   **Input Fields/Filters:** Diagnosis search, notes text area.
*   **Subpages/Nested Flows:** Link to prescription preview.
*   **Expandable Behaviors:** ICD-10 code list matching search suggestions.
*   **Missing E2E Flows:** Completing visit records.
*   **Recommended Implementation Plan:** Add active consultation panel component.
*   **Business-Flow Validation:** Connects to medical records endpoints.

#### 33. doctor_dashboard (3).png
*   **Route:** `/staff/dashboard` (Patient History Sub-Tab)
*   **Target Image:** `doctor_dashboard (3).png`
*   **Live Audit Image:** `30-staff-doctor-dashboard.png` (missing tab)
*   **Missing UI Elements:** Patient historical treatment timeline nodes list showing past diagnostics and prescription history.
*   **Buttons to Add:** "Open Past Record", "Copy Notes".
*   **Input Fields/Filters:** Search past records list.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click node to expand treatment details block.
*   **Missing E2E Flows:** Reviewing patient history.
*   **Recommended Implementation Plan:** Timeline list component.
*   **Business-Flow Validation:** Maps to `/patients/{cccd}/history`.

#### 34. doctor_dashboard (4).png
*   **Route:** `/staff/dashboard` (Follow-up scheduler)
*   **Target Image:** `doctor_dashboard (4).png`
*   **Live Audit Image:** `30-staff-doctor-dashboard.png` (missing scheduler)
*   **Missing UI Elements:** Follow-up appointment scheduling form.
*   **Buttons to Add:** "Schedule Follow-up".
*   **Input Fields/Filters:** Date picker, notes input.
*   **Subpages/Nested Flows:** Success validation popup.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Creating follow-ups.
*   **Recommended Implementation Plan:** Add date pickers and slot checkers.
*   **Business-Flow Validation:** Maps to follow-up endpoint.

#### 35. doctor_dashboard-2.png
*   **Route:** `/staff/doctor/dashboard` (Alternative overview layout)
*   **Target Image:** `doctor_dashboard-2.png`
*   **Live Audit Image:** `30-staff-doctor-dashboard.png`
*   **Missing UI Elements:** Consolidated layout option with doctor schedule and patient counts list.
*   **Buttons to Add:** None.
*   **Input Fields/Filters:** Week view switcher.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** View schedule from dashboard.
*   **Recommended Implementation Plan:** Optional layout variation panel.
*   **Business-Flow Validation:** Integrates with schedule.

#### 36. doctor_lab-results.png
*   **Route:** `/staff/lab-results` & `/staff/lab-results/[id]`
*   **Target Image:** `doctor_lab-results.png`
*   **Live Audit Image:** `25-staff-lab-results.png`, `26-staff-lab-results-1.png`
*   **Missing UI Elements:** Low/High flag markers for lab results detail metrics.
*   **Buttons to Add:** "Enter Lab Findings", "Print Lab Report".
*   **Input Fields/Filters:** Test Category tabs.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click to reveal input numbers form.
*   **Missing E2E Flows:** P1 Blocker: Parameter crash on `/staff/lab-results/1` must be intercepted.
*   **Recommended Implementation Plan:** Integrate dynamic forms and validate UUID path queries.
*   **Business-Flow Validation:** Maps to lab-results.

#### 37. doctor_prescriptions-preview.png
*   **Route:** `/staff/prescriptions/preview` (or record draft PDF)
*   **Target Image:** `doctor_prescriptions-preview.png`
*   **Live Audit Image:** `31-staff-prescriptions-preview.png`
*   **Missing UI Elements:** Complete PDF preview iframe layout showing generated document correctly.
*   **Buttons to Add:** "Download PDF", "Send to Pharmacy Hub".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Displaying the Spring Boot prescription PDF blob.
*   **Recommended Implementation Plan:** Fetch prescription PDF blob from endpoint.
*   **Business-Flow Validation:** Connects to PDF generation APIs.

#### 38. doctor_schedule.png
*   **Route:** `/staff/schedule`
*   **Target Image:** `doctor_schedule.png`
*   **Live Audit Image:** `17-staff-schedule.png`
*   **Missing UI Elements:** Day/Week calendar view switcher and occupied slot blocks indicators.
*   **Buttons to Add:** "Request Schedule Blockout".
*   **Input Fields/Filters:** Month selector dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click block to show tooltip.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Calendar view grid components.
*   **Business-Flow Validation:** Connects to doctor schedule API.

#### 39. doctor_support.png
*   **Route:** `/staff/support` (Doctor View)
*   **Target Image:** `doctor_support.png`
*   **Live Audit Image:** `35-staff-support.png`
*   **Missing UI Elements:** Support desk ticketing links.
*   **Buttons to Add:** "Create Ticket".
*   **Input Fields/Filters:** Support categories search.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** FAQ list.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Update layout spacing.
*   **Business-Flow Validation:** Simulated support ticket flow.

#### 40. doctor_vital-signs.png
*   **Route:** `/staff/vital-signs` (Doctor View)
*   **Target Image:** `doctor_vital-signs.png`
*   **Live Audit Image:** `36-staff-vital-signs.png`
*   **Missing UI Elements:** Visual range limits flags for vital values (e.g. red for BP >140).
*   **Buttons to Add:** "Submit to Medical Record".
*   **Input Fields/Filters:** Numeric inputs fields.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Warning overlays.
*   **Missing E2E Flows:** Updating vitals.
*   **Recommended Implementation Plan:** Implement range alarms logic.
*   **Business-Flow Validation:** Maps to vital-signs.

---

### Section D: Nurse & Receptionist Workspaces

#### 41. nurse_dashboard.png
*   **Route:** `/staff/dashboard` (Nurse View)
*   **Target Image:** `nurse_dashboard.png`
*   **Live Audit Image:** None (renders Doctor Dashboard)
*   **Missing UI Elements:** Nurse intake summary, checked in wait-list queue, and triage KPI cards.
*   **Buttons to Add:** "Go to Queue Board", "Record Vital Signs".
*   **Input Fields/Filters:** Search by CCCD.
*   **Subpages/Nested Flows:** Links to `/staff/vital-signs`.
*   **Expandable Behaviors:** Click list row to see triage check sheet.
*   **Missing E2E Flows:** Intake workflow routing.
*   **Recommended Implementation Plan:** Design conditional Nurse dashboard.
*   **Business-Flow Validation:** Uses wait times statistics.

#### 42. nurse_dashboard (2).png
*   **Route:** `/staff/dashboard` (Nurse triage view)
*   **Target Image:** `nurse_dashboard (2).png`
*   **Live Audit Image:** None
*   **Missing UI Elements:** Wait-time alerts, room allocation widgets, and vitals checklist indicators.
*   **Buttons to Add:** "Start Intake".
*   **Input Fields/Filters:** Queue search.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Hover status to see SLA details.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Queue lists panel.
*   **Business-Flow Validation:** Integrates with check-in.

#### 43. nurse_intake.png
*   **Route:** `/staff/nurse-intake`
*   **Target Image:** `nurse_intake.png`
*   **Live Audit Image:** `28-staff-nurse-intake.png`
*   **Missing UI Elements:** Patient queue records layout with visual status progress trackers.
*   **Buttons to Add:** "Begin Vitals Intake", "Print Wristband".
*   **Input Fields/Filters:** Active search by CCCD.
*   **Subpages/Nested Flows:** Direct links to `/staff/vital-signs`.
*   **Expandable Behaviors:** Click row to reveal previous intake details.
*   **Missing E2E Flows:** Checking in patients.
*   **Recommended Implementation Plan:** Dense intake queue table.
*   **Business-Flow Validation:** Supported by appointments check-in API.

#### 44. nurse_vital_signs.png
*   **Route:** `/staff/vital-signs` (Nurse view)
*   **Target Image:** `nurse_vital_signs.png`
*   **Live Audit Image:** `36-staff-vital-signs.png`
*   **Missing UI Elements:** Intake metrics checklist card, warning range color bands.
*   **Buttons to Add:** "Clear Input", "Submit to Medical Record".
*   **Input Fields/Filters:** Patient Selector (if accessed independently), Heart Rate, Blood Pressure (Systolic/Diastolic), Temperature, SpO2, Weight.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Range tooltips.
*   **Missing E2E Flows:** Recording vitals for checked-in patient.
*   **Recommended Implementation Plan:** Integrate range highlight styles.
*   **Business-Flow Validation:** Maps to vital-signs.

#### 45. nurse_patient_records.png
*   **Route:** `/staff/patients`
*   **Target Image:** `nurse_patient_records.png`
*   **Live Audit Image:** `15-staff-patients.png`
*   **Missing UI Elements:** Advanced filtering parameters, record exporting buttons.
*   **Buttons to Add:** "Advanced Filter", "Export CSV".
*   **Input Fields/Filters:** CCCD search, Date range slider, status select.
*   **Subpages/Nested Flows:** History timeline route.
*   **Expandable Behaviors:** Click row to open timeline overview drawer.
*   **Missing E2E Flows:** Reviewing patient file history.
*   **Recommended Implementation Plan:** Create slide-out drawer panel.
*   **Business-Flow Validation:** Maps to `/api/v1/patient-records`.

#### 46. nurse_queue.png
*   **Route:** `/staff/queue`
*   **Target Image:** `nurse_queue.png`
*   **Live Audit Image:** `16-staff-queue.png`
*   **Missing UI Elements:** wait time warnings (orange/red text) and physician room allocation sidebar layout.
*   **Buttons to Add:** "Call Next Patient" action.
*   **Input Fields/Filters:** Check-in status tabs.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click status to view times logs.
*   **Missing E2E Flows:** Room allocation updates.
*   **Recommended Implementation Plan:** Build Room allocation selector modal.
*   **Business-Flow Validation:** Supported by `/api/v1/queue/{id}/assign-room`.

#### 47. nurse_lab-results.png
*   **Route:** `/staff/lab-results`
*   **Target Image:** `nurse_lab-results.png`
*   **Live Audit Image:** `25-staff-lab-results.png`
*   **Missing UI Elements:** Test category search, pending orders list table.
*   **Buttons to Add:** "Print Laboratory List".
*   **Input Fields/Filters:** Category dropdown filter, status selects.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click row.
*   **Missing E2E Flows:** Searching lab tasks.
*   **Recommended Implementation Plan:** Design dense operational tables.
*   **Business-Flow Validation:** Maps to lab-results.

#### 48. nurse_booking.png
*   **Route:** `/staff/booking` (CCCD Check step)
*   **Target Image:** `nurse_booking.png`
*   **Live Audit Image:** `18-staff-booking.png`
*   **Missing UI Elements:** Step sequence indicators breadcrumb header and patient verification results panel.
*   **Buttons to Add:** "Verify CCCD", "Next Step".
*   **Input Fields/Filters:** CCCD field, Phone input.
*   **Subpages/Nested Flows:** Multi-step wizard wrapper.
*   **Expandable Behaviors:** Suggestion list.
*   **Missing E2E Flows:** Verifying existing patient card.
*   **Recommended Implementation Plan:** Add wizard controller.
*   **Business-Flow Validation:** Connects to check-in validator.

#### 49. nurse_booking (2).png
*   **Route:** `/staff/booking/symptoms` (Symptoms step)
*   **Target Image:** `nurse_booking (2).png`
*   **Live Audit Image:** `22-staff-booking-symptoms.png`
*   **Missing UI Elements:** Interactive check sheets for selecting symptoms.
*   **Buttons to Add:** "Next Step", "Back".
*   **Input Fields/Filters:** Symptoms text area.
*   **Subpages/Nested Flows:** Wizard navigation.
*   **Expandable Behaviors:** Suggested categories tags.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Form state preservation.
*   **Business-Flow Validation:** Maps to appointment intake.

#### 50. nurse_support.png
*   **Route:** `/staff/support` (Nurse View)
*   **Target Image:** `nurse_support.png`
*   **Live Audit Image:** `35-staff-support.png`
*   **Missing UI Elements:** Nurse helpdesk hotlines cards.
*   **Buttons to Add:** "Register Issue".
*   **Input Fields/Filters:** Search queries.
*   **Subpages/Nested Flows:** Support forms.
*   **Expandable Behaviors:** FAQ toggles.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Format cards.
*   **Business-Flow Validation:** Simulated helpdesk.

#### 51. receptionist_dashboard.png
*   **Route:** `/staff/dashboard` (Receptionist role)
*   **Target Image:** `receptionist_dashboard.png`
*   **Live Audit Image:** None (renders Doctor Dashboard)
*   **Missing UI Elements:** Checked In, Waiting, and No Show KPI counters, and scheduling overview slots table.
*   **Buttons to Add:** "Launch Booking Wizard".
*   **Input Fields/Filters:** Department dropdown filter, slot search.
*   **Subpages/Nested Flows:** Booking wizard routes.
*   **Expandable Behaviors:** Click row.
*   **Missing E2E Flows:** Creating slots.
*   **Recommended Implementation Plan:** Implement receptionist dashboard.
*   **Business-Flow Validation:** Maps to scheduling stats.

#### 52. receptionist_booking.png
*   **Route:** `/staff/booking` (Wizard launch step)
*   **Target Image:** `receptionist_booking.png`
*   **Live Audit Image:** `18-staff-booking.png`
*   **Missing UI Elements:** Alignment with receptionist layouts.
*   **Buttons to Add:** "Verify CCCD".
*   **Input Fields/Filters:** CCCD input.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Standardize layouts.
*   **Business-Flow Validation:** Uses CCCD validation.

#### 53. receptionist_queue.png
*   **Route:** `/staff/queue` (Receptionist view)
*   **Target Image:** `receptionist_queue.png`
*   **Live Audit Image:** `16-staff-queue.png`
*   **Missing UI Elements:** Check-in status indicators.
*   **Buttons to Add:** "Call Next Patient", "Assign Room".
*   **Input Fields/Filters:** Check-in times filter dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Hover cards.
*   **Missing E2E Flows:** Checking in patients.
*   **Recommended Implementation Plan:** Dense queue table.
*   **Business-Flow Validation:** Maps to queue status.

#### 54. receptionist_queue (2).png
*   **Route:** `/staff/queue` (Check-in details Modal)
*   **Target Image:** `receptionist_queue (2).png`
*   **Live Audit Image:** `16-staff-queue.png` (missing modal)
*   **Missing UI Elements:** Patient Check-in validation modal showing CCCD details and room selections.
*   **Buttons to Add:** "Confirm Check-in", "Cancel".
*   **Input Fields/Filters:** Attending room selection dropdown, physician selector.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Modal popup.
*   **Missing E2E Flows:** Completing check-in transition.
*   **Recommended Implementation Plan:** Embed check-in verification modal.
*   **Business-Flow Validation:** Invokes `/api/v1/appointments/{id}/checkin`.

#### 55. receptionist_support.png
*   **Route:** `/staff/support` (Receptionist View)
*   **Target Image:** `receptionist_support.png`
*   **Live Audit Image:** `35-staff-support.png`
*   **Missing UI Elements:** Receptionist helpline blocks.
*   **Buttons to Add:** "Submit Query".
*   **Input Fields/Filters:** Search bar.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Accordions.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Format cards.
*   **Business-Flow Validation:** Simulated helpdesk.

---

### Section E: Pharmacist Workspace (Inventory)

#### 56. pharmacist_inventory.png
*   **Route:** `/staff/inventory`
*   **Target Image:** `pharmacist_inventory.png`
*   **Live Audit Image:** `23-staff-inventory.png`
*   **Missing UI Elements:** Expiration alarms lists panel, low-stock visual warning tags, and inventory logs.
*   **Buttons to Add:** "New Inventory Movement", "Record Stock Adjustment".
*   **Input Fields/Filters:** Drug search box, category dropdown.
*   **Subpages/Nested Flows:** Expiration drawer.
*   **Expandable Behaviors:** Click row to reveal lot history.
*   **Missing E2E Flows:** Reconciling inventory balances.
*   **Recommended Implementation Plan:** Add low-stock badges.
*   **Business-Flow Validation:** Supported by `/api/v1/inventory/items`.

---

### Section F: Guest Discovery & Booking (Public Pages)

#### 57. public_home.png
*   **Route:** `/`
*   **Target Image:** `public_home.png`
*   **Live Audit Image:** `01-public-home.png`
*   **Missing UI Elements:** Detailed spacing and polished typography layout, deterministic chatbot float animation.
*   **Buttons to Add:** Chatbot trigger button floating at bottom-right.
*   **Input Fields/Filters:** Chatbot dialog input.
*   **Subpages/Nested Flows:** Deterministic chatbot dialog float.
*   **Expandable Behaviors:** Clicking chatbot icon toggles panel.
*   **Missing E2E Flows:** Selecting suggestions in bot.
*   **Recommended Implementation Plan:** Spacing updates and slide out chat dialog.
*   **Business-Flow Validation:** Connects to chatbot API.

#### 58. public_departments.png
*   **Route:** `/departments`
*   **Target Image:** `public_departments.png`
*   **Live Audit Image:** `02-departments.png`
*   **Missing UI Elements:** Icons and stats cards on department cells.
*   **Buttons to Add:** "View Details".
*   **Input Fields/Filters:** Category filter buttons.
*   **Subpages/Nested Flows:** Links to `/departments/[id]`.
*   **Expandable Behaviors:** Hover cards.
*   **Missing E2E Flows:** Redirecting to detail pages.
*   **Recommended Implementation Plan:** Render icon grid cards.
*   **Business-Flow Validation:** Maps to `/api/v1/departments`.

#### 59. public_doctors.png
*   **Route:** `/doctors`
*   **Target Image:** `public_doctors.png`
*   **Live Audit Image:** `04-doctors.png`
*   **Missing UI Elements:** Availability indicators on doctor cells and pagination controls.
*   **Buttons to Add:** "Schedule Appointment".
*   **Input Fields/Filters:** Department dropdown, name search box.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Booking flow.
*   **Recommended Implementation Plan:** Integrate filters state.
*   **Business-Flow Validation:** Connects to doctors list.

#### 60. public_news.png
*   **Route:** `/news`
*   **Target Image:** `public_news.png`
*   **Live Audit Image:** `05-news.png`
*   **Missing UI Elements:** Asymmetric columns layout.
*   **Buttons to Add:** "Read Article".
*   **Input Fields/Filters:** Search by keyword.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Zoom effects.
*   **Missing E2E Flows:** Selecting articles.
*   **Recommended Implementation Plan:** Format CSS grids.
*   **Business-Flow Validation:** Maps to news REST API.

#### 61. public_booking.png
*   **Route:** `/booking`
*   **Target Image:** `public_booking.png`
*   **Live Audit Image:** `06-booking.png`
*   **Missing UI Elements:** Step sequence chevron indicator and slot scheduling layouts.
*   **Buttons to Add:** "Next Step", "Confirm Booking".
*   **Input Fields/Filters:** Doctor, department dropdowns, slot date picker.
*   **Subpages/Nested Flows:** Wizard sequence components.
*   **Expandable Behaviors:** Slot button select state.
*   **Missing E2E Flows:** Booking an appointment.
*   **Recommended Implementation Plan:** Standardize wizard panels.
*   **Business-Flow Validation:** Supported by appointments POST.

#### 62. public_privacy.png
*   **Route:** `/privacy`
*   **Target Image:** `public_privacy.png`
*   **Live Audit Image:** `07-privacy.png`
*   **Missing UI Elements:** Detailed legal section lists.
*   **Buttons to Add:** Print/PDF mock links.
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** Links to sections.
*   **Expandable Behaviors:** Accordions.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Expand static content blocks.
*   **Business-Flow Validation:** Static content.

#### 63. public_terms.png
*   **Route:** `/terms`
*   **Target Image:** `public_terms.png`
*   **Live Audit Image:** `08-terms.png`
*   **Missing UI Elements:** Standard disclosures blocks.
*   **Buttons to Add:** Back to Home.
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** Link to details.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Scrolling to anchors.
*   **Recommended Implementation Plan:** Expand policy text.
*   **Business-Flow Validation:** Static content.

#### 64. public_terms (2).png
*   **Route:** `/terms` (Additional terms sections)
*   **Target Image:** `public_terms (2).png`
*   **Live Audit Image:** `08-terms.png` (missing sections)
*   **Missing UI Elements:** Details disclosures text block.
*   **Buttons to Add:** Print/PDF.
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Accordions.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Format layouts.
*   **Business-Flow Validation:** Static content.

#### 65. public_security.png
*   **Route:** `/security`
*   **Target Image:** `public_security.png`
*   **Live Audit Image:** `09-security.png`
*   **Missing UI Elements:** Detailed list of controls.
*   **Buttons to Add:** "Report Vulnerability".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** Support forms.
*   **Expandable Behaviors:** Tooltips.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Structure sections.
*   **Business-Flow Validation:** Static content.

#### 66. public_session-expired.png
*   **Route:** `/session-expired`
*   **Target Image:** `public_session-expired.png`
*   **Live Audit Image:** `10-session-expired.png`
*   **Missing UI Elements:** Clinical styled alert panel cards.
*   **Buttons to Add:** "Re-authenticate Staff", "Re-authenticate Patient".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** Links to logins.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Redirecting.
*   **Recommended Implementation Plan:** Format layouts.
*   **Business-Flow Validation:** Simulated session states.

#### 67. public_forbidden.png
*   **Route:** `/forbidden`
*   **Target Image:** `public_forbidden.png`
*   **Live Audit Image:** `11-forbidden.png`
*   **Missing UI Elements:** Clinical themed alert backgrounds.
*   **Buttons to Add:** "Back to Dashboard", "Contact Administrator".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** Support form.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Standard error layouts.
*   **Business-Flow Validation:** Static content.

#### 68. staff_login.png
*   **Route:** `/staff/login`
*   **Target Image:** `staff_login.png`
*   **Live Audit Image:** `12-staff-login.png`
*   **Missing UI Elements:** Two-column grid illustrations.
*   **Buttons to Add:** Help links.
*   **Input Fields/Filters:** Username, password fields.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Authentication sequence.
*   **Recommended Implementation Plan:** Add login columns.
*   **Business-Flow Validation:** Connects to login API.

---

### Section G: Patient Portal Workspace (Patient Facing)

#### 69. portal-login.png
*   **Route:** `/portal/login`
*   **Target Image:** `portal-login.png`
*   **Live Audit Image:** `37-portal-login.png`
*   **Missing UI Elements:** Info blocks and access code claim instructions.
*   **Buttons to Add:** "Claim Access Code", "Portal Guide".
*   **Input Fields/Filters:** Username/CCCD, password.
*   **Subpages/Nested Flows:** Link to `/portal/claim`.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Login sequence.
*   **Recommended Implementation Plan:** Format portal login layout.
*   **Business-Flow Validation:** Maps to portal login API.

#### 70. patient_overview.png
*   **Route:** `/portal/overview`
*   **Target Image:** `patient_overview.png`
*   **Live Audit Image:** `38-portal-overview.png`
*   **Missing UI Elements:** Quick links blocks (Book Specialist, View Lab Report, Refill Medication) and visual timeline of clinic visits.
*   **Buttons to Add:** "Book New Appointment", "Access Lab Reports".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** Timeline links.
*   **Expandable Behaviors:** None.
*   **Missing E2E Flows:** Dashboard landing.
*   **Recommended Implementation Plan:** Render cards grid.
*   **Business-Flow Validation:** Maps to portal overview data.

#### 71. patient_appointments.png
*   **Route:** `/portal/appointments` & `/portal/appointments/2`
*   **Target Image:** `patient_appointments.png`
*   **Live Audit Image:** `40-portal-appointments.png`, `41-portal-appointments-2.png`
*   **Missing UI Elements:** Tele-health mock cards, map instructions blocks.
*   **Buttons to Add:** "Request Reschedule" (disabled), "Cancel Appointment".
*   **Input Fields/Filters:** Past/Upcoming appointments toggle.
*   **Subpages/Nested Flows:** Details modal.
*   **Expandable Behaviors:** Expand card to see instructions details.
*   **Missing E2E Flows:** Rescheduling/Cancellation validation.
*   **Recommended Implementation Plan:** Add appointment list card items.
*   **Business-Flow Validation:** Rescheduling must show reception helpline overlay rather than calling mutations API (portal limit).

#### 72. patient_lab-results.png
*   **Route:** `/portal/lab-results`
*   **Target Image:** `patient_lab-results.png`
*   **Live Audit Image:** `42-portal-lab-results.png`
*   **Missing UI Elements:** Normal/high status tags and reference ranges guide blocks.
*   **Buttons to Add:** "Download Lab Report PDF".
*   **Input Fields/Filters:** Date filters.
*   **Subpages/Nested Flows:** Results drawer.
*   **Expandable Behaviors:** Click row.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Standardize tables.
*   **Business-Flow Validation:** Maps to portal lab-results.

#### 73. patient_lab-results (2).png
*   **Route:** `/portal/lab-results` (Trend Chart Modal)
*   **Target Image:** `patient_lab-results (2).png`
*   **Live Audit Image:** `42-portal-lab-results.png` (missing trend comparison modal)
*   **Missing UI Elements:** Comparison trend graph modal showing historical laboratory measurements.
*   **Buttons to Add:** "Close Trend", "Export Chart".
*   **Input Fields/Filters:** Metric parameter select dropdown.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Modal popups.
*   **Missing E2E Flows:** Comparing diagnostic data trends.
*   **Recommended Implementation Plan:** Build visual canvas charts modal.
*   **Business-Flow Validation:** Pulls lab-results history data.

#### 74. patient_messages.png
*   **Route:** `/portal/messages`
*   **Target Image:** `patient_messages.png`
*   **Live Audit Image:** `43-portal-messages.png`
*   **Missing UI Elements:** Interactive bubble list layout.
*   **Buttons to Add:** "Send Reply" (disabled).
*   **Input Fields/Filters:** Message body input.
*   **Subpages/Nested Flows:** Conversation threads links.
*   **Expandable Behaviors:** Click conversation to load thread.
*   **Missing E2E Flows:** Thread loading.
*   **Recommended Implementation Plan:** Render chat layout with disabled reply input panel displaying support desk number.
*   **Business-Flow Validation:** Messaging is read-only in patient portal.

#### 75. patient_profile.png
*   **Route:** `/portal/profile`
*   **Target Image:** `patient_profile.png`
*   **Live Audit Image:** `44-portal-profile.png`
*   **Missing UI Elements:** Emergency contacts fields.
*   **Buttons to Add:** "Edit Profile Details", "Save Changes".
*   **Input Fields/Filters:** Personal details fields form.
*   **Subpages/Nested Flows:** Settings subpages.
*   **Expandable Behaviors:** Edit/Save state selectors.
*   **Missing E2E Flows:** Profiling updates.
*   **Recommended Implementation Plan:** Responsive forms.
*   **Business-Flow Validation:** Maps to profile updates.

#### 76. patient_billing.png
*   **Route:** `/portal/billing`
*   **Target Image:** `patient_billing.png`
*   **Live Audit Image:** `46-portal-billing.png`
*   **Missing UI Elements:** Pay gateway integrations and invoices timelines.
*   **Buttons to Add:** "Mock Pay Now", "Download PDF Invoice".
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Click invoice to expand fee details.
*   **Missing E2E Flows:** Simulating invoice payment.
*   **Recommended Implementation Plan:** Standardize billing cards grid.
*   **Business-Flow Validation:** Billing updates.

#### 77. patient_pharmacy.png
*   **Route:** `/portal/pharmacy`
*   **Target Image:** `patient_pharmacy.png`
*   **Live Audit Image:** `50-portal-pharmacy.png`
*   **Missing UI Elements:** Prescription lists grids showing refill status progress bar.
*   **Buttons to Add:** "Request Refill" (mock overlay).
*   **Input Fields/Filters:** Active/expired filters toggle.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** Drug description accordions.
*   **Missing E2E Flows:** Refill tracking.
*   **Recommended Implementation Plan:** Prescription progress blocks.
*   **Business-Flow Validation:** Refills simulated info overlay only.

#### 78. patient_staff.png
*   **Route:** `/portal/staff`
*   **Target Image:** `patient_staff.png`
*   **Live Audit Image:** `52-portal-staff.png`
*   **Missing UI Elements:** Attending care team profile cards.
*   **Buttons to Add:** "Request Care Message" link.
*   **Input Fields/Filters:** None.
*   **Subpages/Nested Flows:** Staff schedule.
*   **Expandable Behaviors:** Click card.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** Card collections layout.
*   **Business-Flow Validation:** Pulls attending doctors list.

#### 79. patient_support.png
*   **Route:** `/portal/support`
*   **Target Image:** `patient_support.png`
*   **Live Audit Image:** `53-portal-support.png`
*   **Missing UI Elements:** FAQs list tables.
*   **Buttons to Add:** "Submit FAQ Request".
*   **Input Fields/Filters:** Question search.
*   **Subpages/Nested Flows:** None.
*   **Expandable Behaviors:** FAQ list accordion.
*   **Missing E2E Flows:** None.
*   **Recommended Implementation Plan:** FAQ grids layout.
*   **Business-Flow Validation:** Static help content.

---

## 4. Business-Flow Validation & Risks

Following a validation step against `docs/reference/current-system-flows.md` and active API scopes, the following key items must be preserved:

1.  **Patient Messaging Refactor:** The backend does not support sending portal messages. The UI chat compose box must render as read-only with a message telling the patient to contact the clinic.
2.  **Patient Self-Cancel/Reschedule:** The portal API does not support patient self-serviced cancellations or date mutations. Reschedule buttons should display a help note containing receptionist contact numbers rather than firing API calls.
3.  **Support Tickets vs Queue Boards:** The admin support page must not mirror the nurse queue board. It should be backed by an admin operational logs or helpdesk dashboard interface.
4.  **No-Show / Check-In Transitions:** In the queue dashboard, checking in patient MUST invoke `/api/v1/appointments/{id}/checkin` to transition status from `CONFIRMED` to `CHECKED_IN` before any queue action is enabled.
5.  **Audit Logs Immutability:** Audit log grids must remain read-only; no delete or edit actions can exist on `/admin/audit-logs` or `/staff/audit-logs`.

---

## 5. Prioritized Implementation Order

To ensure developer efficiency and clean builds, we recommend completing the work in the following order:

### Phase 1: P1 blocker fixes (Live data parameter bugs)
*   Fix route parameters and error guards in `/departments/[id]`, `/staff/lab-results/[id]`, `/staff/medical-records/[id]/edit`, and `/admin/users/[id]`. Avoid showing raw parameter/Invalid request messages.

### Phase 2: Dashboard titles & routing (P2 issues)
*   Implement clean dashboard layouts for different staff roles under `/staff/dashboard` (Admin, Accountant, Receptionist) and fix default Doctor titles.
*   Separate `/admin/support` queue board duplication, converting it to a support desk layout.

### Phase 3: Core Workspaces Parity
*   Refactor `/staff/invoices` using the IBM ledger style design, adding the export buttons and side panel controls.
*   Refactor `/staff/queue` room assignment dropdowns and SLA breach alerts.
*   Update `/staff/inventory` adding lot and alert summaries.

### Phase 4: Patient Portal Completeness
*   Upgrade `/portal/messages` and `/portal/appointments` with appropriate static helpers / disabled compose states.
*   Enhance `/portal/overview` navigation layout.

### Phase 5: Public Page Polish
*   Update legal text layouts (`/privacy`, `/terms`, `/security`).
*   Verify responsive layout structures.

---

## 6. Acceptance Criteria

A screen is considered complete and ready for production when it passes the following criteria:

1.  **Visual Alignment:** The screen layout and color structure match the target image with minor layout modifications allowed for dynamic data. All typography and margins use the design token class metrics (`var(--hc-*)`).
2.  **Zero Raw Errors:** Navigation or page loads on seed data routes must not trigger raw backend parameter errors or unhandled HTTP exceptions.
3.  **Role Verification:** Accessing role-guarded screens with unauthorized credentials redirects cleanly to `/forbidden` or displays the appropriate error state.
4.  **E2E Action Validation:** Interaction tests (smoke tests via Playwright) verify that major buttons trigger corresponding endpoints successfully (e.g. check-in updates queue board, invoice generation records correctly in financial summaries).
