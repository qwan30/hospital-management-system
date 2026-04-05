Hospital Management System  **Tài liệu 3: Project Plan & Roadmap**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 3**

**Project Plan & Roadmap**

*Kế hoạch phát triển · Timeline · Milestones · Rủi ro · Phân công*

Phiên bản: 1.0  |  Tổng thời gian: ~13 tuần  |  2025


# **1. Tổng Quan Dự Án**
## **1.1 Thông Tin Chung**

|**Tên dự án**|Hospital Management System (HMS)|
| :- | :- |
|**Mô tả**|Hệ thống quản lý bệnh viện tích hợp AI đặt lịch, email automation, chatbot tư vấn|
|**Tech Stack**|React 18 + TypeScript | Java Spring Boot 3 | PostgreSQL 15 | Docker|
|**AI Services**|Claude API (phân tích triệu chứng + chatbot) | Gmail API OAuth2 (email)|
|**Tổng thời gian**|~13 tuần (6 Phases)|
|**Số Phases**|6 phases, mỗi phase có deliverable rõ ràng|
|**Deploy target**|Local / Docker Compose (demo)|
|**Tài liệu kèm theo**|SRS v1.0 | Technical Design Document v1.0 | Project Plan v1.0|

## **1.2 Mục Tiêu Từng Phase**

|**Phase**|**Tên**|**Thời gian**|**Mục tiêu chính**|
| :- | :- | :- | :- |
|**1**|**Foundation**|2 tuần|Docker setup, Auth JWT, CRUD cơ bản, DB schema, Role-based access|
|**2**|**Booking + AI**|3 tuần|Form đặt lịch public, tích hợp Claude AI phân tích triệu chứng, Gmail xác nhận|
|**3**|**Staff Dashboards**|2 tuần|Dashboard Bác sĩ + Y tá, check-in, hàng chờ real-time, quản lý phòng khám|
|**4**|**Medical Records**|2 tuần|Bệnh án, đơn thuốc PDF, lịch tái khám, email gửi kết quả, cron job nhắc lịch|
|**5**|**Accounting + Admin**|2 tuần|Hóa đơn, báo cáo tài chính, cấu hình giá, Admin dashboard & quản lý nhân sự|
|**6**|**Chatbot + Polish**|2 tuần|Chatbot AI real-time DB query, UI/UX polish, testing E2E, API docs, README|


# **2. Chi Tiết Từng Phase**
## **Phase 1 — Foundation  (Tuần 1–2)**
Mục tiêu: Dựng toàn bộ skeleton dự án, hệ thống auth, CRUD cơ bản và kết nối các service. Cuối phase này có thể đăng nhập và truy cập dashboard rỗng theo role.

|**Phase 1**|**Foundation**|**2 tuần**|||
| :- | :- | :- | :- | :- |
|**ID**|**Task**|**Phụ trách**|**Ngày**|**Ưu tiên**|
|1\.1|Docker Compose setup (PostgreSQL 15 + Spring Boot + React + Nginx)|DevOps / Lead|2|**Cao**|
|1\.2|Maven multi-module project structure (api, core, shared)|Backend|1|**Cao**|
|1\.3|Flyway migration V1: tạo toàn bộ schema (10 bảng)|Backend|1|**Cao**|
|1\.4|Entity classes + Repository (JPA) cho tất cả bảng|Backend|2|**Cao**|
|1\.5|Spring Security + JWT: login, refresh token, logout|Backend|2|**Cao**|
|1\.6|Role-based access control (RBAC): DOCTOR/NURSE/ACCOUNTANT/ADMIN|Backend|1|**Cao**|
|1\.7|CRUD API: departments (GET list, GET detail, POST, PUT, DELETE)|Backend|1|**Trung bình**|
|1\.8|CRUD API: users/staff (GET, POST, PUT, soft-delete)|Backend|1|**Trung bình**|
|1\.9|CRUD API: time\_slots (GET by doctor+date, POST generate, DELETE)|Backend|1|**Trung bình**|
|1\.10|Seed data: 3 khoa, 6 bác sĩ, 2 y tá, 1 kế toán, 1 admin, slots 2 tuần|Backend|1|**Trung bình**|
|1\.11|Vite + React + TypeScript project scaffold, Tailwind setup|Frontend|1|**Cao**|
|1\.12|Axios instance + interceptor JWT (auto-attach + auto-refresh)|Frontend|1|**Cao**|
|1\.13|Zustand auth store (login, logout, user info, role)|Frontend|1|**Cao**|
|1\.14|Protected Routes: redirect về /login nếu chưa auth, guard theo role|Frontend|1|**Cao**|
|1\.15|Trang Login staff (form, call API, lưu token)|Frontend|1|**Cao**|
|1\.16|Layout shell dashboard (sidebar + header + content area) theo role|Frontend|1|**Trung bình**|
|1\.17|OpenAPI / Springdoc setup, swagger-ui accessible tại /swagger-ui|Backend|0\.5|**Thấp**|
|1\.18|README.md: hướng dẫn chạy local (docker-compose up)|Lead|0\.5|**Thấp**|

