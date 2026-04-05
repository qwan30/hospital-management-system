Hospital Management System   **Tài liệu 1: Đặc tả Yêu cầu Phần mềm (SRS)**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 1**

**Đặc tả Yêu cầu Phần mềm**

*Software Requirements Specification (SRS)*

Phiên bản: 1.0  |  Tech Stack: React + Java Spring Boot  |  2025


# **1. Tổng Quan Dự Án**
## **1.1 Mục tiêu**
Xây dựng hệ thống quản lý bệnh viện toàn diện bao gồm trang thông tin công khai cho bệnh nhân đặt lịch khám, tích hợp AI phân tích triệu chứng để tự động sắp xếp thời gian khám phù hợp, và dashboard nội bộ cho các nhân viên y tế (bác sĩ, y tá, kế toán, admin).    
## **1.2 Phạm vi hệ thống**
- Trang web công khai: giới thiệu bệnh viện, khoa/phòng ban, bác sĩ.
- Module đặt lịch khám: không yêu cầu đăng nhập, hỗ trợ đặt lịch cho người nhà.
- AI slot allocation: Claude API phân tích triệu chứng, tự động block thời gian khám.
- Email automation: xác nhận đặt lịch, gửi đơn thuốc PDF, nhắc tái khám qua Gmail API.
- Chatbot tư vấn: truy vấn database real-time về bác sĩ/lịch rảnh, hỗ trợ đặt lịch.
- Dashboard nội bộ: 4 role (Bác sĩ, Y tá, Kế toán, Admin) với phân quyền riêng biệt.
## **1.3 Đối tượng người dùng**

|**Người dùng**|**Role**|**Mô tả**|
| :- | :- | :- |
|Bệnh nhân / Người nhà|Khách (không đăng nhập)|Tra cứu thông tin, đặt lịch, nhận email xác nhận|
|Bác sĩ|Role 2|Quản lý lịch cá nhân, ghi kết quả khám, kê đơn thuốc|
|Y tá|Role 3|Check-in bệnh nhân, quản lý hàng chờ, hỗ trợ bác sĩ|
|Kế toán|Role 4|Quản lý hóa đơn, báo cáo doanh thu, cấu hình giá|
|Admin|Role 5|Quản lý toàn bộ hệ thống, nhân sự, khoa, cấu hình|


# **2. Yêu Cầu Chức Năng — Trang Công Khai**
## **2.1 Trang chủ (Home Page)**
Không yêu cầu đăng nhập. Hiển thị đầy đủ thông tin bệnh viện cho người dùng.
### **Nội dung trang chủ:**
- Banner chính: tên bệnh viện, slogan, ảnh hero, nút CTA "Đặt lịch ngay".
- Thông tin tổng quan: địa chỉ, hotline, giờ làm việc, bản đồ (Google Maps embed).
- Giới thiệu bệnh viện: lịch sử, sứ mệnh, thành tích nổi bật.
- Danh sách khoa/phòng ban: card hiển thị tên khoa, mô tả ngắn, ảnh, nút "Xem chi tiết".
- Đội ngũ bác sĩ nổi bật: ảnh, tên, chuyên khoa.
- Tin tức / Thông báo: các bài viết sức khỏe, thông báo bệnh viện.
- Footer: thông tin liên hệ, mạng xã hội, chính sách bảo mật.
## **2.2 Trang Chi Tiết Khoa (Department Detail)**
- Mô tả chi tiết khoa, chuyên môn, thiết bị, dịch vụ cung cấp.
- Danh sách bác sĩ thuộc khoa: ảnh, tên, chuyên môn, kinh nghiệm, học vị.
- Số lượng bác sĩ đang hoạt động trong khoa.
- Nút "Đặt lịch" dẫn thẳng đến form với khoa đã chọn sẵn.
## **2.3 Trang Hồ Sơ Bác Sĩ**
- Thông tin chi tiết: ảnh, họ tên, chức danh, học vị, chuyên khoa, kinh nghiệm.
- Lịch làm việc: hiển thị các ngày/ca trong tuần bác sĩ có mặt.
- Nút "Đặt lịch với bác sĩ này".


# **3. Yêu Cầu Chức Năng — Module Đặt Lịch**
## **3.1 Luồng Đặt Lịch Khám**
Người dùng không cần đăng nhập. Luồng gồm 4 bước:

