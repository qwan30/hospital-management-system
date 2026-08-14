# Kịch bản quay video demo portfolio — Hospital Management System

> Bản source-backed cho repository tại commit `9770df1`, phân tích ngày 2026-07-28.
> Ngôn ngữ trình bày: tiếng Việt. Thời lượng mục tiêu: **8–9 phút**.

## 1. Mục tiêu của video

Video không nên đi qua mọi màn hình. Câu chuyện mạnh nhất của dự án là một hành trình bệnh nhân xuyên suốt nhiều vai trò:

```text
Đặt lịch công khai
  → lễ tân check-in
  → điều dưỡng quản lý hàng đợi và sinh hiệu
  → bác sĩ khám, lập hồ sơ và kê đơn
  → dược sĩ cấp thuốc theo lô
  → kế toán thu tiền và xem doanh thu
  → quản trị viên kiểm tra audit log
```

Thông điệp chính dành cho nhà tuyển dụng:

> Đây không chỉ là một bộ giao diện quản lý. Hệ thống kết nối luồng nghiệp vụ bệnh viện từ đầu đến cuối, đồng thời xử lý các vấn đề backend thực tế như chống đặt lịch trùng, kiểm soát trạng thái, bảo vệ dữ liệu định danh, phân quyền theo vai trò, truy vết cấp thuốc và audit thao tác nhạy cảm.

## 2. Những phần đáng demo nhất sau khi phân tích source

| Ưu tiên | Phần demo | Vì sao mạnh cho portfolio | Bằng chứng trong source |
| --- | --- | --- | --- |
| 1 | Đặt lịch công khai | Có dữ liệu bác sĩ và slot thật từ API, tạo mã xác nhận; backend khóa cửa sổ slot trong transaction và kiểm tra các slot liên tiếp | `frontend/src/app/(public)/booking/page.tsx`, `AppointmentWriteService#createAppointment`, `TimeSlotRepository#findByIdForUpdate`, `TimeSlotRepository#lockWindow` |
| 2 | Queue và tiếp nhận | Thể hiện phối hợp lễ tân–điều dưỡng–bác sĩ bằng các trạng thái và hành động check-in, gọi bệnh nhân, gán phòng, bắt đầu/hoàn tất khám | `frontend/src/app/staff/(app)/queue/page.tsx`, `QueueController`, `AppointmentWorkflowService` |
| 3 | EHR và đơn thuốc | Là phần clinical có chiều sâu: chẩn đoán, sinh hiệu, ghi chú, thuốc, liều dùng, tần suất, lịch tái khám và PDF đơn thuốc | `frontend/src/app/staff/(app)/medical-records/[id]/edit/page.tsx`, `MedicalRecordController` |
| 4 | Cấp thuốc theo lô | Không chỉ giảm tồn kho: backend đối chiếu thuốc với đơn, kiểm tra lô, số lượng, ghi inventory movement, audit và metrics | `frontend/src/app/staff/(app)/inventory/page.tsx`, `InventoryWriteService#dispenseMedication` |
| 5 | Hóa đơn và doanh thu | Có invoice, itemized charges, ghi nhận thanh toán, báo cáo ngày/tháng và phân rã doanh thu theo khoa | `frontend/src/app/staff/(app)/invoices/page.tsx`, `frontend/src/app/staff/(app)/revenue/page.tsx`, `InvoiceController`, `RevenueReportController` |
| 6 | Bảo mật và audit | Có thể chứng minh bằng cả UI lẫn code: RBAC ở backend, log 401/403, AES-GCM cho CCCD và SHA-256 cho tra cứu | `RbacAuthorizationService`, các controller dùng `@PreAuthorize`, `AuthorizationDenialAuditFilter`, `PatientIdentifierProtector` |

Không đưa vào luồng chính:

- Gửi/trả lời tin nhắn từ patient portal vì thao tác này chưa được triển khai.
- Bệnh nhân tự hủy hoặc đổi lịch vì API chưa được triển khai.
- Cổng thanh toán bên ngoài; hệ thống hiện ghi nhận payment nội bộ.
- “Live room board” riêng; luồng hiện có là gán phòng ngay trên queue.
- Các con số tuyệt đối như “production-ready”, “100% audited”, số endpoint hoặc số test nếu chưa chạy lại gate ngay trước khi quay.

