# Danh Muc Tinh Nang (Feature Catalog)

> Danh muc day du cac tinh nang cua he thong quan ly benh vien (HMS). Status: Release Candidate. Cap nhat lan cuoi: 2026-06-14.

## Danh Sach Trang Thai (Status Legend)

| Status | Y nghia |
|--------|---------|
| **IMPLEMENTED** | Da hoan thanh, co san trong code |
| **PARTIAL** | Mot phan da co, mot phan chua |
| **PLANNED** | Da duoc lap ke hoach cho phien ban tuong lai |
| **REMOVED** | Da co trong qua khu nhung da duoc loai bo |

## Moi Truong Cong Cong (Public Experience)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-001 | **Public Department & Doctor Discovery** | Home page, department list/detail, doctor list/detail with slot availability. Guest-accessible content from API. / Trang chu, danh sach khoa/chi tiet, danh sach bac si/chi tiet voi slot trong. | P0 | IMPLEMENTED |
| F-002 | **Online Appointment Booking with Slot Selection** | Wizard-style booking: symptom intake, doctor/slot selection, patient detail capture, confirmation with code `HMS-XXXXXXXX`. / Dat lich theo wizard: nhap trieu chung, chon bac si/slot, nhap thong tin benh nhan, xac nhan voi ma `HMS-XXXXXXXX`. | P0 | IMPLEMENTED |
| F-003 | **News & Announcements** | Public news list page. Admin CRUD for news articles. / Trang danh sach tin tuc cong khai. Admin CRUD cho bai viet tin tuc. | P1 | IMPLEMENTED |
| F-004 | **Public Chatbot (Rule-based)** | Rule-based chatbot grounded in department/doctor/slot database content. NOT an AI/LLM. / Chatbot quy tac dua tren noi dung co so du lieu khoa/bac si/slot. KHONG phai AI/LLM. | P1 | IMPLEMENTED |
| F-005 | **Booking Success & Confirmation** | Success state after booking showing appointment details and confirmation code. / Trang thai thanh cong sau khi dat lich hien thi chi tiet lich hen va ma xac nhan. | P0 | IMPLEMENTED |

## Xac Thuc & Bao Mat (Authentication & Security)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-006 | **Staff Authentication with JWT** | Login via email/password, access token in body, refresh token in HTTP-only cookie, logout. / Dang nhap bang email/mat khau, access token trong body, refresh token trong HTTP-only cookie, dang xuat. | P0 | IMPLEMENTED |
| F-007 | **Patient Authentication & Portal Claim** | Patient claim flow (CCCD-based), login, refresh, logout via separate patient auth endpoints. / Luong claim benh nhan (dua tren CCCD), dang nhap, lam moi, dang xuat qua endpoint xac thuc benh nhan rieng. | P0 | IMPLEMENTED |
| F-008 | **Role-Based Access Control (RBAC)** | 36 granular backend permissions for 7 roles. `@PreAuthorize` enforcement on all protected endpoints. Frontend route guards matching role policy. / 36 quyen chi tiet cho 7 vai tro. Ap dung `@PreAuthorize` tren tat ca endpoint duoc bao ve. Route guard frontend tuong ung. | P0 | IMPLEMENTED |
| F-009 | **Rate Limiting for Public Endpoints** | 30 requests/minute/IP default for unauthenticated endpoints. HTTP 429 on exceed. / 30 yeu cau/phut/IP mac dinh cho endpoint khong xac thuc. HTTP 429 neu vuot qua. | P1 | IMPLEMENTED |
| F-010 | **PHI Encryption (AES-256-GCM)** | Patient CCCD encrypted at rest. SHA-256 hash for search. BCrypt for passwords. / CCCD benh nhan ma hoa khi luu tru. SHA-256 hash de tim kiem. BCrypt cho mat khau. | P0 | IMPLEMENTED |

## Dieu Phoi & Hang Doi (Queue Management)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-011 | **Queue Management (Check-in to Completion)** | Queue entry on check-in. Actions: call, skip, assign-room, start-consultation, complete. State machine enforcement. / Tao hang doi khi diem danh. Hanh dong: goi, bo qua, gan phong, bat dau kham, hoan thanh. Ap dung may trang thai. | P0 | IMPLEMENTED |
| F-012 | **Patient Check-in** | Nurse registers patient arrival. Triggers appointment status to CHECKED_IN and creates queue entry. / Dieu duong dang ky benh nhan den. Kich hoat lich hen sang CHECKED_IN va tao ban ghi hang doi. | P0 | IMPLEMENTED |
| F-013 | **Today Appointment List** | Nurse/doctor view of today's appointments with filter/sort capabilities. / Danh sach lich hen hom nay cho dieu duong/bac si voi kha nang loc/sap xep. | P0 | IMPLEMENTED |

