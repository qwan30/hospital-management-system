# Document Control

**Status:** Active — 2026-06-14
**Purpose:** Document governance, ownership, review cycles, update procedures
**Template slot:** `00-overview/document-control.md` from universal-docs-generator

---

## 1. Document Ownership

| Category | Owner | Review Cycle |
|----------|-------|-------------|
| 00-overview | Tech Lead | Quarterly |
| 01-business | Product Owner | Per release |
| 02-product | Product Owner | Per sprint |
| 03-requirements | Tech Lead + QA Lead | Per release |
| 04-architecture | Tech Lead | On architectural change |
| 05-api | Backend Lead | On endpoint change |
| 06-database | Backend Lead | On migration |
| 07-flows | Tech Lead | On workflow change |
| 08-ui-ux | Frontend Lead | On UI change |
| 09-testing | QA Lead | Per test cycle |
| 10-deployment | DevOps Lead | On infra change |
| 11-operations | DevOps Lead | Quarterly |
| 12-handover | Tech Lead | Per milestone |

---

## 2. Source of Truth Hierarchy

1. **Repository source code** — absolute truth; documentation must match
2. **Database schema** (`backend/start/src/main/resources/db/migration/`)
3. **API contract** (`docs/05-api/api-contract.md`) — verified against `@RequestMapping`
4. **Architecture docs** (`docs/04-architecture/`) — verified against module structure
5. **Business docs** (`docs/01-business/`)

**Tie-breaker rule:** When docs and code disagree, code wins. Update the doc.

---

## 3. Document Lifecycle

| Stage | Label | Action |
|-------|-------|--------|
| Draft | `Status: Draft` | Under development |
| Review | `Status: In Review` | Awaiting approval |
| Active | `Status: Code-verified` | Matches codebase |
| Superseded | `Status: Superseded by X` | Moved to `archive/` |

---

## 4. Update Procedures

### API Endpoint Change
1. Update `docs/05-api/api-contract.md`
2. Update `docs/03-requirements/functional-requirements.md` if new FR
3. Update `docs/09-testing/test-plan-full.md` with new tests

### Database Migration
1. Create Flyway migration in `backend/start/.../db/migration/`
2. Update `docs/06-database/db-schema.md`
3. Update `docs/06-database/migration-guide.md`

### New Bounded Context
1. Create `backend/domain/.../core/{context}/` with entities + repository
2. Create service in `backend/application/`
3. Create controller in `backend/controller/`
4. Update `docs/04-architecture/domain-driven-design.md`

### Architecture Refactoring
1. Create ADR in `docs/04-architecture/adr/`
2. Update `docs/04-architecture/domain-driven-design.md`
3. Update `docs/04-architecture/architecture.md`

---

## 5. Format Standards

- **Header:** `# Title` with status and date
- **Tables:** GitHub-flavored markdown
- **Code:** Language-specific fences (` ```java `)
- **Cross-refs:** Relative paths from `docs/` root
- **Diagrams:** Mermaid for flows, state machines, architecture
