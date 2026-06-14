# Hospital Management System — Frontend

Next.js 16 (App Router) frontend for the Enterprise Hospital Management System.

**Tech stack:** Next.js 16.2, React 19.2, Tailwind CSS 4, Playwright 1.59, Vitest.

## Getting Started

### Prerequisites
- Node.js 22+
- Backend running at `http://localhost:8081` (see root [README](../README.md))
- `.env.local` file with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1`

### Development
```bash
npm install
npm run dev                    # http://localhost:3000
```

### Production Build
```bash
npm run build
npm start                     # http://localhost:3000
```

## Route Structure

The App Router is organized by role domain:

| Route Group | Path | Purpose |
|-------------|------|---------|
| `(public)` | `/`, `/booking`, `/departments`, `/doctors`, `/news` | Public-facing pages |
| `staff/(auth)` | `/staff/login` | Staff authentication |
| `staff/(app)` | `/staff/dashboard`, `/staff/queue`, `/staff/appointments` | Clinical staff workflows |
| `admin/(app)` | `/admin/dashboard`, `/admin/users`, `/admin/departments` | Administrative operations |
| `portal/(auth)` | `/portal/login` | Patient portal authentication |
| `portal/(app)` | `/portal/appointments`, `/portal/lab-results`, `/portal/profile` | Patient self-service |

## Quality Checks

### Lint & Type Check
```bash
npm run lint                   # ESLint
npm run build                  # Includes type checking
```

### Unit Tests (Vitest)
```bash
npm run test:unit              # Run unit tests
npm run test:unit:coverage     # With coverage (target: 80%+)
```

### E2E Tests (Playwright)

Environment variables:
- `HMS_WEB_URL` — frontend base URL (default: `http://localhost:3000`)
- `HMS_API_URL` — backend API base URL (default: `http://localhost:8081/api/v1`)
- `NEXT_PUBLIC_API_BASE_URL` — client-side API base URL (default: `http://localhost:8081/api/v1`)

| Command | Description |
|---------|-------------|
| `npm run test:e2e:ui` | Route smoke, console/runtime, accessibility, responsive checks (323+ scenarios) |
| `npm run test:e2e:integrated` | Backend-backed auth, claim, logout, booking, queue checks |
| `npm run test:e2e:ci` | Full CI suite — RBAC, API client, operations, security, all routes |
| `npm run test:e2e:visual` | Visual baseline snapshots for high-risk pages |
| `npm run test:e2e:release-data` | Release demo data verification |
| `npm run test:e2e:headed` | Headed local debugging |
| `npm run test:e2e:report` | Open last HTML report |

The Playwright suite uses Page Object Models in `e2e/pages/` and specs in `e2e/specs/`. Tests prefer role, label, and link selectors; add `data-testid` only when semantic selectors are not practical.

## Architecture Notes

- **App Router**: All routes use Next.js App Router with React Server Components where possible.
- **API client**: Centralized in `src/lib/api-client.ts` with JWT token management and refresh flow.
- **UI components**: Custom design system with CSS custom properties (`--hc-*` tokens) under `src/components/ui/`.
- **Auth**: Staff auth via `/staff/login` (JWT in memory), patient auth via `/portal/login` (JWT + httpOnly refresh cookie).
- **Route groups**: `(public)`, `(auth)`, `(app)` conventions separate public, auth-gated, and role-gated layouts.
