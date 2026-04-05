Hospital Management System  **Tài liệu 5: Test Plan**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 5**

**Test Plan**

*Test Cases chi tiết · Unit · Integration · E2E · Performance*

Phiên bản: 1.0  |  2025


# **1. Tổng Quan Chiến Lược Test**
## **1.1 Phạm Vi Test**
Bao gồm toàn bộ các module của hệ thống HMS theo 3 tầng: Unit Test (backend logic), Integration Test (API endpoints), và End-to-End Test (luồng người dùng thực tế).
## **1.2 Công Cụ Test**

|**Loại test**|**Công cụ**|**Mục đích**|
| :- | :- | :- |
|**Unit Test — Backend**|JUnit 5 + Mockito|Test service layer, business logic, edge cases|
|**Integration Test — Backend**|Spring Boot Test + Testcontainers|Test API endpoints với PostgreSQL thật|
|**Unit Test — Frontend**|Vitest + React Testing Library|Test component render, hook logic|
|**E2E Test**|Playwright|Luồng người dùng end-to-end trên browser|
|**Performance Test**|k6|Load test booking API, concurrent slot booking|
|**API Test (manual)**|Postman Collection|Test thủ công, regression sau mỗi deploy|
|**Coverage Report**|JaCoCo (BE) + c8 (FE)|Đảm bảo ≥70% code coverage|

## **1.3 Tiêu Chí Pass/Fail**
- Unit Test: ≥70% code coverage trên service layer. Tất cả test phải PASS trước khi merge PR.
- Integration Test: Tất cả API endpoint có ít nhất 1 happy path test + 1 error case test.
- E2E Test: Tất cả core user flows (đặt lịch, check-in, kê đơn) PASS trên Chrome + Firefox.
- Performance: Booking API p95 < 500ms dưới 50 concurrent users. Không có double-booking.


# **2. Unit Tests — Backend (Spring Boot / JUnit 5)**
## **2.1 AppointmentService — Booking Logic**

|**TC-U001**|**Block slot thành công khi slots còn AVAILABLE**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB có 2 slot liên tiếp status=AVAILABLE cho doctor\_id X vào ngày mai||||
|**Các bước**|1\. Tạo AppointmentRequest với firstSlotId + aiDurationMinutes=60 2. Gọi appointmentService.create(request) 3. Query DB kiểm tra kết quả||||
|**Kết quả mong đợi**|- Appointment record được tạo với status=CONFIRMED - Cả 2 slot time\_slots có status=BOOKED - confirmation\_code không null và unique||||

|**TC-U002**|**Ném ConflictException khi slot đã BOOKED**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB: slot target đã có status=BOOKED||||
|**Các bước**|1\. Tạo AppointmentRequest trỏ đến slot đã BOOKED 2. Gọi appointmentService.create(request)||||
|**Kết quả mong đợi**|- Ném AppointmentConflictException (HTTP 409) - Không có record nào được tạo trong DB - Transaction rollback hoàn toàn||||

|**TC-U003**|**AI duration 90 phút block đúng 3 slot liên tiếp**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB: 3 slot liên tiếp AVAILABLE, slot thứ 4 BOOKED||||
|**Các bước**|1\. Request với aiDurationMinutes=90, firstSlotId = slot[0] 2. Gọi appointmentService.create(request)||||
|**Kết quả mong đợi**|- Slot [0], [1], [2] đều BOOKED - Slot [3] không thay đổi (vẫn BOOKED) - Appointment created thành công||||

|**TC-U004**|**Không thể block slot nếu slot giữa đã BOOKED**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Slot [0]=AVAILABLE, [1]=BOOKED, [2]=AVAILABLE||||
|**Các bước**|1\. Request với aiDurationMinutes=60, firstSlotId=slot[0] 2. Gọi create()||||
|**Kết quả mong đợi**|- Ném ConflictException - Slot [0] vẫn AVAILABLE (rollback) - Không tạo appointment||||

## **2.2 AIService — Phân Tích Triệu Chứng**

