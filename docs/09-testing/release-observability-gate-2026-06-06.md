# HMS Release Observability Gate - 2026-06-06

## Scope

This gate adds local release-candidate observability for the existing Spring Boot backend and `frontend/` Next.js app. It does not change the release verdict by itself; it extends the current readiness lane with logs, metrics, traces, dashboards, and a smoke command.

## Runtime Stack

Run the full local stack with:

```powershell
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d --build
```

Included services:

- Prometheus scrapes `backend:8082/actuator/prometheus`.
- OpenTelemetry Collector accepts OTLP on `4317` and `4318`.
- Tempo stores local traces.
- Loki stores container logs from Promtail.
- Grafana provisions Prometheus, Loki, and Tempo datasources plus HMS release dashboards.

The backend app port remains `8081`; the observability overlay sets `MANAGEMENT_PORT=8082` inside the compose network and does not publish that management port to the host.

## Smoke Command

Use the Windows-friendly release smoke:

```powershell
.\scripts\release-observability-smoke.ps1
```

The command starts the overlay by default, sends a synthetic public backend request with `X-Request-Id`, then checks:

- Prometheus readiness and `up{job="hms-backend"}`.
- HMS HTTP request metric presence.
- Loki request-log evidence for the generated request ID.
- Tempo trace search for `service.name=hms-backend`.
- Grafana, Loki, Tempo, and frontend readiness.

The command emits a concise JSON summary and exits non-zero when required Prometheus/backend evidence is missing. Loki and Tempo evidence are reported as warnings when the local Docker log/trace pipeline is slow to ingest.

## Implementation Evidence

- Backend exposes `health,info,metrics,prometheus` and OTLP tracing configuration.
- `X-Request-Id` is accepted or generated on servlet requests, returned on responses, and placed into MDC.
- Backend logs use JSON console output with request and trace correlation fields.
- Admin monitoring now reports real uptime, DB reachability, today queue count, and metrics/tracing/logging target status.
- Frontend API requests send `X-Request-Id`, preserve response request IDs on errors, and emit sanitized request-duration events.
- Browser errors, unhandled rejections, API request events, and LCP observations can be sent to `/api/client-events` after schema validation and PHI redaction.

## Verification In This Session

Passed:

- `mvn -q -pl application -am -Dtest=OperationsAdminServiceTest "-Dsurefire.failIfNoSpecifiedTests=false" test`
- `mvn -q -pl start -am -DskipTests package`
- `mvn -q test`
- `npm run test:unit -- src/lib/__tests__/api-client.test.ts src/lib/__tests__/client-events.test.ts`
- `npm run test:unit`
- `npm run build`
- `npm run lint` with warnings only in pre-existing unrelated files
- `docker compose -f docker-compose.yml -f docker-compose.observability.yml config`
- PowerShell parse check for `scripts/release-observability-smoke.ps1`

Partially verified:

- `SecurityHardeningIntegrationTest` and `AdminOperationsIntegrationTest` were invoked, but Testcontainers reported no valid Docker environment in this shell. The existing `@Testcontainers(disabledWithoutDocker = true)` behavior skipped runtime DB-backed assertions.

## Acceptance Criteria

Before upgrading the release verdict, run the smoke command against a Docker environment and require:

- Prometheus backend target is `UP`.
- HMS HTTP metrics exist after synthetic traffic.
- Loki contains sanitized request logs with `requestId`.
- Tempo contains traces for release-critical flows.
- No unexpected 5xx responses in synthetic checks.
- No unredacted email, phone, CCCD, token, or record identifiers in logs.