## 3. Chuẩn bị trước khi quay

### 3.1. Dữ liệu và môi trường

- Dùng database chỉ chứa dữ liệu demo tổng hợp, không dùng dữ liệu bệnh nhân thật.
- Bật `HMS_RELEASE_DEMO_SEED_ENABLED=true` trước khi backend khởi tạo dữ liệu demo.
- Chuẩn bị `.env` cục bộ với `POSTGRES_PASSWORD`, `JWT_SECRET` và `PATIENT_IDENTIFIER_SECRET`; không hiển thị file này trong video.
- Kiểm tra trước các URL:
  - Frontend: `http://localhost:3000`
  - Backend health: `http://localhost:8081/actuator/health`
  - OpenAPI, nếu cần cảnh phụ: `http://localhost:8081/v3/api-docs`
- Chạy smoke test dữ liệu demo trước ngày quay; không reset database ngay trong lúc ghi hình.

### 3.2. Tài khoản nên mở sẵn thành các profile/tab riêng

| Profile trình duyệt | Tài khoản demo | Màn hình mở sẵn |
| --- | --- | --- |
| Guest | Không đăng nhập | `/booking` |
| Nurse/Reception | `nurse@hospital.vn` hoặc `receptionist@hospital.vn` | `/staff/queue` |
| Doctor | `doctor1@hospital.vn` | `/staff/doctor/dashboard` |
| Pharmacist | `pharmacist@hospital.vn` | `/staff/inventory` |
| Accountant | `accountant@hospital.vn` | `/staff/invoices` |
| Admin | `admin@hospital.vn` | `/admin/audit-logs` |
| Patient, cảnh tùy chọn | `patient@example.com` | `/portal/overview` |

Không đọc mật khẩu thành tiếng và không để password manager, token, cookie hoặc `.env` xuất hiện trên màn hình.

### 3.3. Checklist hình ảnh

- Quay ở 1440×900 hoặc 1920×1080, zoom trình duyệt 90–100%.
- Tắt thông báo desktop, bookmark bar và extension không liên quan.
- Dùng cùng một bệnh nhân/case xuyên suốt video để câu chuyện không bị đứt.
- Chuẩn bị sẵn một appointment ở từng trạng thái cần thiết: `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS` và `DONE`.
- Chuẩn bị một invoice `UNPAID`, một thuốc có lô còn tồn, và audit log có dữ liệu.
- Khi nhập CCCD trong cảnh booking, dùng dữ liệu tổng hợp và che bớt số nếu video được công khai.

## 4. Shot list tổng quát

| Thời gian | Hình ảnh/thao tác | Điểm muốn chứng minh |
| --- | --- | --- |
| 00:00–00:30 | Homepage và tiêu đề dự án | Bài toán và phạm vi hệ thống |
| 00:30–01:35 | Public booking, chọn bác sĩ/slot, nhận confirmation code | Luồng công khai nối với backend và chống trùng lịch |
| 01:35–02:35 | Staff queue: check-in, call, room, start | State machine và phối hợp nhiều vai trò |
| 02:35–04:10 | Doctor dashboard và Patient Record Entry | EHR, đơn thuốc, tái khám, PDF |
| 04:10–05:15 | Inventory: alert, lot, dispense, movement | Lot traceability và kiểm tra đơn thuốc |
| 05:15–06:15 | Invoice: itemized charges, Pay; Revenue Monitor | Khép kín luồng tài chính |
| 06:15–07:20 | Audit log + cảnh code bảo mật | RBAC, audit denial và bảo vệ PHI |
| 07:20–08:10 | Patient portal hoặc admin dashboard | Góc nhìn tổng hợp sau hành trình khám |
| 08:10–08:40 | Màn hình kết + sơ đồ kiến trúc | Tóm tắt năng lực kỹ thuật |

## 5. Kịch bản nói chi tiết

Các đoạn trong khối trích dẫn là lời nói. Phần **Thao tác** không đọc thành tiếng.

### Cảnh 1 — Mở đầu: bài toán và phạm vi (00:00–00:30)

**Thao tác:** Mở homepage, cuộn nhẹ qua khoa, bác sĩ và CTA đặt lịch. Hiển thị title card “Hospital Management System — End-to-End Clinical Workflow”.

