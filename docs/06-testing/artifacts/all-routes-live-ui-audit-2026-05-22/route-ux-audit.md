# All-Routes Live UI/UX Screenshot Audit - 2026-05-22

## Scope

- Frontend: `http://localhost:13002`
- Backend: `http://127.0.0.1:18083`
- API: `http://127.0.0.1:18083/api/v1`
- Data mode: live backend, release-demo seed enabled, no Playwright API mocks.
- Viewport: 1920x1080 desktop, full-page screenshots.
- Codex Browser mode: in-app browser connection verified; bulk route capture used Playwright Chromium for durable authenticated screenshots.
- Source code changes: none. Audit artifacts only.

## Verification

| Check | Result |
| --- | --- |
| Docker Compose project | `hmsuxaudit20260522` started on frontend `:13002`, backend `:18083`, Postgres `:15434` |
| Backend health | `UP` at `/actuator/health` |
| Frontend health | HTTP 200 at `http://localhost:13002` |
| Release-demo seed gate | `HMS_EXPECT_RELEASE_DEMO_SEED=true npm run test:e2e:release-data` passed, 2 tests |
| Route screenshots | 70 smoke routes captured |
| Side-effect route | `/auth/logout` captured as intentional redirect to `/staff/login` |

## Summary

| Metric | Result |
| --- | ---: |
| Smoke routes captured | 70 |
| Side-effect behavior checks | 1 |
| Pass | 66 |
| Data/auth/setup blocker | 4 |
| UX issue from automated checks | 0 |
| Intentional redirect | 1 |

Benign Next.js RSC prefetch aborts were ignored when the visible route rendered cleanly and no API/document error was present.

## Priority Requirements

### P1

- `/departments/cardiology` - Live data route contract: Either support the public department slug route or update smoke/navigation evidence to use a seeded department UUID. Current live render shows Invalid request parameter from /api/v1/departments/cardiology.
- `/staff/lab-results/1` - Live data route contract: Replace placeholder id 1 with a seeded lab-result UUID/detail id for live screenshot and release evidence, or add a resolver/404 UX that does not surface raw backend parameter errors.
- `/staff/medical-records/1/edit` - Live data route contract: Replace placeholder appointment id 1 with a seeded appointment UUID for live browser evidence. Current live API request /api/v1/appointments/1 returns 400.
- `/admin/users/1` - Live data route contract: Replace placeholder admin user id 1 with a seeded user UUID/detail id, or provide a professional not-found/error state instead of an empty Staff Directory page with raw Invalid request parameter.

### P2

- `/staff/dashboard` - Role-context UX: When authenticated as admin, avoid rendering the page title as Doctor Dashboard with a physician ID. The shell says Admin Ops, but the page content reads doctor-specific.
- `/admin/support` - Route-purpose UX: Rename or restructure the page title/content so Admin Support does not present as Queue Board. Current screenshot is usable but mismatched to route intent.

### P3

- `/privacy, /terms, /security` - Public trust content depth: These public legal/security screens are readable but very sparse. Add scannable sections for data use, retention, patient rights, security controls, and contact/escalation paths before public launch polish.
- `all smoke routes` - Audit maintainability: Keep full-page screenshots, contact sheets, and manifest tied to the route matrix so future implementation can verify exact before/after changes without updating visual baselines blindly.

## Contact Sheets

- [Routes 01-18](contact-sheets/sheet-01-18.png)
- [Routes 19-36](contact-sheets/sheet-19-36.png)
- [Routes 37-54](contact-sheets/sheet-37-54.png)
- [Routes 55-70](contact-sheets/sheet-55-70.png)

## Route-By-Route Audit Table

