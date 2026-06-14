# Migration Guide

**Status:** aligned with the repository on 2026-06-14.
**Engine:** Flyway (Community Edition)
**Location:** `classpath:db/migration` (`backend/start/src/main/resources/db/migration/`)
**Current version:** V20

---

## Flyway Setup

Flyway is configured in `backend/start/src/main/resources/application.yml`:

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
  jpa:
    hibernate:
      ddl-auto: validate
```

Key points:
- **Flyway is enabled** by default. Set `spring.flyway.enabled: false` only for integration tests that need schema-first initialization.
- **Hibernate `ddl-auto: validate`** ensures the JPA entity model matches the Flyway-managed schema. Never use `update` or `create` in production.
- **Migration files** are versioned SQL scripts in the `db/migration` classpath directory.

### How Flyway Works

1. On application startup, Flyway checks the `flyway_schema_history` table (created automatically in the application database).
2. It compares the checksums of applied migrations against the migration files on the classpath.
3. Any new migration files with a version higher than the current schema version are applied in version order.
4. After all migrations complete, Hibernate validates the entity mappings against the resulting schema.

---

## Migration Naming Convention

Migration files follow this format:

```
V{version}__{Description}.sql
```

**Rules:**

| Element | Convention | Example |
|---------|------------|---------|
| Prefix | Always `V` (uppercase) | `V1`, `V20` |
| Version | Monotonic integer, no gaps expected | `1`, `2`, `3` |
| Separator | Double underscore `__` | `__` |
| Description | PascalCase with underscores for word separation | `Create_initial_schema` |
| Extension | `.sql` | `.sql` |

**Examples from the repository:**

```
V1__Create_initial_schema.sql
V4__Expand_patient_identifier_and_security.sql
V11__Remove_ai_assistant_features.sql
V16__Expand_user_role_constraint_for_rbac.sql
V20__Add_email_delivery_attempts.sql
```

---

## Migration Authoring Rules

### Do

- **Additive changes preferred.** Add columns, tables, and indexes rather than modifying or removing them.
- **Use `IF NOT EXISTS` / `IF EXISTS`** for all DDL statements to make migrations idempotent.
- **Use `ADD COLUMN IF NOT EXISTS`** when altering existing tables.
- **Use `DROP CONSTRAINT IF EXISTS`** before replacing CHECK constraints.
- **Include indexes** for new high-read lookup paths.
- **Backfill data carefully** when adding NOT NULL columns to existing tables:

```sql
-- Example from V3: adding a NOT NULL column with backfill
ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
UPDATE patients SET email = CONCAT(...) WHERE email IS NULL;
ALTER TABLE patients ALTER COLUMN email SET NOT NULL;
```

- **Ship a single logical change per migration.** Each migration should be independently reviewable.

### Do Not

- **Never edit a migration that has already been applied** in any shared environment. Flyway Community detects checksum mismatches and fails on startup.
- **Never reorder or renumber migrations** after they are committed.
- **Avoid destructive changes** (DROP TABLE, DROP COLUMN) unless explicitly required and coordinated with all deployment targets. When necessary, use a separate migration clearly documented as a removal.

### Idempotency Patterns

All migrations should be safe to run multiple times on the same schema. Use these patterns:

```sql
-- Table creation
CREATE TABLE IF NOT EXISTS table_name ( ... );

-- Column addition
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;

-- Constraint replacement
ALTER TABLE table_name DROP CONSTRAINT IF EXISTS constraint_name;
ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (...);

-- Unique index replacement
DROP INDEX IF EXISTS idx_name;
CREATE UNIQUE INDEX IF NOT EXISTS idx_name ON table_name (column);
```

---

## Deployment Strategy

### Migration Execution Order

1. **Before deploying new application code:** Ensure the target database has all pending migrations applied.
2. **During deployment:** The application startup runs Flyway migrations automatically. If the application is deployed as a container, the migration runs as part of the container's entrypoint before the application serves traffic.
3. **Rolling deployments:** In multi-instance deployments, only the first instance to start after a deployment applies the migrations. Other instances wait for Flyway's built-in locking to complete.

### Rollback Strategy

Flyway Community Edition does not provide automatic undo migrations. Use these rollback rules instead:

| Scenario | Strategy |
|----------|----------|
| Destructive production failure | Restore from backup |
| Reversible schema mistake | Ship a forward-fix migration (e.g., add column back if accidentally dropped) |
| Application code rollback | The schema remains forward-compatible if the migration was additive. For destructive changes, a forward-fix migration may be needed. |

**Guidelines for rollback-safe migrations:**

- Prefer additive changes (new columns, new tables, new indexes).
- Avoid dropping columns or tables in the same deployment cycle as the application code that depends on them.
- If a destructive change is unavoidable, ship it in a dedicated migration that can be independently rolled forward.

### Testing Migrations

Every new migration should be tested against:

1. **A fresh database** (empty schema): Confirms the migration applies cleanly from scratch.
2. **An evolved database** (at the previous version): Confirms the migration applies cleanly on top of the current production schema.

The project uses **Testcontainers** for integration testing. The `@SpringBootTest` integration tests spin up a PostgreSQL container and apply all Flyway migrations as part of the Spring context initialization.

```bash
# Run all tests (includes migration verification)
cd backend
mvn.cmd verify
```

### Docker Compose

In the development Docker Compose setup, the PostgreSQL service initializes with an empty database, and the backend service applies all Flyway migrations at startup:

```yaml
services:
  hospital-db:
    image: postgres:15
    environment:
      POSTGRES_DB: hospital_db
      POSTGRES_USER: hospital_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  hospital-api:
    build: ./backend
    depends_on:
      - hospital-db
    # Flyway runs automatically via Spring Boot auto-configuration
