# Hospital Management System Integration Guide

Status: aligned with the repository on 2026-04-26 after AI and internal assistant removal.

Architecture diagrams: [HMS_ArchitectureDiagrams.html](HMS_ArchitectureDiagrams.html)  
Removed endpoints reference: [reference/removed-endpoints.md](reference/removed-endpoints.md)

## 1. Integration Overview

The current repository has one configurable external integration:

- Gmail API style OAuth2 configuration for email delivery

The public chatbot remains in-repo and deterministic. It does not call an LLM or external AI provider.

## 2. Gmail Email Integration

### 2.1 Purpose

Gmail integration is used for transactional email behavior such as confirmations and follow-up communication hooks.

### 2.2 Configuration

| Variable | Meaning |
| --- | --- |
| `GMAIL_ENABLED` | enables email delivery |
| `GMAIL_CLIENT_ID` | OAuth client id |
| `GMAIL_CLIENT_SECRET` | OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | refresh token for the sender account |
| `GMAIL_SENDER_EMAIL` | visible sender email |
| `GMAIL_TOKEN_URL` | token endpoint override |
| `GMAIL_API_BASE_URL` | Gmail API base URL override |

### 2.3 Runtime Behavior

- when disabled, the backend remains usable
- when enabled but misconfigured, email-related operations may fail while core workflows still operate
- the UI should not assume successful email delivery unless the backend confirms it

## 3. Public Chatbot

### 3.1 Actual Behavior

The public chatbot is not an LLM chat system.
It is a scoped helper that responds to:

- department questions
- doctor questions
- availability questions
- booking guidance

### 3.2 Data Sources

- departments
- doctors
- available time slots

### 3.3 UX Implication

The chatbot should feel lightweight and task-oriented.
Design it like a guided hospital helper, not like a free-form medical assistant.

## 4. Removed Integrations

The following integration surfaces have been removed from the active product:

- Gemini symptom analysis and `POST /api/v1/ai/analyze-symptoms`
- internal clinical assistant routes under `/api/v1/internal-assistant`
- admin assistant monitoring under `/api/v1/admin/monitoring/internal-assistant`
- admin knowledge document routes under `/api/v1/admin/knowledge-documents`

Flyway migration `V11__Remove_ai_assistant_features.sql` drops the historical assistant and knowledge tables.

## 5. Verification Checklist

### 5.1 Gmail

- `GMAIL_ENABLED=true`
- all Gmail OAuth2 variables are present
- a workflow that triggers email completes without configuration errors

### 5.2 Removed AI/Assistant Surfaces

- `GEMINI_*` variables are not required
- `/api/v1/ai/analyze-symptoms` is not exposed
- `/api/v1/internal-assistant/**` is not exposed
- `/api/v1/admin/knowledge-documents/**` is not exposed
