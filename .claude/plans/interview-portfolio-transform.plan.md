# Plan: Interview-Ready Portfolio Transformation

**Goal**: Transform this repo so a technical interviewer says "I want this engineer" within 90 seconds.
**Complexity**: Medium (15 files, 0 code logic changes, documentation + screenshots + HTML)
**Date**: 2026-06-14
**Estimated**: 17 tasks, ~5.5 hours

## Summary

Enhance README, rebuild HTML documentation portal with live Mermaid diagrams, produce missing product screenshots, create CHANGELOG, and apply 2 critical code fixes. Every task has measurable acceptance criteria and a review gate.

---

## Success Criteria (Top-Level)

- [ ] **SC-1**: README shows architecture diagram + screenshots + ADR highlights within 1 scroll
- [ ] **SC-2**: HTML portal renders Mermaid diagrams in-browser with clinical color theme
- [ ] **SC-3**: All 8 missing clinical screenshots captured and linked
- [ ] **SC-4**: CHANGELOG.md exists with RC 1.0 release notes
- [ ] **SC-5**: `RestExceptionHandler` logs errors before returning 500
- [ ] **SC-6**: `toDouble`/`toBigDecimal` exist exactly once (in `NumberUtils`)
- [ ] **SC-7**: All 148 backend tests pass after code changes (`mvn verify`)
- [ ] **SC-8**: Zero broken links in README.md and HTML portal

---

## Task Breakdown

### PHASE 1: Code Fixes (Critical — do FIRST)

---

#### Task 1.1: Add error logging to generic exception handler

| Field | Value |
|-------|-------|
| **File** | `backend/controller/src/main/java/com/hospital/api/config/RestExceptionHandler.java` |
| **Action** | Add `LOGGER.error("Unhandled exception", exception)` at line 95 before returning 500 |
| **Pattern to mirror** | `AuthorizationDenialAuditFilter.java:21,65` |
| **Estimate** | 10 min |

**Acceptance Criteria**:
- [ ] `LOGGER` field declared with `LoggerFactory.getLogger(RestExceptionHandler.class)`
- [ ] `LOGGER.error("Unhandled exception", exception)` called inside `handleGeneric(Exception)` before return
- [ ] Import `org.slf4j.Logger` and `org.slf4j.LoggerFactory`
- [ ] `mvn compile` succeeds

**Review Gate**: Re-read the file, verify LOGGER pattern matches `AuthorizationDenialAuditFilter`

---

#### Task 1.2: Extract duplicated utility methods into NumberUtils

| Field | Value |
|-------|-------|
| **Files CREATE** | `backend/domain/src/main/java/com/hospital/core/common/NumberUtils.java` |
| **Files UPDATE** | `AppointmentWorkflowService.java`, `MedicalRecordService.java`, `PatientRecordService.java` |
| **Action** | Move private `toDouble`/`toBigDecimal` into shared `NumberUtils` class |
| **Estimate** | 20 min |

**Acceptance Criteria**:
- [ ] `NumberUtils.java` in `com.hospital.core.common` with `public static` methods
- [ ] All 3 service files updated: private methods removed, replaced with `NumberUtils.toXxx()`
- [ ] No other class defines `toDouble(BigDecimal)` or `toBigDecimal(Double)`
- [ ] `mvn compile` succeeds
- [ ] `mvn verify` passes all 148 tests

**Review Gate**: Grep for `toDouble|toBigDecimal` — only `NumberUtils` defines them

---

#### Task 1.3: Verify Phase 1

| Field | Value |
|-------|-------|
| **Command** | `cd backend && mvn verify` |
| **Estimate** | 5 min |

**Acceptance Criteria**:
- [ ] `BUILD SUCCESS`
- [ ] All 148 tests passing
- [ ] No compilation warnings

---

### PHASE 2: Screenshots

---

#### Task 2.1: Rename existing screenshots

| Field | Value |
|-------|-------|
| **Files** | `docs/screenshots/*.png` |
| **Action** | Rename to `01-` through `10-` sequence, fix duplicate `04-` naming |