1. Bước 1 — Chọn khoa & bác sĩ: chọn khoa từ danh sách, sau đó chọn bác sĩ thuộc khoa đó.
1. Bước 2 — Nhập triệu chứng: mô tả triệu chứng → AI phân tích → hiển thị ước tính thời gian khám.
1. Bước 3 — Chọn ngày/slot: calendar hiển thị slot còn trống theo ước tính AI (30/45/60/90 phút). Slot đã đặt bị ẩn.
1. Bước 4 — Nhập thông tin bệnh nhân và xác nhận đặt lịch.
## **3.2 Form Thông Tin Bệnh Nhân**
### **Trường bắt buộc:**
- Họ và tên (toàn bộ)
- Số căn cước công dân (CCCD) — 12 số
- Số điện thoại
- Email (để nhận xác nhận và đơn thuốc)
- Ngày sinh
- Giới tính
- Địa chỉ (tỉnh/thành, quận/huyện, số nhà/đường)
### **Trường tùy chọn:**
- Nghề nghiệp
- Nhóm máu
- Tiền sử bệnh / dị ứng thuốc
- Bảo hiểm y tế (số BHYT nếu có)
## **3.3 Đặt Lịch Cho Người Nhà**
Người dùng có thể chọn "Đặt cho người nhà" trong form. Khi đó hiển thị thêm phần nhập thông tin người nhà:

- Họ tên người nhà (bắt buộc)
- Mối quan hệ: cha/mẹ, vợ/chồng, con, anh/chị/em, khác (bắt buộc)
- Số CCCD người nhà
- Ngày sinh người nhà
- Giới tính người nhà
- Email người liên lạc (có thể dùng email của người đặt)
## **3.4 AI Slot Allocation — Phân Tích Triệu Chứng**
Khi người dùng nhập triệu chứng và nhấn "Phân tích", hệ thống gọi Claude API:

- Input: mô tả triệu chứng của người dùng + khoa đã chọn.
- Output từ Claude: ước tính mức độ phức tạp và thời gian khám đề xuất.

|**Mức độ**|**Thời gian**|**Ví dụ triệu chứng**|
| :- | :- | :- |
|Đơn giản / Thông thường|30 phút|Cảm cúm nhẹ, đau đầu thông thường, khám định kỳ|
|Trung bình|45 phút|Đau bụng, chóng mặt kéo dài, ho dai dẳng|
|Phức tạp|60 phút|Triệu chứng nhiều cơ quan, bệnh mãn tính, tái khám phức tạp|
|Rất phức tạp|90 phút|Đa bệnh lý, cần hội chẩn, ca khó|

Sau khi có ước tính thời gian, hệ thống tự động:

- Block số slot liên tiếp tương ứng (VD: 60 phút = block 2 slot 30-phút liền kề).
- Ẩn các slot bị block trên calendar (người dùng tiếp theo không thể chọn).
- Sử dụng transaction để tránh race condition khi 2 người đặt cùng lúc.


# **4. Yêu Cầu Email Automation**
## **4.1 Email Xác Nhận Đặt Lịch**
Gửi ngay sau khi đặt lịch thành công qua Gmail API (OAuth2). Nội dung bao gồm:

- Thông tin bệnh nhân (hoặc người nhà nếu đặt hộ)
- Tên bác sĩ và khoa
- Ngày giờ khám đã xác nhận
- Địa chỉ bệnh viện + hướng dẫn đến khoa
- Lưu ý trước khi khám (nhịn ăn nếu cần, mang theo giấy tờ, v.v.)
- Mã xác nhận đặt lịch (appointment ID)
## **4.2 Email Gửi Kết Quả Khám & Đơn Thuốc**
Gửi sau khi bác sĩ hoàn tất nhập kết quả khám. Nội dung:

- File PDF đính kèm: Đơn thuốc (tên thuốc, liều lượng, hướng dẫn sử dụng).
- Chẩn đoán bệnh (dưới dạng text trong email body).
- Lịch hẹn tái khám (nếu có): ngày, giờ, bác sĩ, khoa.
- Hướng dẫn chăm sóc tại nhà.
## **4.3 Email Nhắc Lịch Tái Khám**
Gửi tự động trước ngày tái khám 1 ngày, lúc 8:00 sáng (Spring @Scheduled + Cron job). Nội dung:

- Nhắc nhở ngày tái khám hôm sau.
- Thông tin bác sĩ và khoa cần đến.
- Khuyến khích mang theo đơn thuốc trước và kết quả xét nghiệm (nếu có).
- Số điện thoại hotline để đổi/hủy lịch.


