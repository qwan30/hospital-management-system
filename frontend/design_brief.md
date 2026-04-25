# HMS Frontend Design Brief
**Project:** Hospital Management System
**Artifact:** `design-brief.md`
**Audience:** Designer, Frontend Developer
**Goal:** Production-ready handoff for full-system UI/UX, layout, behavior, state, and motion
**Design stack target:** React + shadcn/ui + Motion
**Visual direction:** Bám rất sát design system kiểu Stripe cho public surfaces; staff surfaces ưu tiên utilitarian, dense, explicit
**Language strategy:** Nội dung brief bằng tiếng Việt; route/component/API giữ English để thuận lợi cho handoff
**Source bundle used:** `DESIGN.md`, `HMS_PRD.md`, `HMS_SRS.md`, `api-contract.md`

## 1. Summary judgment

HMS không phải một sản phẩm đơn khối; đây là **4 surface khác nhau nhưng phải dùng chung một token system**: public discovery, booking, patient portal, clinical workspace, và back-office admin. Vấn đề thiết kế cốt lõi không phải là “làm đồng bộ mọi màn”, mà là **giữ brand premium trên public/portal trong khi staff screens phải dày thông tin, nhanh, rõ quyền hạn và ít ma sát**.

Quyết định tổng thể của brief này là: **một visual language, ba density modes, motion có kiểm soát**. Public và patient portal được phép “thở”, còn doctor/nurse/accountant/admin phải tối ưu scanability, tốc độ thao tác, trạng thái hệ thống rõ ràng và tuyệt đối không ngụy tạo capability ngoài API hiện có.

## 2. Contract alignment risks (HIGH RISK trước khi frontend implementation)

Các rủi ro dưới đây phải được chốt với backend trước khi code production. Thiết kế trong brief này đã cố tình chọn pattern an toàn để không khóa frontend vào assumption sai.

| Area | Tài liệu A | Tài liệu B | Rủi ro | Quyết định thiết kế tạm thời |
|---|---|---|---|---|
| Booking request shape | SRS nói booking form có `firstSlotId`, `aiDurationMinutes`, DOB, gender, address | API contract `POST /appointments` chỉ thể hiện email, phone, fullName, CCCD, doctorId, departmentId, date, time, reason, symptoms | Frontend dễ build thừa field hoặc submit sai DTO | UI giữ 3-step wizard. Step 3 chỉ coi contact/identity cốt lõi là **required for submit**, còn demographic mở dưới dạng optional/accordion cho tới khi DTO thật được xác nhận |
| Patient claim flow | SRS mô tả claim form có fullName, email, CCCD, DOB, password | API contract `POST /patient-auth/claim` đang nhận `cccd`, `email`, `verificationCode` | Không rõ claim là single-step hay activate-by-code | Thiết kế thành **2-step claim flow**: identify + verification. Password/set profile là block có thể bật nếu backend xác nhận |
| Medical record form naming | SRS dùng `clinicalNotes` | API contract dùng `notes` | Dev dễ map nhầm field | UI label hiển thị “Clinical notes”, nhưng implementation map phải cấu hình theo DTO cuối cùng |
| Internal assistant modes | SRS dùng `DOCS`, `PATIENT`, `HYBRID` | API contract dùng `CLINICAL_DECISION_SUPPORT`, `DOCUMENTATION`, `DIAGNOSIS_ASSIST`, `KNOWLEDGE_RETRIEVAL` | Mode UI và backend enum không khớp | UI vẫn dùng 3 tab thân thiện: **Docs / Patient / Hybrid**. Frontend adapter chịu trách nhiệm map sang backend enum cuối cùng |
| Nurse queue | SRS nhắc `GET /api/v1/queue/today` | API contract hiện tại không thấy mô tả endpoint queue | Queue board có thể không gọi được API | Thiết kế queue board vẫn tồn tại, nhưng có fallback: derive queue from `appointments/today` + checked-in status nếu queue API chưa chốt |
| Patient messages depth | PRD nhắc nested messages | API contract mới chỉ thể hiện thread summary list | 2-pane detail có thể thiếu payload | Messages page mặc định là **thread list + optional preview panel**, không thiết kế composer/reply |
| Invoice detail | PRD nhắc invoice list and detail | API contract excerpt rõ nhất là list + payment + void | Detail page độc lập có thể thiếu endpoint | Dùng **table + detail drawer** trước; chưa lock một route detail riêng nếu backend chưa có GET detail |
| Lab result attachment/comment | PRD nhắc attachment link và doctor comment | API contract hiện tại list payload không cho thấy attachment URL rõ ràng | Dễ overdesign panel chi tiết | UI chừa vùng “Attachment / clinician note” như optional slot, không coi là P1 bắt buộc |

## 3. Phase 1 — Capability map theo role và goal

### 3.1 Guest
- **Goal:** hiểu bệnh viện có gì, ai phù hợp, khi nào khám được
  - **Capability:** xem nội dung bệnh viện, department, doctor, slot availability
    - **Trigger:** vào Home / Departments / Doctors
    - **Output:** shortlist bác sĩ hoặc khoa phù hợp
    - **Error cases:** không có slot, bác sĩ không hoạt động, content thiếu ảnh/nội dung
- **Goal:** đặt lịch khám nhanh nhưng vẫn có cảm giác an toàn
  - **Capability:** symptom analysis + booking wizard + success confirmation
    - **Trigger:** CTA “Book appointment”
    - **Output:** appointment number + summary
    - **Error cases:** AI symptom analysis fail, slot vừa hết, validation sai, rate limit
- **Goal:** hỏi thông tin scoped
  - **Capability:** chatbot về khoa, bác sĩ, giờ làm, booking
    - **Trigger:** chatbot FAB hoặc CTA
    - **Output:** câu trả lời ngắn, định hướng tiếp theo
    - **Error cases:** rate limit, backend unavailable, question ngoài scope

### 3.2 Patient
- **Goal:** kích hoạt quyền truy cập portal
  - **Capability:** claim / verify / login
    - **Trigger:** portal landing hoặc email/SMS invite
    - **Output:** session patient hợp lệ
    - **Error cases:** CCCD không khớp, code sai, portal đã kích hoạt, token hết hạn
- **Goal:** xem nhanh trạng thái sức khỏe và lịch sử khám
  - **Capability:** overview, appointments, lab results, messages, profile
    - **Trigger:** login thành công
    - **Output:** next appointment, abnormal lab results, unread messages, editable profile
    - **Error cases:** dữ liệu rỗng, attachment thiếu, unauthorized, stale session

### 3.3 Doctor
- **Goal:** xử lý appointment của chính mình nhanh và an toàn
  - **Capability:** dashboard, appointment detail, status update, follow-up, medical record, PDF preview
    - **Trigger:** login hoặc deeplink từ danh sách
    - **Output:** appointment được cập nhật, medical record đã lưu, prescription PDF
    - **Error cases:** không đủ quyền, record save fail, follow-up invalid, PDF preview fail
- **Goal:** hiểu bối cảnh bệnh nhân trước khi ra quyết định
  - **Capability:** patient records, vitals, labs, assistant with patient context
    - **Trigger:** mở appointment detail hoặc patient browser
    - **Output:** clinical context đầy đủ, answer có citation
    - **Error cases:** partial data, assistant refuse, rate limit assistant

### 3.4 Nurse
- **Goal:** intake nhanh với ít click nhất có thể
  - **Capability:** today board, queue board, check-in, vital signs editor
    - **Trigger:** login vào ca làm
    - **Output:** bệnh nhân được check-in, vitals được ghi
    - **Error cases:** queue không đồng bộ, appointment đã cancel, input vital sai định dạng
- **Goal:** tham khảo trợ lý trong ngữ cảnh bệnh nhân đang chờ
  - **Capability:** assistant panel khóa theo current queue context
    - **Trigger:** chọn bệnh nhân trong intake/queue
    - **Output:** answer có citation, suggested next questions
    - **Error cases:** no patient context, rate limit, refusal state

### 3.5 Accountant
- **Goal:** kiểm soát doanh thu, hóa đơn, giá và tồn kho
  - **Capability:** invoices, payments, void, pricing, revenue, inventory
    - **Trigger:** login vào finance workspace
    - **Output:** invoice status rõ ràng, payment history cập nhật, revenue insight, low-stock visibility
    - **Error cases:** duplicate payment, void invalid, report empty, inventory quantity conflict

### 3.6 Admin
- **Goal:** quản trị master data và vận hành hệ thống
  - **Capability:** users, departments, rooms, schedule templates, closures, slots, public content, news, stats, monitoring, audit logs, knowledge docs
    - **Trigger:** login admin
    - **Output:** cấu hình hệ thống nhất quán, monitoring rõ trạng thái, knowledge docs được quản trị
    - **Error cases:** permission mismatch, invalid config, upload fail, reindex fail, audit log empty

## 4. Phase 2 — User journeys by role

### Journey A — Public booking
- **Actor:** Guest
- **Entry point:** Home, Department detail, Doctor detail
- **Steps:**
  1. Nhận diện bệnh viện và CTA booking
  2. Mô tả triệu chứng để nhận duration guidance
  3. Chọn bác sĩ và slot phù hợp
  4. Điền thông tin bệnh nhân / liên hệ
  5. Submit booking
  6. Nhận confirmation number + summary
- **Exit:** booking thành công, có mã xác nhận rõ ràng
- **Pain points:** AI fail, slot race condition, form dài, không rõ field bắt buộc
- **Frequency:** high
- **Criticality:** critical
- **Primary/Secondary:** **Primary**

### Journey B — Patient portal review
- **Actor:** Patient
- **Entry point:** Portal login / claim
- **Steps:**
  1. Claim hoặc login
  2. Vào overview
  3. Mở appointments hoặc lab results
  4. Xem message threads / profile
- **Exit:** bệnh nhân nắm được tình trạng tiếp theo
- **Pain points:** message chỉ read-only, session hết hạn, data rỗng dễ gây hoang mang
- **Frequency:** weekly / event-driven
- **Criticality:** standard
- **Primary/Secondary:** **Primary**

### Journey C — Doctor care completion
- **Actor:** Doctor
- **Entry point:** Staff login -> Doctor dashboard
- **Steps:**
  1. Lọc danh sách appointment
  2. Mở appointment detail
  3. Xem vitals / labs / patient history
  4. Cập nhật status
  5. Tạo medical record + prescription items
  6. Preview/download PDF và tạo follow-up nếu cần
- **Exit:** encounter được hoàn tất và lưu đúng
- **Pain points:** thiếu dữ liệu, save fail, đổi status không rõ hậu quả, assistant trả lời không đúng ngữ cảnh
- **Frequency:** daily / repeated
- **Criticality:** critical
- **Primary/Secondary:** **Primary**

### Journey D — Nurse intake
- **Actor:** Nurse
- **Entry point:** Staff login -> Nurse intake board
- **Steps:**
  1. Xem today list hoặc queue
  2. Chọn bệnh nhân
  3. Check-in
  4. Ghi vital signs
  5. Chuyển bệnh nhân sang trạng thái tiếp theo
- **Exit:** bệnh nhân sẵn sàng cho doctor
- **Pain points:** queue API chưa rõ, thao tác quá nhiều click, vitals validation khó
- **Frequency:** daily / repeated
- **Criticality:** critical
- **Primary/Secondary:** **Primary**

### Journey E — Accountant billing
- **Actor:** Accountant
- **Entry point:** Staff login -> Invoices
- **Steps:**
  1. Tìm invoice theo status/date
  2. Tạo invoice từ appointment
  3. Record payment hoặc void
  4. Kiểm tra pricing
  5. Xem revenue daily/monthly
  6. Kiểm tra inventory low stock nếu thuộc finance operations
- **Exit:** doanh thu và trạng thái thanh toán minh bạch
- **Pain points:** thiếu invoice detail endpoint, report empty, quantity reconciliation
- **Frequency:** daily
- **Criticality:** critical
- **Primary/Secondary:** **Primary**

### Journey F — Admin governance
- **Actor:** Admin
- **Entry point:** Staff login -> Admin shell
- **Steps:**
  1. Chọn module cần quản trị
  2. Xem list/filter
  3. Tạo hoặc chỉnh sửa record trong drawer/form
  4. Kiểm tra monitoring/stats/audit logs
  5. Upload hoặc reindex knowledge docs nếu cần
- **Exit:** cấu hình được cập nhật và có thể audit
- **Pain points:** module nhiều, dễ mất context, upload/reindex có nhiều trạng thái
- **Frequency:** daily / weekly
- **Criticality:** standard -> critical tùy module
- **Primary/Secondary:** **Primary**

### Journey G — Contextual assistant
- **Actor:** Doctor, Nurse, Admin
- **Entry point:** right-side assistant panel trong staff shell
- **Steps:**
  1. Mở panel
  2. Chọn mode hoặc nhận mode theo context
  3. Gửi câu hỏi
  4. Đọc answer + citations + follow-up prompts
  5. Gửi feedback
- **Exit:** có evidence-backed answer hoặc refusal rõ ràng
- **Pain points:** enum mode không khớp docs, rate limit 12/min, người dùng tưởng đây là free-form LLM
- **Frequency:** medium
- **Criticality:** standard nhưng high impact
- **Primary/Secondary:** **Secondary**

## 5. Phase 3 — IA, shell architecture, screen priorities

## 5.1 Route groups đề xuất

- **Public group**
  - `/`
  - `/departments`
  - `/departments/:departmentId`
  - `/doctors`
  - `/doctors/:doctorId`
  - `/booking`
  - `/booking/success`
  - `/news`

- **Portal group**
  - `/portal/claim`
  - `/portal/login`
  - `/portal`
  - `/portal/appointments`
  - `/portal/lab-results`
  - `/portal/messages`
  - `/portal/profile`

- **Staff group**
  - `/staff/login`
  - `/doctor`
  - `/doctor/appointments/:appointmentId`
  - `/doctor/medical-records/new`
  - `/doctor/patients`
  - `/nurse/intake`
  - `/nurse/queue`
  - `/accounting/invoices`
  - `/accounting/pricing`
  - `/accounting/revenue`
  - `/accounting/inventory`
  - `/admin/users`
  - `/admin/departments`
  - `/admin/rooms`
  - `/admin/schedule-templates`
  - `/admin/special-closures`
  - `/admin/slot-generation`
  - `/admin/content`
  - `/admin/news`
  - `/admin/stats`
  - `/admin/monitoring`
  - `/admin/audit-logs`
  - `/admin/knowledge-documents`

## 5.2 Shell decisions

### Public shell
- **Purpose:** build trust + route traffic into booking/discovery.
- **Primary action:** book appointment.
- **Layout:** sticky top navbar, centered content container, strong section rhythm, footer in dark indigo.
- **Density:** spacious.
- **Assistant:** chatbot FAB fixed bottom-right.
- **Motion budget:** subtle to moderate.

### Portal shell
- **Purpose:** giúp patient xem thông tin của chính mình với cảm giác an toàn, dễ hiểu.
- **Primary action:** view next appointment / lab results / messages.
- **Layout:** desktop có left sidebar + top header nhỏ; mobile dùng bottom nav + page title top bar.
- **Density:** balanced.
- **Motion budget:** subtle only.

