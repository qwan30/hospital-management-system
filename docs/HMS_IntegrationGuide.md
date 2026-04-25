# Hospital Management System Integration Guide

Status: aligned to the repository on 2026-04-25

Architecture diagrams: [HMS_ArchitectureDiagrams.html](HMS_ArchitectureDiagrams.html)

## 1. Integration Overview

The current repository has two configurable external integrations and two important in-repo assistant behaviors:

- Gemini for symptom analysis
- Gmail API style OAuth2 configuration for email delivery
- a rule-based public chatbot
- a citation-first internal clinical assistant

Important correction:

- older docs referred to Claude or Anthropic
- the current code uses Gemini for symptom analysis only

## 2. Gemini Symptom Analysis

### 2.1 Purpose

Gemini is used only for `POST /api/v1/ai/analyze-symptoms`.
It is not used for the public chatbot or the internal clinical assistant.

### 2.2 Configuration

| Variable | Meaning |
| --- | --- |
| `GEMINI_ENABLED` | enables external Gemini calls |
| `GEMINI_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | model name, default `gemini-2.0-flash` |
| `GEMINI_API_BASE_URL` | optional API base override |

### 2.3 Runtime behavior

- if Gemini is enabled and available, the backend returns Gemini-based duration and complexity
- if Gemini throws an exception or is disabled, the backend falls back to deterministic heuristics
- the UI should therefore handle AI results as guidance, not as a hard dependency

### 2.4 UX implication

The booking flow should support:

- a loading state while analysis runs
- a fallback-friendly result presentation
- copy that explains the recommendation is advisory

## 3. Gmail Email Integration

### 3.1 Purpose

Gmail integration is used for transactional email behavior such as confirmations and follow-up communication hooks.

### 3.2 Configuration

| Variable | Meaning |
| --- | --- |
| `GMAIL_ENABLED` | enables email delivery |
| `GMAIL_CLIENT_ID` | OAuth client id |
| `GMAIL_CLIENT_SECRET` | OAuth client secret |
| `GMAIL_REFRESH_TOKEN` | refresh token for the sender account |
| `GMAIL_SENDER_EMAIL` | visible sender email |
| `GMAIL_TOKEN_URL` | token endpoint override |
| `GMAIL_API_BASE_URL` | Gmail API base URL override |

### 3.3 Runtime behavior

- when disabled, the backend remains usable
- when enabled but misconfigured, email-related operations may fail while core workflows still operate
- the UI should not assume successful email delivery unless the backend confirms it

## 4. Public Chatbot

### 4.1 Actual behavior

The public chatbot is not an LLM chat system.
It is a scoped helper that responds to:

- department questions
- doctor questions
- availability questions
- booking guidance

### 4.2 Data sources

- departments
- doctors
- available time slots

### 4.3 UX implication

The chatbot should feel lightweight and task-oriented.
Design it like a guided hospital helper, not like a free-form medical AI.

## 5. Internal Clinical Assistant

### 5.1 Actual behavior

The internal assistant is a deterministic, evidence-based assistant for doctor, nurse, and admin workflows.
It uses:

- patient context data when allowed
- active internal knowledge documents
- citations and deep links in responses

### 5.2 Current endpoints

- `GET /api/v1/internal-assistant/sessions/current`
- `POST /api/v1/internal-assistant/messages`
- `POST /api/v1/internal-assistant/messages/{messageId}/feedback`
- `GET /api/v1/admin/monitoring/internal-assistant`
- `GET/POST` and activation lifecycle actions under `/api/v1/admin/knowledge-documents`

### 5.3 Important limits

- doctor: docs, patient, hybrid
- nurse: docs, patient, hybrid, but only for in-scope current queue context
- admin: docs only
- no free-form uncited answer path

## 6. Knowledge Document Administration

Admin users can upload and manage assistant knowledge documents.

Current behavior:

- upload accepts `.md`, `.markdown`, and `.txt`
- max file size is 1 MB
- uploaded documents start as draft and inactive
- admins can activate, revoke, and reindex documents

Design implication:

- the admin UI needs upload, status, ingestion state, and activation controls

## 7. Verification Checklist

### 7.1 Gemini

- `GEMINI_ENABLED=true`
- `GEMINI_API_KEY` is populated
- `POST /api/v1/ai/analyze-symptoms` returns a non-error payload

### 7.2 Gmail

- `GMAIL_ENABLED=true`
- all Gmail OAuth2 variables are present
- a workflow that triggers email completes without configuration errors

### 7.3 Internal assistant

- active knowledge documents exist
- doctor and nurse roles can retrieve session state
- admin can retrieve docs mode session state only
- assistant responses include citations when evidence is found
