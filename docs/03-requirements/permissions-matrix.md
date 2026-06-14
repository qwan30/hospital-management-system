# Ma Tran Quyen (Role-Permission Matrix)

> Ma tran 36 quyen RBAC (Role-Based Access Control) cho 7 vai tro nguoi dung. Cap nhat lan cuoi: 2026-06-14.

**Nguon (Sources):**
- `backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java`
- `backend/domain/src/main/java/com/hospital/shared/enums/UserRole.java`
- `frontend/src/lib/rbac.ts`
- `backend/controller/src/main/java/com/hospital/api/config/SecurityConfig.java`

---

## 1. Danh Sach Vai Tro (Role List)

| Role | Ma | Loai | Mo ta |
|------|:--:|------|-------|
| **ADMIN** | R-01 | Staff | Quan tri he thong, cau hinh, kiem toan, giam sat |
| **DOCTOR** | R-02 | Staff | Bac si lam sang, ho so benh an, don thuoc |
| **NURSE** | R-03 | Staff | Dieu duong, diem danh, hang doi, sinh hieu |
| **RECEPTIONIST** | R-04 | Staff | Tiep tan, ho tro dat lich, hang doi |
| **PHARMACIST** | R-05 | Staff | Duoc si, quan ly thuoc, ton kho, don thuoc |
| **ACCOUNTANT** | R-06 | Staff | Ke toan, hoa don, thanh toan, bao cao doanh thu |
| **PATIENT** | R-07 | Portal | Benh nhan, cong thong tin ca nhan |

---

## 2. Ma Tran Quyen (Permission Matrix)

`[X]` = Co quyen (Authorized) | `[-]` = Khong co quyen (Not authorized)

### 2.1 Admin He Thong (System Administration)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 01 | `ADMIN_USERS_MANAGE` | CRUD, kich hoat/vo hieu hoa tai khoan nhan vien | **X** | - | - | - | - | - | - |
| 02 | `ADMIN_DEPARTMENTS_MANAGE` | CRUD khoa/phong ban, gan bac si vao khoa | **X** | - | - | - | - | - | - |
| 03 | `ADMIN_ROOMS_MANAGE` | CRUD phong, cap nhat trang thai phong | **X** | - | - | - | - | - | - |
| 04 | `ADMIN_SCHEDULE_MANAGE` | Quan ly mau lich, lich nghi dac biet, tao slot | **X** | - | - | - | - | - | - |
| 05 | `ADMIN_CONTENT_MANAGE` | Quan ly noi dung trang chu cong khai, tin tuc | **X** | - | - | - | - | - | - |
| 06 | `ADMIN_MONITORING_READ` | Xem giam sat he thong (health, metrics) | **X** | - | - | - | - | - | - |
| 07 | `ADMIN_STATS_READ` | Xem thong ke he thong tong hop | **X** | - | - | - | - | - | - |

### 2.2 Kiem Toan (Audit)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 08 | `AUDIT_LOG_READ` | Xem nhat ky kiem toan bat bien | **X** | - | - | - | - | **X** | - |

### 2.3 Hang Doi (Queue)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 09 | `QUEUE_READ` | Xem danh sach hang doi | **X** | - | **X** | **X** | - | - | - |
| 10 | `QUEUE_CHECK_IN` | Diem danh benh nhan (CHECKED_IN) | **X** | - | **X** | **X** | - | - | - |
| 11 | `QUEUE_MANAGE` | Quan ly hang doi (call, skip, assign-room, start, complete) | **X** | - | **X** | **X** | - | - | - |

### 2.4 Lich Hen (Appointment)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 12 | `APPOINTMENT_READ` | Xem danh sach va chi tiet lich hen | **X** | **X** | **X** | **X** | - | - | - |
| 13 | `APPOINTMENT_WRITE` | Tao, cap nhat lich hen | **X** | **X** | **X** | **X** | - | - | - |
| 14 | `APPOINTMENT_CANCEL` | Huy lich hen (chuyen sang CANCELLED) | **X** | - | **X** | **X** | - | - | - |
| 15 | `APPOINTMENT_STATUS_WRITE` | Thay doi trang thai lich hen (IN_PROGRESS, DONE) | - | **X** | - | - | - | - | - |