### Staff shell
- **Purpose:** maximize scanability and task speed.
- **Primary action:** varies by role, nhưng luôn nằm trong viewport đầu tiên.
- **Layout:** 272px sidebar desktop, 88px collapsed, 64px top bar, main canvas ưu tiên table/form; assistant panel 400px bên phải khi mở.
- **Density:** dense.
- **Motion budget:** minimal.
- **Rule:** Drawer > modal cho edit records để không mất context.

## 5.3 Screen priorities

### P0 (phải frictionless ngay từ vòng đầu)
- Home
- Booking wizard
- Staff login
- Doctor dashboard
- Doctor appointment detail
- Medical record editor
- Nurse intake board
- Patient portal overview
- Invoices
- Internal assistant panel
- Session expired / permission denied states

### P1 (quan trọng nhưng có thể build sau P0)
- Departments / Department detail
- Doctors / Doctor detail
- Queue board
- Pricing
- Revenue
- Inventory
- Patient appointments / lab results / profile
- Admin users / departments / content / knowledge docs
- Audit logs

### P2 (đọc sâu, giám sát, phụ trợ)
- News list
- Prescription PDF preview
- Admin rooms / templates / closures / slot generation
- Admin stats / monitoring
- Message thread preview enhancements

## 6. Phase 4 — Design system decisions

## 6.1 Design direction

- **Tone**
  - Public: premium, trustworthy, warm-precise
  - Portal: calm, reassuring, readable
  - Staff: clinical / admin-utility / explicit
- **Density**
  - Public: spacious
  - Portal: balanced
  - Staff: dense by default
- **Brand personality:** precise, premium, quietly confident
- **Motion budget**
  - Public: moderate
  - Portal: subtle
  - Staff: minimal
- **Context split**
  - Public/portal: marketing trust + service clarity
  - Doctor/nurse: clinical focus
  - Accountant/admin: operational control

## 6.2 One system, three density modes

### Density mode A — Public
- Large headings, generous whitespace, card-based discovery
- Use purple as CTA and active accent
- Gradient/ruby/magenta chỉ dùng trang trí, không dùng cho semantic state

### Density mode B — Portal
- Smaller cards, calmer surface hierarchy
- Progressive disclosure mạnh hơn để không làm patient quá tải
- Semantic status vẫn rõ, nhưng copy phải đơn giản

### Density mode C — Staff
- Tight vertical rhythm, sticky filters, compact tables, persistent side actions
- Typography co lại, row density giảm whitespace, mọi icon quan trọng đều phải có text label hoặc tooltip
- Không dùng animation giải trí

## 6.3 Token decisions

### Color logic
- **Primary / brand action:** `#533AFD`
  - Use for primary CTA, active nav, selected tab, focus accents
  - Never use as success/error/warning state
- **Primary hover:** `#4434D4`
- **Heading / strong text:** `#061B31`
- **Secondary text:** `#64748D`
- **Label text:** `#273951`
- **Surface 0:** `#FFFFFF`
- **Surface 1:** `#F6F9FC`
- **Surface 2:** `#EEF4FA`
- **Border default:** `#E5EDF5`
- **Dark section / footer:** `#1C1E54`

### Semantic states
- **Success:** text `#108C3D`, bg `rgba(21,190,83,0.16)`, border `rgba(21,190,83,0.35)`
- **Warning:** text `#9B6829`, bg `rgba(155,104,41,0.14)`, border `rgba(155,104,41,0.35)`
- **Error:** text `#C81E4D`, bg `rgba(234,34,97,0.14)`, border `rgba(234,34,97,0.35)`
- **Info:** text `#2874AD`, bg `rgba(40,116,173,0.10)`, border `rgba(40,116,173,0.25)`

### Text hierarchy
- Chỉ giữ 3 level text thường xuyên:
  - **Primary**
  - **Secondary**
  - **Disabled / tertiary**
- Tránh thêm “muted-2”, “muted-3” nếu không thực sự cần; system càng ít text levels càng dễ scan.

### Spacing scale
- **Base unit:** 8px
- **Scale:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64
- Staff screens được phép dùng 6px trong table cell padding nội bộ, nhưng token public vẫn neo theo base 8.

### Typography
- **Target brand font:** `sohne-var`
- **Fallback production reality:** `Inter` hoặc `SF Pro Display` nếu licensing chưa có
- **Monospace:** `SourceCodePro` hoặc `Geist Mono`
- **Rule:** public dùng display size lớn, staff không dùng decorative headline
- **Clinical rule:** bảng dữ liệu, money, date/time phải dùng tabular numerals

### Elevation
- Level 0: flat
- Level 1: ambient cards
- Level 2: elevated cards / sticky summary
- Level 3: drawer / popover / chatbot / assistant
- Public có thể dùng blue-tinted shadows nhiều hơn; staff chỉ dùng khi cần phân lớp.

### Border radius
- **Primary radius tokens:** 4 / 6 / 8
- 4 = dense utility controls
- 6 = default cards, inputs, drawers
- 8 = featured public cards
- Không dùng pill shape cho primary layout blocks

## 6.4 Layout tokens

- **Public max content width:** 1120px
- **Portal max content width:** 1120px
- **Staff content width:** full fluid, nhưng table canvas giữ min 1280px khi cần horizontal scroll
- **Desktop page gutter:** 32px
- **Tablet page gutter:** 24px
- **Mobile page gutter:** 16px
- **Sticky top nav (public):** 72px
- **Sticky top bar (staff/portal):** 64px
- **Sidebar width (staff):** 272px expanded / 88px collapsed
- **Assistant panel width:** 400px desktop, 360px tablet overlay, full-height sheet mobile

## 6.5 Component inventory (mapped to shadcn/ui)

### Button
- **Variants:** primary, secondary, ghost, destructive, outline, icon-only, link
- **When to use:** primary CTA, inline actions, row actions, panel actions
- **When NOT to use:** không dùng primary button dày đặc trong table row; staff row action ưu tiên ghost/icon + explicit text trong menu
- **States:** default / hover / pressed / disabled / loading
- **Responsive:** icon + text trên desktop, icon-only chỉ cho action phụ có tooltip

### Form controls
- **Set:** Input, Textarea, Select, Combobox, Date picker, Search input, Checkbox, Radio, Switch
- **When to use:** form capture, filters, scheduling
- **Anti-pattern:** không dùng modal cho form dài; form > 6 field phải có section grouping
- **State rules:** error text dưới field, required marker rõ, disabled state giảm contrast nhưng vẫn đọc được

### Stepper
- **Use:** booking wizard, claim flow nếu cần verification
- **Rule:** mobile chỉ hiện current + total + step title; desktop hiện full step rail

### Data table / Data grid
- **Use:** doctor appointments, invoices, admin CRUD, audit logs, inventory
- **Anti-pattern:** không dùng card list cho desktop finance/admin data
- **States:** loading rows, empty filtered state, bulk action bar, sticky header, horizontal scroll
- **Responsive:** tablet chuyển sang cardified rows khi thiếu chỗ; mobile chỉ dùng cho portal list đơn giản, không dùng cho staff primary tables

### Badge / Status chip
- **Use:** appointment status, payment status, lab status, user active state, queue state
- **Rule:** luôn có text; không dùng màu đơn thuần không nhãn

### Card / Tile
- **Use:** public previews, portal summary, KPI blocks
- **Anti-pattern:** không nhét form dài vào card nhỏ trên staff screens

### Sheet / Drawer
- **Use:** record edit, detail preview, inline create/update
- **Rule:** back-office edit mặc định dùng right drawer để giữ context table
- **Modal chỉ dùng cho:** destructive confirm, critical blocking decisions, PDF quick preview if not full route

### Dialog
- **Use:** confirm delete/void/activation, session expired, critical warning
- **Anti-pattern:** không dùng dialog chứa form lớn

### Tabs
- **Use:** revenue daily/monthly, inventory items/lots/movements, portal appointments segments, assistant modes
- **Rule:** tab count lý tưởng <= 4

### Toast / Notification
- **Use:** success feedback, rate-limit, background refresh notice
- **Rule:** critical error không chỉ dùng toast; phải có inline error gần tác vụ

### Empty state
- **Use:** first use, no results, no data for role
- **Rule:** public/portal empty state ấm và hướng dẫn; staff empty state ngắn, action-first

### Loading skeleton
- **Use:** initial load, card blocks, table rows, assistant messages
- **Rule:** skeleton phải match final layout, không dùng spinner toàn màn hình trừ blocking auth transition

### Navigation
- **Set:** header, sidebar, breadcrumb, section tabs, bottom nav (portal mobile)
- **Rule:** role boundaries thể hiện bằng nav visibility, không chỉ rely on redirect

### Assistant message block
- **Elements:** user bubble, assistant answer, citation list, deep-link chips, follow-up prompts, feedback row
- **Rule:** answer nào không có evidence cũng phải hiện refusal/limitation rõ ràng

## 7. Phase 5 — Global state & behavior spec

## 7.1 States phải tồn tại ở mọi surface
- **Default / happy path**
- **Initial loading**
- **Inline loading**
- **Empty**
  - first use empty
  - filtered empty
  - no permission to see data
- **Error**
  - network error
  - validation error
  - permission denied
  - partial data
  - rate limited
- **Success feedback**
- **Responsive layout state**
- **Session expired**
- **Optimistic update** (chỉ nơi phù hợp)

## 7.2 High-risk behavior rules

### Rule A — Không optimistic cho clinical/financial writes
Các action sau **không được** optimistic:
- appointment status change có ảnh hưởng care flow
- check-in
- save medical record
- create follow-up
- record payment
- void invoice
- inventory movement write

Thay vào đó:
- button vào state `loading`
- row/panel hiển thị “Saving…”
- chỉ update UI sau server confirm
- nếu fail, rollback bằng inline alert rõ ràng

### Rule B — Chỉ optimistic cho low-risk UI state
Được phép optimistic cho:
- local filter chips
- tab switching
- sidebar collapse
- row expansion
- non-destructive toggles có auto-retry

### Rule C — Permission boundaries phải visible
- Ẩn action người dùng không có quyền
- Nếu vào deeplink không có quyền, hiện dedicated forbidden state
- Không render control disabled mơ hồ nếu quyền hoàn toàn không tồn tại; chỉ giữ disabled khi user có thể hiểu “cần điều kiện khác để bật”

### Rule D — Partial data không được tạo cảm giác bug
- Field thiếu dữ liệu hiển thị `—` + helper text ngắn nếu cần
- Panel vẫn render khung chính, không collapse toàn bộ trang
- Clinical data missing phải có note “No vitals recorded yet” thay vì ô trống

### Rule E — Validation ưu tiên inline trước, summary sau
- Inline field error hiển thị ngay dưới control
- Form dài có thêm alert summary trên cùng khi submit fail
- Mọi field critical phải có example / format hint (CCCD, phone, blood pressure, date)

### Rule F — Auth refresh phải yên lặng một lần
- Khi `401` do token hết hạn: attempt silent refresh 1 lần
- Nếu fail: mở **Session expired** modal
- Không redirect đột ngột làm mất dữ liệu form nếu còn cách recover

## 7.3 Missing states đánh dấu HIGH RISK nếu bỏ qua
- Booking race condition: slot vừa bị người khác lấy
- Patient claim verification mismatch
- Assistant rate limit / refusal
- Queue unavailable fallback
- PDF preview generation fail
- Payment duplicate / void invalid
- Knowledge document upload + reindex progress

## 8. Phase 6 — Motion rules

**Motion principle:** cognitive aid + status signal. Motion không phải để “trông hiện đại”, mà để chỉ ra thay đổi trạng thái, giữ định hướng không gian và giảm cognitive load.

## 8.1 Motion budget by surface
- **Public:** moderate
- **Portal:** subtle
- **Staff:** minimal

## 8.2 Canonical motion rules

### Page transitions
- **Public:** soft fade + 8px vertical settle, 180–220ms, ease-out
- **Portal:** fade only, 140–180ms
- **Staff:** no route theatrics; chỉ fade content region 100–140ms khi filter/tab thay đổi

### Skeleton to content
- Skeleton render ngay
- Content crossfade 120–160ms
- Không dùng spinner toàn màn hình cho table/list thường

### Drawer / sheet
- Right drawer: translateX + opacity, 180ms enter, 140ms exit
- Bottom sheet mobile: translateY + backdrop fade, 180ms enter, 140ms exit
- Drawer close không được làm mất scroll context của page gốc

### Action feedback
- Button press: scale nhẹ 0.98 trong 80ms (public/portal only)
- Staff primary buttons không cần scale; chỉ đổi background + spinner
- Success toast slide/fade 150ms
- Inline success state dùng subtle highlight 1 lần rồi ổn định

### Error appearance
- Inline field error: fade + 4px slide-up, 120ms
- Form summary alert: fade-in 140ms
- Chỉ dùng shake cho 1 field isolated, không áp dụng cho cả card hoặc page

### Assistant response
- Không giả lập typing dài kiểu chat LLM marketing
- Dùng pending placeholder + skeleton lines
- Khi answer tới: render body trước, citations ngay sau 60ms, follow-up prompts sau 60ms nữa
- Refusal state không animate phô trương; chỉ swap sang error/info panel rõ ràng

## 8.3 Reduced motion
- Tắt translate/scale không cần thiết
- Giữ fade rất ngắn hoặc none
- Skeleton có thể giữ static block
- Respect `prefers-reduced-motion`

## 8.4 Anti-patterns to avoid
- Animating every card on scroll trong staff screens
- Delaying data visibility vì motion
- Dùng nhiều style motion khác nhau cho cùng một component family
- Motion vui nhộn trong clinical context

## 9. Shared layout templates

## 9.1 Public list template
Dùng cho Departments, Doctors, News:
- Top intro block: title + subtitle + action
- Sticky mini-filter bar khi cần
- Main content: card grid 3 cột desktop, 2 cột tablet, 1 cột mobile
- Optional right sticky summary card chỉ dùng cho detail pages, không dùng cho list pages mặc định

## 9.2 Portal list/detail template
Dùng cho Appointments, Lab results, Messages:
- Header: page title + small description
- Segmented control / filters nằm ngay dưới title
- Main list cards full width trên mobile
- Desktop có thể dùng 2-pane nếu payload đủ giàu; nếu không, giữ list-only để tránh empty right pane

## 9.3 Staff data canvas template
Dùng cho Doctor dashboard, Invoices, Pricing, Inventory, Audit logs:
- Row 1: page title + page-level action(s)
- Row 2: KPI strip (optional)
- Row 3: sticky filters/search/date/status
- Row 4: main table/list canvas
- Drawer mở từ bên phải cho detail/edit
- Assistant panel là layer ngoài cùng bên phải, không chen vào table width khi chưa mở

## 9.4 Admin CRUD template
Dùng cho Users, Departments, Rooms, Templates, Content, News:
- Title + create action
- Filters row
- Main table/list
- Right drawer với form sectioned
- Confirm dialog cho destructive actions
- Nếu module có preview (content/news), preview panel nằm trong drawer dưới dạng tab “Edit / Preview”