Deliverable Phase 1: Docker Compose chạy được, staff đăng nhập thành công, thấy dashboard layout trống theo role, Swagger UI hiển thị đầy đủ API.


## **Phase 2 — Booking Engine + AI  (Tuần 3–5)**
Mục tiêu: Core feature của toàn bộ hệ thống. Người dùng ngoài internet có thể truy cập trang chủ, xem khoa/bác sĩ, đặt lịch khám với AI phân tích triệu chứng, nhận email xác nhận.

|**Phase 2**|**Booking Engine + AI**|**3 tuần**|||
| :- | :- | :- | :- | :- |
|**ID**|**Task**|**Phụ trách**|**Ngày**|**Ưu tiên**|
|2\.1|Trang chủ public: banner, thông tin bệnh viện, danh sách khoa, bác sĩ nổi bật|Frontend|2|**Cao**|
|2\.2|Trang chi tiết khoa: mô tả, ảnh, danh sách bác sĩ thuộc khoa|Frontend|1|**Cao**|
|2\.3|Trang hồ sơ bác sĩ: ảnh, thông tin, lịch làm việc trong tuần|Frontend|1|**Trung bình**|
|2\.4|Backend API: GET /departments, GET /departments/{id}, GET /doctors, GET /doctors/{id}|Backend|1|**Cao**|
|2\.5|Backend API: GET /doctors/{id}/slots?date=... (trả về slots AVAILABLE)|Backend|1|**Cao**|
|2\.6|Claude API integration: AIService gọi Claude, parse response trả về { durationMinutes, complexity, explanation }|Backend|2|**Cao**|
|2\.7|Backend API: POST /ai/analyze-symptoms (validate input, gọi AIService, cache kết quả)|Backend|1|**Cao**|
|2\.8|Booking Engine: AppointmentService với @Transactional + PESSIMISTIC\_WRITE lock cho slot blocking|Backend|3|**Cao**|
|2\.9|Backend API: POST /appointments (tạo lịch hẹn, block slots, sinh confirmation\_code)|Backend|1|**Cao**|
|2\.10|Gmail OAuth2 setup: GmailService, lưu refresh token vào DB, auto-refresh|Backend|2|**Cao**|
|2\.11|Email template HTML: xác nhận đặt lịch (Thymeleaf, responsive)|Backend|1|**Cao**|
|2\.12|Gửi email async sau khi tạo appointment thành công|Backend|1|**Cao**|
|2\.13|Booking Form Step 1: chọn khoa + bác sĩ|Frontend|1|**Cao**|
|2\.14|Booking Form Step 2: nhập triệu chứng + gọi AI + hiển thị ước tính thời gian|Frontend|2|**Cao**|
|2\.15|Booking Form Step 3: SlotPicker — calendar hiển thị slots rảnh, ẩn slots đã đặt|Frontend|2|**Cao**|
|2\.16|Booking Form Step 4: PatientForm — nhập thông tin bệnh nhân đầy đủ|Frontend|2|**Cao**|
|2\.17|Toggle "Đặt cho người nhà" + FamilyMemberForm (quan hệ, CCCD, ngày sinh...)|Frontend|1|**Cao**|
|2\.18|Preview xác nhận + Submit → gọi POST /appointments → hiển thị trang thành công|Frontend|1|**Cao**|
|2\.19|Xử lý 409 Conflict (slot bị lấy mất): thông báo chọn slot khác, refresh calendar|Frontend|1|**Trung bình**|
|2\.20|Form validation (React Hook Form + Zod): CCCD 12 số, email hợp lệ, ngày sinh, v.v.|Frontend|1|**Trung bình**|

