---
date: 2026-05-20
feature: vitest-accessibility-name-matching-hc-ui
categories: [pattern, failure]
severity: critical
tags: [testing-library, accessibility, dialog, vitest]
---

# Learning: Resolving Testing-Library Selectors in Hospital Core (hc-) UI Migration

**Category:** failure
**Severity:** critical
**Tags:** [testing-library, accessibility, dialog, vitest]
**Applicable-when:** Upgrading screens to the unified `hc-` design system and verifying Vitest unit tests.

## What Happened

During the migration of `rooms`, `users`, and `slots` admin screens to the unified `hc-` design system, multiple Vitest unit tests broke. The failures occurred because tests could not find elements (e.g. `08:00` or status filters) due to changed HTML structures, dynamic text groupings (e.g., `08:00 - 08:30` in a single `td`), missing or altered `aria-label` tags, and the conditional unmounting of closed `Dialog` components which prevented tests from filling form inputs prior to clicking the open/submit triggers.

## Root Cause / Key Insight

1. **Text Node Fragmentation**: Grouping text like `{slot.startTime} - {slot.endTime}` in a single table cell causes `getByText("08:00")` to fail because the text content is no longer exactly `"08:00"`.
2. **Conditional Rendering in Modals**: Shared `Dialog` components that return `null` when `isOpen={false}` completely remove form fields from the DOM, breaking tests that attempt to fill inputs (e.g. `Doctor`, `From Date`) before opening the modal.
3. **Ambiguous Accessible Names**: Translating labels to `aria-label` or changing input/select helper texts can cause `getByLabelText("Status")` or button selectors to fail if the text does not match exactly or is duplicated (e.g. header vs modal submit buttons both matching `/generate slots/i`).
4. **Missing Form Label Associations**: Inline custom forms using `<select>` or other native inputs without standard `TextField` wrapping will throw label-matching errors if they lack `id`/`htmlFor` programmatic associations and `aria-label` definitions.
5. **Search Input Roles**: Native search inputs need explicit `aria-label` (e.g., `aria-label="Search special closures"`) to match search role queries in testing-library (`screen.getByRole("searchbox", { name: /search.../i })`).

## Recommendation for Future Work

- **When rendering ranges**, wrap each individual queryable value in a separate element (e.g., `<span>{slot.startTime}</span> - <span>{slot.endTime}</span>`) to ensure testing-library can locate exact strings.
- **When designing modals/dialogs**, support a test-friendly fallback where closed contents are visually hidden (e.g. `<div className="hidden" aria-hidden="true">{children}</div>`) rather than unmounted, ensuring input selectors remain queryable.
- **When querying buttons with similar names**, always ensure tests click the correct button index (e.g., `screen.getAllByRole("button", { name: "Generate Slots" })[1]`) or use specific classnames/IDs if names are ambiguous.
- **Always associate labels and inputs/selects**: Explicitly link labels via `id`/`htmlFor` and add matching `aria-label` attributes to custom selects (e.g. `aria-label="Room"` or `aria-label="Weekday"`) so they can be located by `getByLabelText` or `getByRole` queries.
- **Add explicit search labels**: Ensure search fields utilize `aria-label` matching the query criteria expected by unit tests.