## 10. Detailed page specs

### 10.1 Public shell
- **Route đề xuất:** `/(public)`
- **Users:** Guest
- **Purpose:** Tạo trust ngay từ first paint và giữ CTA booking luôn trong reach.
- **Primary action:** Đi vào booking hoặc discovery sâu hơn
- **Secondary actions:** Open chatbot, xem departments, xem doctors, xem news
- **Screen weight:** navigation + brand framing
- **Information priority**
  - **P1 (must read in 3s):** logo, brand promise ngắn, booking CTA, nav items chính
  - **P2 (available on demand):** patient portal link, staff login link, chatbot trigger
  - **P3 (collapsed/secondary):** footer links, decorative accent
- **Layout / placement**
  - **Desktop:** Navbar cao 72px: trái là AI-designed logo + wordmark, giữa là nav, phải là `Book appointment` primary button và link `Patient portal`/`Staff login`. Main canvas max 1120px. Footer dark section 3 cột: hospital summary, navigation, contact/notice.
  - **Tablet:** Navbar giữ cấu trúc nhưng CTA gọn lại; nav có thể collapse thành menu sheet.
  - **Mobile:** Top bar 64px với hamburger trái, logo giữa/trái, CTA nhỏ hoặc nằm trong sheet. Chatbot FAB vẫn cố định góc dưới phải.
- **Key components:** Navbar, Button, Sheet, Footer, Floating chatbot trigger
- **Interaction / behavior:** Public shell không chứa dashboard logic. Nếu route đang ở booking, CTA top-right đổi thành `Need help?` để tránh CTA trùng. `Patient portal` và `Staff login` luôn là secondary link, không cạnh tranh với booking.
- **States:** Sticky navbar, active nav state, mobile menu state, offline chatbot fallback, footer with missing content fallback.
- **Motion:** Navbar backdrop blur 12px; mobile sheet slide-down/side 180ms; CTA hover dùng color change + subtle lift.
- **API / data mapping:** Không phụ thuộc API riêng, nhưng shell phải chứa link tới Home, Departments, Doctors, News, Booking, Portal, Staff login.
- **Implementation notes:** Logo placeholder: lock vùng 40x40 icon + wordmark; cho phép thay asset AI sau mà không đổi navbar layout.

### 10.2 Home
- **Route đề xuất:** `/`
- **Users:** Guest
- **Purpose:** Biến một visitor chưa biết gì thành người có ý định khám hoặc ít nhất biết nên xem khoa/bác sĩ nào.
- **Primary action:** Bắt đầu booking
- **Secondary actions:** Khám phá departments, doctors, news, mở chatbot
- **Screen weight:** content-led conversion page
- **Information priority**
  - **P1 (must read in 3s):** hero title/description, primary booking CTA, trust signals
  - **P2 (available on demand):** department highlights, featured doctors, latest news, hospital sections
  - **P3 (collapsed/secondary):** decorative gradients, secondary content blocks
- **Layout / placement**
  - **Desktop:** Hero 12 cột: trái 6 cột cho headline, subtitle, 2 CTA (`Book appointment`, `Explore doctors`); phải 6 cột cho hero media/illustration hoặc branded metric stack card. Dưới hero là trust strip 3–4 items. Kế tiếp là department preview grid 3 cột, featured doctor row, content sections rendered từ CMS blocks, news preview 3 cards, cuối là chatbot/help CTA band.
  - **Tablet:** Hero chuyển thành 1 cột; media xuống dưới copy. Department/doctors/news còn 2 cột.
  - **Mobile:** Hero stack một cột. CTA full-width hoặc 2 nút stacked. Trust strip thành cards ngang cuộn hoặc 2x2 grid. Department/news/doctors đều 1 cột.
- **Key components:** Hero section, trust stat cards, department preview cards, doctor preview cards, content sections, news cards, CTA band
- **Interaction / behavior:** Nếu `heroImage` thiếu thì thay bằng branded gradient panel và 2–3 metric placeholders. Department/doctors/news previews chỉ lấy 3–6 item đầu, luôn có `View all` link. Không nhồi FAQ nếu không có API/content block hỗ trợ.
- **States:** Hero loading skeleton, missing hero image fallback, empty preview state khi doctor/news chưa có dữ liệu, CTA still available when previews fail.
- **Motion:** Hero content fade/settle 200ms; preview cards stagger rất nhẹ 30ms chỉ ở public; không animate khi user cuộn nhanh hoặc prefers-reduced-motion.
- **API / data mapping:** Primary content từ `/content/home`; preview blocks có thể hydrate thêm từ `/departments`, `/doctors`, `/news`.
- **Implementation notes:** Home phải chịu được content-home chỉ có hero + sections tối thiểu. Không thiết kế phụ thuộc vào một CMS schema phức tạp hơn contract.

### 10.3 Departments
- **Route đề xuất:** `/departments`
- **Users:** Guest
- **Purpose:** Giúp guest hiểu bệnh viện có những khoa nào và khoa nào phù hợp với nhu cầu hiện tại.
- **Primary action:** Mở department detail phù hợp
- **Secondary actions:** Search, filter nhẹ, đi thẳng vào booking nếu đã biết khoa
- **Screen weight:** discovery list
- **Information priority**
  - **P1 (must read in 3s):** department name, description ngắn, CTA xem chi tiết
  - **P2 (available on demand):** head doctor, phone, short utility facts
  - **P3 (collapsed/secondary):** decorative icon/background
- **Layout / placement**
  - **Desktop:** Header intro trên cùng. Bên dưới là filter row 2 vùng: trái search input, phải optional sort/filter. Main grid 3 cột cards. Mỗi card: icon/monogram, tên khoa, 2 dòng mô tả, head doctor nếu có, phone nhỏ, footer có `View department` và `Book consultation` secondary link.
  - **Tablet:** 2 cột card grid, filter row wrap thành 2 hàng.
  - **Mobile:** 1 cột stacked cards; search full-width; sort/filter trong horizontal chips hoặc sheet.
- **Key components:** Search input, department cards, optional filter chips
- **Interaction / behavior:** Search local trên name/description. `Book consultation` nếu click sẽ prefill `departmentId` ở booking step 2. Không hiển thị room/floor ở list vì contract detail mới giàu hơn list.
- **States:** Loading grid skeleton, empty search state có gợi ý mở chatbot/Doctors, API error state giữ intro + retry button.
- **Motion:** Card hover nâng shadow nhẹ; filter chip active đổi border/color; không stagger grid ở staff-like tốc độ, nhưng public có thể fade nhẹ.
- **API / data mapping:** `GET /departments`; deeplink sang `/departments/:departmentId`; booking prefill qua query param hoặc shared client state.
- **Implementation notes:** Nếu sau này có department icons thực, card layout vẫn không đổi; icon slot là optional.

### 10.4 Department detail
- **Route đề xuất:** `/departments/:departmentId`
- **Users:** Guest
- **Purpose:** Biến một department từ khái niệm thành nơi đủ đáng tin để đặt lịch.
- **Primary action:** Chọn bác sĩ hoặc đi vào booking với department đã chọn
- **Secondary actions:** Xem danh sách doctors trong khoa, xem phone/hours/location
- **Screen weight:** detail page
- **Information priority**
  - **P1 (must read in 3s):** department name, description, hours, contact, primary CTA
  - **P2 (available on demand):** head doctor, floor/room, doctor list
  - **P3 (collapsed/secondary):** secondary descriptive copy
- **Layout / placement**
  - **Desktop:** Top area 12 cột: trái 8 cột là breadcrumb + department title + description + trust copy; phải 4 cột là sticky quick facts card gồm phone, floor, room, operating hours, CTA `Book in this department`. Phía dưới full-width là `Doctors in this department` dạng 2 hoặc 3 cột card list.
  - **Tablet:** Quick facts card không sticky hoặc chỉ sticky khi còn chỗ; doctors grid 2 cột.
  - **Mobile:** Mọi thứ stack dọc: hero text, quick facts card, doctor cards. CTA nằm trong quick facts card và lặp ở cuối trang.
- **Key components:** Breadcrumb, detail hero, quick facts card, doctor cards, CTA footer block
- **Interaction / behavior:** Nếu `headDoctorName` có thì hiển thị như trust element. Nếu floor/room thiếu, hide entire row chứ không hiện label rỗng. `Book in this department` dẫn tới booking step 2 với department preselected.
- **States:** Loading hero + facts skeleton, no doctors state, partial data state cho thiếu room/floor/hours.
- **Motion:** Sticky card settle khi vào viewport; CTA hover giống system button; doctor cards hover nhẹ.
- **API / data mapping:** `GET /departments/{departmentId}`, `GET /departments/{departmentId}/doctors`.
- **Implementation notes:** Không thêm map/floor plan khi chưa có API hoặc asset chắc chắn.

### 10.5 Doctors
- **Route đề xuất:** `/doctors`
- **Users:** Guest
- **Purpose:** Giúp guest tìm bác sĩ đúng chuyên môn và đi vào slot selection nhanh.
- **Primary action:** Mở doctor detail
- **Secondary actions:** Search doctor, filter theo department/specialization, đi vào booking
- **Screen weight:** discovery list
- **Information priority**
  - **P1 (must read in 3s):** doctor name, specialization, department, CTA xem lịch
  - **P2 (available on demand):** bio snippet, availability entry point
  - **P3 (collapsed/secondary):** secondary badges
- **Layout / placement**
  - **Desktop:** Header intro + filter bar (search trái, department filter phải, optional sort). Main section có thể là card grid 3 cột. Mỗi card: avatar placeholder, doctor name, specialization, department name, 2 dòng bio, row action `View profile` / `Check slots`.
  - **Tablet:** Grid 2 cột; filter row wrap.
  - **Mobile:** 1 cột card list; search và filter trong sheet hoặc stacked row.
- **Key components:** Search input, Select/Combobox filter, doctor cards, action buttons
- **Interaction / behavior:** Nếu API list lớn, pagination hoặc load-more nằm cuối grid. `Check slots` deeplink sang doctor detail với date picker focus. Không show phone/email quá nổi bật trên public card nếu không cần cho conversion.
- **States:** Loading grid skeleton, empty search/filter state, unavailable doctor state nếu `isActive=false` được lọc khỏi list hoặc đánh badge inactive trong admin-only context.
- **Motion:** Card hover + CTA hover; không animate avatar.
- **API / data mapping:** `GET /doctors`, optional filter client-side hoặc query-level nếu backend bổ sung sau.
- **Implementation notes:** Doctor list là discovery surface, không phải hồ sơ EMR; copy phải giữ public-friendly.

### 10.6 Doctor detail with slot picker
- **Route đề xuất:** `/doctors/:doctorId`
- **Users:** Guest
- **Purpose:** Cho guest đủ thông tin để tin tưởng bác sĩ và chọn được slot mà không phải qua nhiều màn trung gian.
- **Primary action:** Chọn slot và đi vào booking
- **Secondary actions:** Xem chuyên môn, đổi ngày, đổi doctor via back navigation
- **Screen weight:** detail + action page
- **Information priority**
  - **P1 (must read in 3s):** doctor identity, specialization, date picker, available slots, primary CTA
  - **P2 (available on demand):** bio, department, availability count
  - **P3 (collapsed/secondary):** extended description
- **Layout / placement**
  - **Desktop:** Above the fold 12 cột: trái 7 cột chứa doctor profile (name, specialization, department link, bio mở đầu), phải 5 cột là sticky booking card gồm date picker, slot chips grouped by time window, selected slot summary và CTA `Continue booking`. Dưới fold là sections `About`, `Department`, `Availability notes`.
  - **Tablet:** Profile 1 cột lớn; booking card xuống dưới hoặc bên phải 4 cột nếu đủ chiều rộng.
  - **Mobile:** Profile stack trước, booking card ngay sau hero. Slot chips phải đủ to để tap; sticky CTA footer có thể dùng trên mobile nếu slot đã chọn.
- **Key components:** Profile card, date picker, slot chip group, sticky booking card, breadcrumb
- **Interaction / behavior:** Date change phải refetch slots và skeleton riêng cho slot area, không block toàn trang. Nếu slot hết, card chuyển sang empty state với `Try another date`. CTA chỉ bật khi có selected slot.
- **States:** Slot loading, no slots state, doctor data partial state, booking prefill state, invalid date state.
- **Motion:** Slot chips fade in theo block sáng/chiều, 120ms; date change không gây full-page transition.
- **API / data mapping:** `GET /doctors/{doctorId}`, `GET /doctors/{doctorId}/slots?date=YYYY-MM-DD`.
- **Implementation notes:** Chưa submit booking ở đây; chỉ khóa `doctorId`, `date`, `time/slot` cho booking wizard.

### 10.7 Booking wizard
- **Route đề xuất:** `/booking`
- **Users:** Guest
- **Purpose:** Tổ chức booking thành flow ít ma sát, giữ trust và tránh submit sai.
- **Primary action:** Hoàn tất booking
- **Secondary actions:** Back step, đổi bác sĩ/slot, lưu selection trong session hiện tại
- **Screen weight:** action-focused multi-step
- **Information priority**
  - **P1 (must read in 3s):** current step, selected doctor/slot summary, required fields của step hiện tại
  - **P2 (available on demand):** AI guidance, optional demographic fields, help text
  - **P3 (collapsed/secondary):** supplementary notes
- **Layout / placement**
  - **Desktop:** Layout desktop là 2 vùng: trái 7–8 cột cho step content, phải 4–5 cột cho sticky summary card luôn hiển thị selected department/doctor/date/time hoặc progress placeholders. Top có stepper ngang 3 bước. Mỗi step không nên làm thay đổi shell mạnh để user thấy continuity.
  - **Tablet:** Stepper vẫn giữ full width nhưng summary card có thể xuống dưới step content. Các step dài dùng section card tách rành mạch.
  - **Mobile:** Stepper compact (e.g. `Step 2 of 3`), summary card thành bottom sticky collapsible panel. Form field 1 cột, CTA area sticky cuối màn hình khi bàn phím không mở.
- **Key components:** Stepper, sticky summary card, form sections, inline validation, review panel
- **Interaction / behavior:** Wizard giữ state khi back step. Refresh browser trong wizard nên cố giữ query params/URL state ở mức doctor/date/slot nếu có thể. Multi-step validation chỉ validate step hiện tại cho tới bước submit cuối.
- **States:** Per-step loading/error, slot race condition, AI rate-limit, submit success, submit network failure, unsaved step back navigation.
- **Motion:** Step transition crossfade 140ms; summary card update màu/chip animate nhẹ 100ms; không dùng slide dài gây cảm giác carousel.
- **API / data mapping:** Step 1 dùng `POST /ai/analyze-symptoms`; step 2 dùng doctors/slots data; submit cuối dùng `POST /appointments`.
- **Implementation notes:** Wizard này phải chịu được mismatch DTO: extra fields ngoài contract nên đặt ở block optional hoặc adapter layer, không khóa toàn bộ UX.