## Lam Sang (Clinical Workflows)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-014 | **Doctor Appointment Dashboard** | Doctor login -> own appointment list -> appointment detail with status updates. / Bac si dang nhap -> danh sach lich hen -> chi tiet lich hen voi cap nhat trang thai. | P0 | IMPLEMENTED |
| F-015 | **Medical Record Creation & Editing** | Complete clinical form: diagnosis, clinical notes, vital signs, follow-up, prescription items. / Form lam sang day du: chan doan, ghi chu lam sang, sinh hieu, tai kham, don thuoc. | P0 | IMPLEMENTED |
| F-016 | **Digital Prescription with PDF Generation** | Prescription items as structured data. PDF generation with Apache PDFBox. Preview and download endpoints. / Don thuoc dien tu duoi dang du lieu co cau truc. Tao PDF voi Apache PDFBox. Endpoint xem truoc va tai xuong. | P0 | IMPLEMENTED |
| F-017 | **Vital Signs Capture** | Blood pressure, temperature, weight, height, heart rate, respiratory rate, oxygen saturation. Linked to appointment or standalone. / Huyet ap, nhiet do, can nang, chieu cao, nhip tim, nhip tho, do bao hoa oxy. Lien ket lich hen hoac doc lap. | P0 | IMPLEMENTED |
| F-018 | **Lab Result Management** | Create and view lab results with doctor comments and attachment links. / Tao va xem ket qua xet nghiem voi nhan xet bac si va link tep dinh kem. | P1 | IMPLEMENTED |
| F-019 | **Follow-up Tracking** | Doctor recommends follow-up date during consultation. Reminder tracking (note: reminder-sent field exists, no automated notification). / Bac si de xuat ngay tai kham trong buoi kham. Theo doi nhac nho. | P1 | IMPLEMENTED |
| F-020 | **Patient History (Medical Records)** | Browse patient record summaries. View full patient medical history across appointments. / Xem tom tat ho so benh nhan. Xem toan bo lich su benh an qua cac lich hen. | P0 | IMPLEMENTED |

## Nha Thuoc & Ton Kho (Pharmacy & Inventory)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-021 | **Pharmacy Inventory Management** | CRUD for inventory items, lots, and movements. Stock level tracking with reorder thresholds. / CRUD cho vat tu, lo, va xuat nhap ton. Theo doi ton kho voi nguong dat lai hang. | P0 | IMPLEMENTED |
| F-022 | **Inventory Lot Tracking** | Lot code, quantity remaining, expiry date tracking per supplier delivery batch. / Ma lo, so luong con lai, ngay het han theo lo hang tu nha cung cap. | P0 | IMPLEMENTED |
| F-023 | **Dispense Tracking** | Record medication dispense against prescriptions. Inventory deduction on dispense. Validation of stock availability. / Ghi nhan cap phat thuoc theo don. Tru ton kho khi cap phat. Kiem tra ton kho con du. | P0 | IMPLEMENTED |
| F-024 | **Low Stock & Expiry Alerts** | Dashboard alerts for low-stock (below reorder level) and soon-to-expire lots. / Canh bao tren dashboard cho ton kho thap va lo sap het han. | P1 | IMPLEMENTED |

## Tai Chinh (Finance)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-025 | **Invoice & Payment Management** | Invoice creation from completed appointments. Payment recording (cash/transfer). Invoice voiding. Status tracking: UNPAID, PAID, CANCELLED. / Tao hoa don tu lich hen da hoan thanh. Ghi nhan thanh toan (tien mat/chuyen khoan). Huy hoa don. Theo doi trang thai. | P0 | IMPLEMENTED |
| F-026 | **Service Pricing Management** | CRUD for service pricing rules. Scoped by department with effective dates. Amount lookup for invoice generation. / CRUD cho bang gia dich vu. Pham vi theo phong ban voi ngay hieu luc. Tra cuu so tien cho tao hoa don. | P0 | IMPLEMENTED |
| F-027 | **Revenue Reporting** | Daily and monthly revenue reports. Department-level breakdowns. Aggregated financial views. / Bao cao doanh thu ngay va thang. Phan tich theo phong ban. Xem tai chinh tong hop. | P0 | IMPLEMENTED |

## Cong Thong Tin Benh Nhan (Patient Portal)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-028 | **Patient Portal Overview** | Dashboard with next appointment, recent lab results, and unread messages. / Dashboard voi lich hen tiep theo, ket qua xet nghiem gan nhat, va tin nhan chua doc. | P0 | IMPLEMENTED |
| F-029 | **Patient Appointment History** | List of past and upcoming appointments with status and details. / Danh sach lich hen qua khu va sap toi voi trang thai va chi tiet. | P0 | IMPLEMENTED |
| F-030 | **Patient Lab Results View** | Lab result list with summary, doctor comment, and attachment links. Read-only. / Danh sach ket qua xet nghiem voi tom tat, nhan xet bac si, va link tep dinh kem. Chi doc. | P0 | IMPLEMENTED |
| F-031 | **Patient Messages (Read-only)** | Message thread list with nested messages. List-and-read only. No compose/send/reply. / Danh sach tin nhan voi tin nhan long nhau. Chi xem danh sach va doc. Khong co soan/gui/tra loi. | P1 | PARTIAL |
| F-032 | **Patient Profile Editing** | View and update personal profile information. / Xem va cap nhat thong tin ca nhan. | P0 | IMPLEMENTED |

