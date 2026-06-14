# Product Requirements Document — Hospital Management System (HMS)

> Tai lieu yeu cau san pham (PRD) tong hop cho he thong quan ly benh vien. Merge tu co so hien tai: `docs/HMS_PRD.md`. Cap nhat lan cuoi: 2026-06-14.

**Status:** Release Candidate, aligned voi repository tai thoi diem 2026-06-14.
**Release label:** Release Candidate
**So do tai lieu:** [docs/00-overview/README.md](../00-overview/README.md)
**Route inventory:** [docs/reference/frontend-route-inventory.md](../reference/frontend-route-inventory.md)
**Feature list chi tiet:** [docs/02-product/feature-list.md](feature-list.md)

---

## 1. Tom Tat San Pham (Product Summary)

Du an la mot he thong quan ly benh vien (Hospital Management System - HMS) backend-first voi:

- **Noi dung benh vien cong khai:** Trang chu, danh sach khoa, bac si, tin tuc
- **Dat lich hen:** Wizard nhap trieu chung, chon bac si, chon khung gio, xac nhan
- **Xac thuc nhan vien:** JWT token + RBAC, HTTP-only refresh cookie
- **Quy trinh lam sang bac si:** Ho so benh an, chan doan, don thuoc (PDF), tai kham
- **Quy trinh dieu phoi:** Diem danh, hang doi, sinh hieu, phong lam sang
- **Quy trinh tai chinh:** Hoa don, thanh toan, bang gia, bao cao doanh thu
- **Quy trinh admin:** Quan ly nguoi dung, khoa, phong, lich, noi dung, thong ke
- **Cong thong tin benh nhan:** Lich su lich hen, ket qua xet nghiem, tin nhan, ho so
- **Nha thuoc:** Quan ly ton kho, lo thuoc, xuat nhap, canh bao

**Architecture:** Modular monolith (DDD), Java 17 + Spring Boot 3.3.5, Next.js 16 + React 19, PostgreSQL 15.

---

## 2. Hien Trang Hien Tai (Current Implementation Baseline)

### 2.1 Da Trieu Khai (Implemented)

- **Backend:** Spring Boot + Maven 5-module reactor (domain, infrastructure, application, controller, start)
- **API:** 40 controllers, 118 REST API mappings
- **Database:** PostgreSQL 15, 20 Flyway migrations (V1-V16 seed + gap migrations), 35 tables, 26 indexes
- **Seed data:** Departments, staff accounts, pricing, slots, inventory, patient portal demo data
- **Frontend:** Next.js 16 App Router, 72 page files, 80.48% Vitest branch coverage, 183+ Playwright E2E scenarios
- **Security:** Spring Security, JWT (JJWT 0.12.6), RBAC (36 permissions), rate limiting, CSP headers
- **PHI protection:** AES-256-GCM for CCCD, SHA-256 for search, BCrypt for passwords
- **Audit logging:** 13+ audit action types, REQUIRES_NEW propagation, immutable
- **Chatbot:** Rule-based, deterministic, grounded in live DB content (departments, doctors, slots)
- **PDF generation:** Apache PDFBox 3.0.4 for prescription PDF
- **Docker:** Docker Compose with PostgreSQL, backend, frontend, Nginx
- **Observability:** Prometheus, Grafana, Loki, Tempo, OpenTelemetry
- **CI/CD:** GitHub Actions, GHCR image registry

### 2.2 Chua Trieu Khai (Not Implemented Yet)

- Full production readiness for every frontend workflow (selected workflows only are backend-integrated)
- Patient self-service cancel/reschedule flows
- Patient portal message compose or reply APIs
- External payment gateway integration
- Separate real-time room-board operations beyond the audited queue assign-room action
- Drug-allergy interaction checking
- AI/LLM assistant features (removed from product)

### 2.3 Frontend Status

