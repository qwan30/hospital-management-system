# Frontend Route Inventory

**Status:** current route inventory for `web/src/app` on April 26, 2026.
**Canonical frontend:** `web/`
**Reference-only frontend prototypes:** `frontend/`

This inventory is based on the current Next.js App Router files under `web/src/app` and the route audit helper in `web/e2e/helpers/routes.ts`.

## 1. Summary

| Area | Status | Current source |
| --- | --- | --- |
| Public routes | Implemented route files | `web/src/app/(public)` |
| Staff routes | Implemented route files, selected backend integration | `web/src/app/staff` |
| Admin routes | Implemented route files, route-guarded | `web/src/app/admin` |
| Patient portal routes | Implemented route files, partial backend integration | `web/src/app/portal` |
| Auth/system routes | Implemented route files | `web/src/app/auth`, `web/src/app/forbidden`, public session pages |
| Classic/variant routes | Reference-only comparison routes where files exist | route directories containing `classic` or `variant` |

Current file count: 65 `page.tsx` files and 71 total route/layout files under `web/src/app`.

## 2. Public Routes

| Route | Source file | Status | Notes |
| --- | --- | --- | --- |
| `/` | `(public)/page.tsx` | Implemented | public home |
| `/booking` | `(public)/booking/page.tsx` | Implemented | public booking |
| `/departments` | `(public)/departments/page.tsx` | Implemented | department list |
| `/departments/[id]` | `(public)/departments/[id]/page.tsx` | Implemented | department detail |
| `/doctors` | `(public)/doctors/page.tsx` | Implemented | doctor list |
| `/news` | `(public)/news/page.tsx` | Implemented | news list |
| `/privacy` | `(public)/privacy/page.tsx` | Implemented | policy page |
| `/security` | `(public)/security/page.tsx` | Implemented | security page |
| `/session-expired` | `(public)/session-expired/page.tsx` | Implemented | auth expiry state |
| `/terms` | `(public)/terms/page.tsx` | Implemented | terms page |

## 3. Staff Routes

| Route | Source file | Status | Notes |
| --- | --- | --- | --- |
| `/staff/login` | `staff/(auth)/login/page.tsx` | Implemented | staff login |
| `/staff/dashboard` | `staff/(app)/dashboard/page.tsx` | Implemented | staff landing |
| `/staff/closures` | `staff/(app)/closures/page.tsx` | Implemented | admin scheduling support |
| `/staff/patients` | `staff/(app)/patients/page.tsx` | Implemented | patient list/workspace |
| `/staff/queue` | `staff/(app)/queue/page.tsx` | Implemented | backend-integrated queue, check-in, call, room assignment, consultation, and completion actions |
| `/staff/schedule` | `staff/(app)/schedule/page.tsx` | Implemented route file | doctor schedule |
| `/staff/booking` | `staff/(app)/booking/page.tsx` | Implemented route file | staff booking shell |
| `/staff/booking/symptoms` | `staff/(app)/booking/symptoms/page.tsx` | Implemented route file | intake step |
| `/staff/booking/slots` | `staff/(app)/booking/slots/page.tsx` | Implemented route file | slot step |
| `/staff/booking/review` | `staff/(app)/booking/review/page.tsx` | Implemented route file | review step |
| `/staff/booking/success` | `staff/(app)/booking/success/page.tsx` | Implemented route file | success state |
| `/staff/inventory` | `staff/(app)/inventory/page.tsx` | Implemented | pharmacist/admin inventory workspace with item, lot, movement, and alert APIs |
| `/staff/invoices` | `staff/(app)/invoices/page.tsx` | Implemented route file | finance workspace |
| `/staff/lab-results` | `staff/(app)/lab-results/page.tsx` | Implemented route file | lab result list |
| `/staff/lab-results/[id]` | `staff/(app)/lab-results/[id]/page.tsx` | Implemented route file | lab result detail |
| `/staff/medical-records/[id]/edit` | `staff/(app)/medical-records/[id]/edit/page.tsx` | Implemented route file | record editor |
| `/staff/nurse-intake` | `staff/(app)/nurse-intake/page.tsx` | Implemented route file | nurse intake |
| `/staff/doctor/dashboard` | `staff/(app)/doctor/dashboard/page.tsx` | Implemented route file | doctor dashboard |
| `/staff/doctor/[id]` | `staff/(app)/doctor/[id]/page.tsx` | Implemented route file | doctor detail |
| `/staff/prescriptions/preview` | `staff/(app)/prescriptions/preview/page.tsx` | Implemented route file | PDF preview |
| `/staff/pricing` | `staff/(app)/pricing/page.tsx` | Implemented route file | pricing management |
| `/staff/revenue` | `staff/(app)/revenue/page.tsx` | Implemented route file | revenue reporting |
| `/staff/slots` | `staff/(app)/slots/page.tsx` | Implemented route file | slot operations |
| `/staff/support` | `staff/(app)/support/page.tsx` | Implemented route file | support page |
| `/staff/vital-signs` | `staff/(app)/vital-signs/page.tsx` | Implemented route file | vital signs |

