# ADR-003: JWT Stateless Authentication with Cookie-Based Refresh

**Status:** Accepted
**Date:** 2026-04-10
**Deciders:** Architecture team

## Context
HMS needs to authenticate 7 user roles (ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT) across a web frontend. Session-based auth requires server-side state and complicates horizontal scaling.

## Decision
Use JWT access tokens (15-minute TTL) for API authentication with httpOnly refresh cookies (7-day TTL with rotation) for silent token renewal.

## Rationale
- Stateless JWT eliminates server-side session storage
- Short-lived access tokens (15 min) minimize exposure if compromised
- httpOnly cookies prevent JavaScript access to refresh tokens (XSS resistant)
- Cookie rotation on each refresh limits refresh token reuse window
- Separate cookie namespaces for staff (`hms_refresh_token`) and patient (`hms_refresh_token_patient`)

## Consequences
- ✅ No server-side session storage
- ✅ Refresh tokens protected from XSS (httpOnly)
- ✅ Independent staff and patient auth domains
- ⚠️ No server-side token invalidation (mitigated by short TTL)
- ⚠️ Refresh cookie must be sent on every API request for auto-renewal