> Xin chào, đây là Hospital Management System — một hệ thống quản lý bệnh viện full-stack mà tôi xây dựng để kết nối toàn bộ hành trình khám bệnh, từ đặt lịch, tiếp nhận, khám và kê đơn, đến cấp thuốc, thanh toán và kiểm soát vận hành.
>
> Trong video này, tôi sẽ không chỉ đi qua các màn hình. Tôi sẽ theo một ca bệnh xuyên suốt nhiều vai trò để cho thấy dữ liệu và quy tắc nghiệp vụ được nối với nhau như thế nào.

### Cảnh 2 — Đặt lịch công khai và chống double-booking (00:30–01:35)

**Thao tác:** Mở `/booking`, chọn bác sĩ, ngày và slot; điền nhanh dữ liệu tổng hợp; chọn triệu chứng; bấm **Confirm Appointment**; zoom vào confirmation code.

> Đầu tiên, bệnh nhân có thể đặt lịch mà không cần tài khoản. Danh sách bác sĩ và khung giờ trống được tải từ backend, sau đó người dùng chọn lịch, nhập thông tin liên hệ và mô tả triệu chứng.
>
> Khi tôi xác nhận, backend tạo appointment và trả về một mã xác nhận riêng. Điểm kỹ thuật quan trọng ở đây là hệ thống không chỉ kiểm tra slot ở giao diện. Trong transaction, service khóa slot được chọn và cả cửa sổ thời gian liên tiếp, xác nhận chúng vẫn còn khả dụng, rồi mới đánh dấu đã đặt. Nhờ vậy hai request đồng thời không thể cùng chiếm một lịch khám.

**Cảnh code phụ 4–6 giây:** Hiển thị `AppointmentWriteService#createAppointment`, tập trung vào `findByIdForUpdate`, `lockWindow`, `validateSlots` và trạng thái `BOOKED`.

> Cơ chế này đặt tính nhất quán ở backend — nơi mới thực sự kiểm soát dữ liệu — thay vì phụ thuộc vào trạng thái tạm thời trên trình duyệt.

### Cảnh 3 — Check-in, queue và sinh hiệu (01:35–02:35)

**Thao tác:** Chuyển sang profile Nurse/Receptionist tại `/staff/queue`. Chọn đúng bệnh nhân vừa chuẩn bị; bấm **Check in**, sau đó **Call**, **Room**, và nếu dữ liệu cho phép thì **Start**. Mở `/staff/vital-signs` hoặc `/staff/nurse-intake` để cho thấy sinh hiệu.

> Khi bệnh nhân đến viện, lễ tân hoặc điều dưỡng đưa lịch hẹn vào luồng tiếp nhận. Queue board hiển thị danh sách trong ngày và cho phép check-in, gọi bệnh nhân, gán phòng, bắt đầu khám, bỏ qua hoặc hoàn tất theo đúng trạng thái hiện tại.
>
> Sau check-in, điều dưỡng có thể ghi huyết áp, nhiệt độ, cân nặng và chiều cao. Những dữ liệu này đi cùng appointment để bác sĩ không phải nhập lại. Các transition không hợp lệ bị từ chối ở backend; vì vậy nút trên UI chỉ là trải nghiệm người dùng, còn quy tắc trạng thái vẫn được bảo vệ ở tầng nghiệp vụ.

### Cảnh 4 — Bác sĩ khám, lập EHR và kê đơn (02:35–04:10)

**Thao tác:** Chuyển sang Doctor profile tại `/staff/doctor/dashboard`. Lọc appointment `CHECKED_IN`, bấm **Start Consultation**, mở hồ sơ bệnh án tương ứng. Tại **Patient Record Entry**, điền diagnosis, clinical notes, một thuốc, dosage, frequency, duration và follow-up date; bấm **Commit Record**. Sau khi thành công, mở prescription PDF/preview.

> Ở vai trò bác sĩ, dashboard lấy lịch hẹn từ API và phân tách rõ các ca đã check-in, đang khám và đã hoàn tất. Chỉ appointment đã check-in mới có thể bắt đầu consultation.
>
> Trong hồ sơ bệnh án, bác sĩ thấy lại thông tin bệnh nhân, triệu chứng ban đầu và sinh hiệu. Tôi có thể ghi chẩn đoán, quan sát lâm sàng, thêm nhiều thuốc với liều dùng, tần suất, số ngày sử dụng và lịch tái khám.
>
> Khi commit, medical record được lưu ở backend và trạng thái appointment được cập nhật theo workflow. Đơn thuốc sau đó có thể được tạo thành PDF. Đây là phần tôi muốn nhấn mạnh trong dự án: EHR không phải một form đứng riêng lẻ; nó nối trực tiếp với lịch hẹn, dữ liệu tiếp nhận, prescription và các bước phía sau.