### 10.7.a Booking step 1 — Symptom analysis
- **Route đề xuất:** `/booking?step=symptoms`
- **Users:** Guest
- **Purpose:** Thu thập mô tả triệu chứng, định hướng urgency và duration mà không giả vờ chẩn đoán.
- **Primary action:** Nhận AI guidance và tiếp tục chọn doctor/slot
- **Secondary actions:** Skip analysis nếu business cho phép, chỉnh triệu chứng, đổi mức độ
- **Screen weight:** transitional analysis step
- **Information priority**
  - **P1 (must read in 3s):** symptom input, urgency result, clear disclaimer
  - **P2 (available on demand):** recommendations, related departments, suggested duration
  - **P3 (collapsed/secondary):** secondary educational copy
- **Layout / placement**
  - **Desktop:** Form 2 cột desktop: trái là input card (symptoms chips/textarea, duration, severity), phải là result card. Result card phải đủ cao để chứa urgency badge, analysis summary, department suggestion, duration suggestion, CTA `Continue`. Nếu chưa submit, result card hiển thị illustration + guidance.
  - **Tablet:** Input và result xếp dọc nhưng vẫn là 2 cards rõ ràng.
  - **Mobile:** 1 cột. Result card xuống dưới form, CTA nằm trong result card hoặc sticky footer sau khi có kết quả.
- **Key components:** Textarea/chips, Select severity, result alert card, department suggestion chips, CTA
- **Interaction / behavior:** Không dùng ngôn ngữ chẩn đoán chắc chắn. Urgency HIGH phải kéo theo visual warning rõ và copy `seek immediate medical attention` nếu backend trả như vậy. Nếu AI fail, fallback state cho phép user vẫn đi tiếp vào doctor selection.
- **States:** Analysis loading, AI unavailable fallback, empty initial result, high urgency warning, rate-limit state.
- **Motion:** Result card từ skeleton sang content fade 160ms; urgency badge không blink.
- **API / data mapping:** `POST /ai/analyze-symptoms`.
- **Implementation notes:** Nút `Skip` chỉ nên hiện nếu business muốn; nếu không, flow vẫn cho continue khi user nhập symptom tối thiểu.

### 10.7.b Booking step 2 — Doctor & slot selection
- **Route đề xuất:** `/booking?step=selection`
- **Users:** Guest
- **Purpose:** Ghép AI guidance với lựa chọn doctor/slot thực tế.
- **Primary action:** Chọn slot đầu tiên hợp lệ
- **Secondary actions:** Đổi department/date, xem doctor detail rút gọn, back step 1
- **Screen weight:** selection page
- **Information priority**
  - **P1 (must read in 3s):** selected slot, doctor cards/list, date context
  - **P2 (available on demand):** AI recommendation, department filters, availability counts
  - **P3 (collapsed/secondary):** deep profile details
- **Layout / placement**
  - **Desktop:** Desktop: trái 8 cột là doctor selection canvas; trên cùng có recommendation bar, dưới là filter row, bên dưới doctor cards/list. Phải 4 cột là sticky selection summary gồm selected doctor, date, time, AI duration, CTA `Continue`. Doctor card mở rộng inline để hiện slot groups thay vì điều hướng sang page khác nếu đã vào wizard.
  - **Tablet:** Doctor cards 1 hoặc 2 cột; summary không quá sticky gây chật.
  - **Mobile:** 1 cột; doctor cards full width; selected summary thành sticky bottom mini panel. Slot groups phải theo chiều dọc, dễ tap.
- **Key components:** Filter bar, doctor card/list, slot chip groups, sticky selection summary
- **Interaction / behavior:** Nếu user tới wizard từ doctor detail đã có preselected doctor/slot, list vẫn render nhưng summary ở trạng thái đã chọn. Slot expired trong lúc user đang step 2 phải báo inline và clear selection.
- **States:** List loading, slot loading per doctor, no results, no slots on date, expired selection, recommendation unavailable.
- **Motion:** Doctor card expand/collapse 140ms; slot chip selection color change 80ms.
- **API / data mapping:** Reuse `/doctors`, `/doctors/{doctorId}/slots`; final selected values map sang submit payload.
- **Implementation notes:** Không cần fetch full doctor detail lần nữa nếu card list đã đủ thông tin; chi tiết sâu vẫn có link mở page riêng trong new tab nếu muốn.

### 10.7.c Booking step 3 — Patient details & review
- **Route đề xuất:** `/booking?step=details`
- **Users:** Guest
- **Purpose:** Thu đủ thông tin tối thiểu để submit booking và cho user cảm giác mọi thứ đã được review rõ.
- **Primary action:** Submit booking
- **Secondary actions:** Quay lại sửa slot, sửa symptom, điền optional info
- **Screen weight:** form-heavy review step
- **Information priority**
  - **P1 (must read in 3s):** required patient/contact fields, booking summary, submit CTA
  - **P2 (available on demand):** optional demographic/medical fields, privacy note
  - **P3 (collapsed/secondary):** secondary helper copy
- **Layout / placement**
  - **Desktop:** Desktop: trái 7 cột là form chia 2 section card: `Required information` và `Optional health context`; phải 5 cột là sticky review card với doctor/date/time/reason/symptoms/estimated duration. Submit CTA nằm trong review card và lặp ở cuối form nếu form dài. Required fields luôn ở phần trên fold.
  - **Tablet:** Form vẫn 1 cột card stack; review card chuyển xuống dưới hoặc sticky một phần.
  - **Mobile:** 1 cột form. Review card nằm cuối nhưng có sticky footer CTA `Confirm booking`. Optional fields đặt trong Accordion.
- **Key components:** Form sections, review card, checkbox consent nếu cần, inline validation, accordion optional fields
- **Interaction / behavior:** Những field contract chưa chắc nhận phải nằm trong optional accordion hoặc adapter note. `CCCD`, `phone`, `email` có helper text format. Nếu submit fail do slot hết, auto quay lại step 2 với alert giữ nguyên dữ liệu form.
- **States:** Validation error per field, submit loading, slot race condition redirect, partial optional data state, network retry state.
- **Motion:** Submit loading spinner và button disable; alert summary fade-in nếu fail.
- **API / data mapping:** `POST /appointments`; payload thật phải map theo backend DTO đã chốt.
- **Implementation notes:** Đây là step cần backend alignment nhất. Không hard-code required list chỉ theo SRS nếu contract thật chưa support.

### 10.8 Booking success
- **Route đề xuất:** `/booking/success`
- **Users:** Guest
- **Purpose:** Đóng booking flow bằng một trạng thái xác nhận đủ rõ để user chụp màn hình hoặc ghi lại ngay.
- **Primary action:** Rời flow với confidence
- **Secondary actions:** Book another appointment, về Home, xem doctor/department
- **Screen weight:** status-only confirmation page
- **Information priority**
  - **P1 (must read in 3s):** appointment number, patient name, doctor/date/time, success state
  - **P2 (available on demand):** contact reminder, next steps
  - **P3 (collapsed/secondary):** secondary marketing content
- **Layout / placement**
  - **Desktop:** Centered confirmation stack trong container ~720px. Trên cùng là success icon/badge + title. Chính giữa là card lớn chứa appointment number nổi bật, doctor/date/time/patient summary. Dưới là next-step bullets và secondary CTAs. Trên desktop có thể thêm nhỏ preview doctor card ở cạnh nếu muốn, nhưng không được cạnh tranh với confirmation number.
  - **Tablet:** Giữ centered stack, phụ trợ xuống dưới.
  - **Mobile:** 1 cột, appointment number và CTA full width.
- **Key components:** Success state card, summary card, next-step list, CTA group
- **Interaction / behavior:** Nếu email/notification không chắc gửi được, copy phải là `Please save this confirmation code` chứ không hứa email chắc chắn. Không auto-create portal account.
- **States:** Success happy path, partial success (booked but notification unavailable), direct refresh with missing state fallback.
- **Motion:** Success icon fade-in 150ms; card settle 120ms; không confetti.
- **API / data mapping:** Data từ response `POST /appointments`.
- **Implementation notes:** Cho phép query params hoặc transient state; nếu refresh mất state, page fallback sang alert + CTA về Home.

### 10.9 News list
- **Route đề xuất:** `/news`
- **Users:** Guest
- **Purpose:** Cho visitor thấy bệnh viện đang hoạt động thật và có cập nhật đáng tin.
- **Primary action:** Mở article preview hoặc đọc nội dung đủ để tăng trust
- **Secondary actions:** Quay lại Home, vào booking, xem department liên quan nếu có
- **Screen weight:** content list
- **Information priority**
  - **P1 (must read in 3s):** title, publish date, image, excerpt
  - **P2 (available on demand):** article content preview, category/tag nếu có
  - **P3 (collapsed/secondary):** secondary decorative elements
- **Layout / placement**
  - **Desktop:** Một card featured lớn trên đầu nếu có item mới nhất, bên dưới list/grid 2 cột desktop hoặc 1 cột list. Mỗi card có image ratio ổn định, title 2 dòng, published date, excerpt 3 dòng, CTA `Read` mở inline sheet/detail panel thay vì route detail riêng nếu backend chưa có endpoint detail.
  - **Tablet:** Featured card full width, list 2 cột.
  - **Mobile:** 1 cột stacked article cards; inline sheet full screen khi đọc.
- **Key components:** Featured article card, news cards, optional preview sheet
- **Interaction / behavior:** Do contract chỉ đảm bảo list, design mặc định không khóa vào dedicated detail endpoint. Nếu content đã đầy đủ ngay trong list payload, `Read` có thể mở preview sheet.
- **States:** List loading, empty news state, broken image fallback, preview content missing fallback.
- **Motion:** Card hover nhẹ; preview sheet slide-up 180ms.
- **API / data mapping:** `GET /news`; preview detail chỉ dùng fields có sẵn trong payload.
- **Implementation notes:** Không build complex category taxonomy nếu API chưa có.

### 10.10 Public chatbot drawer
- **Route đề xuất:** `(global FAB)`
- **Users:** Guest
- **Purpose:** Trả lời câu hỏi scoped về bệnh viện, khoa, bác sĩ, giờ làm, booking mà không bị hiểu nhầm là AI tư vấn y khoa tổng quát.
- **Primary action:** Nhận câu trả lời scoped và đi tiếp vào flow phù hợp
- **Secondary actions:** Chọn suggested prompt, copy response, đóng drawer
- **Screen weight:** utility overlay
- **Information priority**
  - **P1 (must read in 3s):** scope disclaimer, latest message, input box, suggested prompts
  - **P2 (available on demand):** conversation history ngắn, link actions
  - **P3 (collapsed/secondary):** none
- **Layout / placement**
  - **Desktop:** Drawer nổi từ góc phải dưới hoặc right-side panel width ~380px desktop. Header chứa title `Hospital assistant`, subtitle `Questions about departments, doctors, booking`, và close button. Body là message list. Footer là input + send. Trên first open hiển thị suggested prompts theo 2 nhóm: services và booking.
  - **Tablet:** Panel width ~360px overlay.
  - **Mobile:** Full-height bottom sheet; input cố định đáy; keyboard-safe.
- **Key components:** Floating action button, Drawer/Sheet, message bubbles, prompt chips, input composer
- **Interaction / behavior:** Không dùng avatar AI nhân hóa quá mức. Nếu user hỏi ngoài scope, panel trả lời giới hạn rõ và gợi ý hỏi lại đúng chủ đề. Có thể deep link sang Doctors/Departments/Booking.
- **States:** Initial empty state with prompts, loading response, out-of-scope response, rate-limit state, network error, very long answer scroll state.
- **Motion:** Open drawer 180ms; response placeholder skeleton; no typing theater longer than 600ms visual affordance.
- **API / data mapping:** `POST /chatbot/messages` with `conversationId` if available.
- **Implementation notes:** Microcopy phải ghi rõ đây là scoped assistant, không phải medical diagnosis bot.

### 10.11 Staff login
- **Route đề xuất:** `/staff/login`
- **Users:** Doctor, Nurse, Accountant, Admin
- **Purpose:** Cấp quyền truy cập staff nhanh, rõ và không lẫn với patient portal.
- **Primary action:** Đăng nhập
- **Secondary actions:** Đi tới patient portal login nếu user chọn nhầm, retry credentials
- **Screen weight:** auth page
- **Information priority**
  - **P1 (must read in 3s):** email, password, role-aware redirect after success
  - **P2 (available on demand):** support/help text, portal link
  - **P3 (collapsed/secondary):** brand imagery
- **Layout / placement**
  - **Desktop:** Desktop split 5/7 hoặc 4/8: trái là brand/trust panel với ngắn gọn value + security note, phải là centered login card width ~420px. Card có email, password, primary button, small link `Patient portal?`. Không có social login, không có sign up.
  - **Tablet:** Giữ split nếu đủ rộng, nếu không thì brand panel thành top strip.
  - **Mobile:** Centered full-width card với top logo. Form fields stacked, button full-width.
- **Key components:** Auth card, input fields, alert, button, subtle support links
- **Interaction / behavior:** Login success redirect theo role. Invalid credentials hiển thị inline alert trên form. Session expired modal từ các route protected cũng dùng cùng visual language với trang này.
- **States:** Loading submit, invalid credentials, server unavailable, session expired entry state.
- **Motion:** No page theatrics; button loading spinner בלבד.
- **API / data mapping:** `POST /auth/login`, global silent refresh via `/auth/refresh`, logout `/auth/logout`.
- **Implementation notes:** Không thêm forgot-password hoặc registration nếu backend chưa có.

### 10.12 Staff shell
- **Route đề xuất:** `/(staff-protected)`
- **Users:** Doctor, Nurse, Accountant, Admin
- **Purpose:** Cung cấp khung điều hướng role-based, dense, explicit, hỗ trợ assistant panel mà không phá data canvas.
- **Primary action:** Đi vào đúng module vai trò hiện tại
- **Secondary actions:** Mở assistant, collapse sidebar, đổi workspace
- **Screen weight:** navigation shell
- **Information priority**
  - **P1 (must read in 3s):** current page title, role nav, primary page action
  - **P2 (available on demand):** breadcrumbs, user menu, environment indicator
  - **P3 (collapsed/secondary):** decorative elements gần như không có
- **Layout / placement**
  - **Desktop:** Sidebar trái 272px với nav grouped by role. Top bar 64px chứa breadcrumb/title trái, page-level actions giữa/phải, user menu phải cùng assistant toggle. Main area full fluid. Right assistant panel overlay 400px khi mở, đẩy content nhẹ hoặc phủ lên tùy page width.
  - **Tablet:** Sidebar có thể collapse; assistant panel overlay.
  - **Mobile:** Staff mobile không là primary target; dưới 1024 nên chuyển sang temporary sidebar + full-screen page. Clinical heavy screens khuyến nghị tablet landscape trở lên.
- **Key components:** Sidebar, top bar, breadcrumb, page actions, user menu, assistant toggle
- **Interaction / behavior:** Nav item visibility phải phụ thuộc role. Current context như selected patient/appointment có thể hiển thị ở top bar khi cần. Không nhét notification center nếu chưa có backend.
- **States:** Collapsed sidebar, long page title, forbidden module route, assistant opened/closed, low-width fallback.
- **Motion:** Sidebar collapse 140ms; assistant panel 180ms; còn lại minimal.
- **API / data mapping:** No direct API; shell consumes auth/role state.
- **Implementation notes:** Role guard không chỉ redirect; nav cũng phải phản ánh quyền thật.