- `web/` = Canonical Next.js frontend (public, staff, admin, patient portal route groups)
- `frontend/` = Archive of migrated design-reference HTML/PNG prototypes (NOT runnable)
- Frontend route guards are UX-only; backend `@PreAuthorize` and 401/403 responses remain the source of truth
- Only selected frontend workflows are fully backend-integrated

---

## 3. Nguoi Dung Va Vai Tro (Users and Roles)

| Role | Current system access | Design implication |
| --- | --- | --- |
| **Guest** | Public content, doctor directory, department info, booking, chatbot | Can hoan thien giao dien public website va booking flow |
| **Patient** | Portal claim, portal login, overview, appointments, lab results, messages, profile | Can portal nhe, tap trung vao hien thi va niem tin |
| **Doctor** | Staff auth, appointment list/detail, status updates, medical records, follow-up, PDF prescr. | Can khong gian lam vice dac thong tin, desktop-first |
| **Nurse** | Staff auth, daily appointments, queue, check-in, vital signs | Can tuong tac nhanh, list/detail, intake de dang |
| **Accountant** | Invoices, payments, pricing, revenue reports | Can bang tai chinh, bo loc, hien thi trang thai |
| **Receptionist** | RBAC role exists; queue and appointment support. Seeded demo account exists. | Can man hinh scheduling neu role duoc productize |
| **Pharmacist** | RBAC role exists; prescription read + inventory. Seeded demo account exists. | Can man hinh nha thuoc neu role duoc productize |
| **Admin** | Users, departments, rooms, templates, closures, slots, content, news, stats, monitoring, audit logs | Can console dieu hanh rong voi dieu huong manh |

**Xem them:**
- [Role-screen-API matrix](../reference/role-screen-api-matrix.md)
- [Permissions matrix](../03-requirements/permissions-matrix.md)

---

## 4. Trang Thai Tinh Nang (Current-Vs-Planned Feature Status)

| Product area | Status | Notes |
| --- | --- | --- |
| Backend modules and REST APIs | IMPLEMENTED | 5-module Maven reactor, 118 mappings |
| Public discovery and booking APIs | IMPLEMENTED | Departments, doctors, slots, appointments, chatbot |
| Staff auth and RBAC | IMPLEMENTED | JWT, refresh cookies, 36 permissions, frontend guards |
| Clinical workflows | IMPLEMENTED | Queue, vital signs, lab results, medical records, follow-up, prescription PDF |
| Finance and inventory APIs | IMPLEMENTED | Invoice, payment, pricing, revenue, items, lots, movements, alerts |
| Patient portal read experience | PARTIAL | Auth, overview, appointments, lab results, messages (read-only), profile |
| Frontend route tree | PARTIAL | 72 page files; only selected workflows backend-integrated |
| Dockerized frontend | IMPLEMENTED | web/Dockerfile, Docker Compose frontend service |
| External payment gateway | PLANNED | No payment-provider integration present |
| Patient self-cancel/reschedule | PLANNED | APIs not implemented |
| Drug-allergy interaction | PLANNED | No CDSS rules |
| AI/internal assistant | REMOVED | Historical assistant API and DB surfaces removed |
| Real-time room board | PLANNED | Beyond queue assign-room |

---

## 5. Pham Vi Cho Thiet Ke Frontend (Product Scope for Frontend Design)

### 5.1 Public Experience
- Home page (API: `/api/v1/content/home`)
- Department list and detail
- Doctor list, detail, slot availability by date
- News listing
- Booking entry points (symptom intake, doctor/slot selection, patient details, confirmation)
- Public chatbot entry point

### 5.2 Staff Experience
- Staff login and token refresh
- Doctor dashboard and appointment list/detail
- Medical record editor (diagnosis, notes, follow-up, prescription items, PDF)
- Nurse intake board (today list, queue, check-in, vital signs)
- Accountant workspace (invoices, payments, pricing, revenue)
- Admin workspace (users, departments, rooms, schedules, content, monitoring, audit logs)