## 4. Admin Routes

| Route | Source file | Status | Notes |
| --- | --- | --- | --- |
| `/admin/dashboard` | `admin/(app)/dashboard/page.tsx` | Implemented route file | admin landing |
| `/admin/appointments` | `admin/(app)/appointments/page.tsx` | Implemented route file | appointment operations |
| `/admin/audit-logs` | `admin/(app)/audit-logs/page.tsx` | Implemented | audit log viewer for authorization, queue, inventory, and admin events |
| `/admin/departments` | `admin/(app)/departments/page.tsx` | Implemented route file | department admin |
| `/admin/monitoring` | `admin/(app)/monitoring/page.tsx` | Implemented | monitoring snapshot with active, schedule, and inventory alert counts |
| `/admin/news` | `admin/(app)/news/page.tsx` | Implemented route file | news admin |
| `/admin/public-content` | `admin/(app)/public-content/page.tsx` | Implemented route file | public content admin |
| `/admin/rooms` | `admin/(app)/rooms/page.tsx` | Implemented route file | room admin |
| `/admin/users` | `admin/(app)/users/page.tsx` | Implemented route file | user admin |
| `/admin/users/[id]` | `admin/(app)/users/[id]/page.tsx` | Implemented route file | user detail |

## 5. Patient Portal Routes

| Route | Source file | Status | Notes |
| --- | --- | --- | --- |
| `/portal/login` | `portal/(auth)/login/page.tsx` | Implemented | patient login |
| `/portal/claim` | `portal/(app)/claim/page.tsx` | Implemented | claim flow |
| `/portal/overview` | `portal/(app)/overview/page.tsx` | Implemented route file | portal overview |
| `/portal/appointments` | `portal/(app)/appointments/page.tsx` | Implemented route file | appointment list |
| `/portal/appointments/2` | `portal/(app)/appointments/2/page.tsx` | Reference-only sample detail | static sample route |
| `/portal/lab-results` | `portal/(app)/lab-results/page.tsx` | Implemented route file | lab results |
| `/portal/messages` | `portal/(app)/messages/page.tsx` | Implemented route file | read-only message threads |
| `/portal/profile` | `portal/(app)/profile/page.tsx` | Implemented route file | profile |
| `/portal/records` | `portal/(app)/records/page.tsx` | Implemented route file | records |
| `/portal/billing` | `portal/(app)/billing/page.tsx` | Implemented route file | portal billing view |
| `/portal/diagnostics` | `portal/(app)/diagnostics/page.tsx` | Implemented route file | diagnostics view |
| `/portal/inventory` | `portal/(app)/inventory/page.tsx` | Implemented route file | portal inventory view |
| `/portal/patients` | `portal/(app)/patients/page.tsx` | Implemented route file | portal patient view |
| `/portal/pharmacy` | `portal/(app)/pharmacy/page.tsx` | Implemented route file | pharmacy view |
| `/portal/scheduling` | `portal/(app)/scheduling/page.tsx` | Implemented route file | scheduling view |
| `/portal/staff` | `portal/(app)/staff/page.tsx` | Implemented route file | staff view |
| `/portal/support` | `portal/(app)/support/page.tsx` | Implemented route file | support |
| `/portal/admit` | `portal/(app)/admit/page.tsx` | Implemented route file | admit view |

## 6. Auth And System Routes

| Route | Source file | Status | Notes |
| --- | --- | --- | --- |
| `/auth/logout` | `auth/logout/page.tsx` | Implemented | staff logout side-effect route |
| `/forbidden` | `forbidden/page.tsx` | Implemented | authorization denial page |
| `/session-expired` | `(public)/session-expired/page.tsx` | Implemented | expired session page |

## 7. Reference-Only Or Variant Routes

The repo contains directories for classic/variant comparisons such as `home-classic`, `home-variant`, department variants, and login/classic routes. Treat these as reference or comparison material unless the route has a current `page.tsx` and appears in the active route audit.

## 8. Maintenance

When adding, removing, or renaming frontend routes:

- update this file
- update `docs/design_brief.md`
- update `web/e2e/helpers/routes.ts`
- update `docs/HMS_TestPlan.md` if test coverage changes