### 10.13 Doctor dashboard
- **Route đề xuất:** `/doctor`
- **Users:** Doctor
- **Purpose:** Cho doctor nhìn và xử lý danh sách appointment của mình với chi phí nhận thức thấp nhất.
- **Primary action:** Mở appointment detail
- **Secondary actions:** Filter by date/status, quick status view, mở patient search, mở assistant
- **Screen weight:** heavy-data
- **Information priority**
  - **P1 (must read in 3s):** today appointments, appointment status, next critical action
  - **P2 (available on demand):** filters, queue indicators, counts, patient quick facts
  - **P3 (collapsed/secondary):** historical analytics
- **Layout / placement**
  - **Desktop:** Main canvas theo staff data template. Trên cùng title `My appointments` + date picker. Dưới là KPI strip 4 card nhỏ: Today total, Waiting, In progress, Completed. Sau đó sticky filter bar. Bên dưới table full width với columns: time, patient, department, reason snippet, status, last updated, actions. Right rail optional 320px cho `Selected context / Quick actions` nếu product muốn, nhưng không bắt buộc ở dashboard.
  - **Tablet:** KPI strip co lại 2x2. Table giữ horizontal scroll hoặc cardified rows nếu cần.
  - **Mobile:** Không ưu tiên mobile. Nếu buộc hỗ trợ, list cards theo time blocks thay table.
- **Key components:** KPI cards, filters, data table, row actions, optional quick context rail
- **Interaction / behavior:** Primary click là open detail. Date filter và status filter sticky khi scroll table. Search patient theo name/phone. Quick status badges chỉ đọc, status change full nên vào detail để tránh nhầm lẫn.
- **States:** Table loading rows, empty date state, filtered empty, unauthorized, partial patient data, backend timeout retry banner.
- **Motion:** Minimal: row highlight on hover, filter chip active transition 80ms.
- **API / data mapping:** `GET /appointments` với filter date/status/doctorId auto-scoped cho doctor.
- **Implementation notes:** Không nhồi chart lịch sử vào dashboard doctor; bảng công việc trong ngày là P1.

### 10.14 Doctor appointment detail
- **Route đề xuất:** `/doctor/appointments/:appointmentId`
- **Users:** Doctor
- **Purpose:** Đưa toàn bộ ngữ cảnh encounter vào một màn đủ dense nhưng không lộn xộn.
- **Primary action:** Ra quyết định lâm sàng và đi tiếp vào medical record editor
- **Secondary actions:** Đổi status, xem vitals/labs, tạo follow-up, mở patient record, mở assistant
- **Screen weight:** heavy-data + action
- **Information priority**
  - **P1 (must read in 3s):** patient identity, appointment status, reason, current vitals/labs alert, primary next action
  - **P2 (available on demand):** timeline metadata, notes, follow-up, linked record status
  - **P3 (collapsed/secondary):** raw metadata / audit-like details
- **Layout / placement**
  - **Desktop:** Desktop chia 3 vùng: trái 280px sticky `Patient summary` card (name, age/DOB nếu có, CCCD masked, allergies/conditions snippet); giữa là main clinical canvas với header status bar + tabs `Overview / Vitals / Labs / Notes`; phải 320px sticky action rail có status selector, `Open medical record editor`, `Create follow-up`, assistant trigger/context card. Header phải hiển thị appointment number, date/time, doctor, department ngay trên fold.
  - **Tablet:** Patient summary có thể collapse thành top card; action rail xuống dưới main canvas.
  - **Mobile:** Không tối ưu mobile; tablet portrait dùng 1 cột với patient summary -> status/actions -> tab content.
- **Key components:** Sticky patient card, tabs, action rail, status chip/select, summaries, inline alerts
- **Interaction / behavior:** Changing status là explicit action với confirm nếu impact lớn (e.g. complete/cancel). Tabs không được mất selected patient context. Nếu vitals/labs chưa có, hiển thị empty blocks với CTA phù hợp thay vì tab trống.
- **States:** Initial load, forbidden if not assigned doctor, no vitals yet, no labs yet, follow-up absent, partial patient history, status update loading/error.
- **Motion:** Tabs switch fade 100ms; status save uses inline pending indicator; no route-level animation.
- **API / data mapping:** `GET /appointments/{appointmentId}`, `PUT /appointments/{appointmentId}/status`, `GET /appointments/{appointmentId}/vital-signs`, `GET /appointments/{appointmentId}/lab-results`, follow-up endpoints.
- **Implementation notes:** Appointment detail là clinical hub; mọi P1 content phải nằm trên fold desktop.

### 10.15 Medical record editor
- **Route đề xuất:** `/doctor/medical-records/new?appointmentId=:id`
- **Users:** Doctor
- **Purpose:** Cho doctor viết record, kê đơn và chốt encounter trong một flow an toàn, dễ rà soát.
- **Primary action:** Lưu medical record
- **Secondary actions:** Preview PDF, add prescription item, create follow-up draft
- **Screen weight:** form-heavy critical page
- **Information priority**
  - **P1 (must read in 3s):** diagnosis, clinical notes, prescription items, save CTA
  - **P2 (available on demand):** appointment summary, follow-up date, validation hints
  - **P3 (collapsed/secondary):** secondary helper content
- **Layout / placement**
  - **Desktop:** Desktop 12 cột: trái 8 cột là editor gồm section cards `Diagnosis`, `Clinical notes`, `Prescription items`, `Follow-up`. Phải 4 cột sticky summary gồm appointment snapshot, patient summary, record completeness checklist, CTAs `Preview PDF` và `Save record`. Prescription items dùng repeatable rows với columns medicine name, dosage, frequency, duration, instructions.
  - **Tablet:** Editor thành 1 cột lớn, summary xuống dưới nhưng giữ sticky mini action bar trên cùng hoặc dưới.
  - **Mobile:** 1 cột. Prescription repeater chuyển thành stacked cards. Save CTA sticky bottom.
- **Key components:** Section cards, repeater rows, sticky summary checklist, action buttons, inline validation
- **Interaction / behavior:** Section nào thiếu required input thì summary checklist highlight đỏ. `Preview PDF` có thể bật khi đủ diagnosis + prescription tối thiểu. Unsaved changes guard khi rời trang. `Clinical notes` là nhãn UI; field mapping backend do adapter quyết định.
- **States:** Empty initial editor, validation fail, unsaved changes, preview pending/fail, save success/error, no prescription item state.
- **Motion:** Add/remove prescription item animate height 120ms; save only spinner/inline status.
- **API / data mapping:** `POST /medical-records`, `POST /medical-records/preview.pdf`, follow-up endpoint nếu tách riêng.
- **Implementation notes:** Không dùng modal form cho prescription item phức tạp; inline repeater nhanh hơn cho doctor.

### 10.16 Prescription PDF preview
- **Route đề xuất:** `/doctor/medical-records/preview?appointmentId=:id`
- **Users:** Doctor
- **Purpose:** Xem trước bản PDF kê đơn trước khi commit hoặc download.
- **Primary action:** Xác nhận PDF đúng và quay lại editor hoặc download
- **Secondary actions:** Download, close preview, open in new tab
- **Screen weight:** status-only utility screen
- **Information priority**
  - **P1 (must read in 3s):** PDF viewport, close/download actions
  - **P2 (available on demand):** record summary nhỏ
  - **P3 (collapsed/secondary):** none
- **Layout / placement**
  - **Desktop:** Preferred pattern là full-screen overlay route hoặc large dialog 90vw x 90vh. Top toolbar chứa title, close, download/open actions. Main body là PDF viewport chiếm tối đa diện tích. Optional left mini summary chỉ nên hiện nếu còn nhiều không gian.
  - **Tablet:** Toolbar + PDF full canvas.
  - **Mobile:** Full screen sheet hoặc native PDF view.
- **Key components:** Toolbar, PDF viewer, buttons, inline error alert
- **Interaction / behavior:** Preview fail không được mất dữ liệu editor; close quay lại exact scroll position trước đó. Download action secondary.
- **States:** Preview loading, preview fail, empty PDF state, blocked by popup/open new tab.
- **Motion:** Overlay fade + scale nhẹ 140ms; PDF content itself không animate.
- **API / data mapping:** `POST /medical-records/preview.pdf`, `GET /medical-records/{recordId}/prescription.pdf`.
- **Implementation notes:** Nếu browser PDF support kém, fallback download-only state phải tồn tại.

### 10.17 Patient record browser
- **Route đề xuất:** `/doctor/patients`
- **Users:** Doctor
- **Purpose:** Tìm và mở hồ sơ bệnh nhân nhanh mà không rời khỏi clinical workspace quá xa.
- **Primary action:** Mở patient record phù hợp
- **Secondary actions:** Search theo tên/email/CCCD/phone, mở từ appointment detail
- **Screen weight:** search + detail
- **Information priority**
  - **P1 (must read in 3s):** search query, matching records, selected patient summary
  - **P2 (available on demand):** appointment history, conditions, allergies, lab snapshot
  - **P3 (collapsed/secondary):** deep historical detail
- **Layout / placement**
  - **Desktop:** Desktop 2-pane: trái 5 cột là search + result table/list, phải 7 cột là selected patient detail panel. Search bar lớn trên cùng, results bên dưới. Detail panel dùng sections `Identity`, `Conditions & allergies`, `Appointment history`, `Labs/medications`.
  - **Tablet:** 2-pane giữ được nếu đủ rộng; nếu không, detail panel thành drawer.
  - **Mobile:** List -> detail stacked; back button rõ.
- **Key components:** Search input, result table/list, detail panel, section cards
- **Interaction / behavior:** Search phải debounced. Clicking from appointment detail có thể mở sẵn selected patient. Panel detail không cần editable nếu API là read-only browser.
- **States:** No results, partial record fields, loading search, loading detail, forbidden, stale selection after new search.
- **Motion:** Minimal fade for detail swap 100ms.
- **API / data mapping:** `GET /patient-records`, `GET /patient-records/{patientId}`.
- **Implementation notes:** Nếu muốn reuse cho admin sau này, vẫn giữ doctor-first copy và permission labels.

### 10.18 Nurse daily intake board
- **Route đề xuất:** `/nurse/intake`
- **Users:** Nurse
- **Purpose:** Biến ca intake thành một màn thao tác rất nhanh: chọn bệnh nhân, check-in, ghi vitals.
- **Primary action:** Check-in hoặc mở vital signs editor cho bệnh nhân đang chọn
- **Secondary actions:** Filter theo date/status, chuyển sang queue board, mở assistant
- **Screen weight:** action-first operational board
- **Information priority**
  - **P1 (must read in 3s):** waiting patients, selected patient, next action
  - **P2 (available on demand):** daily counts, time buckets, brief notes
  - **P3 (collapsed/secondary):** historical info
- **Layout / placement**
  - **Desktop:** Desktop 12 cột: trái 5 cột là appointment list theo time buckets hoặc compact rows; giữa 4 cột là selected patient intake card với identity, appointment reason, current status, check-in CTA; phải 3 cột là quick vitals summary hoặc assistant context card. Top row có KPI mini-cards: waiting, checked-in, overdue.
  - **Tablet:** List 6 cột + selected card 6 cột; assistant context thành collapsible block.
  - **Mobile:** Tablet/phone fallback: list trên, selected card dưới. Staff mobile không ưu tiên nhưng tablet portrait vẫn usable.
- **Key components:** Time-grouped list, selected patient card, quick actions, KPI chips
- **Interaction / behavior:** Primary click chọn row. Check-in success phải update row state ngay sau server confirm. Nếu đã check-in, CTA chuyển thành `Record vitals`.
- **States:** List loading, no appointments today, patient already checked-in, check-in fail, selected appointment cancelled, queue fallback state.
- **Motion:** Selected row highlight 80ms; check-in button pending spinner.
- **API / data mapping:** `GET /appointments/today`, `POST /appointments/{appointmentId}/checkin`, appointment-linked vitals endpoints.
- **Implementation notes:** Đây là màn tốc độ cao; mọi action quan trọng phải nằm trong vùng giữa màn, không chôn trong dropdown.

### 10.19 Queue board
- **Route đề xuất:** `/nurse/queue`
- **Users:** Nurse
- **Purpose:** Cho nurse thấy thứ tự xử lý hiện tại theo logic queue, nhưng không giả định room-board realtime phức tạp.
- **Primary action:** Chọn bệnh nhân tiếp theo để intake hoặc handoff
- **Secondary actions:** Filter queue state, mở assistant theo current context, quay lại intake board
- **Screen weight:** status-heavy board
- **Information priority**
  - **P1 (must read in 3s):** queue order, patient, wait time, current state
  - **P2 (available on demand):** doctor, checked-in time, quick context
  - **P3 (collapsed/secondary):** room board / call/skip actions
- **Layout / placement**
  - **Desktop:** Desktop dùng table-first layout: columns `Queue #`, `Patient`, `Doctor`, `Checked in at`, `Wait duration`, `State`, `Actions`. Nếu product muốn board feel hơn, có thể thêm segmented tabs `Waiting / Ready / In progress`, nhưng data vẫn table-first. Không thiết kế kanban hoặc room monitor wall.
  - **Tablet:** Table giữ nguyên, tabs thành dropdown nếu hẹp.
  - **Mobile:** Không ưu tiên mobile; fallback card list theo queue order.
- **Key components:** Segmented tabs, queue table, wait-time badges, row action
- **Interaction / behavior:** Nếu queue API chưa có, page dùng fallback derived queue từ appointments/today và hiển thị banner `Queue derived from appointment status`. Không xuất hiện actions `Call`, `Skip`, `Room board` vì current repo chưa support.
- **States:** Queue API unavailable banner, empty queue, stale queue state, wait time partial if timestamp missing.
- **Motion:** Minimal row status color change only.
- **API / data mapping:** Primary target `GET /queue/today`; fallback derive from `/appointments/today` + check-in/status data.
- **Implementation notes:** Page này tồn tại trong brief nhưng phải cắm feature flag nếu backend queue chưa chốt.

### 10.20 Vital signs editor
- **Route đề xuất:** `/nurse/intake/:appointmentId/vitals`
- **Users:** Nurse, Doctor (read mostly), Admin (if allowed)
- **Purpose:** Ghi và rà soát bộ vital signs nhanh, ít sai định dạng.
- **Primary action:** Lưu vital signs
- **Secondary actions:** Edit existing vitals, cancel, quay lại intake/appointment
- **Screen weight:** critical form
- **Information priority**
  - **P1 (must read in 3s):** blood pressure, heart rate, temperature, respiratory rate, SpO2, save state
  - **P2 (available on demand):** recordedAt, appointment summary, format hints
  - **P3 (collapsed/secondary):** secondary notes