**Current → Target**:
```
01-homepage.png         → 01-homepage.png        (keep)
02-departments.png      → 02-departments.png     (keep)
03-doctors.png          → 03-doctors.png         (keep)
04-booking.png          → 04-booking.png         (keep)
04-staff-login.png      → 05-staff-login.png     (fix duplicate number)
05-staff-login.png      → DELETE (duplicate file)
05-staff-dashboard.png  → 06-staff-dashboard.png
06-queue-management.png → 07-queue-management.png
07-patient-records.png  → 08-patient-records.png
08-admin-dashboard.png  → 09-admin-dashboard.png
09-admin-users.png      → 10-admin-users.png
```

**Acceptance Criteria**:
- [ ] Files numbered 01 through 10, no gaps, no duplicates
- [ ] No orphaned files remain

**Review Gate**: `ls docs/screenshots/` shows clean 01-10 sequence

---

#### Task 2.2: Capture 8 new product screenshots

| Field | Value |
|-------|-------|
| **Files CREATE** | `docs/screenshots/11-*.png` through `18-*.png` |
| **Action** | Start app, login as each role, capture missing clinical screens |

**Screenshots**:
| # | File | Role | Screen |
|---|------|------|--------|
| 11 | `11-pharmacy-inventory.png` | pharmacist | Inventory list with lot numbers |
| 12 | `12-pharmacy-dispense.png` | pharmacist | Dispense form with prescription ref |
| 13 | `13-billing-invoice.png` | accountant | Invoice detail with line items |
| 14 | `14-revenue-report.png` | accountant | Revenue dashboard |
| 15 | `15-doctor-ehr.png` | doctor1 | Medical record with prescription |
| 16 | `16-patient-portal.png` | patient | Portal overview |
| 17 | `17-patient-lab-results.png` | patient | Lab results list |
| 18 | `18-admin-monitoring.png` | admin | Admin monitoring dashboard |

**Acceptance Criteria**:
- [ ] All 8 PNG files exist
- [ ] No real patient data visible
- [ ] Full-page captures showing distinct workflows

**Review Gate**: Open each PNG — does it clearly show the described clinical workflow?

**Exception**: If app cannot start (missing .env, DB issues), capture placeholder notes and continue.

---

#### Task 2.3: Create screenshot product tour README

| Field | Value |
|-------|-------|
| **File CREATE** | `docs/screenshots/README.md` |
| **Action** | Visual product tour with each screenshot and clinical context |

**Acceptance Criteria**:
- [ ] Lists all 18 screenshots in order (01-18)
- [ ] Each entry: filename, role, clinical workflow, one-line description
- [ ] Table format for quick scanning

**Review Gate**: Can a non-technical person understand what each screen does?

---

### PHASE 3: HTML Documentation Portal (Rebuild)

---

#### Task 3.1: HTML shell + CSS + Mermaid CDN + nav

| Field | Value |
|-------|-------|
| **File** | `docs/HMS_DOCUMENTATION.html` (rewrite) |
| **Action** | Create shell with clinical color palette, Mermaid.js CDN, responsive CSS |

**Design tokens**: navy `#1e3a5f`, teal `#0891b2`, emerald `#059669`, amber `#d97706`

**Acceptance Criteria**:
- [ ] Mermaid CDN loaded: `<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js">`
- [ ] Mermaid initialized with clinical theme
- [ ] Sticky nav with 12 section links
- [ ] Hero with title, version badge, 6 tech badges
- [ ] Responsive + print-friendly CSS

**Review Gate**: Open in browser — nav sticky? Colors clinical? No console errors?

---

#### Task 3.2: Infographic hero with 12 metric cards

| Field | Value |
|-------|-------|
| **File** | `docs/HMS_DOCUMENTATION.html` (hero section) |
| **Action** | Add stat-grid with 12 key metrics as colorful cards |

