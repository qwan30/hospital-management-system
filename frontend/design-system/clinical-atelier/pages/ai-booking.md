# AI Booking Page Overrides

> PROJECT: Clinical Atelier
> Page Type: Guided booking flow

These rules override the master design system for the `/ai-booking` route.

## Layout

- Present the screen as a guided flow, not a generic dashboard.
- Keep recommendation rationale close to specialist selection.
- Use progressive disclosure: recommendation first, alternatives second, confirmation last.

## Required Sections

1. Step header with current booking stage.
2. AI recommendation summary.
3. Specialist comparison cards.
4. Date and time slot selection.
5. Patient information review.
6. Final confirmation actions.

## Tone

- Helpful and confident, but never opaque.
- Explain why a specialist is recommended in plain language.
- Keep the final review section easy to verify quickly.

## Components

- Recommendation badges should be informative, not decorative.
- Specialist cards need clear differentiation between recommended and alternative options.
- Time slot buttons must support dense scanning without feeling cramped.

## Interaction

- Preserve selected specialist and slot state while moving through the flow.
- Disabled states must explain what prerequisite is missing.
- Final confirmation should summarize doctor, time, and patient details in one place.
