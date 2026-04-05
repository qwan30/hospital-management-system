# Doctor Dashboard Page Overrides

> PROJECT: Clinical Atelier
> Page Type: Operational dashboard

These rules override the master design system for the `/doctor-dashboard` route.

## Layout

- Use a fixed or visually anchored navigation rail with a content-heavy main pane.
- Keep the first viewport focused on decision-making: metrics, patient spotlight, and active queue.
- Support scanning before deep reading. The layout should work left-to-right as: nav, overview, detail.

## Required Sections

1. Dashboard header with search and refresh actions.
2. Summary metrics row.
3. Patient spotlight or currently selected appointment detail.
4. Live schedule list.
5. Action queue table for checked-in and in-progress appointments.

## Tone

- Dense but calm. This is a working screen, not a marketing surface.
- Use restrained emphasis. Red is only for critical actions or risk.
- Prioritize legibility of status, time, and patient identity.

## Components

- Status badges must be consistent across metric cards, lists, and tables.
- Use one primary action per appointment row.
- Keep supporting actions secondary and visually quiet.

## Interaction

- Search should filter without blocking the rest of the UI.
- Loading states should use inline skeletons or placeholders instead of blank panels.
- Detail panels must not cause layout jumps when refreshed.
