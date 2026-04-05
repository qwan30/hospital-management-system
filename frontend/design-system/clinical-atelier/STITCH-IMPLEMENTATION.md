# Stitch Implementation Workflow

This note explains how to use the referenced skills to implement the Stitch design inside the current frontend.

## Current Limitation

The Stitch project URL does not expose the actual artboards from this environment. It returns the Stitch application shell, but not the screen contents. Use this workflow once screenshots, exports, or a readable design source are available.

## Skill Order

1. `ui-ux-pro-max`
   - Use `MASTER.md` as the base token and interaction reference.
   - Use the page override file in `pages/` for route-specific structure.
   - Do not treat generated section names as final until they are checked against the actual Stitch screen.

2. `vercel-composition-patterns`
   - Extract reusable shells and primitives instead of adding more boolean flags to large screens.
   - Preferred shared pieces in this repo:
     - `WorkspaceShell`
     - `Panel`
     - `MetricCard`
     - `StatusBadge`
     - `ActionBar`

3. `vercel-react-best-practices`
   - Keep route files server-first and small.
   - Move client state only into interactive feature components.
   - Use skeletons or inline loading states for network-backed sections.
   - Avoid fetch waterfalls and avoid unnecessary client wrappers.

4. `frontend-patterns`
   - Use composition and focused feature modules.
   - Keep forms accessible and validation local to boundaries.
   - Respect keyboard navigation, visible focus, and reduced motion.

## Route Mapping

- `/` -> `public-home`
- `/doctor-dashboard` -> `doctor-dashboard`
- `/medical-record-editor` -> `medical-record-editor`
- `/nurse-checkin` -> `nurse-checkin`
- `/ai-booking` -> `ai-booking`
- `/billing-revenue` -> `billing-revenue`
- `/admin-monitoring` -> `admin-monitoring`
- `/cms` -> `cms`
- `/cms/sections/[sectionId]` -> `website-section-editor`
- `/patient-records-management` -> `patient-records-management`
- `/pharmacy-inventory` -> `pharmacy-inventory`
- `/patient-portal` -> `patient-portal`
- `/patient-portal/appointments` -> `patient-portal-appointments`
- `/patient-portal/lab-results` -> `patient-portal-lab-results`
- `/patient-portal/messages` -> `patient-portal-messages`
- `/patient-portal/profile` -> `patient-portal-profile`

## Implementation Rules

- Start from the target route and identify what can be shared.
- Move repeated visual patterns into focused components before styling every screen separately.
- Keep icons consistent and SVG-based.
- Prefer CSS variables and route-local CSS modules over one-off inline styles.
- Keep one dominant action per panel.

## Definition Of Done

- The implemented route matches the visible Stitch layout and information hierarchy.
- The code uses reusable composition primitives instead of copy-pasted screen fragments.
- Interactive states are keyboard accessible.
- Mobile and desktop both render without horizontal scroll.
- Loading, empty, and error states are explicit where data is dynamic.
