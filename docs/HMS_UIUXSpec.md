Hospital Management System  **Tài liệu 4: UI/UX Specification**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 4**

**UI/UX Specification**

*Màn hình · User Flow · Navigation · Component Design*

Phiên bản: 1.1  |  2026

> Cập nhật v1.1: đồng bộ lại theo bộ thiết kế Pencil v2 theo hướng dark-first.
> Public pages và booking flow có biến thể desktop + mobile. Dashboard nội bộ
> hiện được chốt ở desktop-first trong vòng thiết kế này.


# **1. Design System & Nguyên Tắc Thiết Kế**
## **1.1 Màu Sắc**

|**Token**|**Hex**|**Dùng cho**|
| :- | :- | :- |
|**Canvas**|#090A0C|Background toàn trang, page shell|
|**Surface**|#0B0D11|Nền chính của screen và content area|
|**Sidebar**|#131416|Sidebar dashboard, nav tối|
|**Card**|#17181B|Card, panel, modal body|
|**Border**|#24262B|Stroke mặc định, divider|
|**Border Strong**|#2A2C31|Card stroke, vùng nhấn mạnh|
|**Primary**|#2563EB|CTA chính, link, active state|
|**Primary Dark**|#1D4ED8|Hover và pressed trên primary|
|**Success**|#22C55E|Trạng thái thành công, confirmed|
|**Danger**|#F97366|Lỗi, huỷ, cảnh báo nghiêm trọng|
|**Warning**|#F59E0B|Pending, cảnh báo, fallback state|
|**Text Primary**|#F3F6FB|Nội dung chính trên nền tối|
|**Text Secondary**|#BBC4D4|Mô tả, label phụ|
|**Text Tertiary**|#7F899A|Hint text, placeholder, metadata nhẹ|

## **1.2 Typography**
- Font chính: Inter (Google Fonts) — rõ ràng, dễ đọc tiếng Việt.
- Heading 1: 28px / Bold — Tiêu đề trang chính.
- Heading 2: 22px / SemiBold — Tiêu đề section.
- Heading 3: 18px / Medium — Tiêu đề subsection, card header.
- Body: 14px / Regular — Nội dung thông thường.
- Small: 12px / Regular — Label, caption, hint text.
- Code / ID: 13px / Monospace (JetBrains Mono) — Mã lịch hẹn, ID.
## **1.3 Spacing & Layout**
- Grid: 12 columns, gutter 24px, breakpoints: sm 576px / md 768px / lg 1024px / xl 1280px.
- Spacing scale (8px base): 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px.
- Border radius: sm 4px / md 8px / lg 12px / xl 16px / full 9999px.
- Shadow: sm (card) / md (dropdown, popover) / lg (modal).
- Dashboard shell v2: sidebar cố định 280px trên desktop, content padding 24–28px, card radius ưu tiên 20px, screen shell radius 28px.
## **1.4 Component Library**
- Dựa trên Tailwind CSS + shadcn/ui (React). Không custom từ đầu, ưu tiên component có sẵn.
- Icon: Lucide React — nhất quán, tree-shakeable.
- Toast/notification: react-hot-toast — top-right, auto dismiss 3s.
- Modal/Dialog: shadcn Dialog — accessible, focus trap.
- Table: TanStack Table v8 — sort, filter, pagination phía client.
- Date picker: react-day-picker — hỗ trợ tiếng Việt locale.
## **1.5 Phạm Vi Thiết Kế Trong Pencil v2**
- Deliverable ở mức screen-level artboards, không phải component spec chi tiết cho dev handoff.
- Public routes và booking flow có đủ desktop + mobile variants.
- Dashboard nội bộ (Doctor, Nurse, Accountant, Admin) hiện chốt desktop-first trong vòng thiết kế này.
- Loading / Empty / Error / Offline states được dựng thành board riêng để tái sử dụng nhất quán.


