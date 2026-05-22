# Hospital Core — Unified Design System

**Role:** Quy chuẩn giao diện dùng chung cho toàn bộ hệ thống Hospital Core: Dashboard, Patients, Queue, Inventory, Finance, Billing, Diagnostics, Appointments, Settings và các trang nghiệp vụ còn lại.

**Reference UI:** Inventory Workspace screenshot. File này thay thế hướng cũ “dark sidebar làm brand moment” bằng chuẩn mới: **dark navy top navigation + light clinical sidebar + white workspace + dense operational tables**.

**Primary goal:** Tất cả page trong hệ thống phải nhìn cùng một sản phẩm, không để mỗi module một kiểu. Mọi page phải dùng chung layout shell, token màu, typography, spacing, card, table, button, badge và trạng thái tương tác bên dưới.

---

## 1. Design Direction

Hospital Core phải tạo cảm giác **clinical, secure, fast, calm, operational**. UI cần giống một hệ thống vận hành bệnh viện thực tế: rõ ràng, đáng tin, dễ scan dữ liệu, ít trang trí thừa.

Phong cách chuẩn theo screenshot:

- **Dark navy topbar** là vùng nhận diện thương hiệu chính.
- **Light contextual sidebar** dùng cho menu nghiệp vụ trong module hiện tại.
- **White/light workspace** là vùng làm việc chính, ưu tiên dữ liệu và hành động.
- **Blue primary actions** cho thao tác chính như `Add Item`, `Admit Patient`, `Create Invoice`.
- **Soft semantic badges** cho trạng thái, tồn kho, cảnh báo, thanh toán, lịch hẹn.
- **Dense tables** nhưng phải có header rõ, row height đều, hover state nhẹ, action icons nhất quán.

### Visual Personality

| Attribute | Direction |
|---|---|
| Clinical | Nền trắng, xanh navy, border mảnh, thông tin rõ ràng |
| Operational | Table/list view gọn, filter nhanh, pagination rõ |
| Secure | Topbar navy, icon shield/cross, alert badge rõ |
| Modern | Rounded card, soft shadow, spacing rộng vừa đủ |
| Professional | Không dùng gradient lòe loẹt trong content, không dùng màu tùy hứng |

### Global Rule

Every page must follow this hierarchy:

1. **Topbar:** brand, global modules, notification, settings, profile.
2. **Left sidebar:** current workspace/module navigation.
3. **Content header:** page title + short description + optional primary action.
4. **KPI/summary row:** 3–4 cards when the page has measurable data.
5. **Control panel:** search, filters, export, create action.
6. **Main content:** table, grid, calendar, record detail, chart, or workflow board.
7. **Footer/pagination:** table counts, pagination, page size.

---

## 2. App Shell Layout

### Desktop Frame

Target desktop layout from screenshot:

| Region | Size / Rule |
|---|---:|
| Viewport reference | 1600 × 900 or 1728 × 972 |
| Topbar height | 64px |
| Left sidebar width | 280px |
| Content padding | 32px top/right/bottom/left |
| Content max behavior | Fluid full width; no centered narrow dashboard |
| Main card radius | 12px–14px |
| Table row height | 46px–52px |
| KPI card height | 112px–120px |
| Filter toolbar height | 64px–72px |

### Shell Structure

```html
<div class="hc-app">
  <header class="hc-topbar">...</header>
  <div class="hc-body">
    <aside class="hc-sidebar">...</aside>
    <main class="hc-main">...</main>
  </div>
</div>
```

```css
.hc-app {
  min-height: 100vh;
  background: var(--hc-bg);
  color: var(--hc-text);
  font-family: var(--hc-font-sans);
}

.hc-topbar {
  height: var(--hc-topbar-h);
  display: flex;
  align-items: center;
  background: var(--hc-navy-950);
  color: var(--hc-white);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hc-body {
  display: grid;
  grid-template-columns: var(--hc-sidebar-w) minmax(0, 1fr);
  min-height: calc(100vh - var(--hc-topbar-h));
}

.hc-sidebar {
  background: var(--hc-sidebar-bg);
  border-right: 1px solid var(--hc-border);
}

.hc-main {
  background: var(--hc-content-bg);
  padding: var(--space-8);
  overflow: auto;
}
```

---

## 3. Design Tokens

Use `--hc-*` tokens for the new Hospital Core design system. If the current codebase still uses `--mc-*`, keep aliases temporarily, but new code should use `--hc-*`.

### Core CSS Variables

