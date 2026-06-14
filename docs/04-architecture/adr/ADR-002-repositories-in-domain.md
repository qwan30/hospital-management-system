# ADR-002: Spring Data JPA Repositories in Domain Layer

**Status:** Accepted
**Date:** 2026-06-14
**Deciders:** Architecture team

## Context
DDD prescribes repository interfaces in the domain layer with implementations in infrastructure. However, Spring Data JPA generates repository implementations at runtime via interface proxies — there is no explicit implementation class to place in infrastructure.

## Decision
Place Spring Data JPA repository interfaces (extending `JpaRepository`) directly in the domain layer under each bounded context package.

## Rationale
- The `JpaRepository` interface serves as the repository contract (port) — it belongs in domain per DDD
- Spring Data generates the implementation at runtime — no manual implementation class exists
- Maven enforcer plugin prevents domain module from depending on outer modules
- Moving from infrastructure to domain (completed 2026-06-14) required ZERO Java import changes — same package names
- This is the pragmatic DDD approach for Spring Boot projects (used by Spring PetClinic reference application and thousands of production projects)

## Consequences
- ✅ Clean dependency flow: domain ← infrastructure ← application ← controller
- ✅ Domain owns its contracts
- ⚠️ Domain module now depends on `spring-boot-starter-data-jpa` (acceptable — it is a framework, not an outer layer)