# **2. Sitemap & Navigation**
## **2.1 Trang Công Khai (Public — không cần đăng nhập)**
- / — Trang chủ (Home)
  - /departments — Danh sách khoa
  - /departments/:id — Chi tiết khoa
  - /doctors — Danh sách bác sĩ
  - /doctors/:id — Hồ sơ bác sĩ
  - /booking — Form đặt lịch khám (4 steps)
  - /booking/success — Xác nhận đặt lịch thành công
  - /news — Tin tức & thông báo bệnh viện
## **2.2 Dashboard Nội Bộ (Cần đăng nhập)**
- /login — Trang đăng nhập staff
- /dashboard — Redirect về dashboard theo role
- DOCTOR: /dashboard/schedule / /dashboard/appointments/:id / /dashboard/patients
- NURSE: /dashboard/queue / /dashboard/checkin / /dashboard/rooms
- ACCOUNTANT: /dashboard/invoices / /dashboard/reports / /dashboard/pricing
- ADMIN: /dashboard/users / /dashboard/departments / /dashboard/slots / /dashboard/stats


# **3. Màn Hình Trang Công Khai**
## **3.1 Trang Chủ (Home)**

|**Màn hình / Component**|**Role truy cập**|**Mô tả & Nội dung chính**|
| :- | :- | :- |
|**Header / Navbar**|Tất cả|Logo bệnh viện, menu: Trang chủ / Khoa & Bác sĩ / Đặt lịch / Tin tức. Nút 'Đặt lịch ngay' (CTA, màu Primary). Responsive: hamburger menu trên mobile.|
|**Hero Section**|Tất cả|Ảnh banner fullwidth, tagline, 2 nút CTA: 'Đặt lịch ngay' và 'Xem các khoa'. Background overlay gradient nhẹ.|
|**Thống kê nhanh**|Tất cả|4 số liệu: Số khoa, Số bác sĩ, Số lượt khám/tháng, Năm thành lập. Card layout hàng ngang.|
|**Danh sách Khoa**|Tất cả|Grid 3 cột (desktop) / 2 cột (tablet) / 1 cột (mobile). Mỗi card: ảnh, tên khoa, mô tả ngắn 2 dòng, nút 'Xem chi tiết'.|
|**Bác sĩ nổi bật**|Tất cả|Carousel 4 bác sĩ (desktop). Avatar tròn, tên, chuyên khoa, khoa, học vị. Nút 'Xem tất cả bác sĩ'.|
|**Quy trình đặt lịch**|Tất cả|4 bước dạng horizontal steps: Chọn khoa → Nhập triệu chứng → Chọn giờ → Xác nhận. Icon + mô tả ngắn.|
|**Footer**|Tất cả|2 cột: Thông tin liên hệ (địa chỉ, hotline, email, bản đồ embed) | Links nhanh + mạng xã hội.|

## **3.2 Trang Chi Tiết Khoa**

|**Màn hình / Component**|**Role truy cập**|**Mô tả & Nội dung chính**|
| :- | :- | :- |
|**Breadcrumb**|Tất cả|Trang chủ > Khoa > [Tên khoa]. Dạng text link.|
|**Banner khoa**|Tất cả|Ảnh fullwidth, overlay tên khoa + tagline ngắn.|
|**Mô tả & Dịch vụ**|Tất cả|Text mô tả khoa, danh sách dịch vụ cung cấp (bullet list), thiết bị nổi bật.|
|**Danh sách Bác sĩ**|Tất cả|Grid card: avatar, tên, học vị, chuyên môn, số năm kinh nghiệm. Nút 'Đặt lịch với BS này'.|
|**CTA Đặt lịch**|Tất cả|Sticky bar ở bottom (mobile): 'Đặt lịch tại khoa [X]' → /booking?departmentId=X.|

## **3.3 Trang Hồ Sơ Bác Sĩ**