```css
:root {
  /* Layout */
  --hc-topbar-h: 64px;
  --hc-sidebar-w: 280px;

  /* Font */
  --hc-font-sans: Inter, "IBM Plex Sans", "SF Pro Display", "Segoe UI", Arial, sans-serif;
  --hc-font-mono: "IBM Plex Mono", "SF Mono", Menlo, Consolas, monospace;

  /* Brand navy / topbar */
  --hc-navy-950: #061735;
  --hc-navy-900: #071B3A;
  --hc-navy-850: #0A2148;
  --hc-navy-800: #0C2A5A;

  /* Primary blue */
  --hc-blue-700: #0B4EDB;
  --hc-blue-600: #0F62FE;
  --hc-blue-500: #1D6FFF;
  --hc-blue-100: #DBEAFE;
  --hc-blue-50: #EFF6FF;

  /* Accent */
  --hc-cyan: #00B8FF;
  --hc-purple: #7C3AED;
  --hc-purple-bg: #F3E8FF;

  /* App surfaces */
  --hc-bg: #F6F8FB;
  --hc-content-bg: #FFFFFF;
  --hc-sidebar-bg: #FBFCFE;
  --hc-surface: #FFFFFF;
  --hc-surface-muted: #F8FAFC;
  --hc-surface-soft: #F1F5F9;

  /* Borders */
  --hc-border: #E2E8F0;
  --hc-border-strong: #CBD5E1;
  --hc-border-soft: #EEF2F7;

  /* Text */
  --hc-text: #0F172A;
  --hc-text-secondary: #475569;
  --hc-text-muted: #64748B;
  --hc-text-placeholder: #94A3B8;
  --hc-white: #FFFFFF;

  /* Semantic */
  --hc-success: #079669;
  --hc-success-bg: #DDFBEA;
  --hc-warning: #F97316;
  --hc-warning-bg: #FFEDD5;
  --hc-danger: #DC2626;
  --hc-danger-bg: #FEE2E2;
  --hc-info: #2563EB;
  --hc-info-bg: #DBEAFE;

  /* Inventory / operational semantic */
  --hc-stock: #059669;
  --hc-stock-bg: #DFF8EA;
  --hc-low-stock: #EA580C;
  --hc-low-stock-bg: #FFEDD5;
  --hc-critical: #DC2626;
  --hc-critical-bg: #FEE2E2;
  --hc-expiring: #7C3AED;
  --hc-expiring-bg: #F3E8FF;

  /* Radius */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-xl: 14px;
  --radius-2xl: 18px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-card: 0 8px 24px rgba(15, 23, 42, 0.06);
  --shadow-card-hover: 0 12px 30px rgba(15, 23, 42, 0.09);
  --shadow-blue: 0 8px 18px rgba(15, 98, 254, 0.22);

  /* Motion */
  --motion-fast: 140ms ease;
  --motion-base: 180ms ease;
}
```

### Spacing Scale

Use this scale everywhere. Do not invent random paddings.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

---

## 4. Color Usage Rules

### Brand Colors

| Token | Hex | Usage |
|---|---:|---|
| `--hc-navy-950` | `#061735` | Topbar background |
| `--hc-navy-900` | `#071B3A` | Topbar hover, profile area |
| `--hc-blue-600` | `#0F62FE` | Primary button, active nav, links, focus ring |
| `--hc-blue-50` | `#EFF6FF` | Active sidebar item background |
| `--hc-cyan` | `#00B8FF` | Logo highlight, optional active underline glow |

### Surface Colors

| Token | Hex | Usage |
|---|---:|---|
| `--hc-content-bg` | `#FFFFFF` | Main workspace |
| `--hc-sidebar-bg` | `#FBFCFE` | Left sidebar |
| `--hc-surface` | `#FFFFFF` | Cards, table panel, filters |
| `--hc-surface-muted` | `#F8FAFC` | Table header, disabled control bg |
| `--hc-border` | `#E2E8F0` | Card/table/input borders |

### Semantic Colors

| Status | Text | Background | Example |
|---|---:|---:|---|
| Success / In stock | `#079669` | `#DDFBEA` | `IN STOCK`, paid, completed |
| Warning / Low stock | `#EA580C` | `#FFEDD5` | `LOW STOCK`, pending, attention |
| Danger / Critical | `#DC2626` | `#FEE2E2` | `CRITICAL`, failed, urgent |
| Info | `#2563EB` | `#DBEAFE` | active, neutral info |
| Purple / Expiring | `#7C3AED` | `#F3E8FF` | `EXPIRING SOON`, special state |

### Do Not

- Do not use gradients in the main content area.
- Do not use dark sidebar for new pages; the screenshot standard uses a light sidebar.
- Do not use different blues per page. Use `--hc-blue-600` for all primary actions.
- Do not make red/green status visible only by color; always include status text.

