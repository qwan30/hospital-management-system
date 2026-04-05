# Nurse Check-In Page Overrides

> PROJECT: Clinical Atelier
> Page Type: Intake and queue management

These rules override the master design system for the `/nurse-checkin` route.

## Layout

- Keep intake, vitals, and queue state visible in a single continuous workflow.
- Surface queue information above less frequent controls.
- Prefer two-column operational panels on desktop, collapsing to one column on mobile.

## Required Sections

1. Station header with current status.
2. Metrics for waiting patients, throughput, and room readiness.
3. Arrival intake card.
4. Vitals or prep panel.
5. Active queue table or board.

## Tone

- Practical and fast-moving.
- Emphasize throughput, status clarity, and next action.
- Avoid decorative animation that slows scanning.

## Components

- Use compact badges for queue states.
- Keep buttons verb-first: confirm arrival, capture vitals, push to queue.
- Intake inputs and vitals blocks should look related but not identical.

## Interaction

- The primary action should always represent the next operational step.
- Status updates must read clearly at a glance from several feet away.
- Keep form states resilient so partial intake data is not lost accidentally.