**Mẹo quay:** Không nhập chậm từng trường. Chuẩn bị nội dung trong clipboard và paste theo từng nhóm để giữ nhịp video.

### Cảnh 5 — Cấp thuốc theo lô và truy vết tồn kho (04:10–05:15)

**Thao tác:** Chuyển sang Pharmacist profile tại `/staff/inventory`. Cho thấy KPI **Critical Alerts**, **Expiry Warnings**, danh sách item/lô và **Recent Movements**. Mở **Dispense**, chọn item, lot, medical record, tên thuốc trong đơn và quantity; xác nhận cấp thuốc; zoom vào success message và movement mới.

> Sau khi có đơn, dược sĩ làm việc tại Inventory Workspace. Màn hình này theo dõi số lượng tồn, ngưỡng đặt hàng lại, lô thuốc sắp hết hạn, cảnh báo thiếu hàng và lịch sử biến động.
>
> Luồng cấp thuốc có nhiều kiểm tra hơn một phép trừ số lượng. Backend khóa item và lot, xác nhận lô thuộc đúng mặt hàng, đối chiếu tên thuốc với prescription trong medical record, kiểm tra tồn ở cả cấp item và cấp lot, rồi mới ghi giảm tồn. Mỗi lần cấp thuốc tạo một inventory movement gắn với bệnh nhân, hồ sơ và mã lô, đồng thời ghi audit và metric.
>
> Điều này giúp truy vết được thuốc nào, từ lô nào, đã cấp cho ca bệnh nào — một ràng buộc rất quan trọng trong nghiệp vụ dược.

**Cảnh code phụ 4–6 giây:** Hiển thị `InventoryWriteService#dispenseMedication`, tập trung vào kiểm tra prescription, lot, quantity và `PHARMACY_MEDICATION_DISPENSED`.

### Cảnh 6 — Hóa đơn, payment và revenue (05:15–06:15)

**Thao tác:** Chuyển sang Accountant profile tại `/staff/invoices`. Mở một invoice `UNPAID` để thấy itemized charges, chọn payment method và bấm ghi nhận thanh toán. Chuyển sang `/staff/revenue`, đổi Daily/Monthly và chọn ngày/tháng có dữ liệu.

> Ở bước tài chính, invoice tổng hợp các khoản phí theo từng hạng mục thay vì chỉ hiển thị một con số cuối cùng. Với hóa đơn chưa thanh toán, kế toán chọn phương thức và ghi nhận payment; trạng thái invoice chuyển sang paid và được phản ánh trong báo cáo doanh thu.
>
> Revenue Monitor hỗ trợ báo cáo theo ngày hoặc theo tháng, cùng số hóa đơn đã thanh toán và phân rã doanh thu theo khoa ở báo cáo ngày. Dự án chủ động giới hạn phạm vi ở việc ghi nhận thanh toán nội bộ; tích hợp cổng thanh toán bên ngoài không được giả lập thành một chức năng đã hoàn thành.

### Cảnh 7 — RBAC, bảo vệ PHI và audit trail (06:15–07:20)

**Thao tác:** Thử mở `/admin/users` bằng profile Nurse/Accountant để nhận forbidden hoặc bị điều hướng. Sau đó chuyển sang Admin profile tại `/admin/audit-logs`, lọc theo action/severity và cho thấy event từ queue hoặc inventory. Chèn hai cảnh code ngắn.

> Với dữ liệu y tế, phân quyền chỉ ở menu là chưa đủ. Các API nhạy cảm trong luồng demo kiểm tra permission bằng `@PreAuthorize`; frontend guard chỉ giúp điều hướng, còn backend vẫn là nguồn quyết định cuối cùng cho 401 và 403. Hệ thống cũng có filter để ghi audit event cho các request được bảo vệ khi bị từ chối.
>
> Với thông tin định danh như CCCD, hệ thống mã hóa dữ liệu lưu trữ bằng AES-GCM. Một SHA-256 hash riêng được dùng để tra cứu mà không cần lưu plaintext làm khóa tìm kiếm.
>
> Ở Audit Logs, quản trị viên có thể lọc thao tác theo actor, action và mức độ, theo dõi các sự kiện bảo mật, queue, inventory và quản trị. Như vậy, bảo mật trong dự án không phải một trang giới thiệu; nó xuất hiện ở storage, authorization và vận hành.