- **Layout / placement**
  - **Desktop:** Preferred UI là right drawer lớn hoặc dedicated page tùy context. Form chia grid 2 cột desktop: BP, HR, Temp, RR, SpO2. Header giữ appointment/patient summary. Right side hoặc footer có action bar `Save vitals`. Inline helper text cho từng field (e.g. `BP format 120/80`).
  - **Tablet:** 1 cột hoặc 2 cột tùy chỗ, action bar sticky.
  - **Mobile:** 1 cột stacked controls; save CTA sticky bottom.
- **Key components:** Form grid, helper text, action bar, summary header
- **Interaction / behavior:** BP dùng masked input hoặc 2-value composed control. Validation phải bắt định dạng và range cơ bản, nhưng không thay người dùng ra quyết định lâm sàng. Nếu existing vitals có, load vào form để edit.
- **States:** Create state, edit state, validation fail, save success, save error, stale appointment state.
- **Motion:** Only inline loading and subtle success highlight.
- **API / data mapping:** Appointment-linked vitals endpoints và `/vital-signs/*` generic endpoints.
- **Implementation notes:** Không thêm auto-interpretation AI cho vitals khi backend chưa support.

### 10.21 Invoices
- **Route đề xuất:** `/accounting/invoices`
- **Users:** Accountant, Admin
- **Purpose:** Quản lý hóa đơn và payment status bằng table-first UI rõ ràng, ít modal chồng chéo.
- **Primary action:** Tạo invoice mới hoặc record payment trên invoice hiện có
- **Secondary actions:** Filter status/date, void invoice, mở detail drawer, đi tới revenue
- **Screen weight:** heavy-data finance
- **Information priority**
  - **P1 (must read in 3s):** invoice number, patient, amount, status, due/issued date, primary actions
  - **P2 (available on demand):** payment history, line items, appointment linkage
  - **P3 (collapsed/secondary):** secondary analytics
- **Layout / placement**
  - **Desktop:** Theo staff data canvas template. Top KPI strip 4 card: issued, pending, paid, voided. Filter row sticky gồm status, date range, search invoice/patient. Main table full width. Row click mở right detail drawer với tabs `Summary / Line items / Payment history`. Drawer footer chứa actions `Record payment`, `Void invoice` theo status.
  - **Tablet:** Table + drawer giữ nguyên; KPI co lại.
  - **Mobile:** Không ưu tiên mobile; cardified rows nếu buộc phải hỗ trợ.
- **Key components:** KPI cards, filters, invoice table, detail drawer, payment sheet, confirm dialog
- **Interaction / behavior:** Create invoice dùng sheet/drawer riêng từ page action. Record payment mở nested sheet nhỏ trên detail drawer. Void invoice luôn cần confirm dialog. Không dùng full-page invoice detail nếu backend chưa chắc có GET detail.
- **States:** Table loading, empty filtered state, create success/error, payment duplicate error, void invalid state, partial detail state if list payload thiếu fields.
- **Motion:** Minimal; row highlight + drawer slide only.
- **API / data mapping:** `GET /invoices`, `POST /invoices`, `POST /invoices/{invoiceId}/payments`, `POST /invoices/{invoiceId}/void`.
- **Implementation notes:** Tất cả money values phải dùng tabular numerals và căn phải trong table.

### 10.22 Pricing management
- **Route đề xuất:** `/accounting/pricing`
- **Users:** Accountant, Admin
- **Purpose:** Chỉnh pricing rules nhanh và ít rủi ro.
- **Primary action:** Tạo hoặc cập nhật pricing rule
- **Secondary actions:** Filter theo service type/status, inspect current price
- **Screen weight:** CRUD utility page
- **Information priority**
  - **P1 (must read in 3s):** service name/type, base price, active state
  - **P2 (available on demand):** currency, updated time
  - **P3 (collapsed/secondary):** none
- **Layout / placement**
  - **Desktop:** Page theo admin CRUD template nhưng finance-friendly. Table columns: service type, service name, base price, currency, active, updatedAt. Right drawer chứa form create/edit đơn giản 1 cột.
  - **Tablet:** Table + drawer, co nhỏ spacing.
  - **Mobile:** Not primary for mobile.
- **Key components:** Table, price badge/value, drawer form, confirm dialog if deactivation needed
- **Interaction / behavior:** Price edit là straightforward; không cần chart ở màn này. Save success nên refresh row, không refetch toàn trang nếu tránh được.
- **States:** Loading, empty, save success/error, duplicate rule error if backend has one.
- **Motion:** No notable motion beyond drawer and toast.
- **API / data mapping:** `GET /pricing`, `POST /pricing`, `PUT /pricing/{pricingId}`.
- **Implementation notes:** Sử dụng input có prefix/suffix tiền tệ rõ ràng; không format gây nhầm dấu phân tách.

### 10.23 Revenue dashboard
- **Route đề xuất:** `/accounting/revenue`
- **Users:** Accountant, Admin
- **Purpose:** Biến raw doanh thu thành màn đọc nhanh theo daily/monthly.
- **Primary action:** Đổi kỳ xem và hiểu revenue breakdown
- **Secondary actions:** Drill sang invoices theo ngày/tháng, đổi view daily/monthly
- **Screen weight:** dashboard analytics
- **Information priority**
  - **P1 (must read in 3s):** total revenue, paid vs pending, period selector
  - **P2 (available on demand):** service breakdown, daily breakdown, invoice count
  - **P3 (collapsed/secondary):** decorative chart flourishes
- **Layout / placement**
  - **Desktop:** Top row: period tabs `Daily / Monthly`, date or month picker. Row 2: KPI cards. Row 3: main content split 8/4 — trái là chart card (bar/line tùy period), phải là summary/breakdown card. Dưới nữa là table breakdown by service hoặc by day.
  - **Tablet:** Chart và summary stack; table full width dưới.
  - **Mobile:** Portal-style mobile not priority; if needed stack cards then simplified chart.
- **Key components:** Tabs, date picker, KPI cards, chart card, breakdown table
- **Interaction / behavior:** Daily mode ưu tiên service breakdown; monthly mode ưu tiên daily trend. Link từ chart point hoặc table row sang invoices với prefilled filters nếu route logic cho phép.
- **States:** Empty report state, loading by period switch, partial data, backend report fail.
- **Motion:** Chart redraw no animation hoặc very short 100ms; period switch fade 100ms.
- **API / data mapping:** `GET /reports/revenue/daily`, `GET /reports/revenue/monthly`.
- **Implementation notes:** Finance charts phải thiên về readability, không showy.

### 10.24 Inventory workspace
- **Route đề xuất:** `/accounting/inventory`
- **Users:** Accountant, Admin
- **Purpose:** Cho finance/ops xem tồn kho, lô hàng và movement history trong một workspace thống nhất.
- **Primary action:** Kiểm tra low stock và thao tác trên item/lot/movement
- **Secondary actions:** Tạo item, tạo lot, ghi movement, filter theo category/status
- **Screen weight:** data workspace
- **Information priority**
  - **P1 (must read in 3s):** selected tab, low-stock alerts, main table
  - **P2 (available on demand):** expiring lots, recent usage, thresholds
  - **P3 (collapsed/secondary):** secondary analytics
- **Layout / placement**
  - **Desktop:** Top có KPI strip: total items, low stock, expiring lots, recent movements. Dưới là tabs `Items / Lots / Movements`. Mỗi tab dùng staff data canvas template riêng. Item tab ưu tiên stock quantity + threshold. Lot tab ưu tiên expiry date. Movement tab ưu tiên chronology.
  - **Tablet:** Tabs giữ nguyên; KPI strip co nhỏ.
  - **Mobile:** Not primary for mobile. If needed, tabs + cards.
- **Key components:** Tabs, KPI cards, tables, row highlights, detail drawer, create/edit sheets
- **Interaction / behavior:** Low stock row phải có semantic highlight và filter shortcut. Lot detail/edit mở drawer. Movement create thường là sheet nhỏ. Không thiết kế warehouse visualization/map.
- **States:** Tab loading, empty tab state, low-stock highlighted state, edit/save error, invalid quantity state.
- **Motion:** Only tabs and drawer motion.
- **API / data mapping:** `/inventory/items`, `/inventory/lots`, `/inventory/movements` endpoints.
- **Implementation notes:** Nếu inventory thuộc admin thay vì accountant ở repo thật, shell có thể reuse mà không đổi page structure.

### 10.25 Admin users
- **Route đề xuất:** `/admin/users`
- **Users:** Admin
- **Purpose:** Quản lý staff accounts, role và trạng thái active theo pattern CRUD rõ ràng.
- **Primary action:** Tạo hoặc cập nhật user
- **Secondary actions:** Filter theo role/department/status, activate/deactivate
- **Screen weight:** admin CRUD
- **Information priority**
  - **P1 (must read in 3s):** full name, email, role, active state
  - **P2 (available on demand):** department, phone, specialty/qualification when relevant
  - **P3 (collapsed/secondary):** secondary metadata
- **Layout / placement**
  - **Desktop:** Table theo admin CRUD template. Filters: role, status, department, search. Drawer form sections `Identity`, `Role & department`, `Professional info`, `Account status`. Footer drawer có primary save.
  - **Tablet:** Table + drawer, filters wrap.
  - **Mobile:** Admin mobile not primary.
- **Key components:** Table, badges, drawer form, confirm dialog
- **Interaction / behavior:** Create/edit cùng một form. Active/deactivate nên là explicit action trong drawer hoặc row menu + confirm. Doctor-specific fields chỉ hiện khi role = DOCTOR.
- **States:** Loading, empty, save error, duplicate email, activation confirm, partial profile fields.
- **Motion:** Drawer only.
- **API / data mapping:** `/admin/users` CRUD + activation endpoints (per repo).
- **Implementation notes:** Form fields tối thiểu theo SRS: email, fullName, role; optional fields conditionally shown.

### 10.26 Admin departments
- **Route đề xuất:** `/admin/departments`
- **Users:** Admin
- **Purpose:** Quản lý metadata khoa/phòng ban và doctor assignment.
- **Primary action:** Tạo hoặc chỉnh department
- **Secondary actions:** Filter/search, assign head doctor, activate/deactivate
- **Screen weight:** admin CRUD
- **Information priority**
  - **P1 (must read in 3s):** name, active state, head doctor, contact basics
  - **P2 (available on demand):** description, floor/room/hours
  - **P3 (collapsed/secondary):** none
- **Layout / placement**
  - **Desktop:** Table columns: name, head doctor, phone, hours, active. Drawer form sections `Core info`, `Location & hours`, `Doctor assignment`.
  - **Tablet:** Same pattern.
  - **Mobile:** Not primary for mobile.
- **Key components:** Table, drawer form, select doctor, active badge
- **Interaction / behavior:** Preview side within drawer có thể hiển thị public-facing card preview nhỏ để admin hiểu kết quả. Nếu doctor assignment data load fail, form vẫn save các field còn lại nếu backend cho phép.
- **States:** Loading, empty, save success/error, partial linked doctor data.
- **Motion:** Drawer only.
- **API / data mapping:** `/admin/departments` CRUD and assignment endpoints.
- **Implementation notes:** Public department detail dùng chính dữ liệu này nên labels phải thân thiện.

### 10.27 Admin rooms
- **Route đề xuất:** `/admin/rooms`
- **Users:** Admin
- **Purpose:** Quản lý room records và room status mà không giả lập room board realtime.
- **Primary action:** Tạo/chỉnh room hoặc cập nhật status
- **Secondary actions:** Filter theo status/department/floor
- **Screen weight:** admin CRUD
- **Information priority**
  - **P1 (must read in 3s):** room identity, current status
  - **P2 (available on demand):** department/floor and operational metadata
  - **P3 (collapsed/secondary):** map/floorplan
- **Layout / placement**
  - **Desktop:** Table-first with filters. Optional compact cards for status summary on top. Drawer form chứa room identity, department, status, description/notes nếu backend support.
  - **Tablet:** Table + drawer.
  - **Mobile:** Not primary for mobile.
- **Key components:** Table, status chips, drawer form
- **Interaction / behavior:** Status update có thể inline nếu very low risk, nhưng create/edit đầy đủ vẫn trong drawer. Không thiết kế graphical floor map.
- **States:** Loading, empty, save error, invalid status transition if backend applies.
- **Motion:** Minimal.
- **API / data mapping:** `/admin/rooms` CRUD and status endpoints.
- **Implementation notes:** Nurse-facing room workflow không nằm ở đây.

### 10.28 Admin schedule templates
- **Route đề xuất:** `/admin/schedule-templates`
- **Users:** Admin
- **Purpose:** Quản lý template thời gian làm việc/schedule generation dưới dạng cấu trúc dễ kiểm tra.
- **Primary action:** Tạo/chỉnh template
- **Secondary actions:** Filter/search, preview weekly pattern
- **Screen weight:** configuration page
- **Information priority**
  - **P1 (must read in 3s):** template name/pattern/effective context
  - **P2 (available on demand):** slot structure details
  - **P3 (collapsed/secondary):** historical versions unless backend supports them
- **Layout / placement**
  - **Desktop:** List/table bên trái hoặc full-width table; drawer/editor bên phải có weekly matrix editor hoặc grouped day blocks. P1 là pattern rõ ràng theo ngày và khung giờ, không phải visual calendar phô trương.
  - **Tablet:** Editor still accessible with stacked day blocks.
  - **Mobile:** Not primary for mobile.
- **Key components:** Table, matrix/day editor, drawer
- **Interaction / behavior:** Template preview phải đủ rõ để admin không generate nhầm slots. Nếu backend field set khác, vẫn giữ khuôn `Days + time windows + metadata`.
- **States:** Loading, empty, invalid overlap state, save error.
- **Motion:** Very minimal.
- **API / data mapping:** `/admin/schedule-templates` CRUD endpoints.
- **Implementation notes:** Không làm drag-drop scheduler nặng nếu backend chưa rõ model.

### 10.29 Admin special closures
- **Route đề xuất:** `/admin/special-closures`
- **Users:** Admin
- **Purpose:** Block ngày nghỉ/maintenance/special closure bằng UI thiên lịch nhưng rõ trạng thái hơn là đẹp.
- **Primary action:** Tạo closure
- **Secondary actions:** Filter by date range, edit/delete closure
- **Screen weight:** calendar + list utility
- **Information priority**
  - **P1 (must read in 3s):** upcoming closures, active date selection
  - **P2 (available on demand):** affected scope, reason
  - **P3 (collapsed/secondary):** decorative calendar motion
- **Layout / placement**
  - **Desktop:** Top split 8/4: trái là month calendar hoặc date list, phải là upcoming closures list. Create/edit dùng drawer với fields date/date range, reason, scope. Calendar cell có closure dot/badge.
  - **Tablet:** Calendar full width trên, list dưới.
  - **Mobile:** List-first nếu calendar quá chật.
- **Key components:** Calendar, list, drawer form, date picker
- **Interaction / behavior:** Calendar chỉ để locate closures; detail and edit vẫn qua drawer/list. Không build complex recurrence nếu API chưa support.
- **States:** Loading, empty, overlapping closure error, save success/error.
- **Motion:** Date selection fade only.
- **API / data mapping:** `/admin/special-closures` CRUD endpoints.
- **Implementation notes:** Nếu backend chỉ hỗ trợ single-date closure, UI range picker phải bị tắt.

