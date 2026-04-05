Hospital Management System  **Tài liệu 2: Technical Design Document**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 2**

**Technical Design Document**

*Kiến trúc hệ thống · Database Schema · API Design · Tech Stack*

Phiên bản: 1.0  |  Stack: React + Java Spring Boot  |  2025


# **1. Tech Stack Chi Tiết**
## **1.1 Frontend**

|**Thư viện / Công cụ**|**Phiên bản**|**Mục đích sử dụng**|
| :- | :- | :- |
|React|18\.x|Core UI framework, component-based architecture|
|TypeScript|5\.x|Type safety, giảm lỗi runtime|
|Vite|5\.x|Build tool, HMR nhanh hơn CRA|
|Tailwind CSS|3\.x|Utility-first CSS, responsive dễ dàng|
|TanStack Query (React Query)|5\.x|Server state management, caching, refetch|
|Zustand|4\.x|Global client state (auth, UI state)|
|React Router v6|6\.x|SPA routing, protected routes theo role|
|Axios|1\.x|HTTP client, interceptor cho JWT|
|React Hook Form|7\.x|Form management, validation|
|Zod|3\.x|Schema validation frontend|
|FullCalendar|6\.x|Lịch bác sĩ (Day/Week view)|
|Recharts|2\.x|Biểu đồ doanh thu, thống kê|
|date-fns|3\.x|Xử lý ngày tháng, timezone|

## **1.2 Backend**

|**Thư viện / Framework**|**Phiên bản**|**Mục đích sử dụng**|
| :- | :- | :- |
|Java|17 (LTS)|Ngôn ngữ lập trình chính|
|Spring Boot|3\.3.x|Core application framework|
|Spring Security|6\.x|Authentication, Authorization, RBAC|
|Spring Data JPA|3\.x|ORM, Repository pattern|
|Hibernate|6\.x|JPA implementation, query optimization|
|Spring Mail|3\.x|Gửi email qua Gmail SMTP/OAuth2|
|Spring @Scheduled|3\.x|Cron job nhắc tái khám|
|jjwt (JJWT)|0\.12.x|Tạo và xác thực JWT token|
|Lombok|1\.18.x|Giảm boilerplate code (getters, builders...)|
|MapStruct|1\.6.x|Entity ↔ DTO mapping|
|iText 7|7\.2.x|Xuất đơn thuốc dạng PDF|
|Flyway|9\.x|Database migration, version control schema|
|Google API Client Java|2\.x|Gmail OAuth2 API (gửi email)|
|Anthropic Java SDK / HTTP|latest|Gọi Claude API để phân tích triệu chứng|
|OpenAPI / Springdoc|2\.x|Tự động sinh API documentation|
|Maven|3\.9.x|Build tool, dependency management|

## **1.3 Database & Infrastructure**

|**Công nghệ**|**Phiên bản**|**Mục đích**|
| :- | :- | :- |
|PostgreSQL|15\.x|Cơ sở dữ liệu chính (relational, ACID)|
|Docker|24\.x|Containerize toàn bộ ứng dụng|
|Docker Compose|2\.x|Orchestrate: PostgreSQL + Backend + Frontend|


# **2. Kiến Trúc Hệ Thống**
## **2.1 Tổng Quan Kiến Trúc**
Hệ thống theo kiến trúc Client-Server truyền thống với API RESTful, phân tách rõ Frontend và Backend:

- Frontend: React SPA chạy trên port 3000 (dev) hoặc được serve qua Nginx.
- Backend: Spring Boot REST API chạy trên port 8080.
- Database: PostgreSQL chạy trên port 5432.
- Tất cả container được định nghĩa trong docker-compose.yml để khởi động local đơn giản.
## **2.2 Cấu Trúc Module Backend (Spring Boot)**
Backend được tổ chức theo package theo feature (không phải theo layer):

src/main/java/com/hospital/

├── auth/              # Authentication, JWT, Spring Security config

├── user/              # User, Role, permission management

├── department/        # Khoa/phòng ban

├── doctor/            # Bác sĩ, lịch làm việc

├── timeslot/          # TimeSlot CRUD + AI slot allocation logic

├── appointment/       # Đặt lịch, booking engine

├── patient/           # Thông tin bệnh nhân, người nhà

├── medicalrecord/     # Kết quả khám, đơn thuốc, PDF

├── invoice/           # Hóa đơn, thanh toán, báo cáo

├── email/             # Gmail service, email templates