**Cảnh code phụ:**

1. `PatientIdentifierProtector`: `AES/GCM/NoPadding` và `SHA-256`.
2. Một controller có `@PreAuthorize`, sau đó `AuthorizationDenialAuditFilter` xử lý 401/403.

### Cảnh 8 — Patient portal hoặc góc nhìn tổng hợp (07:20–08:10)

**Thao tác:** Mở `/portal/overview`, sau đó lướt nhanh appointments, lab results và records. Nếu portal không có dữ liệu đẹp, thay bằng `/admin/dashboard` và `/admin/monitoring`.

> Sau cùng, bệnh nhân có một portal riêng để xem tổng quan, lịch hẹn, hồ sơ và kết quả xét nghiệm thuộc phạm vi của mình. Đây là điểm khép lại hành trình: cùng một dữ liệu được trình bày khác nhau theo nhu cầu và quyền của bệnh nhân, nhân viên lâm sàng, dược sĩ, kế toán và quản trị viên.
>
> Những thao tác chưa được backend hỗ trợ, như bệnh nhân tự đổi lịch hoặc trả lời tin nhắn, tôi giữ ở ngoài phạm vi demo thay vì mô phỏng bằng dữ liệu tĩnh.

### Cảnh 9 — Kết luận (08:10–08:40)

**Thao tác:** Hiện sơ đồ đơn giản `Next.js → Spring Security/REST → Application/Domain → PostgreSQL`, rồi montage nhanh booking, EHR, inventory và audit log. Hiện GitHub/portfolio URL ở cuối.

> Về kiến trúc, hệ thống được tổ chức theo modular monolith và Domain-Driven Design: Next.js đảm nhiệm trải nghiệm theo vai trò, Spring Boot cung cấp REST API và security, các application service điều phối use case, còn domain giữ các quy tắc nghiệp vụ trước khi dữ liệu được lưu vào PostgreSQL.
>
> Qua dự án này, tôi muốn thể hiện khả năng xây dựng một sản phẩm full-stack có workflow liên phòng ban, tính nhất quán dữ liệu, authorization và khả năng truy vết — không chỉ ghép các màn hình CRUD. Cảm ơn bạn đã xem demo.

## 6. Phiên bản rút gọn 3 phút

Nếu nền tảng portfolio giới hạn thời lượng, giữ bốn cảnh sau:

1. **00:00–00:20:** Mở đầu và patient journey.
2. **00:20–01:00:** Booking + confirmation code + cutaway khóa slot.
3. **01:00–01:50:** Doctor EHR + prescription PDF.
4. **01:50–02:30:** Pharmacy dispense + lot movement.
5. **02:30–03:00:** Audit/RBAC + kết luận.

Trong bản 3 phút, dùng lời nối:

> Tôi chọn ba điểm khó nhất để demo: tính nhất quán khi đặt lịch, tính liên tục của hồ sơ lâm sàng và khả năng truy vết thuốc. Sau đó tôi chốt bằng cách hệ thống bảo vệ và audit các thao tác nhạy cảm.

## 7. Phương án dự phòng khi quay

| Sự cố | Cách xử lý không làm vỡ câu chuyện |
| --- | --- |
| Không còn slot trống | Dùng release-demo seed với future slot; chuẩn bị sẵn một booking đã xác nhận và nói “đây là kết quả backend trả về” |
| Không thể đi một patient xuyên suốt trong một take | Dùng các record tổng hợp đã seed nhưng giữ cùng tên bệnh nhân trong narration; không tuyên bố rằng vừa tạo record đó ở cảnh trước |
| Appointment không đúng trạng thái | Chuyển sang record seed ở trạng thái cần thiết; không sửa trạng thái trực tiếp trong database khi đang quay |
| Dispense bị từ chối | Kiểm tra medicine name khớp prescription, lot thuộc item và quantity còn đủ; giữ lại lỗi này làm cảnh phụ để chứng minh validation |
| Revenue ngày hiện tại bằng 0 | Chọn ngày/tháng của invoice đã seed hoặc chỉ demo invoice payment |
| Portal ít dữ liệu | Thay cảnh portal bằng admin dashboard và monitoring; không kéo dài để lấp thời gian |
| Mạng/email không hoạt động | Không tập trung vào email confirmation; confirmation code trên UI là bằng chứng chính của booking |