Deliverable Phase 2: Người dùng ngoài vào được trang chủ, đặt lịch thành công, nhận email xác nhận tự động. AI phân tích triệu chứng và gợi ý thời gian khám.


## **Phase 3 — Staff Dashboards  (Tuần 6–7)**
Mục tiêu: Bác sĩ quản lý được lịch cá nhân. Y tá check-in bệnh nhân và quản lý hàng chờ. Thông tin cập nhật real-time trong ca làm việc.

|**Phase 3**|**Staff Dashboards**|**2 tuần**|||
| :- | :- | :- | :- | :- |
|**ID**|**Task**|**Phụ trách**|**Ngày**|**Ưu tiên**|
|3\.1|Backend API: GET /me/schedule?date=&week= (lịch bác sĩ theo ngày/tuần)|Backend|1|**Cao**|
|3\.2|Backend API: GET /appointments/{id} chi tiết + thông tin bệnh nhân|Backend|1|**Cao**|
|3\.3|Backend API: PUT /appointments/{id}/status (PENDING→CHECKED\_IN→IN\_PROGRESS→DONE)|Backend|1|**Cao**|
|3\.4|Doctor Dashboard: summary cards (hôm nay, hoàn thành, đang chờ)|Frontend|1|**Cao**|
|3\.5|Doctor Calendar (FullCalendar Day/Week view): hiển thị appointments theo slot|Frontend|2|**Cao**|
|3\.6|Doctor: click vào lịch → modal chi tiết bệnh nhân + triệu chứng + ước tính AI|Frontend|1|**Cao**|
|3\.7|Doctor: nút "Bắt đầu khám" → chuyển trạng thái IN\_PROGRESS|Frontend|0\.5|**Trung bình**|
|3\.8|Backend API: POST /appointments/{id}/checkin (ghi nhận check-in time)|Backend|1|**Cao**|
|3\.9|Backend API: GET /queue/today?doctorId= (hàng chờ theo bác sĩ/phòng)|Backend|1|**Cao**|
|3\.10|Nurse Dashboard: danh sách appointments hôm nay, search theo tên/CCCD/mã|Frontend|1|**Cao**|
|3\.11|Nurse: nút Check-in bệnh nhân → gọi API + cập nhật UI tức thì|Frontend|1|**Cao**|
|3\.12|Nurse: Màn hình hàng chờ — danh sách đã check-in, số thứ tự, thời gian chờ|Frontend|1|**Cao**|
|3\.13|Nurse: "Gọi vào khám" → update trạng thái + thông báo hiển thị dashboard bác sĩ|Frontend|1|**Trung bình**|
|3\.14|Nurse: nhập vital signs (HA, nhiệt độ, cân nặng, chiều cao) trước khi gọi vào|Frontend|1|**Trung bình**|
|3\.15|Backend API: GET /rooms/status + PUT /rooms/{id}/status|Backend|0\.5|**Thấp**|
|3\.16|Real-time polling (interval 30s) cho hàng chờ và trạng thái phòng|Frontend|1|**Trung bình**|

Deliverable Phase 3: Bác sĩ thấy lịch hôm nay + tuần trên calendar, bắt đầu khám. Y tá check-in bệnh nhân và quản lý hàng chờ theo thời gian thực.


## **Phase 4 — Medical Records & Email Automation  (Tuần 8–9)**
Mục tiêu: Bác sĩ hoàn thành vòng tròn khám bệnh: nhập kết quả → kê đơn → xuất PDF → gửi email cho bệnh nhân → đặt tái khám. Cron job nhắc lịch tự động.