├── ai/                # Claude API integration, symptom analysis

├── chatbot/           # Chatbot API queries

├── scheduler/         # Spring @Scheduled jobs

└── shared/            # Common DTOs, exceptions, utilities

## **2.3 Cấu Trúc Frontend (React)**
src/

├── pages/

│   ├── public/        # Home, Department, Doctor, Booking

│   └── dashboard/     # Doctor, Nurse, Accountant, Admin views

├── components/

│   ├── ui/            # Reusable: Button, Input, Modal, Table

│   ├── booking/       # BookingForm, SlotPicker, PatientForm

│   ├── chatbot/       # ChatbotWidget, ChatMessage

│   └── calendar/      # DoctorCalendar, SlotGrid

├── features/          # Feature-scoped logic (hooks, types, api)

├── stores/            # Zustand stores (auth, UI)

├── api/               # Axios instances, API functions

├── routes/            # Protected routes, role guards

└── utils/             # Date helpers, formatters, validators
## **2.4 Luồng Authentication**
- Staff (bác sĩ, y tá, kế toán, admin) đăng nhập qua POST /api/auth/login.
- Backend trả về accessToken (JWT, 15 phút) và refreshToken (7 ngày).
- Frontend lưu token vào memory (accessToken) và httpOnly cookie (refreshToken).
- Axios interceptor tự động attach Bearer token vào mọi request.
- Khi accessToken hết hạn, interceptor tự gọi POST /api/auth/refresh trước khi retry request gốc.
- Frontend sử dụng React Router v6 Protected Routes: kiểm tra role trước khi render trang nội bộ.


# **3. Database Schema**
## **3.1 Sơ Đồ Quan Hệ (ERD Tóm Tắt)**
Toàn bộ schema sử dụng UUID làm primary key, timestamps (created\_at, updated\_at) cho mọi bảng, và soft delete (deleted\_at, is\_active) cho các entity quan trọng.
## **3.2 Bảng Chi Tiết**
### **Bảng: departments**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK, DEFAULT gen\_random\_uuid()|Khóa chính|
|name|VARCHAR(150)|NOT NULL, UNIQUE|Tên khoa|
|description|TEXT|NULLABLE|Mô tả chi tiết khoa|
|image\_url|VARCHAR(500)|NULLABLE|Ảnh đại diện khoa|
|phone|VARCHAR(20)|NULLABLE|Số điện thoại riêng của khoa|
|is\_active|BOOLEAN|DEFAULT true|Khoa đang hoạt động hay không|
|created\_at|TIMESTAMP|DEFAULT now()|Thời điểm tạo|
|updated\_at|TIMESTAMP|DEFAULT now()|Thời điểm cập nhật gần nhất|

### **Bảng: users (Staff — Bác sĩ, Y tá, Kế toán, Admin)**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|department\_id|UUID|FK → departments.id, NULLABLE|Khoa (bác sĩ, y tá)|
|email|VARCHAR(255)|NOT NULL, UNIQUE|Email đăng nhập|
|password\_hash|VARCHAR(255)|NOT NULL|BCrypt hash|
|full\_name|VARCHAR(200)|NOT NULL|Họ và tên đầy đủ|
|phone|VARCHAR(20)|NULLABLE|Số điện thoại|
|role|VARCHAR(20)|NOT NULL (DOCTOR/NURSE/ACCOUNTANT/ADMIN)|Role trong hệ thống|
|specialty|VARCHAR(200)|NULLABLE|Chuyên môn (chỉ bác sĩ)|
|qualification|VARCHAR(200)|NULLABLE|Học vị, chức danh|
|avatar\_url|VARCHAR(500)|NULLABLE|Ảnh đại diện|
|experience\_years|INTEGER|NULLABLE|Số năm kinh nghiệm|
|is\_active|BOOLEAN|DEFAULT true|Tài khoản còn hoạt động|
|created\_at / updated\_at|TIMESTAMP|DEFAULT now()|Timestamps|

### **Bảng: time\_slots**
Lưu toàn bộ slot khám của bác sĩ. Admin cấu hình, hệ thống tự sinh slot theo lịch làm việc.

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|doctor\_id|UUID|FK → users.id, NOT NULL|Bác sĩ sở hữu slot này|
|start\_time|TIMESTAMP|NOT NULL|Giờ bắt đầu slot|
|end\_time|TIMESTAMP|NOT NULL (= start + 30min)|Giờ kết thúc slot|
|status|VARCHAR(20)|NOT NULL (AVAILABLE/BOOKED/BLOCKED/OFF)|Trạng thái slot|
|created\_at|TIMESTAMP|DEFAULT now()|Timestamps|