### 2.5 Tai Kham (Follow-up)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 16 | `FOLLOW_UP_READ` | Xem thong tin tai kham | **X** | **X** | **X** | - | - | - | - |
| 17 | `FOLLOW_UP_WRITE` | Tao tai kham (de xuat ngay tai kham) | - | **X** | - | - | - | - | - |

### 2.6 Lich Lam Vice (Schedule)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 18 | `SCHEDULE_READ` | Xem lich lam viec ca nhan (doctor's own schedule) | - | **X** | - | - | - | - | - |

### 2.7 Ho So Benh Nhan (Patient Record)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 19 | `PATIENT_RECORD_READ` | Xem ho so/tom tat benh nhan | **X** | **X** | - | - | - | - | - |
| 20 | `PATIENT_HISTORY_READ` | Xem lich su kham benh cua benh nhan | - | **X** | - | - | - | - | - |

### 2.8 Ho So Benh An (Medical Record)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 21 | `MEDICAL_RECORD_WRITE` | Tao, cap nhat ho so benh an (chan doan, ghi chu, don thuoc) | **X** | **X** | - | - | - | - | - |

### 2.9 Don Thuoc (Prescription)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 22 | `PRESCRIPTION_READ` | Xem don thuoc, tai PDF don thuoc | **X** | **X** | - | - | **X** | - | - |

### 2.10 Ket Qua Xet Nghiem (Lab Result)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 23 | `LAB_RESULT_READ` | Xem ket qua xet nghiem | **X** | **X** | **X** | - | - | - | - |
| 24 | `LAB_RESULT_WRITE` | Tao, cap nhat ket qua xet nghiem | **X** | **X** | - | - | - | - | - |

### 2.11 Sinh Hieu (Vital Signs)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 25 | `VITAL_SIGNS_READ` | Xem sinh hieu (huyet ap, nhiet do, can nang, v.v.) | **X** | **X** | **X** | - | - | - | - |
| 26 | `VITAL_SIGNS_WRITE` | Tao, cap nhat sinh hieu | **X** | **X** | **X** | - | - | - | - |

### 2.12 Hoa Don (Invoice)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 27 | `INVOICE_READ` | Xem danh sach va chi tiet hoa don | **X** | - | - | - | - | **X** | - |
| 28 | `INVOICE_WRITE` | Tao hoa don, ghi nhan thanh toan, huy hoa don | **X** | - | - | - | - | **X** | - |

### 2.13 Bang Gia (Pricing)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 29 | `PRICING_MANAGE` | Quan ly bang gia dich vu (CRUD) | **X** | - | - | - | - | **X** | - |

### 2.14 Doanh Thu (Revenue)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 30 | `REVENUE_READ` | Xem bao cao doanh thu (ngay, thang, khoa) | **X** | - | - | - | - | **X** | - |

### 2.15 Ton Kho (Inventory)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 31 | `INVENTORY_READ` | Xem danh sach vat tu, lo thuoc, xuat nhap ton | **X** | - | - | - | **X** | - | - |
| 32 | `INVENTORY_MANAGE` | Quan ly vat tu, lo thuoc, xuat nhap ton, canh bao | **X** | - | - | - | **X** | - | - |

### 2.16 Cong Thong Tin Benh Nhan (Patient Portal)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 33 | `PATIENT_PORTAL_READ` | Xem thong tin ca nhan, lich hen, KQXN, tin nhan | - | - | - | - | - | - | **X** |
| 34 | `PATIENT_PORTAL_WRITE` | Cap nhat ho so ca nhan | - | - | - | - | - | - | **X** |

### 2.17 Endpoint Cong Khai (Public Endpoints - Khong can xac thuc)

| # | Permission | Mo ta | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PHARMACIST | ACCOUNTANT | PATIENT |
|:-:|------------|-------|:-----:|:------:|:-----:|:------------:|:----------:|:----------:|:-------:|
| 35 | `PUBLIC_ACCESS` | Truy cap endpoint cong khai (no auth required) | * | * | * | * | * | * | * |
| 36 | `CHATBOT_ACCESS` | Su dung chatbot cong khai | * | * | * | * | * | * | * |