# **5. Yêu Cầu Chức Năng — Chatbot**
## **5.1 Phạm Vi Chatbot**
Chatbot xuất hiện dạng floating widget ở góc phải màn hình, áp dụng cho trang công khai. Chatbot kết nối trực tiếp với database qua backend API để trả lời real-time.
## **5.2 Các Loại Câu Hỏi Chatbot Hỗ Trợ**
### **Thông tin bệnh viện:**
- Giờ làm việc, địa chỉ, hotline.
- Danh sách các khoa có trong bệnh viện.
- Mô tả dịch vụ từng khoa.
### **Thông tin bác sĩ và lịch rảnh:**
- "Khoa Nội tiết có bao nhiêu bác sĩ?" → query DB, trả về số lượng + tên bác sĩ.
- "Bác sĩ nào rảnh vào ngày mai?" → query time\_slots, lọc theo ngày.
- "Bác sĩ Nguyễn còn slot nào trong tuần này?" → query slots của bác sĩ cụ thể.
- "Khoa Tim mạch còn slot sáng nay không?" → query real-time.
### **Hỗ trợ đặt lịch:**
- Hướng dẫn quy trình đặt lịch.
- Giải thích cách chọn khoa phù hợp với triệu chứng.
- Hỗ trợ điều hướng đến form đặt lịch với tham số đã điền sẵn (khoa, bác sĩ).
## **5.3 Giới Hạn Chatbot**
Chatbot KHÔNG hỗ trợ:

- Tư vấn y tế, chẩn đoán bệnh.
- Thay đổi hoặc hủy lịch đặt (yêu cầu gọi hotline).
- Xem thông tin cá nhân của bệnh nhân.


# **6. Yêu Cầu Chức Năng — Role Bác Sĩ (Role 2)**
## **6.1 Dashboard Bác Sĩ**
- Hiển thị tổng quan: số lịch hôm nay, số đã hoàn thành, số đang chờ.
- Calendar view: xem lịch theo ngày và tuần, hiển thị tên bệnh nhân + triệu chứng ngắn.
- Thông báo: slot mới được đặt, bệnh nhân đã check-in, cần xử lý.
## **6.2 Xem & Quản Lý Lịch Khám**
- Xem danh sách lịch hẹn trong ngày theo thứ tự thời gian.
- Chi tiết từng lịch: thông tin bệnh nhân, triệu chứng, ước tính thời gian AI, lịch sử khám (nếu có).
- Chuyển trạng thái lịch: Chờ → Đang khám → Hoàn thành.
## **6.3 Nhập Kết Quả Khám**
- Form nhập: chẩn đoán bệnh, ghi chú lâm sàng, kết quả xét nghiệm tham chiếu.
- Kê đơn thuốc: thêm nhiều thuốc (tên thuốc, liều lượng, số lần/ngày, số ngày, ghi chú).
- Tạo lịch tái khám: chọn ngày, chọn slot, hệ thống tự block slot và gửi email bệnh nhân.
- Xem lại và xác nhận trước khi hoàn tất (preview PDF đơn thuốc).
- Sau khi xác nhận: hệ thống tự xuất PDF và gửi Gmail cho bệnh nhân.
## **6.4 Xem Lịch Sử Bệnh Nhân**
- Tìm kiếm bệnh nhân theo tên hoặc số CCCD.
- Xem toàn bộ lịch sử khám: các lần khám trước, chẩn đoán, đơn thuốc, ghi chú.
- Xem lịch sử kể cả bệnh nhân đặt qua thông tin người nhà.


# **7. Yêu Cầu Chức Năng — Role Y Tá (Role 3)**
## **7.1 Màn Hình Check-in Bệnh nhân**
- Xem danh sách bệnh nhân có lịch hẹn trong ngày, sắp xếp theo giờ.
- Tìm kiếm bệnh nhân theo tên, CCCD, mã lịch hẹn.
- Xác nhận bệnh nhân đã đến (check-in): chuyển trạng thái từ "Chờ" sang "Đã đến".
- Ghi nhận giờ đến thực tế của bệnh nhân.
## **7.2 Quản Lý Hàng Chờ**
- Màn hình hàng chờ real-time: danh sách bệnh nhân đã check-in, chờ vào khám.
- Hiển thị: số thứ tự, tên bệnh nhân, bác sĩ, phòng khám, thời gian chờ ước tính.
- Gọi bệnh nhân vào: chuyển trạng thái "Đã đến" → "Đang khám", thông báo cho bác sĩ.
## **7.3 Theo Dõi Trạng Thái Phòng Khám**
- Tổng quan tất cả phòng khám: đang khám bệnh nhân nào, còn bao nhiêu người chờ.
- Cập nhật trạng thái phòng: Sẵn sàng / Đang khám / Nghỉ / Bảo trì.
## **7.4 Hỗ Trợ Bác Sĩ**
- Nhập sơ bộ thông tin trước khám: huyết áp, nhiệt độ, cân nặng, chiều cao.
- Ghi nhận lý do khám nếu bệnh nhân bổ sung thêm thông tin khi đến.