|**Màn hình / Component**|**Role truy cập**|**Mô tả & Nội dung chính**|
| :- | :- | :- |
|**Profile Header**|Tất cả|Avatar lớn (120px), tên đầy đủ, học vị, khoa, số năm kinh nghiệm. Badge specialty.|
|**Thông tin chi tiết**|Tất cả|2 cột: Trái — bio, chuyên môn sâu, bằng cấp, đào tạo. Phải — lịch làm việc tuần (grid 7 ngày × ca sáng/chiều).|
|**Nút đặt lịch**|Tất cả|Button primary 'Đặt lịch với Bác sĩ [Tên]' → /booking?doctorId=X. Sticky ở bottom mobile.|


# **4. User Flow — Đặt Lịch Khám (Core Flow)**
## **4.1 Flow Tổng Quan**
Form đặt lịch chia 4 bước, có stepper indicator ở top. User có thể back về bước trước. Dữ liệu giữ trong React state khi navigate giữa các bước.

## **4.2 Bước 1 — Chọn Khoa & Bác Sĩ**

|**Bước**|**Hành động người dùng**|**Phản hồi hệ thống**|**Ghi chú / Validation**|
| :- | :- | :- | :- |
|**1**|Vào /booking|Render Step 1: dropdown chọn khoa, sau đó list bác sĩ theo khoa|Nếu có ?departmentId hoặc ?doctorId từ URL, pre-select sẵn|
|**2**|Chọn khoa từ dropdown|Load danh sách bác sĩ thuộc khoa (TanStack Query, có loading spinner)|Phải chọn khoa trước khi chọn bác sĩ|
|**3**|Chọn bác sĩ (click card)|Card bác sĩ highlight, nút 'Tiếp theo' active|Bắt buộc chọn bác sĩ|
|**4**|Nhấn 'Tiếp theo'|Chuyển Step 2, stepper update||

## **4.3 Bước 2 — Nhập Triệu Chứng & AI Phân Tích**

|**Bước**|**Hành động người dùng**|**Phản hồi hệ thống**|**Ghi chú / Validation**|
| :- | :- | :- | :- |
|**1**|Nhập triệu chứng vào textarea|Đếm ký tự real-time, placeholder gợi ý (VD: 'Mô tả triệu chứng của bạn...')|Tối thiểu 20 ký tự, tối đa 1000 ký tự|
|**2**|Nhấn 'Phân tích triệu chứng'|Button loading, gọi POST /ai/analyze-symptoms|Disable button khi đang call API|
|**3**|AI trả kết quả|Hiện badge mức độ (Đơn giản / Trung bình / Phức tạp) + thời gian ước tính + giải thích ngắn|Nếu AI fail: hiển thị warning, mặc định 30 phút, cho phép tiếp tục|
|**4**|Nhấn 'Tiếp theo'|Chuyển Step 3 với duration đã chọn||

## **4.4 Bước 3 — Chọn Ngày & Giờ Khám**

|**Bước**|**Hành động người dùng**|**Phản hồi hệ thống**|**Ghi chú / Validation**|
| :- | :- | :- | :- |
|**1**|Xem calendar|Hiện tháng hiện tại, disable ngày quá khứ + ngày bác sĩ nghỉ|Chỉ hiển thị 30 ngày tương lai|
|**2**|Click chọn ngày|Load slots available của bác sĩ ngày đó (loading state)|Slots đã đặt không hiển thị|
|**3**|Xem slots available|Grid slots 30 phút: 07:30 / 08:00 / 08:30 / ... Slot blocked bởi AI duration hiện khác màu|AI duration = 60 phút → cần 2 slot liền nhau còn trống|
|**4**|Click chọn slot|Slot selected highlight (màu Primary), nút 'Tiếp theo' active|Chỉ chọn được slot đủ duration liên tiếp|
|**5**|Nhấn 'Tiếp theo'|Chuyển Step 4||

## **4.5 Bước 4 — Nhập Thông Tin & Xác Nhận**

