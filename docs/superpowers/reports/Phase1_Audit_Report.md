# Phase 1 Audit Report: Deep Code-Docs Alignment

**Date:** 2026-07-10
**Target:** `d:\projects\hospital-management-system`
**Scope:** `docs/`, `backend/`, and `frontend/`

---

## 1. Executive Summary
This report presents the findings of a Phase 1 Deep Audit. The primary goal was to cross-reference the project's documentation (architecture, requirements, business rules) with the actual implementations in the `backend/` (Spring Boot Modular Monolith) and `frontend/` (Next.js) codebases. Overall, the system strictly adheres to its Domain-Driven Design (DDD) boundaries and business rules. However, several discrepancies were found where the documentation has fallen behind the code (stale "Known Integration Caveats"), along with some orphaned backend AI features and explicit technical debt regarding patient interactions.

---

## 2. Documentation vs. Code Discrepancies

### 2.1 Outdated Frontend Architecture Caveats
The `docs/04-architecture/frontend-architecture.md` file lists several "Known Integration Caveats" that have already been resolved in the codebase. The documentation is currently under-reporting the frontend's capabilities:
*   **Token Refresh:** The docs state *"No automatic token refresh replay... `apiRequest` attaches tokens but does not retry 401"*. **Correction:** The `frontend/src/lib/api-client.ts` file **does** intercept 401 responses, successfully calls `attemptTokenRefresh()`, and retries the original request.
*   **Staff Lab Results Page:** The docs state *"Staff lab-results page is static... uses local labReports data"*. **Correction:** The page (`frontend/src/app/staff/(app)/lab-results/page.tsx`) dynamically fetches appointments via `listAppointments` and corresponding lab results via `listLabResultsByAppointment`.
*   **Staff Schedule Page:** The docs state *"Staff schedule page is static"*. **Correction:** `frontend/src/app/staff/(app)/schedule/page.tsx` dynamically loads data via `getMySchedule(params)`.

### 2.2 Missing/Orphaned Bounded Contexts (AI & Chatbot)
*   `docs/04-architecture/domain-driven-design.md` explicitly lists **17 Bounded Contexts**. It does not mention AI or Chatbot contexts.
*   However, the backend codebase contains `AiIntegrationController` and `ChatbotController` (along with their respective services). 
*   Furthermore, these backend endpoints are **completely absent** from the frontend implementation (no references to `/api/v1/ai` or `/api/v1/chatbot` exist in `frontend/src`).
*   *Note:* The V11 Flyway migration removed the `vector` extension and internal AI assistant tables, but the AI and Chatbot services remain as either hardcoded rule-based stubs or data-extraction layers for external integrations.

---

## 3. Technical Debt & Unimplemented Features

### 3.1 Unimplemented Patient Portal Actions
As outlined in the UI implementation (`frontend/src/app/portal/(app)/appointments/page.tsx`), patients are unable to manage their appointments. The UI displays an explicit **"Unsupported Actions"** block stating: *"Reschedule, cancel, and telehealth actions are not exposed by the current patient portal API."*

### 3.2 Read-Only Patient Messages
In adherence with `BR-023: Patient Portal Messages Are Read-Only`, the current API and UI only allow patients to view message threads. There are no endpoints or UI components implemented for patients to compose, send, or reply to messages.

### 3.3 Domain-Driven Design (DDD) Technical Debt
As noted in `docs/04-architecture/domain-driven-design.md`, the backend architecture still has planned technical debt for its DDD implementation:
*   **Missing Use Case Ports:** Use case interfaces (ports) in the application layer are marked as "planned" but not yet implemented.
*   **Missing Domain Events:** Cross-context communication still relies on direct service-to-service/repository calls instead of a Domain Event bus (marked as "planned").

### 3.4 Billing Domain Technical Debt
Significant technical debt exists in the implementation of the Invoicing UI (`frontend/src/app/staff/(app)/invoices/page.tsx`):
*   **Stubbed Itemized Charges:** The backend `InvoiceEntity` only stores a scalar `totalAmount` field without any relational line-items. Consequently, the frontend dynamically fakes itemized charge lines (e.g., "Specialist Physician Consultation", "Advanced Diagnostics / Lab Panels") using hardcoded logic based entirely on the total mathematical value of the invoice.
*   **Missing Features:** The UI notes that "Invoice audit events are not exposed by the current invoice API" and "Batch billing controls are not exposed by the current backend API."

---

## 4. Business Logic & Security Adherence

The codebase demonstrates strong adherence to the documented business rules and non-functional requirements:
*   **BR-009 (Invoice Auto-Generated from Service Pricing):** `InvoiceService.resolveAmount()` correctly enforces this by dynamically looking up the valid `ServicePricingEntity` for "CONSULTATION" based on the doctor's department and the appointment date, falling back to a default if unavailable. 
*   **BR-010 (Invoice Requires Completed Appointment):** `InvoiceService.createInvoice()` verifies that the appointment status is strictly `DONE` before generating an invoice, successfully enforcing this rule.
*   **BR-019 (Audit Log Immutability):** The system securely prevents modifications to audit logs. The `AdminAuditLogController` only exposes a `GET` endpoint for querying logs. No `PUT` or `DELETE` endpoints exist.
*   **BR-024 & NFR-10.3 (JWT Token Security):** The frontend strictly manages access tokens in volatile memory (`inMemoryStaffAccessToken`, `inMemoryPatientAccessToken`) and correctly utilizes `credentials: "include"` to pass the `httpOnly` refresh token cookies automatically.
*   **Modular Monolith Boundaries:** The backend successfully separates bounded contexts without entanglement, matching the Maven dependency graph rules (e.g., the `domain` module does not depend on `infrastructure` or `application`).
*   **API Envelopes:** Both the backend responses and the frontend `api-client.ts` envelope parsing align exactly with the schema defined in `docs/05-api/api-contract.md`.