|**Phase 4**|**Medical Records + Email**|**2 tuần**|||
| :- | :- | :- | :- | :- |
|**ID**|**Task**|**Phụ trách**|**Ngày**|**Ưu tiên**|
|4\.1|Backend API: POST /medical-records (tạo bệnh án kèm prescription\_items)|Backend|1|**Cao**|
|4\.2|Backend API: GET /medical-records/{appointmentId} (xem bệnh án của lịch hẹn)|Backend|0\.5|**Cao**|
|4\.3|Backend API: GET /patients/{cccd}/history (toàn bộ lịch sử khám bệnh)|Backend|1|**Cao**|
|4\.4|iText 7: PdfGeneratorService sinh file PDF đơn thuốc (logo, tên thuốc, liều, hướng dẫn)|Backend|2|**Cao**|
|4\.5|Lưu PDF lên local storage (src/main/resources/uploads/) + lưu pdf\_url vào DB|Backend|1|**Cao**|
|4\.6|Email template HTML: kết quả khám + đính kèm file PDF đơn thuốc|Backend|1|**Cao**|
|4\.7|GmailService: gửi email với attachment PDF sau khi bác sĩ xác nhận bệnh án|Backend|1|**Cao**|
|4\.8|Backend API: POST /appointments/{id}/follow-up (tạo slot tái khám, block slot)|Backend|1|**Cao**|
|4\.9|Email template HTML: thông báo lịch tái khám (ngày, giờ, bác sĩ, khoa)|Backend|0\.5|**Cao**|
|4\.10|Spring @Scheduled: FollowUpReminderJob — chạy 8:00 sáng mỗi ngày, query follow\_up\_date = tomorrow AND reminder\_sent = false, gửi email, update reminder\_sent = true|Backend|2|**Cao**|
|4\.11|Index DB: (follow\_up\_date, reminder\_sent) cho cron job query nhanh|Backend|0\.5|**Trung bình**|
|4\.12|Doctor UI: form nhập kết quả khám — chẩn đoán, ghi chú lâm sàng, dấu hiệu sinh tồn|Frontend|1|**Cao**|
|4\.13|Doctor UI: PrescriptionForm — thêm nhiều thuốc (tên, liều, tần suất, số ngày, ghi chú)|Frontend|1|**Cao**|
|4\.14|Doctor UI: Preview PDF đơn thuốc trước khi xác nhận|Frontend|1|**Trung bình**|
|4\.15|Doctor UI: modal tạo lịch tái khám — chọn ngày, chọn slot còn trống|Frontend|1|**Cao**|
|4\.16|Doctor UI: màn hình tìm kiếm + xem lịch sử khám bệnh nhân theo CCCD|Frontend|1|**Trung bình**|

Deliverable Phase 4: Bác sĩ hoàn tất khám, bệnh nhân nhận email kèm PDF đơn thuốc và lịch tái khám. Cron job chạy đúng 8h sáng gửi nhắc lịch ngày hôm sau.


## **Phase 5 — Accounting & Admin  (Tuần 10–11)**
Mục tiêu: Module tài chính đầy đủ cho kế toán. Admin quản lý toàn bộ nhân sự, khoa, cấu hình hệ thống và xem thống kê tổng quan.