---

## 5. Typography

### Font Family

```css
body {
  font-family: Inter, "IBM Plex Sans", "SF Pro Display", "Segoe UI", Arial, sans-serif;
}

code,
.mono,
.item-id,
.record-id,
.timestamp {
  font-family: "IBM Plex Mono", "SF Mono", Menlo, Consolas, monospace;
}
```

### Type Scale

| Role | Size | Weight | Line Height | Usage |
|---|---:|---:|---:|---|
| App brand | 18px | 700 | 24px | `HOSPITAL CORE` in topbar |
| Top nav | 14px | 600 | 20px | Dashboard, Patients, Queue |
| Page title | 28px | 700 | 36px | Inventory Workspace, Patient Records |
| Page description | 14px | 400 | 22px | Subtitle under page title |
| Section title | 18px | 700 | 26px | Card/table group heading |
| KPI label | 12px | 700 | 16px | Uppercase metric labels |
| KPI value | 30px | 700 | 36px | `2,845`, `156`, `82` |
| KPI helper | 12px | 500 | 16px | `Across all locations` |
| Body | 14px | 400 | 20px | General UI text |
| Body strong | 14px | 600 | 20px | Item names, patient names |
| Table header | 11px | 700 | 14px | Uppercase column labels |
| Table cell | 13px | 500 | 18px | Dense data rows |
| Badge | 10px–11px | 700 | 14px | Status badges |

### Text Rules

- Page title uses `--hc-text`, not blue.
- Descriptions use `--hc-text-secondary`.
- IDs such as `MED-000984` use blue link style and can be monospace only when helpful.
- Table header labels should be uppercase with small size.
- Avoid huge dashboard titles; the screenshot uses confident but compact typography.

---

## 6. Topbar

The topbar is the global navigation and strongest brand region.

### Topbar Layout

```css
.hc-topbar {
  height: 64px;
  padding: 0 20px 0 28px;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) auto;
  align-items: center;
  background: var(--hc-navy-950);
  color: var(--hc-white);
}
```

### Brand Area

Use shield/cross mark like screenshot.

```css
.hc-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.hc-brand-mark {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--hc-blue-500);
}
```

Rules:

- Logo icon should be outline shield with medical cross/plus.
- Brand text should be white, uppercase or title case depending on actual logo.
- Do not place the brand in the left sidebar for this design standard.

### Top Navigation Tabs

```css
.hc-topnav {
  display: flex;
  align-items: stretch;
  height: 64px;
  gap: 18px;
}

.hc-topnav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 64px;
  padding: 0 8px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.hc-topnav-item:hover {
  color: var(--hc-white);
}

.hc-topnav-item.active {
  color: var(--hc-white);
}

.hc-topnav-item.active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 999px 999px 0 0;
  background: var(--hc-blue-500);
}
```

Top nav labels should be reserved for high-level modules only:

- Dashboard
- Patients
- Queue
- Inventory
- Finance
- Reports / Admin when needed

### Topbar Actions

```css
.hc-topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hc-topbar-icon {
  position: relative;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.88);
}

.hc-topbar-icon:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--hc-white);
}

.hc-notification-dot {
  position: absolute;
  top: 7px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--hc-danger);
  color: var(--hc-white);
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}
```

### User Profile

```css
.hc-user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--hc-white);
}

.hc-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-full);
  background: #F8FAFC;
  color: var(--hc-navy-950);
  font-size: 13px;
  font-weight: 700;
}

.hc-user-name {
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
}

.hc-user-role {
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 16px;
}
```

---

## 7. Left Context Sidebar

The left sidebar is light, clean, and operational. It is not the main brand area.

### Sidebar Container

```css
.hc-sidebar {
  width: 280px;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: var(--hc-sidebar-bg);
  border-right: 1px solid var(--hc-border);
}

.hc-sidebar-content {
  flex: 1;
  padding: 22px 18px;
}
```

### Workspace Card

Shown at the top of the sidebar: `Clinical Suite`, access level, icon tile.

```css
.hc-suite-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.hc-suite-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-lg);
  background: var(--hc-surface);
  color: var(--hc-navy-800);
  box-shadow: var(--shadow-xs);
}

.hc-suite-title {
  color: var(--hc-text);
  font-size: 14px;
  font-weight: 700;
  line-height: 18px;
}

.hc-suite-access {
  color: var(--hc-blue-600);
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
```

### Sidebar Primary Action

Use one primary action per sidebar when it is globally relevant to the current workspace.