|**Bước**|**Hành động người dùng**|**Phản hồi hệ thống**|**Ghi chú / Validation**|
| :- | :- | :- | :- |
|**1**|Xem form thông tin|Tab 'Bản thân' + toggle 'Đặt cho người nhà'||
|**2**|Điền thông tin bệnh nhân|Validate real-time: CCCD 12 số, email format, phone VN format|Highlight lỗi ngay khi blur field|
|**3**|(Nếu chọn người nhà) Toggle ON|Hiện form người nhà bên dưới|Validate riêng biệt|
|**4**|Xem Preview xác nhận|Modal summary: bác sĩ, ngày giờ, thông tin bệnh nhân, ước tính AI||
|**5**|Nhấn 'Xác nhận đặt lịch'|Loading state, gọi POST /appointments|Disable nút tránh double submit|
|**6a**|Thành công|Redirect /booking/success, hiển thị mã xác nhận, nhắc kiểm tra email||
|**6b**|409 Conflict (slot bị lấy mất)|Toast error, tự quay về Step 3, highlight slot đã bị lấy|Không xoá data đã nhập|


# **5. Dashboard — Màn Hình Nội Bộ**
## **5.1 Layout Chung Dashboard**
Sidebar cố định bên trái (280px desktop). Header bar: logo, tên user + role, nút logout. Content area cuộn độc lập. Trong bộ thiết kế v2 hiện chưa chốt mobile/tablet cho dashboard nội bộ.

## **5.2 Dashboard Bác Sĩ**

|**Màn hình / Component**|**Role truy cập**|**Mô tả & Nội dung chính**|
| :- | :- | :- |
|**Summary Cards (row đầu)**|DOCTOR|4 card: Lịch hôm nay / Đang chờ / Đang khám / Hoàn thành. Số lớn + màu semantic (Warning/Primary/Success).|
|**Calendar View (FullCalendar)**|DOCTOR|Toggle Day/Week. Mỗi event: tên bệnh nhân, giờ, màu theo status. Click event mở sidebar detail.|
|**Appointment Detail Sidebar**|DOCTOR|Slide-in từ phải: thông tin bệnh nhân đầy đủ, triệu chứng, ước tính AI, tiền sử (nếu có). Nút 'Bắt đầu khám'.|
|**Form Kết Quả Khám**|DOCTOR|Full page: Chẩn đoán (textarea), Ghi chú lâm sàng, Vital signs grid, Đơn thuốc (dynamic rows: +/- thuốc), Nút Tạo lịch tái khám.|
|**Preview Đơn Thuốc**|DOCTOR|Modal hiển thị trước PDF: tiêu đề, thông tin bệnh nhân, bảng thuốc. Nút 'Xác nhận & Gửi email'.|
|**Lịch Sử Bệnh Nhân**|DOCTOR|Search bar (CCCD / Tên), kết quả dạng timeline theo ngày khám, accordion expand từng lần.|

## **5.3 Dashboard Y Tá**

|**Màn hình / Component**|**Role truy cập**|**Mô tả & Nội dung chính**|
| :- | :- | :- |
|**Danh Sách Lịch Hẹn Hôm Nay**|NURSE|Table: STT, Tên bệnh nhân, Giờ hẹn, Bác sĩ, Phòng, Trạng thái (badge màu). Search/filter theo bác sĩ.|
|**Modal Check-in**|NURSE|Popup: thông tin bệnh nhân, xác nhận check-in, nhập giờ đến thực tế (auto-fill now). Nút 'Xác nhận check-in'.|
|**Form Vital Signs**|NURSE|Inline form: Huyết áp (systolic/diastolic), Nhiệt độ (°C), Cân nặng (kg), Chiều cao (cm). Lưu kèm appointment.|
|**Hàng Chờ Real-time**|NURSE|Board dạng Kanban: 3 cột Đã đến / Đang khám / Xong. Card: tên, phòng, thời gian chờ (đếm ngược). Refresh 30s.|
|**Sơ Đồ Phòng Khám**|NURSE|Grid phòng khám: màu theo trạng thái (Xanh=rảnh, Vàng=đang khám, Đỏ=bảo trì). Click đổi trạng thái.|

## **5.4 Dashboard Kế Toán**