## 8. Cách nói để video chuyên nghiệp hơn

- Nói theo cấu trúc **bài toán → thao tác → quy tắc backend → giá trị nghiệp vụ**.
- Sau mỗi click quan trọng, dừng 1–2 giây để người xem thấy trạng thái thay đổi.
- Chỉ mở source code ở 2–3 đoạn ngắn; dùng highlight, không cuộn file dài.
- Không đọc tên công nghệ thành một danh sách. Chỉ nhắc công nghệ khi nó giải thích một quyết định.
- Dùng “hệ thống kiểm tra/từ chối/ghi nhận” thay cho “em có làm một API”.
- Nếu quay bằng tiếng Anh sau này, giữ nguyên cấu trúc cảnh; chỉ thay lời thoại, không thay câu chuyện.

## 9. Claim an toàn để đưa vào phần mô tả video

Có thể dùng:

> Full-stack Hospital Management System demonstrating an end-to-end clinical workflow across public booking, queue triage, EHR and e-prescriptions, lot-traceable pharmacy dispensing, billing, RBAC and audit logging. Built with Next.js, Spring Boot and PostgreSQL using a DDD modular-monolith architecture.

Không nên dùng nếu chưa có bằng chứng release mới ngay tại thời điểm đăng:

- “Production-ready” hoặc “deployed in a real hospital”.
- “Zero double-booking under any load”.
- “100% PHI compliant” hoặc “HIPAA certified”.
- “All actions are audited”.
- Con số latency, throughput, test count hoặc coverage chưa được tái tạo từ artifact hiện tại.

## 10. Source map dùng để kiểm tra lại trước ngày quay

| Nội dung cần xác nhận | File chính |
| --- | --- |
| Public booking UI | `frontend/src/app/(public)/booking/page.tsx` |
| Transactional booking và slot locking | `backend/application/src/main/java/com/hospital/core/appointment/AppointmentWriteService.java` |
| Pessimistic lock contract | `backend/domain/src/main/java/com/hospital/core/timeslot/TimeSlotRepository.java` |
| Queue board | `frontend/src/app/staff/(app)/queue/page.tsx` |
| Queue API permissions | `backend/controller/src/main/java/com/hospital/api/queue/QueueController.java` |
| Doctor dashboard | `frontend/src/app/staff/(app)/doctor/dashboard/page.tsx` |
| EHR và prescription form | `frontend/src/app/staff/(app)/medical-records/[id]/edit/page.tsx` |
| Prescription PDF API | `backend/controller/src/main/java/com/hospital/api/medicalrecord/MedicalRecordController.java` |
| Inventory/dispense UI | `frontend/src/app/staff/(app)/inventory/page.tsx` |
| Dispense validation, movement, audit, metrics | `backend/application/src/main/java/com/hospital/core/inventory/InventoryWriteService.java` |
| Invoice/payment | `frontend/src/app/staff/(app)/invoices/page.tsx`, `backend/controller/src/main/java/com/hospital/api/invoice/InvoiceController.java` |
| Revenue | `frontend/src/app/staff/(app)/revenue/page.tsx`, `RevenueReportController.java` |
| RBAC | `backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java` |
| Audit UI và denial audit | `frontend/src/app/admin/(app)/audit-logs/page.tsx`, `AuthorizationDenialAuditFilter.java` |
| AES-GCM và SHA-256 | `backend/infrastructure/src/main/java/com/hospital/core/patient/PatientIdentifierProtector.java` |
| Demo accounts và seed coverage | `docs/reference/demo-accounts-and-seed-data.md` |
| Phạm vi tích hợp và giới hạn hiện tại | `docs/reference/current-system-flows.md`, `docs/reference/role-screen-api-matrix.md` |

Trước khi quay chính thức, chạy lại luồng bằng dữ liệu demo hiện tại. Nếu UI hoặc seed đã thay đổi, ưu tiên source và hành vi runtime thay vì giữ nguyên lời thoại cũ.