```css
.hc-sidebar-primary {
  width: 100%;
  height: 42px;
  margin-bottom: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--hc-blue-600);
  color: var(--hc-white);
  font-size: 14px;
  font-weight: 700;
  box-shadow: var(--shadow-blue);
}

.hc-sidebar-primary:hover {
  background: var(--hc-blue-700);
}
```

Examples:

| Module | Sidebar primary action |
|---|---|
| Patients | Admit Patient |
| Queue | Add to Queue |
| Inventory | Add Item |
| Billing | Create Invoice |
| Appointments | New Appointment |
| Diagnostics | New Test Order |

### Sidebar Navigation Item

```css
.hc-side-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hc-side-nav-item {
  position: relative;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
  border-radius: 0;
  color: #1E2A44;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.hc-side-nav-item svg {
  width: 20px;
  height: 20px;
  color: #31415F;
}

.hc-side-nav-item:hover {
  background: var(--hc-surface-soft);
  color: var(--hc-blue-600);
}

.hc-side-nav-item.active {
  background: var(--hc-blue-50);
  color: var(--hc-blue-600);
  font-weight: 700;
}

.hc-side-nav-item.active svg {
  color: var(--hc-blue-600);
}

.hc-side-nav-item.active::before {
  content: "";
  position: absolute;
  left: -18px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--hc-blue-600);
}
```

### Sidebar Bottom Area

Use support/logout rows and system status card exactly once in the lower area.

```css
.hc-sidebar-footer {
  padding: 18px;
  border-top: 1px solid var(--hc-border-soft);
}

.hc-status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 86px;
  padding: 16px;
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-lg);
  background: var(--hc-surface);
  box-shadow: var(--shadow-xs);
}

.hc-status-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--hc-success);
}
```

---

## 8. Content Workspace

### Page Header

```css
.hc-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.hc-page-title {
  margin: 0;
  color: var(--hc-text);
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  letter-spacing: -0.02em;
}

.hc-page-description {
  margin: 2px 0 0;
  color: var(--hc-text-secondary);
  font-size: 14px;
  line-height: 22px;
}
```

Page header rule:

- Title must be short and functional: `Inventory Workspace`, `Patient Records`, `Queue Board`.
- Description should explain the page in one line.
- Primary action can be in header or filter panel, but not duplicated in both unless necessary.

---

## 9. KPI / Summary Cards

KPI cards follow the screenshot: white card, left icon tile, uppercase label, large value, helper text.

### KPI Grid

```css
.hc-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
```

### KPI Card

```css
.hc-kpi-card {
  min-height: 112px;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 22px;
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-xl);
  background: var(--hc-surface);
  box-shadow: var(--shadow-card);
}

.hc-kpi-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
  transition: box-shadow var(--motion-base), transform var(--motion-base);
}

.hc-kpi-icon {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: var(--radius-lg);
}

.hc-kpi-label {
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  line-height: 16px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.hc-kpi-value {
  margin-top: 4px;
  color: var(--hc-text);
  font-size: 30px;
  font-weight: 700;
  line-height: 36px;
  letter-spacing: -0.02em;
}

.hc-kpi-helper {
  margin-top: 2px;
  color: var(--hc-text-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}
```

### KPI Icon Variants

| Variant | Background | Icon/Text |
|---|---:|---:|
| Blue / total | `#E8F0FF` | `#0F62FE` |
| Amber / warning | `#FFF3E0` | `#F97316` |
| Purple / expiring | `#F3E8FF` | `#7C3AED` |
| Red / critical | `#FEE2E2` | `#DC2626` |
| Green / success | `#DDFBEA` | `#079669` |
| Teal / clinical | `#CCFBF1` | `#0F766E` |

Example inventory KPI set:

1. Total Items
2. Low Stock Items
3. Expiring Soon
4. Critical Alerts

---

## 10. Control Panel, Search, Filters

Use a single white panel for search/filter/table controls. In table-heavy pages, the filter row sits inside the same card as the table.

### Panel

```css
.hc-data-panel {
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-xl);
  background: var(--hc-surface);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.hc-filter-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px;
  border-bottom: 1px solid var(--hc-border);
}
```

### Search Input

```css
.hc-search {
  min-width: 280px;
  flex: 1 1 320px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-md);
  background: var(--hc-surface);
  color: var(--hc-text);
}

.hc-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--hc-text);
  font-size: 13px;
}

.hc-search input::placeholder {
  color: var(--hc-text-placeholder);
}

.hc-search:focus-within {
  border-color: var(--hc-blue-600);
  box-shadow: 0 0 0 3px rgba(15, 98, 254, 0.12);
}
```

### Select / Dropdown

