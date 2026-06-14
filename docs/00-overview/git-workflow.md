# Git Workflow

> **Quy trình làm việc với Git** dành cho nhóm phát triển HMS.
> Phù hợp với mô hình **trunk-based development** và quy ước **conventional commits**.

---

## 1. Mô Hình Branch

HMS sử dụng **trunk-based development** — `master` là nhánh chính duy nhất, mọi thay đổi được tích hợp qua các feature branch ngắn hạn.

```
master  ───●────●────●────●────●────●────●──→
            \              /   \         /
feature/*    ●──●──●────●     ●──●──●──●
```

### Nguyên tắc chính

| Nguyên tắc | Mô tả |
|------------|-------|
| **Master luôn xanh** | `master` phải luôn ở trạng thái build thành công, test pass, sẵn sàng deploy. |
| **Feature branch ngắn hạn** | Branch feature sống tối đa 1-2 ngày. Nếu kéo dài hơn, rebase thường xuyên. |
| **Không commit trực tiếp lên master** | Mọi thay đổi phải thông qua pull request (PR). |
| **Tích hợp liên tục (CI)** | Mỗi push lên feature branch đều chạy CI để phát hiện lỗi sớm. |

### Luồng cơ bản

```
1. Tạo branch từ master
2. Code và commit trên feature branch
3. Mở Pull Request lên master
4. Chờ CI pass + review
5. Merge vào master
6. CD tự động deploy lên staging
```

---

## 2. Quy Tắc Đặt Tên Branch

Sử dụng tiền tố phân loại rõ ràng, theo dạng `loại/mô-tả-ngắn`:

| Loại | Cú pháp | Ví dụ |
|------|----------|-------|
| **Tính năng mới** | `feature/<ngắn-gọn-mô-tả>` | `feature/add-ai-endpoint` |
| **Sửa lỗi** | `fix/<ngắn-gọn-mô-tả>` | `fix/double-slot-booking` |
| **Cải tiến/hồi tố** | `refactor/<ngắn-gọn-mô-tả>` | `refactor/split-dashboard-views` |
| **Công việc kỹ thuật** | `chore/<ngắn-gọn-mô-tả>` | `chore/update-deps` |
| **Tài liệu** | `docs/<ngắn-gọn-mô-tả>` | `docs/api-guide` |
| **Hiệu năng** | `perf/<ngắn-gọn-mô-tả>` | `perf/cache-optimization` |
| **CI/CD** | `ci/<ngắn-gọn-mô-tả>` | `ci/split-parallel-jobs` |
| **Kiểm thử** | `test/<ngắn-gọn-mô-tả>` | `test/e2e-expand-coverage` |

### Quy tắc đặt tên

- Dùng chữ thường, phân tách bằng dấu gạch ngang (`-`)
- Mô tả ngắn gọn (3-5 từ), đủ hiểu nội dung chính
- Không dùng số thứ tự, tên cá nhân hay ngày tháng
- Sau khi merge, branch sẽ bị xoá

---

## 3. Commit Convention (Conventional Commits)

HMS áp dụng **Conventional Commits** — chuẩn commit có cấu trúc giúp tự động sinh changelog và xác định version bump.

### Cấu trúc

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Các type bắt buộc

| Type | Ý nghĩa | Ví dụ |
|------|---------|-------|
| `feat` | Tính năng mới | `feat: add AI integration endpoints` |
| `fix` | Sửa lỗi | `fix: resolve double booking race condition` |
| `refactor` | Tái cấu trúc code, không thay đổi hành vi | `refactor: extract role-specific dashboard` |
| `docs` | Cập nhật tài liệu | `docs: rewrite README with diagrams` |
| `test` | Thêm hoặc sửa test | `test: add comprehensive API integration coverage` |
| `chore` | Bảo trì, cập nhật dependencies, config | `chore: add Chrome DevTools MCP config` |
| `perf` | Cải thiện hiệu năng | `perf: split CI into 3 parallel jobs` |
| `ci` | Thay đổi CI/CD pipeline | `ci: add web docker build and non-billing gates` |
| `trigger` | Kích hoạt lại pipeline (không đổi code) | `trigger: fresh CI run with prometheus fix` |

### Scope (không bắt buộc, dùng khi cần)

Scope giúp xác định rõ module bị ảnh hưởng:

```
feat(lab-results): add staff result creation flow
fix(api): normalize lab result IDs and tighten queue data
fix(pages): harden public pages with error boundaries
test(e2e): stabilize visual baselines
docs(onboarding): add interactive codebase guide
```

### Body (khi commit phức tạp)

Sử dụng body khi commit cần giải thích thêm. Body được ngăn cách với title bằng một dòng trống.

```
feat: add secure AI integration endpoints and tests

Implements AI-powered diagnosis suggestions behind a feature flag.
Includes rate limiting, input sanitization, and audit logging.
```

### Co-Authored-By

Mọi commit do AI hỗ trợ (Claude Code) đều kèm co-author:

```
feat: add pharmacy dispensing workflow

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Quy tắc viết commit tốt

1. **Subject line**: Tối đa 72 ký tự, viết chữ thường, không có dấu chấm cuối
2. **Dùng động từ nguyên mẫu**: "add", "fix", "remove" — không dùng "added", "fixed", "removed"
3. **Mô tả cái gì và tại sao**, không mô tả code thế nào
4. **Một commit = một thay đổi logic**: không gộp nhiều việc không liên quan

### Ví dụ commit trong HMS

```
# Tot (commit có thể đứng một mình)
feat: add CSV export and date range filters to invoices

# Tot (có scope)
fix(api): normalize lab result IDs

# Tot (có body và footer)
feat: integrate observability stack