### 10.30 Admin slot generation
- **Route đề xuất:** `/admin/slot-generation`
- **Users:** Admin
- **Purpose:** Biến việc generate/delete slots thành flow minh bạch và ít nguy cơ tạo dữ liệu sai.
- **Primary action:** Generate slots
- **Secondary actions:** Preview impact, delete slots, adjust parameters
- **Screen weight:** action-focused config page
- **Information priority**
  - **P1 (must read in 3s):** selected doctor/template/date range, preview count, confirm action
  - **P2 (available on demand):** warnings/conflicts
  - **P3 (collapsed/secondary):** secondary guidance
- **Layout / placement**
  - **Desktop:** Page 2 vùng: trái là configuration form (doctor/department/template/date range, generation options nếu có), phải là preview/impact card sticky. Bên dưới full-width preview table hiển thị sample slots hoặc generated summary. Danger zone delete slots ở cuối, tách khối rõ.
  - **Tablet:** Form trên, preview dưới.
  - **Mobile:** 1 cột stacked; confirm CTA sticky bottom.
- **Key components:** Form, preview card, preview table, danger zone dialog
- **Interaction / behavior:** Không allow generate blind. Always preview count and affected days before confirm. Delete slots luôn confirm destructively.
- **States:** No template selected, no preview yet, generation success, generation fail, delete fail, conflict warning.
- **Motion:** Preview card update subtle; destructive confirm no theatrics.
- **API / data mapping:** `/admin/slots` generation/deletion endpoints + dependencies to templates/doctors.
- **Implementation notes:** Đây là page operational risk cao; copy phải rất explicit.

### 10.31 Admin public content
- **Route đề xuất:** `/admin/content`
- **Users:** Admin
- **Purpose:** Chỉnh content public site mà vẫn thấy preview đủ sát.
- **Primary action:** Lưu content section
- **Secondary actions:** Chuyển section, preview public output, manage hero content
- **Screen weight:** content editor
- **Information priority**
  - **P1 (must read in 3s):** selected section, hero fields, section content
  - **P2 (available on demand):** preview, image URL, content blocks
  - **P3 (collapsed/secondary):** CMS ambitions beyond contract
- **Layout / placement**
  - **Desktop:** Layout 3 vùng desktop: trái 240px section list, giữa 1fr editor form, phải 360px live preview panel. Editor form có hero fields trên top nếu content type là Home hero; section fields dưới. Preview panel render public card/section thu nhỏ theo token thật.
  - **Tablet:** Section list thành horizontal tabs hoặc accordion; preview xuống dưới.
  - **Mobile:** 1 cột stack: section selector -> editor -> preview.
- **Key components:** Section list, content form, preview panel, image URL input, save bar
- **Interaction / behavior:** Do contract home content còn khá gọn, editor không nên giả CMS quá giàu. Preview phải rõ nhưng không cần full-browser simulation.
- **States:** Loading sections, save error, image missing, preview fallback, unsaved changes.
- **Motion:** Preview re-render fade 100ms only.
- **API / data mapping:** `/admin/content/sections`, `/admin/public-content`, `/content/home` as preview target.
- **Implementation notes:** Nếu reorder sections chưa có API, section list phải fixed-order.

### 10.32 Admin news
- **Route đề xuất:** `/admin/news`
- **Users:** Admin
- **Purpose:** Tạo và chỉnh news items cho public surface bằng pattern editor đơn giản, ít rủi ro.
- **Primary action:** Tạo/chỉnh article
- **Secondary actions:** Preview article card, set publish date, search/filter news
- **Screen weight:** content CRUD
- **Information priority**
  - **P1 (must read in 3s):** title, published date, publish state
  - **P2 (available on demand):** image, excerpt/body preview
  - **P3 (collapsed/secondary):** category workflow nếu backend chưa có
- **Layout / placement**
  - **Desktop:** Page theo admin CRUD template. Table/list article bên trái/full width. Drawer có tabs `Edit` và `Preview`. Edit fields: title, content/body, image URL, published date. Preview tab render card như public news list + excerpt extraction.
  - **Tablet:** Same pattern, preview dưới form nếu hẹp.
  - **Mobile:** Not primary for mobile.
- **Key components:** Table/list, drawer editor, preview tab
- **Interaction / behavior:** Article content dài dùng textarea lớn nhưng không biến thành full CMS. Broken image fallback phải rõ.
- **States:** Loading, empty, save error, image fallback, preview fallback.
- **Motion:** Drawer only.
- **API / data mapping:** `/admin/news` CRUD endpoints; public reflect via `/news`.
- **Implementation notes:** Không build workflow approval nếu backend chưa support.

### 10.33 Admin stats
- **Route đề xuất:** `/admin/stats`
- **Users:** Admin
- **Purpose:** Cho admin cái nhìn cấp cao về hoạt động hệ thống/bệnh viện trong một dashboard read-only.
- **Primary action:** Đọc nhanh vận hành hiện tại
- **Secondary actions:** Đi sâu sang monitoring, audit logs, content/news management
- **Screen weight:** dashboard summary
- **Information priority**
  - **P1 (must read in 3s):** headline KPIs
  - **P2 (available on demand):** module summaries, trend snippets
  - **P3 (collapsed/secondary):** deep analytics
- **Layout / placement**
  - **Desktop:** KPI cards row đầu, summary cards/mini charts row sau, quick links sang monitoring/audit/content. Layout 12 cột cân bằng 3–4 blocks.
  - **Tablet:** Cards stack 2 cột.
  - **Mobile:** Not primary for mobile.
- **Key components:** KPI cards, mini charts, quick link tiles
- **Interaction / behavior:** Stats page không ôm quá nhiều controls; đây là read-only landing cho admin.
- **States:** Loading, empty, partial metrics missing.
- **Motion:** Minimal card refresh.
- **API / data mapping:** `/admin/stats`.
- **Implementation notes:** Nếu monitoring đủ mạnh, stats có thể là admin home.

### 10.34 Admin monitoring
- **Route đề xuất:** `/admin/monitoring`
- **Users:** Admin
- **Purpose:** Hiển thị health của hệ thống và internal assistant theo cách vận hành được, không over-visualized.
- **Primary action:** Phát hiện vấn đề hệ thống hoặc assistant performance
- **Secondary actions:** Chuyển tab system/assistant, mở audit logs, refresh data
- **Screen weight:** operational dashboard
- **Information priority**
  - **P1 (must read in 3s):** service health / assistant health / critical alerts
  - **P2 (available on demand):** response times, usage counts, error rates
  - **P3 (collapsed/secondary):** decorative charts
- **Layout / placement**
  - **Desktop:** Top có tabs `System` và `Internal assistant`. System tab: service health cards + metric table/chart. Assistant tab: request counts, latency, refusal/error, feedback summary. Alerts card luôn nằm trên fold.
  - **Tablet:** Tabs giữ nguyên; cards stack.
  - **Mobile:** Not primary for mobile.
- **Key components:** Tabs, alert cards, metric tables/charts, refresh action
- **Interaction / behavior:** Monitoring phải read-only. Critical alert dùng semantic error/warning, không dùng brand purple. Refresh action manual nếu backend không streaming.
- **States:** Loading, no incidents, partial metrics, API fail, stale data banner.
- **Motion:** Very little motion; maybe count update fade.
- **API / data mapping:** `/admin/monitoring`, `/admin/monitoring/internal-assistant`.
- **Implementation notes:** Không làm real-time oscilloscope nếu backend chỉ trả periodic stats.

### 10.35 Admin audit logs
- **Route đề xuất:** `/admin/audit-logs`
- **Users:** Admin
- **Purpose:** Cho admin tra sự kiện vận hành với khả năng scan, filter và inspect raw detail.
- **Primary action:** Tìm log event phù hợp
- **Secondary actions:** Filter by actor/action/date, mở raw detail drawer
- **Screen weight:** heavy-data forensic page
- **Information priority**
  - **P1 (must read in 3s):** timestamp, actor, action, target, result
  - **P2 (available on demand):** metadata, request correlation, raw payload
  - **P3 (collapsed/secondary):** charts
- **Layout / placement**
  - **Desktop:** Full-width table dense with sticky filter row. Columns căn monospace cho time/id nếu cần. Row click mở detail drawer có sections `Summary`, `Metadata`, `Raw payload` (monospace block).
  - **Tablet:** Table + drawer.
  - **Mobile:** Not primary for mobile.
- **Key components:** Dense table, filter row, detail drawer, code block
- **Interaction / behavior:** Search/filter must dominate. Raw payload scroll riêng trong drawer để không kéo cả page. Export chỉ future scope nếu backend chưa support.
- **States:** Loading, empty, filtered empty, partial payload, unauthorized.
- **Motion:** Drawer only.
- **API / data mapping:** `/admin/audit-logs`.
- **Implementation notes:** Typography monospace chỉ dùng cho technical fields, không dùng toàn page.

### 10.36 Admin knowledge documents
- **Route đề xuất:** `/admin/knowledge-documents`
- **Users:** Admin
- **Purpose:** Quản trị tài liệu knowledge base cho assistant với upload, trạng thái index và action rõ ràng.
- **Primary action:** Upload hoặc reindex/revoke document
- **Secondary actions:** Filter status, inspect document metadata, retry failed jobs
- **Screen weight:** admin CRUD + file workflow
- **Information priority**
  - **P1 (must read in 3s):** document name, status, source, updated/index state
  - **P2 (available on demand):** upload progress, failure reason, action controls
  - **P3 (collapsed/secondary):** full document preview if connector not guaranteed
- **Layout / placement**
  - **Desktop:** Top action bar có `Upload document`. Dưới là status summary chips và main table/list. Upload dùng dashed dropzone card + file queue. Row click mở drawer với metadata, status timeline, actions `Activate / Revoke / Reindex`.
  - **Tablet:** Dropzone full width trên, table dưới.
  - **Mobile:** Upload flow full width; table cards if needed.
- **Key components:** Dropzone, upload queue, table, status badges, detail drawer, confirm dialog
- **Interaction / behavior:** Upload/reindex có nhiều transient states nên row status phải rất rõ: uploaded, processing, indexed, failed, revoked. Failed state cần retry action và lý do fail. File preview chỉ cần metadata + maybe snippet, không hứa full document renderer.
- **States:** Upload in progress, indexing pending, indexing fail, empty state, revoked state, retry state.
- **Motion:** Progress bar animate width 120ms; status chip swap subtle.
- **API / data mapping:** `/admin/knowledge-documents` and related actions.
- **Implementation notes:** Đây là nơi cần state design mạnh nhất trong admin vì có workflow bất đồng bộ phía backend.

### 10.37 Patient portal shell
- **Route đề xuất:** `/portal/(protected)`
- **Users:** Patient
- **Purpose:** Tạo cảm giác an toàn, rõ ràng và personal mà không giống admin dashboard.
- **Primary action:** Đi tới thông tin cá nhân quan trọng nhất
- **Secondary actions:** Đổi page, logout, quay về public site
- **Screen weight:** portal navigation shell
- **Information priority**
  - **P1 (must read in 3s):** page title, next critical info, nav hiện tại
  - **P2 (available on demand):** profile shortcut, logout
  - **P3 (collapsed/secondary):** decorative content
- **Layout / placement**
  - **Desktop:** Desktop: trái sidebar nhẹ 240px với nav `Overview / Appointments / Lab results / Messages / Profile`; trên cùng main area có top bar nhỏ với page title và patient summary mini. Mobile: top bar + bottom nav 5 item.
  - **Tablet:** Sidebar thu gọn hoặc top tabs tùy width.
  - **Mobile:** Bottom nav fixed + top title bar. Không dùng sidebar mobile.
- **Key components:** Sidebar/bottom nav, top bar, content container
- **Interaction / behavior:** Portal nav labels phải đơn giản, tránh jargon. Current page title và small description đủ để patient orient. Logout ở profile/menu, không quá nổi bật cạnh primary tasks.
- **States:** Shell loading, unauthorized redirect, session expired modal, active nav state.
- **Motion:** Subtle only.
- **API / data mapping:** Consumes patient auth/session state.
- **Implementation notes:** Portal shell dùng surface nhẹ hơn staff, nhiều whitespace hơn.

### 10.38 Patient claim access
- **Route đề xuất:** `/portal/claim`
- **Users:** Patient
- **Purpose:** Kích hoạt quyền truy cập portal bằng flow ít đáng sợ, rõ bước xác minh.
- **Primary action:** Xác minh và kích hoạt portal access
- **Secondary actions:** Quay sang login nếu đã có tài khoản, resend/enter verification code nếu business support
- **Screen weight:** auth/activation flow
- **Information priority**
  - **P1 (must read in 3s):** CCCD, email, verification step, clear guidance
  - **P2 (available on demand):** identity helper copy, support contact
  - **P3 (collapsed/secondary):** secondary profile completion
- **Layout / placement**
  - **Desktop:** Desktop centered auth shell width ~520px. Step 1 card: identify patient (CCCD, email, optional DOB/full name nếu backend chốt). Step 2 card: verification code. Optional step/set password block chỉ hiện nếu backend thật sự support. Right/left supportive illustration panel có thể dùng nhưng không bắt buộc.
  - **Tablet:** Same centered flow.
  - **Mobile:** 1 cột full-width card, step indicator text only.
- **Key components:** Stepper, auth card, OTP/verification input, support alert
- **Interaction / behavior:** Do contract/SRS mismatch, flow phải modular. Nếu backend hiện tại chỉ cần `cccd + email + verificationCode`, step 2 submit xong vào session luôn. Không hứa self-service password change. `Already activated? Sign in` luôn hiển thị.
- **States:** Invalid code, patient not found, already activated, partial step progression, session already active redirect.
- **Motion:** Step transition fade 140ms; verification code inputs focus animation rất nhẹ.
- **API / data mapping:** `POST /patient-auth/claim`; optional extra identity fields chờ DTO confirmation.
- **Implementation notes:** Đây là một trong hai area cần backend alignment gấp.

### 10.39 Patient login
- **Route đề xuất:** `/portal/login`
- **Users:** Patient
- **Purpose:** Cho patient vào portal nhanh và không nhầm với staff login.
- **Primary action:** Đăng nhập portal
- **Secondary actions:** Đi sang claim access, retry credentials
- **Screen weight:** auth page
- **Information priority**
  - **P1 (must read in 3s):** email, password, portal identity
  - **P2 (available on demand):** claim access link
  - **P3 (collapsed/secondary):** none
- **Layout / placement**
  - **Desktop:** Centered card ~420px trong portal-themed auth shell. Trên card có title `Patient portal`, subtitle ngắn. Form rất ngắn. Link `Need access? Claim portal` dưới form.
  - **Tablet:** Same.
  - **Mobile:** Full-width card with stacked fields.
- **Key components:** Auth card, inputs, button, helper links
- **Interaction / behavior:** Không nhét staff/security jargon. Session active thì redirect thẳng overview.
- **States:** Invalid credentials, server unavailable, session expired re-entry.
- **Motion:** Only button loading.
- **API / data mapping:** `POST /patient-auth/login`, refresh/logout patient endpoints.
- **Implementation notes:** Không thêm forgot password nếu chưa có API.