| # | Route | Label | Session | HTTP | Final Path | Class | Visible purpose | Evidence note | Screenshot |
| ---: | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| 1 | `/` | public home | public | 200 | `/` | Pass | Engineering-grade healthcare precision at scale. / Real-time clinical operations. Deterministic outcomes. | Clean browser render | [png](screenshots/01-public-home.png) |
| 2 | `/departments` | public departments | public | 200 | `/departments` | Pass | Core Clinical Departments / Cardiology | Clean render; ignored 8 benign Next RSC prefetch abort(s) | [png](screenshots/02-departments.png) |
| 3 | `/departments/cardiology` | public department detail | public | 200 | `/departments/cardiology` | data/auth/setup blocker | Department could not be loaded: Cardiology | 1 HTTP 4xx/5xx response(s); 1 console error(s) | [png](screenshots/03-departments-cardiology.png) |
| 4 | `/doctors` | public doctors | public | 200 | `/doctors` | Pass | Expert doctors at your service. / Stay informed about your health. | Clean browser render | [png](screenshots/04-doctors.png) |
| 5 | `/news` | public news | public | 200 | `/news` | Pass | Advancing the frontier of clinical excellence. / Breakthrough in Neural Reconstruction Systems | Clean browser render | [png](screenshots/05-news.png) |
| 6 | `/booking` | public booking | public | 200 | `/booking` | Pass | Book Appointment / Doctor And Slot | Clean browser render | [png](screenshots/06-booking.png) |
| 7 | `/privacy` | privacy | public | 200 | `/privacy` | Pass | Privacy Policy | Clean browser render | [png](screenshots/07-privacy.png) |
| 8 | `/terms` | terms | public | 200 | `/terms` | Pass | Terms Of Service | Clean browser render | [png](screenshots/08-terms.png) |
| 9 | `/security` | security | public | 200 | `/security` | Pass | Security Controls | Clean browser render | [png](screenshots/09-security.png) |
| 10 | `/session-expired` | session expired | public | 200 | `/session-expired` | Pass | Session Expired | Clean browser render | [png](screenshots/10-session-expired.png) |
| 11 | `/forbidden` | forbidden | public | 200 | `/forbidden` | Pass | Access denied | Clean browser render | [png](screenshots/11-forbidden.png) |
| 12 | `/staff/login` | staff login | public | 200 | `/staff/login` | Pass | Clinical Suite / Staff Login | Clean browser render | [png](screenshots/12-staff-login.png) |
| 13 | `/staff/dashboard` | staff dashboard | admin | 200 | `/staff/dashboard` | Pass | Doctor Dashboard | Clean browser render | [png](screenshots/13-staff-dashboard.png) |
| 14 | `/staff/closures` | staff closures | admin | 200 | `/staff/closures` | Pass | Special Closures / Closure Calendar | Clean browser render | [png](screenshots/14-staff-closures.png) |
| 15 | `/staff/patients` | staff patients | doctor | 200 | `/staff/patients` | Pass | Search Records / Release Patient 008 | Clean browser render | [png](screenshots/15-staff-patients.png) |
| 16 | `/staff/queue` | staff queue | nurse | 200 | `/staff/queue` | Pass | Queue Board / Physician Allocation | Clean browser render | [png](screenshots/16-staff-queue.png) |
| 17 | `/staff/schedule` | staff schedule | doctor | 200 | `/staff/schedule` | Pass | My Schedule | Clean browser render | [png](screenshots/17-staff-schedule.png) |
| 18 | `/staff/booking` | staff booking | receptionist | 200 | `/staff/booking` | Pass | Booking Wizard: Symptoms / Patient Input Section | Clean browser render | [png](screenshots/18-staff-booking.png) |
| 19 | `/staff/booking/review` | staff booking review | receptionist | 200 | `/staff/booking/review` | Pass | Patient Details & Review / Required Information | Clean browser render | [png](screenshots/19-staff-booking-review.png) |
| 20 | `/staff/booking/slots` | staff booking slots | receptionist | 200 | `/staff/booking/slots` | Pass | Schedule Appointment / Available Specialists | Clean browser render | [png](screenshots/20-staff-booking-slots.png) |
| 21 | `/staff/booking/success` | staff booking success | receptionist | 200 | `/staff/booking/success` | Pass | Booking confirmed. / Dr. Julian Sterling | Clean browser render | [png](screenshots/21-staff-booking-success.png) |
| 22 | `/staff/booking/symptoms` | staff booking symptoms | receptionist | 200 | `/staff/booking/symptoms` | Pass | Booking Wizard: Symptoms / Patient Input Section | Clean browser render | [png](screenshots/22-staff-booking-symptoms.png) |
| 23 | `/staff/inventory` | staff inventory | pharmacist | 200 | `/staff/inventory` | Pass | Inventory Workspace / Items | Clean browser render | [png](screenshots/23-staff-inventory.png) |
| 24 | `/staff/invoices` | staff invoices | accountant | 200 | `/staff/invoices` | Pass | Financial Ledger | Clean browser render | [png](screenshots/24-staff-invoices.png) |
| 25 | `/staff/lab-results` | staff lab results | doctor | 200 | `/staff/lab-results` | Pass | Laboratory Results | Clean render; ignored 3 benign Next RSC prefetch abort(s) | [png](screenshots/25-staff-lab-results.png) |
| 26 | `/staff/lab-results/1` | staff lab result detail | doctor | 200 | `/staff/lab-results/1` | data/auth/setup blocker | Dashboard Patients Schedule ⌘/ 3 DR Dr. Rivera Cardiology HOSPITAL CORE Clinical Suite STA | 1 HTTP 4xx/5xx response(s); 1 console error(s) | [png](screenshots/26-staff-lab-results-1.png) |
| 27 | `/staff/medical-records/1/edit` | staff medical record edit | doctor | 200 | `/staff/medical-records/1/edit` | data/auth/setup blocker | Invalid request parameter | 1 HTTP 4xx/5xx response(s); 1 console error(s) | [png](screenshots/27-staff-medical-records-1-edit.png) |
| 28 | `/staff/nurse-intake` | staff nurse intake | nurse | 200 | `/staff/nurse-intake` | Pass | Intake Board / Today's Intake Queue | Clean browser render | [png](screenshots/28-staff-nurse-intake.png) |
| 29 | `/staff/doctor/1` | staff doctor detail | doctor | 200 | `/staff/doctor/1` | Pass | Doctor Detail / Dr. Alistair Thorne | Clean browser render | [png](screenshots/29-staff-doctor-1.png) |
| 30 | `/staff/doctor/dashboard` | staff doctor dashboard | doctor | 200 | `/staff/doctor/dashboard` | Pass | Doctor Dashboard | Clean browser render | [png](screenshots/30-staff-doctor-dashboard.png) |
| 31 | `/staff/prescriptions/preview` | staff prescription preview | doctor | 200 | `/staff/prescriptions/preview` | Pass | Prescription Preview / HMS Precision | Clean browser render | [png](screenshots/31-staff-prescriptions-preview.png) |
| 32 | `/staff/pricing` | staff pricing | accountant | 200 | `/staff/pricing` | Pass | Pricing Catalog | Clean browser render | [png](screenshots/32-staff-pricing.png) |
| 33 | `/staff/revenue` | staff revenue | accountant | 200 | `/staff/revenue` | Pass | Revenue Monitor | Clean browser render | [png](screenshots/33-staff-revenue.png) |
| 34 | `/staff/slots` | staff slots | admin | 200 | `/staff/slots` | Pass | Generate Service Slots / 01. Parameters | Clean browser render | [png](screenshots/34-staff-slots.png) |
| 35 | `/staff/support` | staff support | admin | 200 | `/staff/support` | Pass | Operations Help Desk / Open Request | Clean browser render | [png](screenshots/35-staff-support.png) |
| 36 | `/staff/vital-signs` | staff vital signs | nurse | 200 | `/staff/vital-signs` | Pass | Vital Signs Recording / Record Vitals | Clean browser render | [png](screenshots/36-staff-vital-signs.png) |
| 37 | `/portal/login` | portal login | public | 200 | `/portal/login` | Pass | Patient Portal / Log in to your account | Clean browser render | [png](screenshots/37-portal-login.png) |
| 38 | `/portal/overview` | portal overview | patient | 200 | `/portal/overview` | Pass | Patient Portal Overview / Your current portal record has 2 upcoming appointments and 0 available lab results. | Clean browser render | [png](screenshots/38-portal-overview.png) |
| 39 | `/portal/records` | portal records | patient | 200 | `/portal/records` | Pass | Search Records / Sarah J. Miller | Clean browser render | [png](screenshots/39-portal-records.png) |
| 40 | `/portal/appointments` | portal appointments | patient | 200 | `/portal/appointments` | Pass | Patient Appointments / Dr. Nguyen Van An | Clean browser render | [png](screenshots/40-portal-appointments.png) |
| 41 | `/portal/appointments/2` | portal appointment detail | patient | 200 | `/portal/appointments/2` | Pass | Patient Appointments | Clean browser render | [png](screenshots/41-portal-appointments-2.png) |
| 42 | `/portal/lab-results` | portal lab results | patient | 200 | `/portal/lab-results` | Pass | Patient Lab Results / Laboratory Results | Clean browser render | [png](screenshots/42-portal-lab-results.png) |
| 43 | `/portal/messages` | portal messages | patient | 200 | `/portal/messages` | Pass | Inbox / Release UAT care-team follow-up | Clean browser render | [png](screenshots/43-portal-messages.png) |
| 44 | `/portal/profile` | portal profile | patient | 200 | `/portal/profile` | Pass | Patient Profile / Personal Information | Clean browser render | [png](screenshots/44-portal-profile.png) |
| 45 | `/portal/claim` | portal claim | public | 200 | `/portal/claim` | Pass | Patient Claim Access | Clean browser render | [png](screenshots/45-portal-claim.png) |
| 46 | `/portal/billing` | portal billing | patient | 200 | `/portal/billing` | Pass | Billing | Clean browser render | [png](screenshots/46-portal-billing.png) |
| 47 | `/portal/diagnostics` | portal diagnostics | patient | 200 | `/portal/diagnostics` | Pass | Patient Lab Results / Laboratory Results | Clean browser render | [png](screenshots/47-portal-diagnostics.png) |
| 48 | `/portal/inventory` | portal inventory | patient | 200 | `/portal/inventory` | Pass | Home Care Inventory | Clean browser render | [png](screenshots/48-portal-inventory.png) |
| 49 | `/portal/patients` | portal patients | patient | 200 | `/portal/patients` | Pass | Patient Profile Access | Clean browser render | [png](screenshots/49-portal-patients.png) |
| 50 | `/portal/pharmacy` | portal pharmacy | patient | 200 | `/portal/pharmacy` | Pass | Pharmacy | Clean browser render | [png](screenshots/50-portal-pharmacy.png) |
| 51 | `/portal/scheduling` | portal scheduling | patient | 200 | `/portal/scheduling` | Pass | Patient Appointments / Dr. Nguyen Van An | Clean browser render | [png](screenshots/51-portal-scheduling.png) |
| 52 | `/portal/staff` | portal staff | patient | 200 | `/portal/staff` | Pass | Assigned Staff | Clean browser render | [png](screenshots/52-portal-staff.png) |
| 53 | `/portal/support` | portal support | patient | 200 | `/portal/support` | Pass | Support | Clean browser render | [png](screenshots/53-portal-support.png) |
| 54 | `/portal/admit` | portal admit | patient | 200 | `/portal/admit` | Pass | Admission And Booking | Clean browser render | [png](screenshots/54-portal-admit.png) |
| 55 | `/admin/dashboard` | admin dashboard | admin | 200 | `/admin/dashboard` | Pass | Admin Statistics | Clean browser render | [png](screenshots/55-admin-dashboard.png) |
| 56 | `/admin/appointments` | admin appointments | admin | 200 | `/admin/appointments` | Pass | Appointment ManagementLive queue / Upcoming Queue | Clean browser render | [png](screenshots/56-admin-appointments.png) |
| 57 | `/admin/audit-logs` | admin audit logs | admin | 200 | `/admin/audit-logs` | Pass | Audit LogsLive / Audit Logs | Clean browser render | [png](screenshots/57-admin-audit-logs.png) |
| 58 | `/admin/departments` | admin departments | admin | 200 | `/admin/departments` | Pass | Manage Departments | Clean browser render | [png](screenshots/58-admin-departments.png) |
| 59 | `/admin/monitoring` | admin monitoring | admin | 200 | `/admin/monitoring` | Pass | HMS Operational Health | Clean browser render | [png](screenshots/59-admin-monitoring.png) |
| 60 | `/admin/news` | admin news | admin | 200 | `/admin/news` | Pass | Hospital News | Clean browser render | [png](screenshots/60-admin-news.png) |
| 61 | `/admin/public-content` | admin public content | admin | 200 | `/admin/public-content` | Pass | Public Content | Clean browser render | [png](screenshots/61-admin-public-content.png) |
| 62 | `/admin/rooms` | admin rooms | admin | 200 | `/admin/rooms` | Pass | Room Inventory / Room Details | Clean browser render | [png](screenshots/62-admin-rooms.png) |
| 63 | `/admin/users` | admin users | admin | 200 | `/admin/users` | Pass | Staff Directory | Clean browser render | [png](screenshots/63-admin-users.png) |
| 64 | `/admin/users/1` | admin user detail | admin | 200 | `/admin/users/1` | data/auth/setup blocker | Staff Directory | 1 HTTP 4xx/5xx response(s); 1 console error(s) | [png](screenshots/64-admin-users-1.png) |
| 65 | `/admin/inventory` | admin inventory | admin | 200 | `/admin/inventory` | Pass | Inventory Workspace | Clean browser render | [png](screenshots/65-admin-inventory.png) |
| 66 | `/admin/pricing` | admin pricing | admin | 200 | `/admin/pricing` | Pass | Service Catalog | Clean browser render | [png](screenshots/66-admin-pricing.png) |
| 67 | `/admin/schedule-templates` | admin schedule templates | admin | 200 | `/admin/schedule-templates` | Pass | Schedule Templates | Clean browser render | [png](screenshots/67-admin-schedule-templates.png) |
| 68 | `/admin/slots` | admin slots | admin | 200 | `/admin/slots` | Pass | Slot Generation | Clean browser render | [png](screenshots/68-admin-slots.png) |
| 69 | `/admin/special-closures` | admin special closures | admin | 200 | `/admin/special-closures` | Pass | Special Closures | Clean browser render | [png](screenshots/69-admin-special-closures.png) |
| 70 | `/admin/support` | admin support | admin | 200 | `/admin/support` | Pass | Queue Board | Clean browser render | [png](screenshots/70-admin-support.png) |

## Side-Effect Route

| Route | Final Path | Class | Evidence note | Screenshot |
| --- | --- | --- | --- | --- |
| `/auth/logout` | `/staff/login` | intentional redirect | cleared staff session and redirected to /staff/login | [png](screenshots/71-auth-logout.png) |

## Artifact Files

- Manifest: `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-22/all-routes-live-manifest.json`
- Route audit: `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-22/route-ux-audit.md`
- Screenshots: `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-22/screenshots/`
- Contact sheets: `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-22/contact-sheets/`