**Metrics**: 118 APIs, 35 tables, 17 contexts, 7 roles, 36 permissions, 148 tests, 183+ E2E, 80.48% coverage, 20 migrations, 72 pages, 4 CI/CD, 25 specs

**Acceptance Criteria**:
- [ ] 4-col grid desktop, 2-col tablet, 2-col mobile
- [ ] Each card: large number + small label
- [ ] Subtle left-border color per domain

**Review Gate**: Count 12 cards, verify numbers match codebase

---

#### Task 3.3: Rendered Mermaid diagrams (4 diagrams)

| Field | Value |
|-------|-------|
| **File** | `docs/HMS_DOCUMENTATION.html` |
| **Action** | Embed 4 Mermaid diagrams: system architecture, clinical flow, DDD context map, queue state machine |

**Acceptance Criteria**:
- [ ] All 4 diagrams render in-browser
- [ ] Clinical color palette applied
- [ ] Each has descriptive section header

**Review Gate**: Open HTML — all 4 diagrams render without Mermaid syntax errors

---

#### Task 3.4: Screenshot gallery section

| Field | Value |
|-------|-------|
| **File** | `docs/HMS_DOCUMENTATION.html` |
| **Action** | 3-col thumbnail grid linking to full-size screenshots |

**Acceptance Criteria**:
- [ ] All 18 screenshots as thumbnails with `<img loading="lazy">`
- [ ] Each with role badge + clinical context caption
- [ ] No broken image links
- [ ] Click opens full image

**Review Gate**: All thumbnails load, captions correct

---

#### Task 3.5: Architecture Decision Records timeline

| Field | Value |
|-------|-------|
| **File** | `docs/HMS_DOCUMENTATION.html` |
| **Action** | Visual timeline of 4 ADRs |

**Acceptance Criteria**:
- [ ] Vertical timeline (CSS, not image)
- [ ] 4 entries: Monolith choice, Repos in domain, JWT auth, PHI encryption
- [ ] Links to full ADR .md files
- [ ] Color-coded by domain

**Review Gate**: Click each ADR link — resolves to real file

---

#### Task 3.6: Quick Start, Demo Accounts, Docs Index, Footer + link check

| Field | Value |
|-------|-------|
| **File** | `docs/HMS_DOCUMENTATION.html` (remaining sections) |
| **Action** | Add final sections and verify all links |

**Acceptance Criteria**:
- [ ] Quick Start: 4 numbered steps with copy-paste commands
- [ ] Demo Accounts: all 8 accounts listed
- [ ] Docs Index: links to all 12 doc categories
- [ ] Footer with project info
- [ ] Every `<a href>` resolves to existing file
- [ ] Total file < 200KB

**Review Gate**: Scroll top to bottom — every link clickable? Every section present?

---

### PHASE 4: README Enhancement

---

#### Task 4.1: Add "Why" context + ADR highlights

| Field | Value |
|-------|-------|
| **File** | `README.md` (UPDATE) |
| **Action** | Insert after hero description: project context + architecture decisions table |

**Acceptance Criteria**:
- [ ] "Why This Project Exists": 2-3 sentences
- [ ] "Key Architecture Decisions" table: 4 rows with Decision | Why | ADR link
- [ ] Does NOT duplicate existing mermaid diagram

**Review Gate**: Does it explain WHY, not just WHAT?

---

#### Task 4.2: Add technical challenges section

| Field | Value |
|-------|-------|
| **File** | `README.md` (UPDATE) |
| **Action** | Add "Technical Challenges Solved" with 4 challenges |

**Challenges**: Double-booking prevention, PHI encryption, 36-permission RBAC, queue state machine

**Acceptance Criteria**:
- [ ] 4 challenges with problem → solution format
- [ ] Each references source code package/class
- [ ] 1-2 lines each, concise

---

#### Task 4.3: CHANGELOG link + final README polish

| Field | Value |
|-------|-------|
| **File** | `README.md` (UPDATE) |
| **Action** | Link to CHANGELOG.md, verify all links |

