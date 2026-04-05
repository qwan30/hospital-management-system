# Medical Record Editor Page Overrides

> PROJECT: Clinical Atelier
> Page Type: Clinical editor

These rules override the master design system for the `/medical-record-editor` route.

## Layout

- Treat this screen as a primary workbench: wide main editing column plus supportive sidebar.
- Keep the patient identity and save actions visible near the top.
- Reserve the sidebar for risk, status, and recent activity rather than duplicate form fields.

## Required Sections

1. Patient header with identity, episode context, and save action.
2. Vitals metrics strip.
3. Clinical notes or SOAP sections.
4. Prescription or orders builder.
5. Follow-up scheduling area.
6. Sidebar with alerts, recent changes, and chart status.

## Tone

- Serious, clean, and low-noise.
- Emphasize medical safety over visual flourish.
- Use spacing and grouping to separate note types instead of decorative borders.

## Components

- Alerts must be highly visible without overpowering the editor.
- Data tables and medication rows should align cleanly and use predictable column widths.
- Save, send-for-review, and navigation actions must be clearly separated.

## Interaction

- Preserve focus after save or inline actions.
- Error and validation states must be local to the affected section.
- Use explicit confirmation only for destructive actions.
