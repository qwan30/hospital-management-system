# ADR-001: Modular Monolith over Microservices

**Status:** Accepted
**Date:** 2026-03-15
**Deciders:** Architecture team

## Context
The HMS requires 17 bounded contexts (appointment, queue, patient, inventory, invoice, etc.) that are tightly coupled in clinical workflows. A patient booking flows through: public booking → reception check-in → nurse vital signs → doctor consultation → pharmacy dispense → billing.

## Decision
Use a DDD modular monolith architecture instead of microservices.

## Rationale
- 17 contexts share transactional boundaries in clinical workflows
- Distributed transactions across microservices would add complexity without benefit at current scale (single hospital deployment)
- Modular monolith preserves domain boundaries while enabling simple deployment
- Maven module structure (`domain/`, `infrastructure/`, `application/`, `controller/`, `start/`) enables future extraction to microservices if needed
- Single PostgreSQL database with 35 tables avoids eventual consistency challenges

## Consequences
- ✅ Simple deployment: single JAR + single database
- ✅ Strong transactional consistency for clinical workflows
- ✅ Easy local development with Docker Compose
- ⚠️ Must maintain module boundary discipline to prevent coupling
- ⚠️ Full-stack redeployment required for any change
