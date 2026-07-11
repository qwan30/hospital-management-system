# Phase 2 & 3: Granular & E2E Testing Plan

## Phase 2: Highly Parallel Domain Testing
Chạy 4 luồng kiểm thử độc lập (mỗi luồng có 1 Maker để test và 1 Reviewer để kiểm chứng):

### Luồng 1: Backend Security & API Auth
- **Maker (Security Tester)**: Chạy các test case liên quan đến JWT, RBAC (kiểm tra phân quyền 36 roles), mã hóa AES-GCM. Lệnh dự kiến: `mvn test -Dtest=*Security*`.
- **Reviewer (Security Reviewer)**: Đọc logs test, check coverage, phát hiện lỗ hổng logic phân quyền.

### Luồng 2: Clinical Workflows (DDD Domain Logic)
- **Maker (Domain Tester)**: Chạy unit/integration test cho các Bounded Contexts (Booking, Queue, EHR, Pharmacy, Billing). Đảm bảo không dính "Double-booking" hay sai state machine. Lệnh dự kiến: `mvn test -Dtest=*ServiceTest*`.
- **Reviewer (Domain Reviewer)**: Bắt lỗi transaction, invariants của DDD.

### Luồng 3: Frontend UI & Next.js App Router
- **Maker (Frontend Tester)**: Chạy test React component, check type. Lệnh dự kiến: `npm run test` (hoặc `npx vitest` / `jest` tuỳ repo).
- **Reviewer (Frontend Reviewer)**: Đảm bảo test suite check logic chứ không chỉ snapshot render.

### Luồng 4: Data Layer & PostgreSQL
- **Maker (DB Tester)**: Test Hibernate repositories, Flyway migrations.
- **Reviewer (DB Reviewer)**: Bắt lỗi N+1 query, rò rỉ dữ liệu.

## Phase 3: Real-User E2E & Business Evaluation
### Luồng 5: E2E Playwright Automation
- **Maker (Playwright Executor)**: Chạy `npx playwright test`.
- **Reviewer (Playwright Debugger)**: Phân tích trace/video nếu fail, loop lại cho Maker.

### Luồng 6: Human Simulation (Workflow Walkthrough)
- **Maker (Persona Agent)**: Dùng Browser Automation giả lập luồng: Lễ tân -> Bác sĩ -> Dược sĩ -> Thu ngân.
- **Reviewer (Quality Assessor)**: Đánh giá UI/UX, cập nhật kết quả vào Báo cáo Giai đoạn 1.

## Tổng hợp Báo cáo
Sau Phase 3, gộp tất cả báo cáo thành `Comprehensive_System_Report_VI.md` và chờ Người dùng duyệt (Human Gate).