```css
.hc-field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hc-field-label {
  color: var(--hc-text-muted);
  font-size: 11px;
  font-weight: 600;
  line-height: 14px;
}

.hc-select,
.hc-input {
  height: 40px;
  min-width: 150px;
  padding: 0 12px;
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-md);
  background: var(--hc-surface);
  color: var(--hc-text);
  font-size: 13px;
  font-weight: 500;
}

.hc-select:focus,
.hc-input:focus {
  outline: none;
  border-color: var(--hc-blue-600);
  box-shadow: 0 0 0 3px rgba(15, 98, 254, 0.12);
}
```

### Toolbar Actions

```css
.hc-toolbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
```

Use this order from left to right:

1. Search
2. Category/type filter
3. Location/department filter
4. Status filter
5. More Filters
6. Export
7. Primary Add/Create action

---

## 11. Buttons

### Primary Button

```css
.hc-btn-primary {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: var(--hc-blue-600);
  color: var(--hc-white);
  box-shadow: var(--shadow-blue);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.hc-btn-primary:hover {
  background: var(--hc-blue-700);
  transform: translateY(-1px);
}
```

### Secondary Button

```css
.hc-btn-secondary {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-md);
  background: var(--hc-surface);
  color: var(--hc-text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.hc-btn-secondary:hover {
  border-color: var(--hc-border-strong);
  background: var(--hc-surface-muted);
}
```

### Filter Button

```css
.hc-btn-filter {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid var(--hc-border);
  border-radius: var(--radius-md);
  background: var(--hc-surface);
  color: var(--hc-text);
  font-size: 13px;
  font-weight: 700;
}
```

### Icon Button

```css
.hc-icon-btn {
  width: 36px;
  height: 36px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: #334155;
  cursor: pointer;
}

.hc-icon-btn:hover {
  background: var(--hc-blue-50);
  color: var(--hc-blue-600);
}
```

Button rules:

- Each page should have only one visually dominant primary action in the current context.
- Export/download actions should be secondary.
- Destructive actions must not use primary blue; use danger text/button styling.

---

## 12. Tables

Tables are the default pattern for operational pages: Inventory, Patients, Billing, Finance, Diagnostics, Audit Logs.

### Table Container

```css
.hc-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.hc-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}
```

### Table Header

```css
.hc-table thead th {
  height: 42px;
  padding: 0 14px;
  border-bottom: 1px solid var(--hc-border);
  background: var(--hc-surface-muted);
  color: #334155;
  font-size: 11px;
  font-weight: 800;
  line-height: 14px;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}
```

### Table Rows

```css
.hc-table tbody td {
  height: 48px;
  padding: 0 14px;
  border-bottom: 1px solid var(--hc-border-soft);
  color: #1E293B;
  font-size: 13px;
  font-weight: 500;
  vertical-align: middle;
  white-space: nowrap;
}

.hc-table tbody tr:hover td {
  background: #FAFCFF;
}

.hc-table tbody tr:last-child td {
  border-bottom: 0;
}
```

### Table Content Rules

| Column type | Rule |
|---|---|
| Checkbox | 16px square, border `--hc-border-strong`, radius 4px |
| ID | Blue link, 13px/700, optional monospace |
| Primary name | Dark text, 13px/700 |
| Category | Icon + label, semantic icon color |
| Quantity / money | Numeric alignment optional; use semantic color for risk |
| Date | Standard format `YYYY-MM-DD` or localized display |
| Status | Badge, never plain colored text |
| Actions | View, edit, more; 36px icon buttons |

### Sort Indicators

```css
.hc-sortable {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.hc-sortable svg {
  width: 12px;
  height: 12px;
  color: var(--hc-text-placeholder);
}
```

### Pagination Footer

```css
.hc-table-footer {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  border-top: 1px solid var(--hc-border);
  background: var(--hc-surface);
}

.hc-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hc-page-btn {
  min-width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--hc-text);
  font-size: 13px;
  font-weight: 700;
}

.hc-page-btn.active {
  background: var(--hc-blue-600);
  color: var(--hc-white);
}
```

---

## 13. Badges & Status System

### Base Badge

```css
.hc-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  font-size: 10px;
  font-weight: 800;
  line-height: 14px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
}

.hc-badge.success {
  color: var(--hc-success);
  background: var(--hc-success-bg);
}

.hc-badge.warning {
  color: var(--hc-low-stock);
  background: var(--hc-low-stock-bg);
}

.hc-badge.danger {
  color: var(--hc-danger);
  background: var(--hc-danger-bg);
}

.hc-badge.info {
  color: var(--hc-info);
  background: var(--hc-info-bg);
}

.hc-badge.purple {
  color: var(--hc-expiring);
  background: var(--hc-expiring-bg);
}
```