|**TC-U005**|**Parse kết quả Claude API thành công**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Mock ClaudeClient trả JSON hợp lệ: {duration:30, complexity:'SIMPLE'}||||
|**Các bước**|1\. Gọi aiService.analyzeSymptoms('đau đầu nhẹ', 'NEUROLOGY') 2. Kiểm tra output||||
|**Kết quả mong đợi**|- Trả về AIAnalysisResult với durationMinutes=30, complexity=SIMPLE - Không ném exception||||

|**TC-U006**|**Fallback khi Claude API timeout**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Mock ClaudeClient ném TimeoutException sau 15 giây||||
|**Các bước**|1\. Gọi aiService.analyzeSymptoms() với mock timeout 2. Kiểm tra fallback||||
|**Kết quả mong đợi**|- Trả về AIAnalysisResult với durationMinutes=30 (default) - isAIAvailable=false trong response - Log warning được ghi||||

## **2.3 FollowUpReminderJob — Cron**

|**TC-U007**|**Gửi email nhắc đúng bệnh nhân có tái khám ngày mai**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB: 3 medical\_records với follow\_up\_date = tomorrow, reminder\_sent=false. 1 record follow\_up\_date = ngày kia.||||
|**Các bước**|1\. Gọi reminderJob.sendFollowUpReminders() thủ công 2. Kiểm tra emails được gửi 3. Kiểm tra DB||||
|**Kết quả mong đợi**|- GmailService.send() được gọi đúng 3 lần - 3 records có reminder\_sent=true - Record ngày kia KHÔNG bị gửi||||

|**TC-U008**|**Không gửi email trùng lặp nếu job chạy 2 lần**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB: 2 records follow\_up\_date=tomorrow, reminder\_sent=false||||
|**Các bước**|1\. Chạy reminderJob lần 1 2. Chạy reminderJob lần 2||||
|**Kết quả mong đợi**|- Lần 1: GmailService.send() gọi 2 lần, records update reminder\_sent=true - Lần 2: GmailService.send() KHÔNG được gọi (query trả về empty)||||


# **3. Integration Tests — API Endpoints**
## **3.1 Auth API**

|**TC-IT001**|**POST /api/v1/auth/login — Đăng nhập thành công**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB có user email='doctor@hospital.vn', password hash của 'Test@1234', role=DOCTOR, is\_active=true||||
|**Các bước**|1\. POST /api/v1/auth/login    Body: {email:'doctor@hospital.vn', password:'Test@1234'} 2. Kiểm tra response||||
|**Kết quả mong đợi**|- HTTP 200 - Response có accessToken (JWT, expires 15 phút) và refreshToken - accessToken payload chứa sub=userId, role=DOCTOR||||

|**TC-IT002**|**POST /api/v1/auth/login — Sai mật khẩu**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB có user email='doctor@hospital.vn'||||
|**Các bước**|1\. POST /api/v1/auth/login    Body: {email:'doctor@hospital.vn', password:'WrongPass'}||||
|**Kết quả mong đợi**|- HTTP 401 - Response body: {success:false, message:'Email hoặc mật khẩu không đúng'} - Không trả về token||||

|**TC-IT003**|**GET endpoint protected — Không có token**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Không có Authorization header||||
|**Các bước**|1\. GET /api/v1/me/schedule||||
|**Kết quả mong đợi**|- HTTP 401 - Response: {success:false, message:'Unauthorized'}||||

|**TC-IT004**|**GET endpoint — Sai role (Nurse gọi API Doctor)**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Đăng nhập với role=NURSE, có valid token||||
|**Các bước**|1\. GET /api/v1/me/schedule với Bearer token của NURSE||||
|**Kết quả mong đợi**|- HTTP 403 - Response: {success:false, message:'Forbidden'}||||

## **3.2 Booking API**

|**TC-IT005**|**POST /api/v1/appointments — Đặt lịch thành công**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB: doctor X có 2 slot AVAILABLE ngày mai 09:00-10:00. Patient chưa có trong DB.||||
|**Các bước**|1\. POST /api/v1/appointments    Body: {patientInfo:{fullName,cccd,phone,email,...}, doctorId, firstSlotId, symptoms, aiDurationMinutes:60} 2. Kiểm tra DB và response||||
|**Kết quả mong đợi**|- HTTP 201 - Response: {success:true, data:{appointmentId, confirmationCode}} - 2 slots trong DB có status=BOOKED - Patient record được tạo - Email được trigger (mock GmailService)||||