### 10.40 Patient overview
- **Route đề xuất:** `/portal`
- **Users:** Patient
- **Purpose:** Cho patient thấy điều quan trọng nhất trong 5 giây đầu: lần khám tiếp theo, kết quả cần chú ý, và hành động kế tiếp.
- **Primary action:** Mở next appointment hoặc lab results
- **Secondary actions:** Đi tới messages, profile
- **Screen weight:** balanced dashboard
- **Information priority**
  - **P1 (must read in 3s):** next appointment, pending lab results, unread messages, quick summary
  - **P2 (available on demand):** last visit, profile summary
  - **P3 (collapsed/secondary):** secondary educational copy
- **Layout / placement**
  - **Desktop:** Desktop 12 cột: trên cùng welcome card / next appointment card chiếm 7 cột, bên phải 5 cột là summary cards (pending labs, unread messages, last visit). Dưới là 2 cột cards: recent appointments, recent lab results/messages. Layout ưu tiên cards lớn, ít table.
  - **Tablet:** Cards stack 2 cột.
  - **Mobile:** 1 cột card stack, next appointment card trên cùng, bottom nav hỗ trợ điều hướng sâu.
- **Key components:** Hero summary card, stat cards, recent item cards, quick links
- **Interaction / behavior:** Nếu không có next appointment, hero card chuyển thành `No upcoming appointment` với CTA nhẹ về contact/booking public. Abnormal lab results nếu có phải hiện warning badge rõ.
- **States:** Loading cards, no upcoming appointment, no lab results yet, no messages, partial profile summary.
- **Motion:** Cards fade in 120ms; no heavy animations.
- **API / data mapping:** `GET /patient-portal/overview`.
- **Implementation notes:** Portal overview không được giống admin dashboard; text phải thân thiện và ít thuật ngữ.

### 10.41 Patient appointments
- **Route đề xuất:** `/portal/appointments`
- **Users:** Patient
- **Purpose:** Hiển thị lịch sử và lịch hẹn sắp tới rõ ràng, không tạo kỳ vọng hủy/reschedule nếu API chưa có.
- **Primary action:** Xem chi tiết một appointment
- **Secondary actions:** Filter upcoming/past, open doctor/department context
- **Screen weight:** list/detail
- **Information priority**
  - **P1 (must read in 3s):** upcoming vs past appointment, doctor, department, status, date/time
  - **P2 (available on demand):** diagnosis/notes summary
  - **P3 (collapsed/secondary):** cancel/reschedule controls
- **Layout / placement**
  - **Desktop:** Desktop: header + segmented control `Upcoming / Past / All`, danh sách cards hoặc clean table-lite. Row/card click mở detail drawer phải. Drawer hiển thị doctor, department, diagnosis, notes, timestamps. Không có destructive actions.
  - **Tablet:** List + optional drawer; nếu hẹp thì detail full width modal.
  - **Mobile:** 1 cột stacked appointment cards; tap mở full-screen detail sheet.
- **Key components:** Segmented control, appointment cards, detail drawer/sheet, status badges
- **Interaction / behavior:** Không hiển thị `Cancel` hoặc `Reschedule` CTA nếu API chưa có. Nếu appointment completed, diagnosis/notes lên P2 trong detail.
- **States:** Loading, no appointments, filtered empty, partial detail, unauthorized/session expired.
- **Motion:** Subtle card hover; drawer/sheet open only.
- **API / data mapping:** `GET /patient-portal/appointments`.
- **Implementation notes:** Nếu business muốn self-service booking later, thêm future-scope note chứ không render giả button.

### 10.42 Patient lab results
- **Route đề xuất:** `/portal/lab-results`
- **Users:** Patient
- **Purpose:** Biến danh sách lab results thành thứ dễ đọc, đặc biệt với abnormal values.
- **Primary action:** Mở lab result chi tiết
- **Secondary actions:** Filter by status/date, đọc giải thích gọn
- **Screen weight:** list/detail
- **Information priority**
  - **P1 (must read in 3s):** test name, value, status, tested/reported date
  - **P2 (available on demand):** reference range, notes, doctor comment/attachment nếu có
  - **P3 (collapsed/secondary):** deep raw lab docs
- **Layout / placement**
  - **Desktop:** Desktop: top filters đơn giản, main list cards hoặc table-lite. Detail drawer/sheet hiển thị testName, value/unit, referenceRange, status badge, notes. Optional zones cho clinician comment và attachment link nằm dưới, chỉ hiện nếu payload có.
  - **Tablet:** List + detail same pattern.
  - **Mobile:** 1 cột cards; abnormal results có visual prominence nhưng không hoảng loạn.
- **Key components:** Lab result cards, status badges, detail sheet, optional attachment row
- **Interaction / behavior:** Abnormal state dùng warning/error tone tùy backend status. Reference range hiển thị cạnh value để patient dễ so. Không hiển thị medical jargon dày đặc nếu không có explanation layer.
- **States:** Loading, no lab results, abnormal highlighted state, partial payload without notes/reference range.
- **Motion:** Only drawer/sheet motion and subtle badge transitions.
- **API / data mapping:** `GET /patient-portal/lab-results`.
- **Implementation notes:** Nếu attachment URL chưa có, khu vực attachment phải tự biến mất.

### 10.43 Patient messages
- **Route đề xuất:** `/portal/messages`
- **Users:** Patient
- **Purpose:** Cho patient thấy thread liên lạc từ bệnh viện theo cách read-only, rõ và không gây hiểu lầm có thể reply.
- **Primary action:** Đọc thread phù hợp
- **Secondary actions:** Filter unread/all, quay lại overview
- **Screen weight:** list or list+preview
- **Information priority**
  - **P1 (must read in 3s):** subject, doctor, last message, unread count
  - **P2 (available on demand):** message preview if payload available
  - **P3 (collapsed/secondary):** compose/reply controls
- **Layout / placement**
  - **Desktop:** Desktop ưu tiên 2-pane **chỉ khi** payload đủ chứa message bodies; nếu không thì list-only với preview card cơ bản. Left pane/thread list 4–5 cột, right preview 7–8 cột. Header có `Messages from your care team`.
  - **Tablet:** 2-pane nếu chỗ đủ và payload đủ; nếu không stack.
  - **Mobile:** List-only hoặc list -> full-screen sheet.
- **Key components:** Thread list, unread badge, preview panel/sheet
- **Interaction / behavior:** Không hiển thị input composer. Empty state phải nói rõ `Your care team will message you here when needed`. Nếu chỉ có summary payload, preview pane hiển thị subject + lastMessage + metadata thay vì giả thread body.
- **States:** Loading, no messages, unread filter empty, summary-only payload, session expired.
- **Motion:** Minimal.
- **API / data mapping:** `GET /patient-portal/messages`; preview depth phụ thuộc payload thật.
- **Implementation notes:** Đây là area mismatch PRD vs contract; dev cần feature flag preview depth.

### 10.44 Patient profile
- **Route đề xuất:** `/portal/profile`
- **Users:** Patient
- **Purpose:** Cho patient cập nhật contact/profile an toàn và hiểu field nào editable.
- **Primary action:** Lưu profile
- **Secondary actions:** Xem read-only identity fields, cập nhật emergency contact / allergies
- **Screen weight:** form page
- **Information priority**
  - **P1 (must read in 3s):** full name, email, phone, primary editable fields
  - **P2 (available on demand):** address, emergency contact, allergies, optional health info
  - **P3 (collapsed/secondary):** immutable fields like CCCD beyond read-only display
- **Layout / placement**
  - **Desktop:** Desktop 2-column form: trái `Personal & contact`, phải `Health & emergency`. Top có readonly identity strip. Save bar sticky cuối page hoặc top-right depending form length.
  - **Tablet:** 2 columns giữ nếu đủ chỗ, nếu không stack.
  - **Mobile:** 1 cột stacked sections; save CTA sticky bottom.
- **Key components:** Section cards, read-only identity strip, save bar, inline validation
- **Interaction / behavior:** Editable vs read-only phải rõ bằng styling và label. `CCCD` hiển thị read-only. Optional health fields có helper text. Save chỉ bật khi dirty hoặc valid according to strategy.
- **States:** Loading, save success, save error, partial profile, session expired with unsaved changes.
- **Motion:** Only save feedback/toast.
- **API / data mapping:** `GET /patient-portal/profile`, `PUT /patient-portal/profile`.
- **Implementation notes:** Không thêm password change section nếu API chưa có.

### 10.45 Internal assistant panel
- **Route đề xuất:** `(shared right panel in staff shell)`
- **Users:** Doctor, Nurse, Admin
- **Purpose:** Cung cấp trợ lý evidence-first, session-aware, citation-first mà không bị hiểu như chat generalist.
- **Primary action:** Gửi câu hỏi và đọc answer có citation
- **Secondary actions:** Đổi mode, mở deep link, gửi feedback
- **Screen weight:** shared utility panel
- **Information priority**
  - **P1 (must read in 3s):** current mode, current context, latest answer, citations
  - **P2 (available on demand):** follow-up prompts, feedback, session info
  - **P3 (collapsed/secondary):** chat theatrics
- **Layout / placement**
  - **Desktop:** Panel 400px bên phải desktop. Header gồm title, mode tabs `Docs / Patient / Hybrid` (role-gated), context chips (patient / appointment), rate-limit helper text nhỏ nếu cần. Body: chronological message list. Mỗi assistant answer block có body, citations list, deep links, follow-up chips, feedback row. Composer fixed bottom.
  - **Tablet:** Panel overlay 360px.
  - **Mobile:** Full-height bottom sheet; composer fixed.
- **Key components:** Tabs, context chips, message blocks, citation list, prompt chips, feedback buttons, composer
- **Interaction / behavior:** Admin chỉ thấy Docs mode. Nurse chỉ dùng patient/hybrid khi có selected queue context; nếu không có context, tab disabled kèm helper text. User-friendly tab labels được map qua adapter sang backend enum. Refusal state render bằng alert card rõ lý do, không như empty answer.
- **States:** Initial empty state with prompt suggestions, loading answer, refusal state, rate-limit state, context missing state, feedback submitted state.
- **Motion:** Open panel 180ms; answer renders body -> citations -> prompts in short sequence; no fake typing.
- **API / data mapping:** `GET /internal-assistant/sessions/current`, `POST /internal-assistant/messages`, `POST /internal-assistant/messages/{messageId}/feedback`.
- **Implementation notes:** Assistant phải luôn là secondary support, không che primary task canvas.

### 10.46 Global overlays & error states
- **Route đề xuất:** `(global)`
- **Users:** All roles
- **Purpose:** Xử lý những trạng thái xuyên hệ thống một cách nhất quán.
- **Primary action:** Recover session hoặc hiểu rõ vì sao không thể tiếp tục
- **Secondary actions:** Retry, go back, login again, switch role/surface
- **Screen weight:** status-only utility
- **Information priority**
  - **P1 (must read in 3s):** session expired, forbidden, 404/500/maintenance, destructive confirms
  - **P2 (available on demand):** retry options, support links
  - **P3 (collapsed/secondary):** none
- **Layout / placement**
  - **Desktop:** Các overlay/global pages bắt buộc: `Session expired modal`, `Permission denied state`, `404`, `500`, `Maintenance`, `Unsaved changes confirm`. Session expired là modal chặn vừa đủ, không redirect gấp. Forbidden là full-page state trong protected shell, vẫn giữ nav để user biết mình đang ở đâu.
  - **Tablet:** Same patterns.
  - **Mobile:** Mobile-first overlays full width when needed.
- **Key components:** Dialog, full-page state, alert, action buttons
- **Interaction / behavior:** 404 public phải cho đường quay về Home/Booking. 403 staff phải nói rõ vai trò hiện tại không có quyền. 500 phải giữ ngôn ngữ bình tĩnh, không lộ kỹ thuật. Maintenance chỉ cần nếu deployment cần.
- **States:** All error families, retry states, offline notes, partial recovery.
- **Motion:** Only fade/dialog motions; errors không rung lắc toàn màn hình.
- **API / data mapping:** Driven by router/auth/error boundary rather than single endpoint.
- **Implementation notes:** Đây là phần thường bị bỏ quên nhưng là HIGH RISK nếu thiếu.

## 11. Priority fixes / decisions to lock before coding

1. **Lock backend contract alignment cho booking và patient claim**
   Nếu không chốt sớm, frontend sẽ build form đúng UX nhưng sai payload adapter.

2. **Khóa assistant mode mapping giữa UI tabs và backend enum**
   UI nên giữ `Docs / Patient / Hybrid`; adapter layer mới map enum thật.

3. **Xác nhận queue source of truth**
   Có endpoint queue thật hay derive từ appointments/today. Quyết định này ảnh hưởng trực tiếp Nurse board.

4. **Chốt depth của patient messages và invoice detail**
   Nếu chỉ có summary payload, phải freeze list/detail expectations ngay để tránh overbuild.

5. **Khóa density rules theo surface ngay trong component library**
   Cùng một design system nhưng phải có `public / portal / staff` presets; nếu không, project sẽ hoặc quá rỗng cho staff, hoặc quá nặng cho public.

## 12. What to NOT build (intentionally exclude or defer)

- **Không build patient self-service cancel/reschedule** nếu backend chưa support.
- **Không build patient message compose/reply**; messages hiện là read-only.
- **Không build public chatbot như general AI medical assistant**; đây là scoped helper về bệnh viện, khoa, bác sĩ, booking.
- **Không build nurse room board / call / skip / real-time wallboard** nếu repo hiện chưa có endpoints tương ứng.
- **Không build flashy motion trên clinical/back-office screens**; tốc độ đọc và độ tin cậy quan trọng hơn.
- **Không lock dedicated news detail route hoặc invoice detail route** nếu backend chưa xác nhận detail endpoint.
- **Không giả lập CMS phức tạp hơn contract** trong admin content/news.
- **Không hứa feature password reset / external payment / advanced notification flows** nếu API chưa có.

## 13. Frontend implementation guardrails

- Dùng **layout-level route groups** để tách public, portal, staff.
- Tạo **surface presets** trong theme/tokens:
  - `surface-public`
  - `surface-portal`
  - `surface-staff`
- Tạo **status token map** riêng; không reuse brand purple cho success/error/warning.
- Table-heavy pages nên dùng shared `DataCanvas` abstraction với:
  - sticky filter row
  - loading rows
  - empty state
  - detail drawer slot
- Form-heavy pages nên dùng shared `SectionedForm` abstraction với:
  - section header
  - inline validation
  - sticky action bar
  - unsaved changes guard
- Assistant nên là shared shell component, không re-implement theo từng page.
- Mọi state critical cần snapshot trong Storybook/Figma states:
  - loading
  - empty
  - error
  - partial
  - permission denied
  - success
  - session expired

## 14. Deliverables implied by this brief

Từ brief này, designer/frontend có thể tiếp tục tạo:
- sitemap + route map
- wireframe cho từng page
- high-fidelity screen set
- component states library
- interaction prototype
- frontend implementation checklist per route
- API adapter alignment checklist