## Quan Tri He Thong (Admin Operations)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-033 | **User Management** | CRUD and activation/deactivation for staff accounts. Role assignment. / CRUD va vo hieu hoa/kich hoat tai khoan nhan vien. Gan vai tro. | P0 | IMPLEMENTED |
| F-034 | **Department Management** | CRUD for departments. Doctor assignment to departments. Soft-delete. / CRUD cho khoa/phong ban. Gan bac si vao khoa. Xoa mem. | P0 | IMPLEMENTED |
| F-035 | **Room Management** | CRUD for rooms. Room status management (READY, IN_USE, BREAK, MAINTENANCE). Soft-delete. / CRUD cho phong. Quan ly trang thai phong. Xoa mem. | P0 | IMPLEMENTED |
| F-036 | **Schedule Template Management** | CRUD for recurring weekly doctor schedule templates. Day of week, start/end time. / CRUD cho mau lich lam viec hang tuan cua bac si. Thu, gio bat dau/ket thuc. | P0 | IMPLEMENTED |
| F-037 | **Special Closure Management** | CRUD for one-off scheduling exceptions (holidays, training). Blocks slot generation. / CRUD cho lich nghi dac biet (ngay le, dao tao). Chan tao slot. | P0 | IMPLEMENTED |
| F-038 | **Slot Generation** | Generate slots from schedule templates for a date range. Accounts for special closures. Delete slots. / Tao slot tu mau lich lam viec cho mot khoang ngay. Tinh den lich nghi dac biet. Xoa slot. | P0 | IMPLEMENTED |
| F-039 | **Public Content Management** | CRUD for home page content sections. Manage hospital public website content. / CRUD cho noi dung trang chu. Quan ly noi dung website cong khai cua benh vien. | P0 | IMPLEMENTED |
| F-040 | **News Article Management** | CRUD for news articles published on the public site. / CRUD cho bai viet tin tuc tren trang cong khai. | P0 | IMPLEMENTED |
| F-041 | **Audit Log Viewer** | View immutable audit logs. Filter by action type, actor, date range. For ADMIN and ACCOUNTANT only. / Xem nhat ky kiem toan bat bien. Loc theo loai hanh dong, tac tu, khoang ngay. Chi danh cho ADMIN va ACCOUNTANT. | P0 | IMPLEMENTED |
| F-042 | **System Monitoring** | Server health, API metrics, and system status dashboard. For ADMIN only. / Dashboard suc khoe may chu, do lot API, va trang thai he thong. Chi danh cho ADMIN. | P1 | IMPLEMENTED |
| F-043 | **System Statistics Dashboard** | Aggregate system usage stats (appointments, patients, etc.). For ADMIN only. / Thong ke su dung he thong tong hop. Chi danh cho ADMIN. | P1 | IMPLEMENTED |

## Tinh Nang Tuong Lai (Planned / Not Yet Implemented)

| ID | Ten tinh nang | Mo ta | Priority | Status |
|----|--------------|-------|----------|--------|
| F-044 | **Patient Self-Cancel / Reschedule** | Allow patients to cancel or reschedule their own appointments via portal. / Cho phep benh nhan tu huy hoac dat lai lich hen qua cong thong tin. | P1 | PLANNED |
| F-045 | **Patient Message Compose/Send** | Allow patients to send and reply to messages in the portal. / Cho phep benh nhan gui va tra loi tin nhan trong cong thong tin. | P2 | PLANNED |
| F-046 | **External Payment Gateway** | Integration with VNPay, Momo, or other Vietnamese payment gateways. / Tich hop voi VNPay, Momo, hoac cong thanh toan Viet Nam khac. | P2 | PLANNED |
| F-047 | **Real-time Room Board** | Live display of room status for nurse workflow beyond queue assign-room. / Hien thi trang thai phong thoi gian thuc cho dieu duong. | P2 | PLANNED |
| F-048 | **Drug-Allergy Interaction Check** | Clinical decision support for drug-allergy interaction detection at prescription time. / Kiem tra tuong tac thuoc-di ung khi ke don. | P2 | PLANNED |
| F-049 | **AI Chatbot Enhancement** | Upgrade to LLM-powered chatbot for natural language patient support. / Nang cap chatbot len LLM de ho tro benh nhan bang ngon ngu tu nhien. | P3 | PLANNED (removed from current scope) |
| F-050 | **Inventory Auto-Reorder** | Automatic purchase order generation when stock falls below threshold. / Tu dong tao don dat hang khi ton kho duoi nguong. | P3 | PLANNED |
