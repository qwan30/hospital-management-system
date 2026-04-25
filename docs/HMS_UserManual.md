# Hospital Management System User Manual

Status: role workflow reference aligned to the repository on 2026-04-25

## 1. How To Use This Manual

The repository does not yet contain a production frontend.
This manual therefore describes the workflows the future UI must support, based on the current backend APIs.
Use it as a UX behavior guide, not as proof that every screen already exists.

## 2. Guest And Public User

The public experience should allow a guest to:

- view hospital homepage content
- browse departments
- view doctor profiles
- view doctor availability by date
- read news items
- use the public chatbot for departments, doctors, booking guidance, and next available slots
- create an appointment booking

The booking flow should show:

- selected doctor
- selected first slot
- AI-recommended visit duration
- patient identity and contact data
- confirmation code after successful booking

## 3. Patient Portal User

The patient portal should allow a patient to:

- claim portal access using full name, email, CCCD, date of birth, and password
- log in and remain signed in through refresh-cookie behavior
- view an overview with upcoming appointment count, unread threads, available lab results, and next appointment
- view appointment history
- view lab result summaries, doctor comments, and attachment links
- view message threads and nested message history
- update profile details

Current limitation to reflect in UX:

- the backend does not currently allow patients to send or reply to messages
- the backend does not currently allow patient self-cancel or patient reschedule

## 4. Doctor User

The doctor workflow should allow a doctor to:

- sign in
- view own appointments
- open appointment detail
- update appointment status
- review patient demographics and symptoms
- review recorded vital signs
- create a medical record
- add prescription items
- set a follow-up date
- preview and download prescription PDF
- open the internal assistant in docs, patient, or hybrid mode

The doctor workspace should prioritize:

- quick switching between appointment list and appointment detail
- clear patient context
- strong visibility of diagnosis, notes, vitals, and prescriptions
- easy access to generated PDFs

## 5. Nurse User

The nurse workflow should allow a nurse to:

- sign in
- open today appointments
- open the queue view
- check in a patient
- record or update vital signs
- use the internal assistant for the current queue context

Important limitation:

- the current repo does not provide a nurse-specific room management API
- nurse UX should not depend on live room operations beyond queue and check-in

## 6. Accountant User

The accountant workflow should allow an accountant to:

- sign in
- list invoices
- filter invoices by status
- create an invoice from an appointment
- record a payment
- void an invoice
- list and maintain pricing rules
- review daily and monthly revenue reports

The accountant UI should emphasize:

- status chips
- sortable/filterable tables
- action confirmation for money-related changes

## 7. Admin User

The admin workflow should allow an admin to:

- sign in
- manage staff users
- manage departments
- manage rooms
- manage doctor schedule templates
- manage special closures
- generate and delete time slots
- review system stats
- review monitoring snapshots
- review audit logs
- manage public content sections and news
- manage internal assistant knowledge documents
- use the internal assistant only in docs mode

The admin UI should support:

- broad navigation across many operational areas
- clear separation between content admin, operational admin, and monitoring
- safe destructive actions with confirmation

## 8. Internal Assistant User Expectations

The internal assistant should present:

- current mode
- current patient or appointment context when relevant
- assistant answer
- citation list
- deep links
- follow-up suggestions
- answer feedback controls

The assistant should also clearly explain when it refuses to answer because:

- the selected role is not allowed
- required patient context is missing
- the selected patient is outside allowed scope
- there is not enough approved evidence

## 9. UX Notes For All Roles

- public and patient views should be mobile-friendly
- staff views should be desktop-first
- role boundaries must be visible in navigation and actions
- loading, empty, and error states are required for every list and detail screen
- the UI should never imply capabilities that the current API does not provide
