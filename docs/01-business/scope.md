# Pham Vi Du An (Project Scope)

> Tai lieu nay xac dinh pham vi cua he thong quan ly benh vien (HMS). Status: Release Candidate. Cap nhat lan cuoi: 2026-06-14.

## 1. Tong Quan (Overview)

HMS la mot he thong hoach dinh nguon luc doanh nghiep (ERP) danh cho benh vien, hoat dong trong boi canh benh vien Viet Nam. He thong ho tro 6 vai tro nguoi dung, 7 quy trinh lam sang, bao ve PHI theo tieu chuan HIPAA, va duoc trien khai bang Docker.

**Release label:** Release Candidate
**Architecture:** Modular monolith (DDD), Java 17 + Spring Boot + Next.js 16 + PostgreSQL 15

## 2. Trong Pham Vi (In Scope)

### 2.1 Clinical Workflows (7 quy trinh lam sang)

| # | Workflow | Modules chinh |
|:-:|----------|---------------|
| 1 | **Public Discovery & Booking** | Home page content, department/doctor directory, slot availability, appointment booking, symptom intake, booking confirmation |
| 2 | **Appointment & Queue Management** | Check-in, queue board (call/skip/assign-room/start-consultation/complete), status transitions |
| 3 | **Clinical Documentation** | Medical record creation, diagnosis, clinical notes, prescription PDF generation/preview/download, follow-up management |
| 4 | **Vital Signs & Lab Results** | Capture and read vital signs (BP, temperature, etc.), lab result management |
| 5 | **Pharmacy & Inventory** | Inventory items, lots, movements, dispense tracking, low-stock/expiry alerts |
| 6 | **Billing & Revenue** | Invoice management, payment recording, voiding, pricing management, daily/monthly revenue reports |
| 7 | **Patient Portal** | Claim access, login, overview dashboard, appointment history, lab result viewing, message read, profile editing |

### 2.2 Role-Based Access Control (RBAC)

- 7 user roles: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT
- 36 granular backend permissions
- Frontend route guards matching role policies
- JWT authentication with refresh token (HTTP-only cookie)
- Rate limiting on public endpoints (30/min default)

### 2.3 PHI Protection (Protected Health Information)

- AES-256-GCM encryption for sensitive patient data (CCCD)
- SHA-256 hashing for CCCD search/duplicate detection
- BCrypt password hashing
- Spring Security configuration with CSP headers
- Stateless session management
- Audit logging for all domain actions

### 2.4 Infrastructure & Deployment

- Docker Compose for local and production deployment
- PostgreSQL 15 with pgvector
- GitHub Actions CI/CD pipeline
- GitHub Container Registry (GHCR) for image storage
- Observability stack: Prometheus, Grafana, Loki, Tempo, OpenTelemetry
- Nginx reverse proxy configuration
- Multi-module Maven build

### 2.5 User Authentication

- **Staff authentication:** Login via email/password, access token + refresh cookie, logout
- **Patient authentication:** Claim flow (CCCD-based), login, refresh, logout
- Public chatbot (rule-based, grounded in departments/doctors/slots - NO AI/LLM)

### 2.6 Languages

- Giao dien tieng Viet (Vietnamese UI)
- Tai lieu ky thuat tieng Anh (Technical documentation in English)

## 3. Ngoai Pham Vi (Out of Scope)

| Muc | Ly do |
|-----|-------|
| **External payment gateway integration** | Not implemented; payment recording is manual (cash/transfer recorded in system) |
| **Patient self-cancel / reschedule appointments** | APIs not implemented; cancel is staff-only |
| **Drug-allergy interaction checking** | No clinical decision support rules implemented |
| **Real-time room board display** | Room assignment exists within queue workflow; no separate live board |
| **AI features (chatbot LLM, diagnostic support, image analysis)** | Removed from product; chatbot is rule-based only |
| **Bulk SMS / email marketing** | Gmail hooks exist but are for transactional only (disabled by default) |
| **Billing integration with Vietnamese tax authorities (eHoadon)** | No tax authority integration |
| **Patient video consultation / telemedicine** | No telemedicine features |
| **Inventory auto-reordering** | Alerts exist but no automated purchasing |
| **Multi-language UI (English interface)** | Vietnamese UI only at this stage |
| **Mobile native apps** | Responsive web design covers mobile use cases |
| **Third-party HIS/EMR integration** | Standalone system; no integration adapters for other hospital systems |
| **Biometric authentication** | Password-based authentication only |

## 4. Can Nhin Tuong Lai (Future Considerations)

Cac muc sau duoc ghi nhan cho cac phien ban tuong lai nhung chua thuoc ke hoach hien tai:

- Tich hop cong thanh toan (VNPay, Momo)
- Cho phep benh nhan tu huy / dat lai lich hen
- Kiem tra tuong tac thuoc-di ung
- Bang dieu phoi phong kham thoi gian thuc (real-time room board)
- Mo rong AI: chatbot thong minh, ho tro chan doan
- Tich hop hoa don dien tu (eHoadon)
- Tich hop voi he thong bao hiem y te (BHYT)
- Xuat bao cao thong ke nang cao (Power BI, metabase)
- Goi dien thoai / nhan tin tu dong (twilio, sms)
- Kham benh tu xa (telemedicine)
- Ung dung dien thoai di dong (React Native / Flutter)
- Tieng Anh cho giao dien benh nhan

## 5. Gioi Han Ky Thuat (Technical Constraints)

- Chatbot lai quy tac, khong phai AI. Chi tra loi dua tren co so du lieu noi dung co hien tai.
- Patient portal messages la read-only. Khong co API gui/tra loi tin nhan.
- Room management chi co qua admin API. Khong co nurse room workflow rieng.
- Refresh token duoc tra ve qua HTTP-only cookie cho ca staff va patient auth.
- Prescription PDF duoc tao bang Apache PDFBox.
- Schedule slots la 30-phut, duoc tao tu schedule template.