|**TC-IT006**|**POST /api/v1/appointments — 409 Concurrent booking**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB: 1 slot AVAILABLE. 2 request gửi đồng thời.||||
|**Các bước**|1\. Gửi 2 POST requests đồng thời (2 threads) cho cùng slot 2. Kiểm tra kết quả||||
|**Kết quả mong đợi**|- 1 request trả về HTTP 201 (thành công) - Request còn lại trả về HTTP 409 - DB chỉ có 1 appointment được tạo||||

|**TC-IT007**|**GET /api/v1/doctors/{id}/slots — Trả slot rảnh đúng**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Doctor X có 5 slots ngày mai: 3 AVAILABLE, 2 BOOKED||||
|**Các bước**|1\. GET /api/v1/doctors/{id}/slots?date=tomorrow||||
|**Kết quả mong đợi**|- HTTP 200 - Response data chứa đúng 3 slots AVAILABLE - Không trả về slot BOOKED||||

## **3.3 Medical Records API**

|**TC-IT008**|**POST /api/v1/medical-records — Tạo bệnh án + đơn thuốc**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Đăng nhập DOCTOR. Appointment appointmentId=X có status=IN\_PROGRESS.||||
|**Các bước**|1\. POST /api/v1/medical-records    Body: {appointmentId, diagnosis, prescriptionItems:[{medicine,dosage,...}]} 2. Kiểm tra DB và response||||
|**Kết quả mong đợi**|- HTTP 201 - medical\_records record tạo thành công - prescription\_items records tạo đúng số lượng - Appointment status → DONE - PDF được generate và lưu - Email trigger với PDF đính kèm||||


# **4. End-to-End Tests — Playwright**
## **4.1 Luồng Đặt Lịch Khám (Guest)**

|**TC-E001**|**Đặt lịch thành công end-to-end với AI phân tích**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|App đang chạy. Gmail mock server ready. DB có bác sĩ với slots available.||||
|**Các bước**|1\. Mở /booking 2. Chọn 'Khoa Nội tổng quát' 3. Chọn bác sĩ đầu tiên trong list 4. Nhập triệu chứng: 'Tôi bị đau đầu khoảng 3 ngày, kèm theo chóng mặt' 5. Click 'Phân tích triệu chứng', chờ kết quả AI 6. Click chọn ngày làm việc gần nhất 7. Click chọn slot đầu tiên available 8. Điền thông tin: Họ tên, CCCD, Phone, Email 9. Click 'Xác nhận đặt lịch' 10. Kiểm tra trang success||||
|**Kết quả mong đợi**|- Trang /booking/success hiển thị - Có confirmation code hiển thị - Email xác nhận được gửi đến email đã nhập (mock) - Slot đã chọn không còn xuất hiện nếu vào lại calendar||||

|**TC-E002**|**Đặt lịch cho người nhà**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Như E001||||
|**Các bước**|1-3. Giống E001 4. Nhập triệu chứng 5. Chọn ngày + slot 6. Toggle 'Đặt cho người nhà' ON 7. Điền thông tin người đặt (người thân) 8. Điền thông tin người nhà (bệnh nhân thực sự) 9. Xác nhận||||
|**Kết quả mong đợi**|- Appointment tạo với is\_for\_family=true - family\_members record được tạo - Email gửi đến email người đặt - Tên người nhà hiển thị trong email||||

|**TC-E003**|**Validation form — CCCD sai định dạng**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|App đang chạy||||
|**Các bước**|1\. Đến Step 4 booking 2. Nhập CCCD = '123' (3 số) 3. Click ngoài field (blur) 4. Cố nhấn 'Xác nhận đặt lịch'||||
|**Kết quả mong đợi**|- Lỗi 'CCCD phải đủ 12 số' hiển thị dưới field - Nút Submit không trigger API call - Form không navigate đi||||

## **4.2 Luồng Bác Sĩ**