### **Bảng: patients**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|full\_name|VARCHAR(200)|NOT NULL|Họ và tên|
|cccd|VARCHAR(12)|NOT NULL, UNIQUE|Số căn cước công dân|
|phone|VARCHAR(20)|NOT NULL|Số điện thoại|
|email|VARCHAR(255)|NOT NULL|Email nhận xác nhận & đơn thuốc|
|date\_of\_birth|DATE|NOT NULL|Ngày sinh|
|gender|VARCHAR(10)|NOT NULL (MALE/FEMALE/OTHER)|Giới tính|
|address|TEXT|NOT NULL|Địa chỉ đầy đủ|
|occupation|VARCHAR(150)|NULLABLE|Nghề nghiệp|
|blood\_type|VARCHAR(5)|NULLABLE|Nhóm máu (A/B/AB/O ± Rh)|
|medical\_history|TEXT|NULLABLE|Tiền sử bệnh|
|drug\_allergies|TEXT|NULLABLE|Dị ứng thuốc|
|insurance\_number|VARCHAR(20)|NULLABLE|Số BHYT|
|created\_at / updated\_at|TIMESTAMP|DEFAULT now()|Timestamps|

### **Bảng: appointments**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Mã lịch hẹn|
|patient\_id|UUID|FK → patients.id, NOT NULL|Bệnh nhân đặt lịch|
|doctor\_id|UUID|FK → users.id, NOT NULL|Bác sĩ được chỉ định|
|first\_slot\_id|UUID|FK → time\_slots.id, NOT NULL|Slot đầu tiên được block|
|symptoms|TEXT|NOT NULL|Mô tả triệu chứng do người dùng nhập|
|ai\_duration\_minutes|INTEGER|NOT NULL (30/45/60/90)|Thời gian khám do AI ước tính|
|ai\_complexity|VARCHAR(20)|NULLABLE (SIMPLE/MEDIUM/COMPLEX/VERY\_COMPLEX)|Mức độ phức tạp AI|
|is\_for\_family|BOOLEAN|DEFAULT false|Đặt lịch cho người nhà|
|status|VARCHAR(20)|DEFAULT 'PENDING'|PENDING/CONFIRMED/CHECKED\_IN/IN\_PROGRESS/DONE/CANCELLED|
|confirmation\_code|VARCHAR(20)|NOT NULL, UNIQUE|Mã xác nhận gửi email|
|checked\_in\_at|TIMESTAMP|NULLABLE|Giờ bệnh nhân thực sự đến|
|reminder\_sent|BOOLEAN|DEFAULT false|Đã gửi email nhắc tái khám chưa|
|created\_at / updated\_at|TIMESTAMP|DEFAULT now()|Timestamps|

### **Bảng: family\_members**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|appointment\_id|UUID|FK → appointments.id, NOT NULL|Lịch hẹn liên quan|
|full\_name|VARCHAR(200)|NOT NULL|Họ tên người nhà|
|relationship|VARCHAR(50)|NOT NULL (PARENT/SPOUSE/CHILD/SIBLING/OTHER)|Mối quan hệ|
|cccd|VARCHAR(12)|NULLABLE|Số CCCD người nhà|
|date\_of\_birth|DATE|NULLABLE|Ngày sinh người nhà|
|gender|VARCHAR(10)|NULLABLE|Giới tính người nhà|

### **Bảng: medical\_records**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|appointment\_id|UUID|FK → appointments.id, UNIQUE|1 lịch hẹn = 1 bệnh án|
|doctor\_id|UUID|FK → users.id, NOT NULL|Bác sĩ lập bệnh án|
|diagnosis|TEXT|NOT NULL|Chẩn đoán bệnh|
|clinical\_notes|TEXT|NULLABLE|Ghi chú lâm sàng|
|vital\_signs|JSONB|NULLABLE|Dấu hiệu sinh tồn (HA, nhiệt độ, cân nặng...)|
|follow\_up\_date|DATE|NULLABLE|Ngày tái khám|
|follow\_up\_slot\_id|UUID|FK → time\_slots.id, NULLABLE|Slot tái khám đã đặt|
|pdf\_url|VARCHAR(500)|NULLABLE|Đường dẫn file PDF đơn thuốc|
|email\_sent|BOOLEAN|DEFAULT false|Đã gửi email kết quả khám chưa|
|created\_at|TIMESTAMP|DEFAULT now()|Thời điểm tạo|