|**Phase 5**|**Accounting + Admin**|**2 tuần**|||
| :- | :- | :- | :- | :- |
|**ID**|**Task**|**Phụ trách**|**Ngày**|**Ưu tiên**|
|5\.1|Backend: auto-tạo Invoice record sau khi appointment DONE (trigger từ status update)|Backend|1|**Cao**|
|5\.2|Backend API: GET /invoices (filter theo status, date, department; pagination)|Backend|1|**Cao**|
|5\.3|Backend API: PUT /invoices/{id}/pay (ghi nhận thanh toán, update status=PAID)|Backend|0\.5|**Cao**|
|5\.4|Backend API: GET /reports/revenue?from=&to=&groupBy=day|month|Backend|1|**Cao**|
|5\.5|Backend API: GET /service-pricing + POST + PUT (quản lý giá theo khoa)|Backend|1|**Trung bình**|
|5\.6|iText7: xuất báo cáo tài chính PDF + endpoint export CSV/Excel|Backend|1|**Trung bình**|
|5\.7|Accountant UI: danh sách hóa đơn, filter, phân trang|Frontend|1|**Cao**|
|5\.8|Accountant UI: modal ghi nhận thanh toán (tiền mặt/chuyển khoản, số tiền, ghi chú)|Frontend|1|**Cao**|
|5\.9|Accountant UI: Recharts biểu đồ doanh thu (line chart ngày, bar chart tháng)|Frontend|1|**Cao**|
|5\.10|Accountant UI: báo cáo chi tiết với bộ lọc + nút xuất PDF/Excel|Frontend|1|**Trung bình**|
|5\.11|Accountant UI: trang quản lý giá dịch vụ (CRUD, effective date)|Frontend|1|**Trung bình**|
|5\.12|Admin UI: trang quản lý nhân sự — danh sách, thêm/sửa/vô hiệu hóa|Frontend|1|**Cao**|
|5\.13|Admin UI: trang quản lý khoa — thêm/sửa/xóa, gán bác sĩ vào khoa|Frontend|1|**Cao**|
|5\.14|Admin UI: cấu hình lịch làm việc bác sĩ (ngày trong tuần, giờ bắt đầu/kết thúc, nghỉ lễ)|Frontend|2|**Cao**|
|5\.15|Admin: nút "Sinh slots" tự động tạo time\_slots từ cấu hình lịch làm việc|Frontend+Backend|1|**Cao**|
|5\.16|Admin UI: dashboard tổng quan — summary cards + biểu đồ + bảng top bác sĩ/khoa|Frontend|1|**Cao**|
|5\.17|Admin UI: audit log — nhật ký thao tác quan trọng (đăng nhập, thay đổi dữ liệu)|Frontend+Backend|1|**Thấp**|
|5\.18|Admin UI: quản lý nội dung trang chủ (banner, tin tức, thông báo)|Frontend+Backend|1|**Thấp**|

Deliverable Phase 5: Kế toán quản lý hóa đơn và xuất được báo cáo tài chính. Admin quản lý toàn bộ nhân sự, cấu hình lịch bác sĩ, xem dashboard thống kê.


## **Phase 6 — Chatbot & Polish  (Tuần 12–13)**
Mục tiêu: Hoàn thiện chatbot AI real-time, nâng cấp UI/UX, chạy end-to-end testing toàn bộ luồng, hoàn thiện tài liệu.

|**Phase 6**|**Chatbot + Polish**|**2 tuần**|||
| :- | :- | :- | :- | :- |
|**ID**|**Task**|**Phụ trách**|**Ngày**|**Ưu tiên**|
|6\.1|Backend API: POST /chatbot/message — nhận câu hỏi, query DB, build context, gọi Claude|Backend|2|**Cao**|
|6\.2|ChatbotService: định tuyến câu hỏi (slots rảnh → query DB → augment prompt → Claude API)|Backend|2|**Cao**|
|6\.3|Query functions: getAvailableSlotsByDate(), getDoctorsByDepartment(), getOpenSlotsByDoctor()|Backend|1|**Cao**|
|6\.4|Frontend: ChatbotWidget floating (góc phải, toggle open/close, conversation UI)|Frontend|1|**Cao**|
|6\.5|Frontend: Streaming response display (typing effect hoặc chunk streaming)|Frontend|1|**Trung bình**|
|6\.6|Frontend: Quick-reply buttons ("Xem bác sĩ rảnh hôm nay", "Đặt lịch ngay")|Frontend|0\.5|**Trung bình**|
|6\.7|UI/UX polish trang chủ: responsive mobile (320px–768px), loading states, skeleton|Frontend|2|**Cao**|
|6\.8|UI/UX polish booking flow: progress bar 4 bước, better error states, back navigation|Frontend|1|**Cao**|
|6\.9|UI/UX polish dashboards: empty states, loading spinners, toast notifications|Frontend|1|**Trung bình**|
|6\.10|E2E testing: luồng đặt lịch đầy đủ (chọn bác sĩ → AI → slot → form → email)|QA|2|**Cao**|
|6\.11|E2E testing: luồng bác sĩ (đăng nhập → xem lịch → khám → kê đơn → gửi email)|QA|1|**Cao**|
|6\.12|E2E testing: cron job nhắc lịch (set follow\_up\_date = tomorrow, chạy job, kiểm tra email)|QA|1|**Trung bình**|
|6\.13|API docs cuối cùng: Swagger/OpenAPI đầy đủ mô tả, example request/response|Backend|1|**Trung bình**|
|6\.14|README hoàn chỉnh: setup guide, env variables, seed data, demo accounts|Lead|1|**Trung bình**|
|6\.15|Bug fix & stabilization từ kết quả testing|Cả team|2|**Cao**|