### Standard Badge Labels

Use consistent labels across modules.

| Domain | Labels |
|---|---|
| Inventory | `IN STOCK`, `LOW STOCK`, `CRITICAL`, `EXPIRING SOON`, `OUT OF STOCK` |
| Appointments | `SCHEDULED`, `CHECKED IN`, `IN PROGRESS`, `COMPLETED`, `CANCELLED` |
| Queue | `WAITING`, `TRIAGE`, `WITH DOCTOR`, `URGENT`, `DONE` |
| Billing | `PAID`, `PENDING`, `OVERDUE`, `REFUNDED`, `FAILED` |
| Diagnostics | `ORDERED`, `COLLECTED`, `PROCESSING`, `RESULT READY`, `ABNORMAL` |
| Patients | `ACTIVE`, `ADMITTED`, `DISCHARGED`, `FOLLOW UP`, `CRITICAL` |
| Audit / Admin | `SUCCESS`, `WARNING`, `DENIED`, `SECURITY`, `SYSTEM` |

---

## 14. Forms

Forms should look like the filter controls, just with more spacing.

```css
.hc-form {
  display: grid;
  gap: 18px;
}

.hc-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.hc-form-label {
  display: block;
  margin-bottom: 6px;
  color: var(--hc-text);
  font-size: 13px;
  font-weight: 700;
}

.hc-form-help {
  margin-top: 4px;
  color: var(--hc-text-muted);
  font-size: 12px;
  line-height: 16px;
}

.hc-form-error {
  margin-top: 4px;
  color: var(--hc-danger);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
}
```

Rules:

- Inputs height: 40px for regular fields, 44px for large modal forms.
- Textareas min height: 96px.
- Required marker uses danger color but label remains dark.
- Focus ring always uses blue.
- Validation error uses red text + red border + helper message.

---

## 15. Modals, Drawers, Detail Pages

### Modal

```css
.hc-modal {
  width: min(680px, calc(100vw - 32px));
  border-radius: var(--radius-2xl);
  background: var(--hc-surface);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
}

.hc-modal-header,
.hc-modal-footer {
  padding: 20px 24px;
  border-bottom: 1px solid var(--hc-border);
}

.hc-modal-body {
  padding: 24px;
}

.hc-modal-footer {
  border-top: 1px solid var(--hc-border);
  border-bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

### Right Drawer

Use drawers for row details, quick edit, activity logs.

```css
.hc-drawer {
  width: 440px;
  max-width: 100vw;
  height: 100vh;
  background: var(--hc-surface);
  border-left: 1px solid var(--hc-border);
  box-shadow: -16px 0 48px rgba(15, 23, 42, 0.12);
}
```

### Detail Page

Detail pages should still use the same app shell. Main content can use:

- Header card with title, status, metadata.
- Two-column layout: main record info + right summary/activity panel.
- Tables/timelines reuse the same table/badge styles.

---

## 16. Icons

Use one outline icon family consistently, preferably **Lucide** or **Heroicons**.

### Sizes

| Placement | Size | Stroke |
|---|---:|---:|
| Topbar icon | 20px–22px | 2px |
| Sidebar icon | 20px | 2px |
| KPI icon | 26px | 2px |
| Table action icon | 18px | 2px |
| Button icon | 18px | 2px |

### Recommended Icons

| Page / Feature | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Patients | `Users` |
| Queue | `ListOrdered` |
| Inventory | `Archive` / `Package` |
| Finance | `WalletCards` / `DollarSign` |
| Billing | `ReceiptText` |
| Appointments | `CalendarCheck` |
| Diagnostics | `Microscope` / `Stethoscope` |
| Support | `CircleHelp` |
| Logout | `LogOut` |
| Settings | `Settings` |
| Notifications | `Bell` |
| Critical alert | `TriangleAlert` |
| Expiring soon | `Calendar` |

Rules:

- Do not mix filled icons and outline icons in the same navigation.
- Sidebar icons are dark navy/gray by default, blue when active.
- KPI icons should use semantic color and a soft tinted square.

---

## 17. Page Templates

Every page should be implemented using one of these templates.

### A. Data Table Page

For Inventory, Patients, Billing, Diagnostics, Audit Logs, Staff, Finance transactions.

```text
Page Header
KPI Row (optional)
Data Panel
  Filter Row
  Table
  Pagination Footer