### **Bảng: prescription\_items**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|record\_id|UUID|FK → medical\_records.id, NOT NULL|Bệnh án chứa đơn thuốc này|
|medicine\_name|VARCHAR(200)|NOT NULL|Tên thuốc|
|dosage|VARCHAR(100)|NOT NULL|Liều lượng (VD: 500mg)|
|frequency|VARCHAR(100)|NOT NULL|Số lần/ngày (VD: 3 lần/ngày)|
|duration\_days|INTEGER|NOT NULL|Số ngày dùng thuốc|
|instructions|TEXT|NULLABLE|Hướng dẫn sử dụng (uống sau ăn, v.v.)|
|sort\_order|INTEGER|DEFAULT 0|Thứ tự hiển thị trong đơn thuốc|

### **Bảng: invoices**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|appointment\_id|UUID|FK → appointments.id, UNIQUE|1 lịch hẹn = 1 hóa đơn|
|invoice\_number|VARCHAR(30)|NOT NULL, UNIQUE|Số hóa đơn (tự sinh, VD: INV-2025-0001)|
|base\_fee|DECIMAL(12,2)|NOT NULL|Phí khám cơ bản theo khoa|
|additional\_fees|JSONB|NULLABLE|Phụ phí dịch vụ khác (xét nghiệm, chiếu chụp...)|
|total\_amount|DECIMAL(12,2)|NOT NULL|Tổng tiền|
|status|VARCHAR(20)|DEFAULT 'PENDING'|PENDING / PAID / CANCELLED|
|payment\_method|VARCHAR(20)|NULLABLE|CASH / BANK\_TRANSFER|
|paid\_at|TIMESTAMP|NULLABLE|Thời điểm thanh toán|
|collected\_by|UUID|FK → users.id, NULLABLE|Kế toán ghi nhận thanh toán|
|created\_at / updated\_at|TIMESTAMP|DEFAULT now()|Timestamps|

### **Bảng: service\_pricing**

|**Cột**|**Kiểu dữ liệu**|**Constraint**|**Mô tả**|
| :- | :- | :- | :- |
|id|UUID|PK|Khóa chính|
|department\_id|UUID|FK → departments.id, NULLABLE|Null = áp dụng toàn viện|
|service\_name|VARCHAR(200)|NOT NULL|Tên dịch vụ (VD: Khám tổng quát)|
|price|DECIMAL(12,2)|NOT NULL|Giá dịch vụ|
|effective\_from|DATE|NOT NULL|Ngày áp dụng giá|
|effective\_to|DATE|NULLABLE|Ngày hết hiệu lực (null = hiện hành)|
|created\_by|UUID|FK → users.id|Kế toán tạo bảng giá|


# **4. API Design**
## **4.1 Convention**
- Base URL: /api/v1
- Authentication: Bearer JWT trong header Authorization (trừ các endpoint public).
- Response format chuẩn: { success, data, message, timestamp }.
- Lỗi: HTTP status code chuẩn (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict).
- Pagination: ?page=0&size=20&sort=createdAt,desc
## **4.2 Public APIs (Không cần Auth)**

|**Method**|**Endpoint**|**Mô tả**|
| :- | :- | :- |
|GET|/departments|Danh sách tất cả khoa đang hoạt động|
|GET|/departments/{id}|Chi tiết khoa + danh sách bác sĩ|
|GET|/doctors|Danh sách bác sĩ (lọc theo ?departmentId=)|
|GET|/doctors/{id}|Chi tiết hồ sơ bác sĩ|
|GET|/doctors/{id}/slots|Slots rảnh của bác sĩ theo ?date= hoặc ?week=|
|POST|/ai/analyze-symptoms|Gọi Claude API, trả về ước tính thời gian khám|
|POST|/appointments|Tạo lịch hẹn mới (block slots, gửi email xác nhận)|
|GET|/appointments/confirm/{code}|Kiểm tra mã xác nhận|
|POST|/chatbot/message|Gửi tin nhắn chatbot, nhận trả lời AI|

## **4.3 Staff APIs (Cần Auth + Role)**