|**Màn hình / Component**|**Role truy cập**|**Mô tả & Nội dung chính**|
| :- | :- | :- |
|**Danh Sách Hóa Đơn**|ACCOUNTANT|Table với filter: Ngày / Trạng thái (Pending/Paid/Cancelled) / Khoa. Mỗi row: số HĐ, bệnh nhân, bác sĩ, tổng tiền, nút 'Thu tiền'.|
|**Modal Thu Tiền**|ACCOUNTANT|Hiện chi tiết hóa đơn, chọn phương thức (Tiền mặt / CK), nhập số tiền thực nhận, ghi chú. Confirm update DB.|
|**Biểu Đồ Doanh Thu**|ACCOUNTANT|Recharts: Line chart doanh thu 30 ngày gần nhất + Bar chart so sánh theo khoa. Date range picker.|
|**Báo Cáo Chi Tiết**|ACCOUNTANT|Table có sort/filter đầy đủ + Export button (PDF / Excel). Summary row ở cuối.|
|**Bảng Giá Dịch Vụ**|ACCOUNTANT|CRUD table: thêm/sửa/xóa giá theo khoa. Mỗi row có effective\_date, hiển thị 'Đang áp dụng' badge.|

## **5.5 Dashboard Admin**

|**Màn hình / Component**|**Role truy cập**|**Mô tả & Nội dung chính**|
| :- | :- | :- |
|**Overview Stats**|ADMIN|Dashboard tổng: 6 summary cards + 2 biểu đồ (lịch hẹn 7 ngày, top 5 khoa bận nhất).|
|**Quản Lý Nhân Sự**|ADMIN|Table user với filter role + status. Nút Thêm mở drawer form. Edit inline cho thông tin cơ bản. Toggle is\_active.|
|**Form Thêm/Sửa Nhân Viên**|ADMIN|Drawer từ phải: Full name, Email, Role (select), Department (select, nếu DOCTOR/NURSE), Specialty, Qualification, Avatar upload.|
|**Quản Lý Khoa**|ADMIN|Card grid khoa: ảnh, tên, số bác sĩ, trạng thái. Nút Edit mở modal. Drag-to-reorder thứ tự hiển thị.|
|**Cấu Hình Lịch Bác Sĩ**|ADMIN|Table bác sĩ + weekday checkboxes + time picker (giờ bắt đầu/kết thúc). Nút 'Sinh slots' tạo tự động.|
|**Audit Log**|ADMIN|Table nhật ký: timestamp, user, action, entity, IP. Read-only, chỉ có filter + export.|


# **6. Responsive & Accessibility**
## **6.1 Breakpoints**
- Public + Booking Mobile (<768px): Single column, hamburger nav, bottom sheet thay modal, thumb-friendly buttons (≥44px height).
- Public + Booking Desktop (>1024px): Multi-column, full navigation, sticky CTA, hero/content hierarchy giữ nguyên.
- Dashboard nội bộ v2: desktop-first (>1280px). Tablet/mobile cho staff workflows được tách sang vòng sau để tránh làm mờ priority nghiệp vụ.
## **6.2 Accessibility (WCAG 2.1 AA)**
- Contrast ratio: tối thiểu 4.5:1 cho text thường, 3:1 cho large text.
- Focus visible: outline rõ ràng trên tất cả interactive elements (không dùng outline:none).
- ARIA labels: tất cả icon buttons có aria-label, form inputs có aria-describedby.
- Skip navigation link: 'Skip to main content' hidden, show on focus.
- Loading states: aria-live='polite' cho dynamic content updates.
- Error messages: role='alert' cho form validation errors.
## **6.3 Loading & Empty States**
- Skeleton loader: dùng cho danh sách, calendar khi đang fetch data.
- Empty state: illustration + text + CTA button (VD: 'Chưa có lịch hẹn — Xem bác sĩ có sẵn').
- Error state: icon cảnh báo + message + nút 'Thử lại' (retry trigger query).
- Offline state: banner notification khi mất mạng, disable submit buttons.
HMS — Tài liệu 4: UI/UX Specification v1.1