# **8. Yêu Cầu Chức Năng — Role Kế Toán (Role 4)**
## **8.1 Quản Lý Hóa Đơn Viện Phí**
- Xem danh sách hóa đơn cần thanh toán theo ngày, trạng thái.
- Tạo hóa đơn từ lịch khám đã hoàn thành: tự động tính phí theo loại dịch vụ và khoa.
- Ghi nhận thanh toán tại quầy: tiền mặt, chuyển khoản. Cập nhật trạng thái hóa đơn.
- In hóa đơn (PDF) cho bệnh nhân.
- Quản lý hóa đơn chưa thanh toán / đã thanh toán / hủy.
## **8.2 Cấu Hình Giá Dịch Vụ**
- Thiết lập giá khám theo từng khoa.
- Thiết lập phụ phí theo loại dịch vụ: xét nghiệm, chiếu chụp, thủ thuật.
- Lịch sử thay đổi giá (audit log).
## **8.3 Báo Cáo Tài Chính**
- Báo cáo doanh thu theo ngày: tổng thu, số lượt khám, doanh thu theo khoa.
- Báo cáo doanh thu theo tháng: biểu đồ xu hướng, so sánh tháng trước.
- Báo cáo chi tiết: danh sách từng giao dịch với bộ lọc (khoa, bác sĩ, thời gian).
- Xuất báo cáo ra file Excel (.xlsx) hoặc PDF.


# **9. Yêu Cầu Chức Năng — Role Admin (Role 5)**
## **9.1 Quản Lý Nhân Sự**
- Thêm / sửa / xóa (soft delete) tài khoản: bác sĩ, y tá, kế toán, admin khác.
- Gán role và quyền cho từng tài khoản.
- Kích hoạt / vô hiệu hóa tài khoản nhân viên.
- Xem danh sách nhân sự theo khoa, theo role, theo trạng thái.
## **9.2 Quản Lý Khoa / Phòng Ban**
- Thêm / sửa / xóa khoa (tên, mô tả, ảnh đại diện, thông tin liên hệ riêng).
- Gán bác sĩ vào khoa, chuyển bác sĩ giữa các khoa.
- Quản lý phòng khám: tên phòng, khoa, trạng thái.
## **9.3 Cấu Hình Khung Giờ Làm Việc**
- Cấu hình giờ làm việc mặc định của bệnh viện (VD: 7:00 - 17:00, Thứ 2 - Thứ 7).
- Cấu hình lịch làm việc riêng cho từng bác sĩ: các ngày trong tuần, giờ bắt đầu/kết thúc.
- Thiết lập ngày nghỉ đặc biệt: bác sĩ nghỉ phép, ngày lễ, đóng phòng.
- Thời gian slot mặc định: 30 phút (AI có thể block nhiều slot liên tiếp tùy phức tạp).
## **9.4 Thống Kê & Giám Sát Hệ Thống**
- Dashboard tổng quan: tổng lịch hẹn hôm nay, tỷ lệ hoàn thành, khoa bận nhất.
- Thống kê theo khoa: số lượt khám, doanh thu, bác sĩ hoạt động.
- Thống kê theo bác sĩ: số lịch hẹn, tỷ lệ hoàn thành, thời gian khám trung bình.
- Audit log: nhật ký toàn bộ thao tác quan trọng trong hệ thống.
- Quản lý nội dung trang chủ: banner, tin tức, thông báo.


# **10. Yêu Cầu Phi Chức Năng**
## **10.1 Bảo Mật**
- Xác thực: JWT (Access Token 15 phút + Refresh Token 7 ngày) cho staff.
- Phân quyền: Spring Security + Role-based Access Control (RBAC).
- Mã hóa: HTTPS (TLS), mật khẩu hash BCrypt, dữ liệu nhạy cảm (CCCD) encrypt at rest.
- Input validation: backend validate toàn bộ đầu vào, chống SQL injection, XSS.
## **10.2 Hiệu Năng**
- Trang web công khai load < 3 giây (FCP).
- API response time < 500ms cho các endpoint thông thường.
- Slot blocking: sử dụng pessimistic locking để tránh double-booking.
## **10.3 Trải Nghiệm Người Dùng**
- Form đặt lịch: responsive (mobile-first), hỗ trợ tốt trên smartphone.
- Thông báo lỗi rõ ràng, hướng dẫn cụ thể (VD: "CCCD phải đủ 12 số").
- Xác nhận trước khi submit đặt lịch (preview thông tin).
## **10.4 Khả Năng Mở Rộng (cho tương lai)**
- Kiến trúc module hóa, dễ thêm tính năng mới (VD: thanh toán online, telemedicine).
- API RESTful chuẩn, có thể tích hợp app mobile sau này.
- Database migration qua Flyway: dễ nâng cấp schema mà không mất dữ liệu.
Hospital Management System — SRS v1.0
