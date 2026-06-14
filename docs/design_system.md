# Hospital Core Design System

Design token reference and component usage guide for the HMS frontend.

> Taste-skill dials: VARIANCE 4 / MOTION 4 / DENSITY 7

## Design Tokens

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--hc-primary` | `#0F62FE` | Primary CTAs, links, active states |
| `--hc-primary-bg` | `#EFF6FF` | Primary button hover, selected backgrounds |
| `--hc-navy-950` | `#061735` | Topbar, dark hero backgrounds |
| `--hc-cyan` | `#00B8FF` | Accent highlights, clinical console elements |
| `--hc-success` | `#079669` | Success states, stock sufficient |
| `--hc-warning` | `#F97316` | Warning states, low stock |
| `--hc-danger` | `#DC2626` | Error states, critical alerts |
| `--hc-purple` | `#7C3AED` | Lab results, special categories |

### Surfaces

| Token | Usage |
|-------|-------|
| `--hc-bg` | Page background (`#F6F8FB`) |
| `--hc-surface` | Card, panel, modal backgrounds (`#FFFFFF`) |
| `--hc-surface-muted` | Secondary surface (`#F8FAFC`) |
| `--hc-surface-soft` | Tertiary surface, input backgrounds (`#F1F5F9`) |

### Text

| Token | Usage |
|-------|-------|
| `--hc-text` | Primary text (`#0F172A`) |
| `--hc-text-secondary` | Secondary text, descriptions (`#475569`) |
| `--hc-text-muted` | Tertiary text, labels (`#64748B`) |
| `--hc-text-placeholder` | Input placeholders (`#94A3B8`) |

### Borders

| Token | Usage |
|-------|-------|
| `--hc-border` | Card borders, input borders (`#E2E8F0`) |
| `--hc-border-strong` | Active borders, dividers (`#CBD5E1`) |
| `--hc-border-soft` | Subtle separators (`#EEF2F7`) |

### Typography Scale

| Size | Usage |
|------|-------|
| `text-[11px]` | Micro-labels, uppercase tracking |
| `text-[13px]` | Body text, table cells, form labels |
| `text-[14px]` | Button labels, form descriptions |
| `text-[18px]` | Section subtitles |
| `text-[26px]` | Card headings |
| `text-[32px]` | KPI values |
| `text-[44px]` | Page hero headings |

### Spacing

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

### Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--motion-fast` | `140ms ease` | Button presses, icon toggles |
| `--motion-base` | `180ms ease` | Hover transitions, tab switches |
| `--motion-slow` | `280ms ease` | Page transitions, panel reveals |
| `--motion-spring` | `300ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Card pops, dialog enters |

### Shadows

| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(15, 23, 42, 0.04)` |
| `--shadow-card` | `0 8px 24px rgba(15, 23, 42, 0.06)` |
| `--shadow-card-hover` | `0 12px 30px rgba(15, 23, 42, 0.09)` |
| `--shadow-blue` | `0 8px 18px rgba(15, 98, 254, 0.22)` |

## Component Library

### Button

```tsx
import { Button } from "@/components/ui/button";

// Primary CTA
<Button variant="default">Save Patient</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// With loading state
<Button isLoading>Authenticating...</Button>

// With icon
<Button leftIcon={<Stethoscope className="size-4" />}>
  New Consultation
</Button>

// Destructive
<Button variant="destructive">Delete Record</Button>
```

Variants: `default`, `outline`, `secondary`, `filter`, `ghost`, `destructive`, `link`
Sizes: `default`, `sm`, `lg`, `icon`, `icon-sm`, `xs`

### KpiCard

```tsx
import { KpiCard } from "@/components/ui/kpi-card";

<KpiCard
  label="Total Patients"
  value="12,842"
  helper="Increased 4.2% vs last month"
  icon={Users}
  tone="blue"
/>

// Loading state
<KpiCard label="Revenue" value="" icon={DollarSign} isLoading />
```

Tones: `blue`, `green`, `amber`, `red`, `purple`, `teal`

### Skeleton

```tsx
import { Skeleton, KpiCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";

// Generic skeleton
<Skeleton className="h-4 w-48 rounded" />

// Pre-built skeletons matching component dimensions
<KpiCardSkeleton />
<TableRowSkeleton columns={5} />
```

## Accessibility

### Reduced Motion

All animations are gated behind `prefers-reduced-motion: reduce`. When enabled, all transitions, animations, and scroll behaviors are disabled.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

- Body text: WCAG AA minimum (4.5:1)
- Large text (18px+): WCAG AA minimum (3:1)
- All form inputs have visible focus rings
- Error states use both color and text indicators

## Anti-Patterns

- Do not use raw hex colors in components — use CSS variables
- Do not use `console.log` in production code
- Do not use em-dashes in visible text — use hyphen or colon
- Do not display version numbers in UI (these are AI tells)
- Do not use generic placeholder names (John Doe, Sarah Chan)
- Do not use fake-precise numbers without data sources

## File Structure

```
src/
├── app/
│   ├── (public)/      # Public-facing pages
│   ├── admin/(app)/   # Admin dashboard pages
│   ├── staff/(app)/   # Staff clinical pages
│   ├── staff/(auth)/  # Staff authentication
│   ├── portal/(app)/  # Patient portal pages
│   └── portal/(auth)/ # Patient authentication
├── components/
│   ├── ui/            # Shared UI primitives
│   ├── auth/          # Auth guards
│   └── shells/        # Layout shells
└── lib/               # API client, auth hooks, utilities
```
