# Hospital Management System Internal Clinical Assistant SRS

Status: aligned to the repository on 2026-04-25

## 1. Module Purpose

The internal clinical assistant is a staff-only, evidence-based assistant that supports:

- internal document lookup
- patient-context lookup for allowed users
- hybrid answers that combine patient data and active internal documents

This module is intended for clinical workflow support, not open-ended chat.

## 2. Current Users And Access Rules

| Role | Allowed modes | Notes |
| --- | --- | --- |
| Doctor | `DOCS`, `PATIENT`, `HYBRID` | patient scope limited to doctor-owned patient context |
| Nurse | `DOCS`, `PATIENT`, `HYBRID` | patient scope limited to current queue context |
| Admin | `DOCS` only | no patient context access |

## 3. Current Endpoints

- `GET /api/v1/internal-assistant/sessions/current`
- `POST /api/v1/internal-assistant/messages`
- `POST /api/v1/internal-assistant/messages/{messageId}/feedback`
- `GET /api/v1/admin/monitoring/internal-assistant`
- admin knowledge document routes under `/api/v1/admin/knowledge-documents`

## 4. Implemented Assistant Behavior

### 4.1 Modes

- `DOCS`: answer from active knowledge documents only
- `PATIENT`: answer from selected patient or appointment context only
- `HYBRID`: combine patient evidence with relevant active documents

### 4.2 Session model

- the API exposes current session lookup
- the message request may include an optional `sessionId`
- assistant answers are recorded as part of a session

### 4.3 Response contract

Each successful answer may include:

- assistant message text
- citations
- deep links
- suggested follow-up prompts
- resolved scope (`DOCS`, `PATIENT`, `HYBRID`, or `REFUSED`)

### 4.4 Refusal behavior

The assistant refuses when:

- the role is not allowed to use the selected mode
- patient mode or hybrid mode lacks patient context
- the selected patient is outside the allowed role scope
- there is not enough approved evidence

## 5. Evidence Sources

### 5.1 Patient-context evidence

The assistant can cite:

- patient profile data
- appointment data
- medical record data
- lab result data
- patient portal thread summaries
- prescription summaries

### 5.2 Document evidence

The assistant can cite:

- active knowledge documents
- knowledge chunks
- graph-linked document nodes and edges

Important note:

- the current implementation is deterministic and repository-backed
- it does not call an external LLM for answer generation

## 6. Knowledge Document Administration

Admin users can:

- list documents
- open document detail
- inspect latest ingestion
- upload a new document
- activate a document
- revoke a document
- reindex a document

Current upload constraints:

- allowed file types: `.md`, `.markdown`, `.txt`
- max size: 1 MB

## 7. Monitoring And Audit

The module records:

- mode usage
- outcome categories
- citation counts
- response timing
- feedback values

Admin monitoring UI should show:

- usage totals
- refusal counts
- citation-rich vs citation-free behavior
- feedback trends

## 8. UI Requirements

The assistant UI must show:

- mode selector
- patient or appointment context chip when relevant
- answer body
- citation list
- deep links
- follow-up suggestions
- feedback controls
- clear refusal copy

The UI must never imply:

- that admin can access patient context
- that the assistant produces uncited free-form advice
- that the assistant can change medical data

## 9. Current Gaps

- no streaming response API
- no session list or session delete API
- no rich document editor inside the app; document upload is file-based
- no patient-facing version of this assistant