**Acceptance Criteria**:
- [ ] `CHANGELOG.md` link present near version badge
- [ ] All existing section links still resolve
- [ ] README under 400 lines

**Review Gate**: Re-read full README — coherent story? No broken links?

---

### PHASE 5: CHANGELOG + Final Verification

---

#### Task 5.1: Create CHANGELOG.md

| Field | Value |
|-------|-------|
| **File CREATE** | `CHANGELOG.md` |
| **Action** | Release history following keepachangelog.com format |

**Acceptance Criteria**:
- [ ] RC 1.0 entry dated 2026-06-14
- [ ] Sections: Added, Changed, Security
- [ ] 5-8 bullet points
- [ ] Links to ADRs for detail

**Review Gate**: Matches keepachangelog.com convention

---

#### Task 5.2: Final cross-reference verification

| Field | Value |
|-------|-------|
| **Action** | Verify all links across all modified files |

**Checklist**:
- [ ] README → all doc links resolve
- [ ] README → CHANGELOG link resolves
- [ ] README → HTML portal link resolves
- [ ] HTML → all 18 screenshot paths resolve
- [ ] HTML → all doc links resolve
- [ ] HTML → Mermaid CDN valid
- [ ] screenshots/README.md → all 18 references resolve
- [ ] CHANGELOG → ADR links resolve
- [ ] `mvn verify` passes
- [ ] `npm run build` passes

---

## Progress Tracker

| # | Task | Est. | Status |
|---|------|------|--------|
| 1.1 | Add error logging to RestExceptionHandler | 10m | ⬜ Pending |
| 1.2 | Extract NumberUtils utility | 20m | ⬜ Pending |
| 1.3 | Verify Phase 1 (mvn verify) | 5m | ⬜ Pending |
| 2.1 | Rename screenshots to 01-10 | 5m | ⬜ Pending |
| 2.2 | Capture 8 new screenshots | 45m | ⬜ Pending |
| 2.3 | Create screenshot tour README | 15m | ⬜ Pending |
| 3.1 | HTML: shell + CSS + nav | 30m | ⬜ Pending |
| 3.2 | HTML: infographic hero | 20m | ⬜ Pending |
| 3.3 | HTML: Mermaid diagrams | 25m | ⬜ Pending |
| 3.4 | HTML: screenshot gallery | 15m | ⬜ Pending |
| 3.5 | HTML: ADR timeline | 15m | ⬜ Pending |
| 3.6 | HTML: remaining sections + links | 20m | ⬜ Pending |
| 4.1 | README: Why + ADR table | 15m | ⬜ Pending |
| 4.2 | README: challenges section | 15m | ⬜ Pending |
| 4.3 | README: CHANGELOG link + polish | 10m | ⬜ Pending |
| 5.1 | Create CHANGELOG.md | 10m | ⬜ Pending |
| 5.2 | Final verification | 10m | ⬜ Pending |
| **TOTAL** | | **~5.5h** | |

---

## Exception Rules (per task)

| Task | If fails... | Fallback |
|------|-------------|----------|
| 1.1 | Logger import conflict | Use `System.err.println` as temp, mark TODO |
| 1.2 | Import cycle | Place only in domain layer (no Spring deps) |
| 1.3 | Test fails | Revert failing change, diagnose, retry |
| 2.1 | File locked (Windows) | Close apps using files, retry |
| 2.2 | App won't start | Skip screenshots, note in HTML as placeholder |
| 3.x | HTML > 200KB | Extract CSS to external file |
| 4.x | README > 400 lines | Move detail to docs/, keep README as index |
| 5.2 | Broken links found | Fix in same task, don't skip |

---

## ⚠️ REVIEW AFTER EVERY TASK

After each task, PAUSE and check:
1. ✅ All acceptance criteria met?
2. ✅ No new errors introduced?
3. ✅ Pattern matches existing codebase conventions?
4. ✅ Report result before starting next task

**DO NOT batch tasks. Verify each one independently.**
