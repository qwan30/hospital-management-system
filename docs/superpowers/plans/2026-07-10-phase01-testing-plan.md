# Phase 0 & 1 Sub-Agent Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Mỗi task đều áp dụng nguyên tắc: Maker lập plan/làm -> Reviewer kiểm tra -> Maker sửa (nếu cần) -> Reviewer chốt.

**Goal:** Thực thi Giai đoạn 0 (Khởi tạo Infra) và Giai đoạn 1 (Deep Audit tài liệu và code) bằng các cặp Maker-Reviewer Sub-agent để xuất ra Báo cáo sai lệch chi tiết.

**Architecture:** 
- Giai đoạn 0 sử dụng **Infra Agent (Maker)** và **Infra Reviewer**.
- Giai đoạn 1 sử dụng **Doc-Code Auditor Agent (Maker)** và **Logic Verifier Agent (Reviewer)**.

**Tech Stack:** Docker, Java Spring Boot, Next.js, Markdown.

## Global Constraints
- **Adversarial Review**: Bắt buộc tuân thủ luồng: Reviewer duyệt kế hoạch của Maker -> Maker chạy -> Reviewer check kết quả thực tế.
- **Retry Loop**: Nếu Reviewer đánh giá Fail, Maker phải chạy lại (Tối đa 3 lần).
- **Temporary Reporting**: Logic nghiệp vụ chưa thể test tĩnh (static) phải được đưa vào `Temporary_Drift_Report.md`.
- **Thư mục báo cáo**: Mọi report lưu tại `docs/audits/`.

---

### Task 1: Phase 0 - Khởi tạo Infra (Maker: Infra Agent)

**Files:**
- Xem xét: `docker-compose.yml` (hoặc cấu hình tương đương ở root)

**Interfaces:**
- Produces: Các container Docker đang chạy (PostgreSQL, Backend, Frontend).

- [ ] **Step 1: Kiểm tra trạng thái Docker hiện tại**
```bash
docker ps
```
*Expected:* Hiển thị danh sách container đang chạy (để xem port có bị chiếm dụng không).

- [ ] **Step 2: Khởi động môi trường**
```bash
docker-compose up -d
```
*Expected:* Output cho thấy network và các container được tạo thành công.

---

### Task 2: Phase 0 - Kiểm tra Infra (Reviewer: Infra Reviewer)

**Files:** Không trực tiếp chỉnh sửa file code.

- [ ] **Step 1: Xác nhận Container Up**
```bash
docker-compose ps
```
*Expected:* Các container db, backend, frontend đều có State là `Up`.

- [ ] **Step 2: Ping Health Check**
```bash
curl -s http://localhost:8080/actuator/health
```
*Expected:* Output trả về json báo health status là `UP`. (Reviewer chốt chặn: Nếu Fail, yêu cầu Maker check lại logs container).

---

### Task 3: Phase 1 - Deep Audit (Maker: Doc-Code Auditor Agent)

**Files:**
- Create: `docs/audits/Phase1_Drift_Report.md`
- Create: `docs/audits/Temporary_Drift_Report.md`

- [ ] **Step 1: Khảo sát Code & Docs**
Dùng lệnh tìm kiếm (grep) hoặc đọc trực tiếp cấu trúc `backend/src/main/java/` và so sánh với `docs/04-architecture/` cùng `docs/05-api/`.

- [ ] **Step 2: Đối soát Business Logic (DDD Contexts)**
Đọc `README.md` để lấy danh sách Bounded Contexts. Đối chiếu logic phân quyền (RBAC) và mã hóa (PHI Encryption) giữa tài liệu thiết kế và code thực tế. 

- [ ] **Step 3: Ghi chép Báo cáo**
Tạo file `Phase1_Drift_Report.md` ghi nhận các sai lệch tĩnh (tên file, cấu trúc, API contract).
Tạo file `Temporary_Drift_Report.md` ghi nhận các luồng nghiệp vụ phức tạp cần Giai đoạn 3 (Runtime/E2E) để kiểm chứng.

---

### Task 4: Phase 1 - Xác thực Logic (Reviewer: Logic Verifier Agent)

**Files:**
- Modify: `docs/audits/Phase1_Drift_Report.md`
- Modify: `docs/audits/Temporary_Drift_Report.md`

- [ ] **Step 1: Đánh giá độ chính xác (Cross-check)**
Reviewer đọc `Phase1_Drift_Report.md`. Truy cập ngẫu nhiên 2-3 điểm sai lệch do Maker chỉ ra để kiểm chứng độc lập xem Maker nói đúng không (ví dụ: Maker bảo thiếu API X, Reviewer sẽ search lại code xem API X có bị đổi tên không).

- [ ] **Step 2: Phân loại Mức độ Nghiêm trọng (Severity)**
Cập nhật file `Phase1_Drift_Report.md` bằng cách gắn thẻ [CRITICAL], [HIGH], [MEDIUM], [LOW] cho từng lỗi. 
Nếu phát hiện Maker bỏ sót các domain lớn, kích hoạt *Retry Loop* yêu cầu Maker quét lại.

- [ ] **Step 3: Chốt chặn Giai đoạn 1**
In ra terminal tóm tắt kết quả kiểm tra. Xác nhận hoàn tất Giai đoạn 1 và sẵn sàng chuyển giao (Handoff) sang Giai đoạn 2.