```

Rules:

- Search input comes first.
- Filters are compact select controls.
- Export is secondary.
- Add/Create is primary and placed rightmost.
- Table actions use icon buttons, not text links.

### B. Dashboard Page

For overview dashboards.

```text
Page Header
KPI Row
2-column analytics grid
Operational table/list panels
```

Rules:

- Keep analytics cards white with same radius/shadow.
- Charts should not introduce new color palettes.
- Use blue/green/amber/red only from tokens.

### C. Workflow Board Page

For Queue, triage, task management.

```text
Page Header
KPI Row
Filter Row
Board Columns / Queue List
```

Rules:

- Columns use white cards and light gray headers.
- Urgent rows/cards use danger badge, not full red background.
- Patient/action metadata follows table typography.

### D. Calendar / Schedule Page

For Appointments.

```text
Page Header
Calendar Toolbar
Calendar Grid or Appointment List
Right Detail Drawer / Day Summary
```

Rules:

- Current day uses blue outline/fill.
- Appointment statuses use standard badge system.
- Do not use random event colors; map them to semantic states.

### E. Record Detail Page

For patient profile, invoice detail, inventory item detail.

```text
Header Card
Tabs
Main detail sections
Right summary/activity panel
```

Rules:

- Header card uses white surface and border.
- Tabs use blue underline active state.
- Activity timeline uses same status badges and text scale.

---

## 18. Page-Specific Guidance

### Inventory Workspace

Reference screenshot standard.

Required layout:

1. Page title: `Inventory Workspace`.
2. Description: `Manage and track hospital supplies, medications, and equipment across all locations.`
3. KPI cards: Total Items, Low Stock Items, Expiring Soon, Critical Alerts.
4. Filter row: Search, Category, Location, Status, More Filters, Export CSV, Add Item.
5. Table columns: checkbox, Item ID, Item Name, Category, Location, Quantity, Unit, Expiry Date, Status, Last Updated, Actions.
6. Pagination footer with item count and page size selector.

Inventory rules:

- Item IDs are blue links.
- Low quantities use amber or red based on threshold.
- Missing expiry date uses an em dash `—` in muted text.
- Status badge is required for each row.

### Patients

- Use Data Table Page or Record Detail Page.
- KPIs: Total Patients, Admitted, Critical, Discharged/Follow-up.
- Primary action: `Admit Patient`.
- Table should include Patient ID, Name, Age/Gender, Department, Doctor, Status, Last Visit, Actions.

### Queue

- Use Workflow Board or Data Table Page.
- KPIs: Waiting, In Triage, Urgent, Completed Today.
- Use strong urgency labels but keep row background mostly white.
- Active queue item can use blue left border.

### Appointments

- Use Calendar Page.
- Primary action: `New Appointment`.
- Appointment status badges must follow standard labels.
- No custom pastel rainbow colors per doctor; use semantic colors only.

### Diagnostics

- Use Data Table Page.
- KPIs: Ordered, Processing, Result Ready, Abnormal.
- Abnormal uses danger badge.
- Test IDs use blue link.

### Billing / Finance

- Use Data Table Page plus summary KPIs.
- KPIs: Revenue, Pending, Overdue, Paid.
- Money values use tabular numbers when available.
- Overdue uses danger badge; pending uses warning badge; paid uses success badge.

### Audit Logs / Admin

- Use Data Table Page.
- KPIs: Total Events, Security Alerts, System Actions, Validation Events.
- Use timestamp, actor, role, action, target, severity, details, row actions.
- Use monospace for API paths, keys, and request IDs.

---

## 19. Empty, Loading, Error States

### Empty State

```css
.hc-empty-state {
  min-height: 280px;
  display: grid;
  place-items: center;
  padding: 40px;
  text-align: center;
  color: var(--hc-text-secondary);
}