### 5.3 Patient Portal
- Portal claim flow
- Portal login and refresh
- Overview dashboard
- Appointment history
- Lab results list with summary, comment, attachment
- Message threads (read-only)
- Profile editing

---

## 6. Kien Truc He Thong (System Architecture)

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Backend** | Java 17, Spring Boot 3.3.5 | Modular monolith with DDD layering |
| **Frontend** | Next.js 16, React 19, TypeScript | App Router, Tailwind CSS 4 |
| **Database** | PostgreSQL 15 (pgvector) | Flyway migrations, 35 tables |
| **Security** | Spring Security, JJWT 0.12.6 | RBAC, rate limiting, CSRF, CSP |
| **PDF** | Apache PDFBox 3.0.4 | Prescription PDF generation |
| **Container** | Docker, Docker Compose | Backend, frontend, PostgreSQL, Nginx |
| **Observability** | Prometheus, Grafana, Loki, Tempo | Optional overlay stack |
| **CI/CD** | GitHub Actions | Build, test, security scan, deploy |

---

## 7. Cac Yeu Cau Phien Dung (UX Requirements)

- Public va patient experiences: mobile + desktop responsive
- Staff experiences: desktop-first, tablet-friendly
- UI phan anh chinh xac gioi han vai tro (khong hien thi actions khong duoc phep)
- Form validation inline, giu lai du lieu da nhap khi an toan
- Du lieu nhay cam: giao dien lam sang, dam bao, it nhieu, khong marketing
- Accessibility target: WCAG 2.1 AA

---

## 8. Cac Rang Buoc (Product Constraints From Current Code)

- Chatbot la quy tac, khong phai AI/LLM. Khong co tich hop AI ben ngoai.
- Patient portal messages: read-only tu phia benh nhan.
- Room management: admin API chi; chua co nurse room workflow rieng.
- Refresh tokens: HTTP-only cookies cho ca staff va patient auth.
- Prescription PDF: chi preview/download; khong co gui email tu dong (Gmail hook disabled by default).
- Slot duration: 30 phut co dinh.
- Khong co external payment gateway.
- Khong co telemedicine.

---

## 9. Danh Muc Man Hinh (Screen Inventory)

### 9.1 Public Screens
| Screen | API Dependency |
|--------|---------------|
| Home | `GET /api/v1/content/home` |
| Departments | `GET /api/v1/departments` |
| Department detail | `GET /api/v1/departments/{id}` |
| Doctors | `GET /api/v1/doctors` |
| Doctor detail with slot picker | `GET /api/v1/doctors/{id}`, `GET /api/v1/doctors/{id}/slots?date=` |
| Booking wizard | `POST /api/v1/appointments` |
| Booking success | — |
| News list | `GET /api/v1/news` |
| Chatbot drawer | `POST /api/v1/chatbot/messages` |

### 9.2 Staff Screens
| Screen | Roles |
|--------|-------|
| Staff login | All staff |
| Doctor dashboard + appointment list | DOCTOR, ADMIN |
| Doctor appointment detail | DOCTOR, ADMIN |
| Medical record editor | DOCTOR, ADMIN |
| Prescription PDF preview/download | DOCTOR, ADMIN, PHARMACIST |
| Nurse daily intake board | NURSE, ADMIN |
| Queue board | NURSE, RECEPTIONIST, ADMIN |
| Vital signs editor | NURSE, DOCTOR, ADMIN |
| Invoice list and detail | ACCOUNTANT, ADMIN |
| Pricing management | ACCOUNTANT, ADMIN |
| Revenue dashboard | ACCOUNTANT, ADMIN |
| Admin users | ADMIN |
| Admin departments | ADMIN |
| Admin rooms | ADMIN |
| Admin schedule templates | ADMIN |
| Admin special closures | ADMIN |
| Admin slot generation | ADMIN |
| Admin content and news | ADMIN |
| Admin stats and monitoring | ADMIN |
| Audit log viewer | ADMIN, ACCOUNTANT |
| Support dashboard | All staff |
| Schedule view | DOCTOR |
| Inventory management | PHARMACIST, ADMIN |