```

---

## Current Migration Inventory

| Version | Description | Type | Tables Affected |
|---------|-------------|------|-----------------|
| V1 | Create initial schema | CREATE | 11 tables, 3 indexes |
| V2 | Add clinical workflow columns | ALTER | 3 tables |
| V3 | Add patient email and follow-up schedule | ALTER + CREATE INDEX | 2 tables, 1 index |
| V4 | Expand patient identifier and security | ALTER + CREATE INDEX | 1 table, 1 index |
| V5 | Expand SRS, booking, and operations foundation | CREATE + ALTER | 6 tables, 3 indexes |
| V6 | Add room, schedule, closure operational flags | ALTER | 3 tables |
| V7 | Add inventory management tables | CREATE | 3 tables, 3 indexes |
| V8 | Add patient portal tables | CREATE | 4 tables, 3 indexes |
| V9 | Add internal assistant knowledge tables | CREATE + EXTENSION | 4 tables, vector ext |
| V10 | Implement internal assistant V1 safe rollout | CREATE + ALTER | 3 tables, 4 indexes |
| V11 | Remove AI assistant features | DROP | 9 tables, vector ext removed |
| V12 | Add appointment follow-ups table | CREATE | 1 table, 1 index |
| V13 | Add appointment vital signs table | CREATE | 1 table, 1 index |
| V14 | Add appointment metadata columns | ALTER | 1 table |
| V15 | Add appointment lab result columns | ALTER | 1 table |
| V16 | Expand user role constraint for RBAC | ALTER (CHECK) | 1 table |
| V17 | Add inventory quantity constraints | ALTER (CHECK) | 2 tables |
| V18 | Align invoice status constraint | UPDATE + ALTER (CHECK) | 1 table |
| V19 | Add pharmacy dispense traceability | ALTER + CREATE INDEX | 1 table, 2 indexes |
| V20 | Add email delivery attempts | CREATE | 1 table, 2 indexes |

---

## Adding a New Migration

Step-by-step process for adding a new migration (V21 and beyond):

1. **Determine the next version number.** Check the highest numbered file in `backend/start/src/main/resources/db/migration/`. If V20 is the highest, the next file is `V21__{Description}.sql`.

2. **Create the migration file.** Place it in `backend/start/src/main/resources/db/migration/`. Use the naming convention `V{version}__{Description}.sql`.

3. **Follow idempotency patterns.** Use `IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, and `DROP CONSTRAINT IF EXISTS` as appropriate.

4. **Include indexes.** Add `CREATE INDEX IF NOT EXISTS` statements for any new query paths the application needs.

5. **Test against a fresh database.** Run the application or integration tests against a clean PostgreSQL container.

6. **Test against an evolved database.** Apply the migration on top of the previous version to verify it handles both existing and new data correctly.

7. **Update documentation.** Update this file and `db-schema.md` with the new migration details.

8. **Commit.** The migration file is checked into version control and deployed as part of the application artifact.

```sql
-- Example template for a new migration
-- V21__Add_example_table.sql

CREATE TABLE IF NOT EXISTS example_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_example_table_name
  ON example_table(name);
```

---

## Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `POSTGRES_HOST` | Database host (default: `localhost`) |
| `POSTGRES_PORT` | Database port (default: `5432`) |
| `POSTGRES_DB` | Database name (default: `hospital_db`) |
| `POSTGRES_USER` | Database user (default: `hospital_user`) |
| `POSTGRES_PASSWORD` | Database password (required) |
| `JWT_SECRET` | JWT signing key (required) |
| `PATIENT_IDENTIFIER_SECRET` | AES-GCM encryption key for patient CCCD (required) |