Adds Prometheus metrics, structured logging, and OpenTelemetry
tracing configured via docker-compose.observability.yml.

Closes #42
Co-Authored-By: Claude <noreply@anthropic.com>

# Không tôt
updated some files
fix bug
WIP
```

---

## 4. Pull Request Workflow

### Khi nào mở PR

- Feature/fix hoàn chỉnh, đã chạy test local thành công
- Commit đã clean, không còn WIP/debug code
- Branch đã được rebase lên master mới nhất

### Quy trình PR

```
1. git checkout master && git pull
2. git checkout -b feature/your-feature
3. Code, commit, push (nhiều lần)
4. git rebase master (trước khi mở PR)
5. Mở Pull Request lên master
6. CI chạy tự động
7. Được review và approve (tối thiểu 1 reviewer)
8. Merge (Squash & Merge)
```

### Nội dung PR bắt buộc

Mỗi PR phải có:

1. **Link issue/ticket** — tham chiếu tới GitHub Issue hoặc Jira
2. **Mô tả thay đổi** — tổng quan ngắn gọn, những file/module chính bị ảnh hưởng
3. **Mô tả kiểm thử** — test nào đã chạy, kịch bản kiểm thử thủ công (nếu có)
4. **Lưu ý migration/breaking changes** — có migration DB không, có thay đổi API contract không
5. **Reviewer** — gán người review phù hợp

### Cách viết PR summary

Khi soạn PR summary, cần:

- **Phân tích toàn bộ commit history**, không chỉ commit cuối
- **Dùng `git diff <base-branch>...HEAD`** để xem toàn bộ thay đổi
- **Viết test plan** với các TODO cụ thể cho QA

### Template PR

```markdown
## Mô tả
<!-- Tổng quan về PR này -->

## Thay đổi chính
- Module A: thêm tính năng X
- Module B: sửa lỗi Y
- Module C: tái cấu trúc Z

## Kiểm thử
- [ ] Unit test: thêm N test cho module A
- [ ] Integration test: chạy `mvn verify` trên backend
- [ ] E2E test: chạy `npm run test:e2e:ci` trên frontend
- [ ] Kiểm thử thủ công: ...

## Lưu ý
- Migration: có/không
- Breaking changes: có/không
- Cần config mới: có/không

## Screenshots (nếu có)

Related issue: #123
```

### Checklist trước khi merge

- [ ] CI pass (HMS CI workflow) — CodeQL + Backend test + Frontend test + Docker build
- [ ] CodeQL security scan không có CRITICAL/HIGH issue
- [ ] Test coverage >= 80% (backend: JaCoCo, frontend: Vitest)
- [ ] Playwright E2E pass (183+ scenarios)
- [ ] Docker image build và push lên GHCR thành công (nếu là merge vào master)
- [ ] Ít nhất 1 reviewer approve
- [ ] Không còn WIP, `console.log`, TODO comment, secret hardcode
- [ ] Branch đã rebase lên master mới nhất

---

## 5. CI/CD Tích Hợp

HMS có 4 GitHub Actions workflows:

| Workflow | File | Trigger | Mục đích |
|----------|------|---------|----------|
| **HMS CI** | `ci.yml` | Push lên master/PR | Build, test, lint, scan, push Docker images lên GHCR |
| **CD** | `cd.yml` | CI completed + branch master | Deploy lên staging/production |
| **Rollback** | `rollback.yml` | workflow_dispatch | Rollback về phiên bản trước |
| **Security Scan** | `security-scan.yml` | Push/PR | Secret scanning + dependency audit |

### CI Pipeline (hms-ci)

Khi push lên feature branch hoặc master:

```
1. Path detection     → Xác định module thay đổi (backend/frontend/infra)
2. CodeQL scan        → Security analysis (Java + JS/TS)
3. Backend test       → Maven verify + JaCoCo coverage (148 tests)
4. Frontend test      → Lint + Vitest + Next build + Playwright E2E (183 tests)
5. Observability      → Validate docker-compose config
6. Docker push        → Build & push images lên GHCR (chỉ trên push master)
```

### CD Pipeline

Sau khi CI pass trên master:

```
1. Deploy staging      → Tự động (nếu CI success)
2. Deploy production   → Manual trigger (workflow_dispatch)
```

---

## 6. Các Lệnh Git Thông Dụng

### Khởi đầu feature mới

```bash
git checkout master
git pull
git checkout -b feature/ten-tinh-nang
```

### Commit và push

```bash
git add .
git commit -m "feat: add pharmacy dispensing workflow"
git push -u origin feature/ten-tinh-nang
```

### Rebase lên master (trước khi mở PR)

```bash
git checkout feature/ten-tinh-nang
git fetch origin
git rebase origin/master
# giải quyết conflict nếu có
git push --force-with-lease
```

### Xem toàn bộ thay đổi so với master

```bash
git diff origin/master...HEAD
```

### Xoá branch sau khi merge

```bash
git branch -d feature/ten-tinh-nang                    # local
git push origin --delete feature/ten-tinh-nang         # remote
```

---

## 7. Thông Tin Cấu Hình Git

Thông tin Git của dự án:

- **User name**: `tranhquan099-commits`
- **User email**: `tranhquan099@gmail.com`
- **Default branch**: `master`
- **Remote**: `origin` (GitHub)
- **Registry**: `ghcr.io` (GitHub Container Registry)

---

## 8. Tài Liệu Tham Khảo

- [Conventional Commits](https://www.conventionalcommits.org/) — Chuẩn commit message
- [Trunk-Based Development](https://trunkbaseddevelopment.com/) — Mô hình branch
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow) — Luồng GitHub cơ bản