### 9.3 Patient Portal Screens
| Screen | API |
|--------|-----|
| Claim access | `POST /api/v1/patient-auth/claim` |
| Login | `POST /api/v1/patient-auth/login` |
| Overview | `GET /api/v1/patient-portal/overview` |
| Appointments | `GET /api/v1/patient-portal/appointments` |
| Lab results | `GET /api/v1/patient-portal/lab-results` |
| Messages | `GET /api/v1/patient-portal/messages` |
| Profile | `GET/PUT /api/v1/patient-portal/profile` |

### 9.4 Shared Overlay Patterns
- Authentication expired modal / silent refresh flow
- Permission denied states
- Empty states
- Optimistic loading and skeleton states
- Form validation states

---

## 10. Cac Hanh Trinh Chinh (Key Journeys)

### 10.1 Public Booking Journey
1. Guest lands on Home or Departments
2. Guest explores doctors and slot availability
3. Guest enters symptoms (duration guidance)
4. Guest selects doctor and first slot
5. Guest completes patient details and booking contact
6. System returns `HMS-XXXXXXXX` confirmation code and booking summary

### 10.2 Doctor Care Completion Journey
1. Doctor logs in
2. Reviews own appointment list
3. Updates appointment status
4. Creates medical record (diagnosis, notes, vitals, follow-up, prescription)
5. Previews/downloads prescription PDF

### 10.3 Nurse Intake Journey
1. Nurse logs in
2. Opens today appointments or queue
3. Checks in the patient
4. Records vital signs

### 10.4 Accountant Billing Journey
1. Accountant logs in
2. Reviews invoices by status
3. Creates invoice from appointment
4. Records payment or voids invoice
5. Reviews revenue reports (daily/monthly/department)
6. Maintains pricing rules

### 10.5 Admin Governance Journey
1. Admin logs in
2. Manages staff, departments, rooms, scheduling structures
3. Manages public content and news
4. Reviews monitoring, stats, and audit logs

---

## 11. Cac Tinh Nang Chua Trieu Khai (Not Yet Implemented Items)

| Feature | Reason | Required for GA? |
|---------|--------|:----------------:|
| Full frontend integration for all workflows | Selected flows only are API-connected | No (iterative) |
| Patient self-cancel / reschedule | No API exists | No |
| Patient message compose/reply | No API exists | No |
| External payment gateway | No integration exists | No |
| Real-time room board | Beyond queue assign-room | No |
| Drug-allergy interaction | CDSS scope | No |
| AI chatbot / LLM | Removed from product | No |

---

## 12. Tai Lieu Tham Khao (References)

| Document | Location |
|----------|----------|
| Feature catalog | [docs/02-product/feature-list.md](feature-list.md) |
| Project scope | [docs/01-business/scope.md](../01-business/scope.md) |
| Business rules | [docs/01-business/business-rules.md](../01-business/business-rules.md) |
| Glossary | [docs/01-business/glossary.md](../01-business/glossary.md) |
| Permissions matrix | [docs/03-requirements/permissions-matrix.md](../03-requirements/permissions-matrix.md) |
| SRS (functional requirements) | [docs/HMS_SRS.md](../HMS_SRS.md) |
| TDD (technical design) | [docs/HMS_TDD.md](../HMS_TDD.md) |
| API endpoints | [docs/API_ENDPOINTS_COMPREHENSIVE.md](../API_ENDPOINTS_COMPREHENSIVE.md) |
| Role-screen-API matrix | [docs/reference/role-screen-api-matrix.md](../reference/role-screen-api-matrix.md) |
| Domain-driven design | [docs/04-architecture/domain-driven-design.md](../04-architecture/domain-driven-design.md) |
| User manual | [docs/HMS_UserManual.md](../HMS_UserManual.md) |
| Design system | [docs/design_system.md](../design_system.md) |