Deliverable Phase 6: Chatbot hoạt động trả lời câu hỏi real-time về bác sĩ/lịch rảnh. Toàn bộ hệ thống được test end-to-end. README đầy đủ để bàn giao demo.


# **3. Milestones & Deliverables**

|**Milestone**|**Mô tả**|**Cuối tuần**|**Deliverable chính**|
| :- | :- | :- | :- |
|**M1 — Skeleton**|Toàn bộ infra, auth, CRUD cơ bản sẵn sàng|Tuần 2|Docker Compose chạy, staff login, Swagger UI|
|**M2 — Book & AI**|Người dùng đặt lịch được, AI phân tích, email tự động|Tuần 5|Form đặt lịch hoạt động end-to-end, nhận email xác nhận|
|**M3 — Operations**|Bác sĩ + Y tá vận hành được trong ngày làm việc|Tuần 7|Calendar bác sĩ, check-in, hàng chờ real-time|
|**M4 — Clinical**|Vòng tròn khám bệnh hoàn chỉnh, email kết quả|Tuần 9|PDF đơn thuốc gửi mail, cron job nhắc lịch hoạt động|
|**M5 — Finance**|Kế toán & Admin quản lý đầy đủ|Tuần 11|Module hóa đơn, báo cáo, admin dashboard hoàn chỉnh|
|**M6 — Launch**|Sản phẩm hoàn thiện, tested, sẵn sàng demo|Tuần 13|Chatbot AI, E2E tested, README đầy đủ, toàn bộ tài liệu|


# **4. Timeline Tổng Thể (Gantt View)**

|**Phase / Tuần**|**T1**|**T2**|**T3**|**T4**|**T5**|**T6**|**T7**|**T8**|**T9**|**T10**|**T11**|**T12–13**|
| :- | :- | :- | :- | :- | :- | :- | :- | :- | :- | :- | :- | :- |
|**P1 Foundation**|**▓**|**▓**|||||||||||
|**P2 Booking+AI**|||**▓**|**▓**|**▓**||||||||
|**P3 Dashboards**||||||**▓**|**▓**||||||
|**P4 Medical Rec.**||||||||**▓**|**▓**||||
|**P5 Finance+Admin**||||||||||**▓**|**▓**||
|**P6 Chatbot+Polish**||||||||||||**▓**|

Tổng: 13 tuần làm việc. Các phase có thể chạy song song (FE + BE) trong cùng một phase nếu team đủ người.


# **5. Phân Công Công Việc (Đề Xuất)**
Đề xuất cho team 3–4 người. Có thể điều chỉnh theo số lượng thực tế.

|**Vai trò**|**Phụ trách chính**|**Chi tiết công việc**|
| :- | :- | :- |
|**Backend Lead**|Spring Boot + DB + AI|Auth/JWT, Booking Engine, AI integration, Gmail Service, PDF generation, Cron job, API design|
|**Frontend Lead**|React + UX|Public pages, Booking flow, Dashboards (Doctor/Nurse/Accountant/Admin), Chatbot widget, Calendar|
|**Full-stack Dev**|Feature dev|Hỗ trợ cả FE + BE theo từng phase, tập trung vào Medical Records, Invoices, Reports|
|**DevOps / QA**|Infra + Testing|Docker Compose setup, DB migrations, E2E testing, API docs, README, môi trường local ổn định|


# **6. Phân Tích Rủi Ro & Biện Pháp Giảm Thiểu**

