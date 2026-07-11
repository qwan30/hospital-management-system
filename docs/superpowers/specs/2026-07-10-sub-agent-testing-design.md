# Enterprise Hospital Management System (HMS) - Sub-Agent Testing Architecture (Santa Method)

## 1. Mục tiêu và Nguyên tắc Cốt lõi (Goals & Principles)
- **Kiểm toán sâu (Deep Audit & Technical Debt Prevention)**: Mục tiêu tối thượng của Giai đoạn 1 là rà soát toàn diện sự sai lệch giữa Tài liệu (`docs/`) và Mã nguồn (`app/`, `backend/`, `frontend/`), không chỉ ở cấp độ kỹ thuật mà còn ở **Logic Nghiệp vụ (Business Logic)**. Mọi khác biệt phải được triệt tiêu để tránh nợ kỹ thuật (Technical Debt).
- **Nguyên tắc "1 kèm 1" (Adversarial Review)**: KHÔNG MỘT HÀNH ĐỘNG NÀO của hệ thống được thực hiện mà không có Sub-agent Reviewer kiểm tra chéo.
- **Retry-Loop Logic (Vòng lặp ổn định)**: Khi có lỗi hoặc bất đồng, hệ thống sẽ tự động loop (Maker sửa -> Reviewer duyệt) cho đến khi trạng thái "Ổn định" (Stable).
- **Trì hoãn Thực thi (Deferred Execution)**: Hệ thống chạy xuyên suốt 3 Giai đoạn (Phases) chỉ để **Kiểm thử và Thu thập dữ liệu**, KHÔNG TỰ Ý SỬA CODE. Kết quả cuối cùng được tổng hợp thành một Report Toàn diện (Comprehensive Report). Người dùng (Human) sẽ review Report này, đánh giá các chức năng, và ra quyết định phê duyệt trước khi Agent bắt đầu quá trình thay đổi/fix code.
- **Báo cáo Tạm (Temporary Reporting)**: Nếu trong Giai đoạn 1 có những logic nghiệp vụ phức tạp chưa thể xác thực ngay (cần chạy E2E ở Giai đoạn 3 mới rõ), Auditor Agent sẽ ghi chú vào Báo cáo tạm và tự động cập nhật lại sau khi Giai đoạn 3 hoàn tất.

## 2. Kiến trúc Agent (Agent Architecture)

### 2.0. Giai đoạn 0: Setup & Infra (Môi trường)
- **Infra/Setup Agent (Maker)**: Vì Docker đã bật sẵn, chạy lệnh `docker-compose up -d`, seed mock data (PostgreSQL), và khởi động Spring Boot / Next.js.
- **Infra Reviewer Agent**: Ping các cổng (ports), check health endpoints, đảm bảo DB đã được seed chuẩn dữ liệu trước khi báo Cờ Xanh (Green Light) cho Giai đoạn 1.

### 2.1. Giai đoạn 1: Knowledge, Consistency & Business Logic Deep Audit
- **Phạm vi**: Quét toàn bộ `docs/` và đối chiếu với logic thực tế trong code (Java Spring Boot, Next.js).
- **Doc-Code Auditor Agent (Maker)**: 
  - So sánh kiến trúc, cấu trúc API, và test plan hiện tại.
  - Phân tích sâu vào **Logic Nghiệp vụ (Business Logic)**: Quy trình khám bệnh, RBAC, mã hóa PHI.
  - Tạo *Temporary_Drift_Report.md* (Báo cáo tạm) cho những logic cần runtime test.
- **Logic Verifier Agent (Reviewer)**: Kiểm tra chéo lỗi là do Document cũ hay Code sai thiết kế. Ép Auditor chạy lại nếu phân tích hời hợt.
- **Đầu ra**: `Phase1_Drift_Report.md`.

### 2.2. Giai đoạn 2: Highly Parallel Domain Testing (Kiểm thử vi mô Java & React)
Chạy đồng thời 4 luồng kiểm thử sâu vào code base hiện tại:

- **Cặp 1: Backend Security & API Auth**
  - *Security Tester*: Chạy test cho JWT, RBAC (36 quyền), AES-GCM PHI encryption.
  - *Security Reviewer*: Phân tích coverage, tìm lỗ hổng logic phân quyền.
- **Cặp 2: Clinical Workflows (DDD Domain Logic)**
  - *Domain Tester*: Test logic nghiệp vụ của các Bounded Contexts (Booking, Queue, EHR, Pharmacy, Billing). Đảm bảo chặn các ca "Double-booking" hoặc sai state machine.
  - *Domain Reviewer*: Kiểm tra các transaction rollbacks và invariants của DDD.
- **Cặp 3: Frontend UI & Next.js App Router**
  - *Frontend Tester*: Chạy test component React, typecheck.
  - *Frontend Reviewer*: Đánh giá xem test suite có thực sự kiểm tra UI logic hay chỉ render suông.
- **Cặp 4: Data Layer & PostgreSQL**
  - *DB Tester*: Test repositories, Flyway migrations, Hibernate queries.
  - *DB Reviewer*: Bắt các query N+1, thiếu index, hoặc rò rỉ dữ liệu.

### 2.3. Giai đoạn 3: Real-User E2E & Business Evaluation
Kiểm tra đầu cuối trên môi trường Live. Cập nhật lại Báo cáo tạm của Giai đoạn 1.

- **Cặp 5: E2E Playwright Automation**
  - *Playwright Executor*: Chạy bộ 203+ Playwright E2E scenarios.
  - *Playwright Debugger (Reviewer)*: Tự động tải trace/video chẩn đoán nếu test tạch. Loop báo lại cho Executor xác nhận lỗi.
- **Cặp 6: Human Simulation (Workflow Walkthrough)**
  - *Persona Agent*: Giả lập Bác sĩ/Lễ tân, điều khiển trình duyệt thật (qua MCP). Đi toàn bộ luồng: Lễ tân tiếp nhận -> Bác sĩ khám (EHR) -> Dược sĩ phát thuốc -> Thu ngân.
  - *Quality Assessor Agent (Reviewer)*: Đánh giá UI, UX, thông báo lỗi. Cập nhật kết quả xác thực nghiệp vụ vào Báo cáo của Giai đoạn 1.

## 3. Data Flow & Handoff (Luồng thực thi)
1. **[Giai đoạn 0]** Infra Agent -> Môi trường Ready.
2. **[Giai đoạn 1]** Auditor + Verifier -> Xuất `Temporary_Drift_Report.md` (Check Logic & Code).
3. **[Giai đoạn 2]** Domain Teams -> Chạy test song song -> Xuất `Phase2_Test_Results.md`.
4. **[Giai đoạn 3]** E2E Teams -> Chạy Playwright & Trình duyệt giả lập.
5. **[Tổng hợp]** Hệ thống tự động update kết quả GĐ3 vào GĐ1, kết hợp toàn bộ thành **`Comprehensive_System_Report_VI.md`**.
6. **[HUMAN GATE]** -> Người dùng (Human) đọc Report, đánh giá toàn bộ chức năng, phê duyệt các điểm sai lệch.
7. **[Action Phase]** -> Agent nhận lệnh phê duyệt để bắt đầu sửa code/docs. Infra Agent -> Teardown môi trường.