.hc-empty-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-lg);
  background: var(--hc-blue-50);
  color: var(--hc-blue-600);
}
```

Rules:

- Empty title: short, action-oriented.
- Empty body: one sentence.
- Primary CTA only when useful.

### Loading State

- Use skeleton rows for tables.
- Keep table header visible while rows load.
- Do not use full-screen spinners unless app shell is loading.

### Error State

- Use inline danger alert card in content area.
- Error should include retry action if recoverable.
- Do not replace the entire layout with an error page unless app cannot load.

---

## 20. Responsive Behavior

### Large Desktop

- Topbar stays 64px.
- Sidebar stays 280px.
- KPI grid uses 4 columns.
- Tables are full width.

### Tablet

```css
@media (max-width: 1024px) {
  :root {
    --hc-sidebar-w: 84px;
  }

  .hc-side-nav-item span,
  .hc-suite-title,
  .hc-suite-access,
  .hc-sidebar-primary span {
    display: none;
  }

  .hc-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

### Mobile

- Topbar becomes compact.
- Sidebar becomes drawer.
- KPI cards stack.
- Tables become horizontally scrollable or transform to cards for patient-facing views.

```css
@media (max-width: 768px) {
  .hc-body {
    grid-template-columns: 1fr;
  }

  .hc-sidebar {
    position: fixed;
    inset: 64px auto 0 0;
    transform: translateX(-100%);
    z-index: 50;
  }

  .hc-sidebar.open {
    transform: translateX(0);
  }

  .hc-main {
    padding: 20px;
  }

  .hc-kpi-grid {
    grid-template-columns: 1fr;
  }

  .hc-filter-row {
    flex-wrap: wrap;
  }
}
```

---

## 21. Accessibility

- Normal text contrast must be at least 4.5:1.
- Focus state must be visible on every interactive element.
- Do not rely on color alone for status; always use text badges.
- Click targets should be at least 40×40px for primary controls and 36×36px for dense table actions.
- Sidebar active state must include background + left rail, not only blue text.
- Topbar active state must include underline, not only color.
- Every icon-only action must have `aria-label`.

Example:

```html
<button class="hc-icon-btn" aria-label="View item details">
  <EyeIcon />
</button>
```

---

## 22. Implementation Checklist

Use this checklist when building or refactoring any page.

### App Shell

- [ ] Uses dark navy topbar.
- [ ] Uses light left sidebar.
- [ ] Active top nav has blue underline.
- [ ] Active side nav has blue text, blue rail, light blue background.
- [ ] Sidebar width is consistent.
- [ ] Main content padding is consistent.

### Page Content

- [ ] Page header has title + one-line description.
- [ ] KPI cards use the same card structure.
- [ ] Filter/search controls use same input/select styles.
- [ ] Primary action is blue and right-aligned.
- [ ] Export/download actions are secondary.

### Tables

- [ ] Table is inside `hc-data-panel`.
- [ ] Header uses muted background and uppercase labels.
- [ ] Row height is 48px–52px.
- [ ] Status values use badges.
- [ ] Row action icons use the same icon-button style.
- [ ] Pagination footer matches the standard.

### Visual Consistency

- [ ] No custom page-specific blue/green/red values.
- [ ] No dark sidebar on new pages.
- [ ] No mismatched border radius.
- [ ] No oversized titles or random shadows.
- [ ] No gradients in content cards.

---

## 23. Migration Notes From Previous Design System

The older design direction used a premium dark gradient sidebar as the main brand element. The screenshot standard is different and should now be considered the source of truth.

Replace these old assumptions:

| Old | New |
|---|---|
| Dark gradient sidebar | Dark navy topbar + light sidebar |
| Sidebar-first branding | Topbar-first branding |
| 248–264px sidebar | 280px light sidebar |
| Sidebar active gradient | Active side item = light blue background + blue left rail |
| Topbar as light utility bar | Topbar as primary global navigation |
| Page-specific components | Shared data panel, table, filter row, buttons, badges |

Do not partially mix the two systems. Pages should not have a dark sidebar while other pages use the new topbar/light-sidebar pattern.

---

## 24. Quick Prompt for Future UI Generation

Use this prompt for new screens:

> Create a 16:9 Hospital Core clinical operations dashboard matching the Inventory Workspace reference. Use a dark navy horizontal topbar with shield/cross brand, global nav tabs with blue active underline, a light left contextual sidebar with blue active rail, a clean white workspace, rounded KPI cards with soft shadows, compact filter controls, dense hospital data tables, blue primary buttons, secondary export buttons, and soft semantic badges for success, warning, danger, info, and expiring states. Keep typography Inter-like, spacing consistent, and make every page feel part of the same hospital management system.

---

## 25. Minimal Component Class Map

Use these class names consistently in implementation:

| Component | Class |
|---|---|
| App root | `.hc-app` |
| Topbar | `.hc-topbar` |
| Brand | `.hc-brand` |
| Top nav item | `.hc-topnav-item` |
| Body grid | `.hc-body` |
| Sidebar | `.hc-sidebar` |
| Sidebar nav item | `.hc-side-nav-item` |
| Main content | `.hc-main` |
| Page header | `.hc-page-header` |
| KPI grid | `.hc-kpi-grid` |
| KPI card | `.hc-kpi-card` |
| Data panel | `.hc-data-panel` |
| Filter row | `.hc-filter-row` |
| Search | `.hc-search` |
| Select/input | `.hc-select`, `.hc-input` |
| Primary button | `.hc-btn-primary` |
| Secondary button | `.hc-btn-secondary` |
| Icon button | `.hc-icon-btn` |
| Table | `.hc-table` |
| Badge | `.hc-badge` |
| Pagination | `.hc-pagination` |