|**Rủi ro**|**Xác suất**|**Mức độ ảnh hưởng**|**Biện pháp giảm thiểu**|
| :- | :- | :- | :- |
|Race condition double-booking: 2 người đặt cùng slot cùng lúc|**Trung bình**|Cao — bệnh nhân xung đột lịch|Pessimistic locking (@Lock PESSIMISTIC\_WRITE) trong AppointmentService @Transactional. Test với JMeter concurrent requests.|
|Gmail OAuth2 refresh token hết hạn hoặc bị thu hồi|**Thấp**|Cao — không gửi được email|Lưu refresh token vào DB, bắt lỗi 401 từ Gmail API, log cảnh báo và gửi alert admin. Có thể fallback sang SMTP đơn giản.|
|Claude API timeout hoặc trả về kết quả không parse được|**Trung bình**|Trung bình — AI không phân tích được|Đặt timeout 15s, try-catch + retry 1 lần. Nếu fail, trả về duration mặc định 30 phút và cho user biết AI không khả dụng.|
|iText7 sinh PDF lỗi font (tiếng Việt bị vỡ)|**Cao**|Trung bình — PDF không đọc được|Nhúng font Noto Sans Vietnamese vào file JAR, test ngay đầu Phase 4. Dùng BaseFont.IDENTITY\_H encoding.|
|Scope creep — thêm yêu cầu mới giữa chừng|**Cao**|Trung bình — trễ timeline|Đóng băng scope sau Phase 1. Yêu cầu mới ghi vào backlog, chỉ xem xét sau khi xong Phase 6.|
|Hiệu năng calendar load chậm khi có nhiều slots|**Trung bình**|Thấp — UX kém nhưng không block|Chỉ query slots trong khoảng ±2 tuần, pagination cho list view, index DB trên (doctor\_id, start\_time, status).|
|Dữ liệu bệnh nhân nhạy cảm (CCCD, bệnh án) bị lộ|**Thấp**|Rất cao — vi phạm pháp luật|HTTPS bắt buộc, CCCD encrypt at rest (AES-256), audit log mọi truy cập bệnh án, không log PII vào console/file.|


# **7. Definition of Done (DoD)**
Một task/feature được coi là HOÀN THÀNH khi đáp ứng đầy đủ các tiêu chí sau:

## **7.1 Backend**
- API endpoint trả đúng HTTP status code và response schema đã định nghĩa.
- Có validation đầu vào (Bean Validation hoặc manual check), trả lỗi 400 với message rõ ràng.
- Phân quyền đúng (403 nếu role không được phép).
- Không có lỗi trong log khi chạy happy path và edge cases cơ bản.
- Flyway migration không conflict với migration trước.
- Swagger UI hiển thị endpoint mới với đầy đủ mô tả.
## **7.2 Frontend**
- Component render đúng trên Chrome, Firefox (desktop) và mobile 375px.
- Loading state và error state được xử lý (không để màn hình trắng).
- Form validation hiển thị thông báo lỗi cụ thể trước khi submit.
- Không có lỗi TypeScript (strict mode).
- Không có console error khi sử dụng tính năng.
## **7.3 Integration**
- Luồng chạy end-to-end không có lỗi trên môi trường docker-compose local.
- Email gửi được và nội dung đúng (kiểm tra bằng Gmail test account).
- Không có N+1 query hoặc slow query vượt 1 giây cho các operation thường gặp.


# **8. Environment Variables Cần Cấu Hình**

|**Biến môi trường**|**Service**|**Mô tả**|
| :- | :- | :- |
|SPRING\_DATASOURCE\_URL|Backend|JDBC URL đến PostgreSQL (docker service name)|
|SPRING\_DATASOURCE\_USERNAME|Backend|DB username|
|SPRING\_DATASOURCE\_PASSWORD|Backend|DB password (không commit lên Git)|
|JWT\_SECRET|Backend|Secret key ký JWT (min 256-bit random string)|
|JWT\_EXPIRATION\_MS|Backend|Access token TTL (default: 900000 = 15 phút)|
|ANTHROPIC\_API\_KEY|Backend|Claude API key từ console.anthropic.com|
|GMAIL\_CLIENT\_ID|Backend|Google OAuth2 Client ID|
|GMAIL\_CLIENT\_SECRET|Backend|Google OAuth2 Client Secret|
|GMAIL\_REFRESH\_TOKEN|Backend|Refresh token sau bước authorization|
|GMAIL\_SENDER\_EMAIL|Backend|Email gửi đi (phải khớp với OAuth2 account)|
|HOSPITAL\_NAME|Backend|Tên bệnh viện (xuất hiện trong email, PDF)|
|HOSPITAL\_ADDRESS|Backend|Địa chỉ bệnh viện|
|VITE\_API\_BASE\_URL|Frontend|URL backend API (http://localhost:8080/api/v1)|

Hospital Management System — Project Plan v1.0