|**TC-E004**|**Bác sĩ đăng nhập và xem lịch hôm nay**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB có appointment hôm nay cho doctor@hospital.vn||||
|**Các bước**|1\. Đến /login 2. Nhập email + password bác sĩ 3. Kiểm tra redirect sau login 4. Kiểm tra calendar||||
|**Kết quả mong đợi**|- Redirect về /dashboard/schedule - Summary cards hiển thị số lịch đúng - Calendar Day view hiển thị appointments đúng giờ||||

|**TC-E005**|**Bác sĩ hoàn tất khám và kê đơn thuốc**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Appointment có status=IN\_PROGRESS. Đăng nhập bác sĩ.||||
|**Các bước**|1\. Click appointment trên calendar 2. Sidebar detail mở 3. Click 'Bắt đầu khám' → status IN\_PROGRESS 4. Click 'Nhập kết quả' 5. Điền chẩn đoán: 'Viêm xoang cấp' 6. Thêm 1 thuốc: Amoxicillin 500mg, 3 lần/ngày, 7 ngày 7. Click 'Preview đơn thuốc' 8. Xác nhận gửi||||
|**Kết quả mong đợi**|- PDF preview render đúng thông tin - Sau confirm: appointment status=DONE - Email với PDF đính kèm được gửi - medical\_records và prescription\_items tạo trong DB||||

## **4.3 Luồng Y Tá**

|**TC-E006**|**Y tá check-in bệnh nhân**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|Appointment có status=CONFIRMED. Đăng nhập y tá.||||
|**Các bước**|1\. Vào /dashboard/checkin 2. Tìm bệnh nhân theo tên 3. Click 'Check-in' 4. Xác nhận trong modal 5. Kiểm tra hàng chờ||||
|**Kết quả mong đợi**|- Appointment status → CHECKED\_IN - Bệnh nhân xuất hiện trong hàng chờ - Thời gian check-in được ghi nhận||||


# **5. Performance Tests — k6**
## **5.1 Test Concurrent Slot Booking (Race Condition)**

|**TC-P001**|**50 người đặt cùng 1 slot cùng lúc**||**Ưu tiên:**|**Cao**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB: 1 slot AVAILABLE||||
|**Các bước**|Script k6: 50 VUs gửi POST /appointments đồng thời đến cùng slot Duration: 30 giây||||
|**Kết quả mong đợi**|- Đúng 1 request thành công (HTTP 201) - 49 requests còn lại HTTP 409 - Không có duplicate appointment trong DB - p95 response time < 1000ms||||

|**TC-P002**|**Load test API đặt lịch — 100 users đồng thời**||**Ưu tiên:**|**Trung bình**|
| :- | :- | :- | :- | :- |
|**Điều kiện trước**|DB có đủ slots available cho 100 users||||
|**Các bước**|Script k6: Ramp-up 0→100 VUs trong 30s, giữ 100 VUs trong 2 phút Mỗi VU: POST /appointments với slot khác nhau||||
|**Kết quả mong đợi**|- Error rate < 1% - p50 < 300ms, p95 < 500ms, p99 < 1000ms - Tất cả appointments tạo thành công - Không có data corruption||||

# **6. Test Data & Môi Trường**
## **6.1 Seed Data Cho Test**
- 3 khoa: Nội tổng quát, Tim mạch, Thần kinh.
- 6 bác sĩ (2 mỗi khoa), lịch làm việc Thứ 2–6, 07:30–11:30 + 13:30–16:30.
- Slots tự động từ ngày mai đến +30 ngày, mỗi slot 30 phút.
- Tài khoản test: doctor@hospital.vn / nurse@hospital.vn / accountant@hospital.vn / admin@hospital.vn (Pass: Test@1234).
- 10 appointments mẫu ở các trạng thái khác nhau: PENDING/CHECKED\_IN/IN\_PROGRESS/DONE.
## **6.2 Môi Trường Test**
- Backend test: Testcontainers PostgreSQL 15 (tự spin up/down trong test, không ảnh hưởng DB thật).
- Gmail: MockGmailService (không gửi email thật, capture vào in-memory list để assert).
- Claude API: WireMock stub trả response cố định theo từng test case.
- E2E: Browser thật (Chromium + Firefox) qua Playwright, chạy trên local docker-compose.
HMS — Tài liệu 5: Test Plan v1.0
