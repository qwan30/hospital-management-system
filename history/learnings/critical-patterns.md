# Critical Learning Patterns

This file documents critical, reusable patterns and lessons learned during development to help future agents avoid regressions and streamline code migrations.

## [2026-05-20] Resolving Testing-Library Selectors in Hospital Core (hc-) UI Migration
**Category:** failure
**Feature:** vitest-accessibility-name-matching-hc-ui
**Tags:** [testing-library, accessibility, dialog, vitest]

Migrating legacy admin screens to the unified `hc-` design system introduced multiple Vitest selector regressions:
1. Dynamic time ranges (e.g. `08:00 - 08:30` in one cell) broke exact string queries. Wrapping values in individual `<span>` tags (e.g. `<span>08:00</span>`) preserves design while fixing queries.
2. Conditionally unmounted dialogs removed inputs from the DOM, causing pre-fill steps in tests to fail. Modifying the `Dialog` component to render closed content in an `aria-hidden="true" className="hidden"` container keeps them queryable.
3. Multiple buttons with matching text (e.g. header vs modal submit button) required explicit index selection or unique labels in test assertions.
4. Select components and custom fields in modals require explicit `id`/`htmlFor` linking and matching `aria-label` properties, otherwise testing-library's label queries (`getByLabelText`) fail to find form controls.
5. Search fields require explicit `aria-label` matching test queries (e.g., `screen.getByRole("searchbox", { name: /search.../i })`) to be discoverable in test runs.

**Full entry:** [20260520-accessibility-testing-vitest-hc-ui.md](file:///D:/projects/hospital-management-system/history/learnings/20260520-accessibility-testing-vitest-hc-ui.md)