|**Method**|**Endpoint**|**Role yêu cầu**|**Mô tả**|
| :- | :- | :- | :- |
|POST|/auth/login|Tất cả|Đăng nhập, nhận JWT|
|POST|/auth/refresh|Tất cả|Refresh access token|
|GET|/me/schedule|DOCTOR|Lịch khám của bác sĩ đang đăng nhập|
|PUT|/appointments/{id}/status|DOCTOR/NURSE|Cập nhật trạng thái lịch hẹn|
|POST|/medical-records|DOCTOR|Tạo bệnh án + đơn thuốc|
|GET|/medical-records/{appointmentId}|DOCTOR|Xem bệnh án của lịch hẹn|
|GET|/patients/{cccd}/history|DOCTOR|Lịch sử khám bệnh theo CCCD|
|POST|/appointments/{id}/checkin|NURSE|Check-in bệnh nhân đã đến|
|GET|/queue/today|NURSE|Hàng chờ hôm nay theo phòng khám|
|GET|/invoices|ACCOUNTANT|Danh sách hóa đơn (filter, pagination)|
|PUT|/invoices/{id}/pay|ACCOUNTANT|Ghi nhận thanh toán tại quầy|
|GET|/reports/revenue|ACCOUNTANT|Báo cáo doanh thu theo ngày/tháng|
|POST /PUT /DELETE|/admin/users|ADMIN|Quản lý nhân sự|
|POST /PUT /DELETE|/admin/departments|ADMIN|Quản lý khoa|
|POST|/admin/slots/generate|ADMIN|Tự động sinh slots cho bác sĩ theo lịch|
|GET|/admin/stats/overview|ADMIN|Dashboard thống kê tổng quan|


# **5. Luồng Kỹ Thuật Quan Trọng**
## **5.1 AI Slot Blocking — Chi Tiết Kỹ Thuật**
Đây là luồng phức tạp nhất, cần xử lý concurrency cẩn thận:

1. Frontend: User nhập triệu chứng → gọi POST /api/v1/ai/analyze-symptoms.
1. Backend AIService: Xây dựng prompt → gọi Claude API → parse response → trả về { durationMinutes: 60, complexity: 'COMPLEX', explanation: '...' }.
1. Frontend: Nhận ước tính → hiển thị cho user → user chọn slot bắt đầu trên calendar.
1. Frontend: Submit form → gọi POST /api/v1/appointments với { patientInfo, symptoms, doctorId, firstSlotId, aiDurationMinutes }.
1. Backend AppointmentService (@Transactional + PESSIMISTIC\_WRITE lock): Query các slot liên tiếp từ firstSlotId (số slot = durationMinutes / 30) → kiểm tra tất cả đều AVAILABLE → update status = BOOKED → tạo appointment record → commit transaction.
1. Nếu conflict (slot đã bị lấy trước): rollback, trả về 409 Conflict, frontend hiển thị thông báo yêu cầu chọn slot khác.
1. Sau commit thành công: trigger async job gửi email xác nhận qua GmailService.
## **5.2 Gmail OAuth2 Setup**
- Tạo Google Cloud Project → Enable Gmail API → Tạo OAuth2 credentials (type: Web application).
- Lần đầu: Admin chạy authorization flow → nhận authorization code → exchange lấy refresh token → lưu refresh token vào database (bảng system\_config).
- GmailService tự động dùng refresh token để lấy access token mới khi hết hạn.
- Template email: HTML template được lưu trong resources/templates, sử dụng Thymeleaf để render động.
## **5.3 Cron Job Nhắc Tái Khám**
@Scheduled(cron = "0 0 8 \* \* \*")  // Chạy lúc 8:00 sáng mỗi ngày

public void sendFollowUpReminders() {

`    `// Query: WHERE follow\_up\_date = tomorrow AND reminder\_sent = false

`    `// Gửi email từng bệnh nhân

`    `// Update: reminder\_sent = true

}

Cần thêm index trên cột follow\_up\_date và reminder\_sent để query nhanh.
## **5.4 Chatbot Architecture**
- Frontend: ChatbotWidget component, lưu conversation history trong React state.
- Mỗi tin nhắn user → POST /api/v1/chatbot/message với { message, conversationHistory }.
- Backend ChatbotService: Build system prompt gồm thông tin bệnh viện tĩnh (tên, địa chỉ, giờ làm...) + kết quả query database thực tế (slots rảnh, số bác sĩ, v.v.).
- Gọi Claude API với system prompt đã augment → stream hoặc trả về full response.
- Lưu ý: Chatbot KHÔNG có quyền tạo/sửa data, chỉ đọc (SELECT queries only).
Hospital Management System — TDD v1.0