> `*` = Public endpoint, khong yeu cau xac thuc (unauthenticated).
> Tat ca endpoint public deu co rate limiting (30 requests/min/IP default).

---

## 3. Tom Tat Quyen Theo Vai Tro (Permission Count by Role)

| Role | Count | Permissions dac trung |
|------|:-----:|-----------------------|
| **ADMIN** | 28 | All admin, audit, queue, appointment, clinical, finance, inventory |
| **DOCTOR** | 14 | Appointment (own), medical records, prescription, follow-up, lab results, vital signs, patient records |
| **NURSE** | 9 | Queue (read/check-in/manage), vital signs (read/write), lab results (read), appointment (read/write/cancel), follow-up (read) |
| **RECEPTIONIST** | 6 | Queue (read/check-in/manage), appointment (read/write/cancel) |
| **PHARMACIST** | 3 | Prescription (read), inventory (read/manage) |
| **ACCOUNTANT** | 6 | Audit log (read), invoice (read/write), pricing (manage), revenue (read) |
| **PATIENT** | 2 | Portal (read/write) |
| **Guest (unauthenticated)** | 2 | Public access, chatbot access |

---

## 4. Frontend Route Guards

Cac frontend route guards trong `frontend/src/lib/rbac.ts` phan anh RBAC phia backend, voi mot so ngoai le:

| Route prefix | Roles duoc phep | Ghi chu |
|--------------|----------------|---------|
| `/admin` (except audit-logs) | ADMIN | — |
| `/admin/audit-logs` | ADMIN, ACCOUNTANT | Exception |
| `/staff/booking`, `/staff/queue` | ADMIN, NURSE, RECEPTIONIST | — |
| `/staff/nurse-intake` | ADMIN, NURSE | — |
| `/staff/lab-results/new` | ADMIN, DOCTOR | — |
| `/staff/vital-signs`, `/staff/lab-results` | ADMIN, DOCTOR, NURSE | — |
| `/staff/patients`, `/staff/medical-records`, `/staff/doctor` | ADMIN, DOCTOR | — |
| `/staff/prescriptions` | ADMIN, DOCTOR, PHARMACIST | — |
| `/staff/schedule` | DOCTOR | — |
| `/staff/inventory` | ADMIN, PHARMACIST | — |
| `/staff/invoices`, `/staff/pricing`, `/staff/revenue` | ADMIN, ACCOUNTANT | — |
| `/staff/closures`, `/staff/slots` | ADMIN | — |
| `/staff/support`, `/staff/dashboard` | All staff roles | Chung cho tat ca nhan vien |
| `/portal` | PATIENT | Tru login/claim la public |

---

## 5. Nguyen Tac Thuc Thi (Enforcement Rules)

1. **Backend la nguon su that:** `@PreAuthorize("@rbac.hasPermission(authentication, 'PERMISSION_NAME')")` tren moi endpoint la bien phap kiem soat chinh.
2. **Frontend guards la UX:** Chi bao ve dieu huong; HTTP 401/403 tu backend van la phan hoi cuoi cung.
3. **Phan biet doc/ghi:** Moi permission doc va ghi duoc dinh nghia rieng biet (VD: `VITAL_SIGNS_READ` != `VITAL_SIGNS_WRITE`).
4. **Role inheritance:** ADMIN duoc ke thua tat ca quyen. Cac role khac doc lap, khong co he thong ke thua.
5. **No de-escalation:** Mot nguoi dung chi co mot role; khong co co che giam quyen trong phien lam viec.

---

## 6. Tham Chieu (References)

- Backend RBAC implementation: `backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java`
- Frontend route policies: `frontend/src/lib/rbac.ts`
- Security configuration: `backend/controller/src/main/java/com/hospital/api/config/SecurityConfig.java`
- UserRole enum: `backend/domain/src/main/java/com/hospital/shared/enums/UserRole.java`
- Role-screen-API matrix: `docs/reference/role-screen-api-matrix.md`
- Feature catalog: `docs/02-product/feature-list.md`
