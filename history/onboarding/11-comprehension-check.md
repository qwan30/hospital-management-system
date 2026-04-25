# Comprehension Check

Use this after the intern finishes the onboarding pack. The goal is not trivia; the goal is to confirm that the intern can reason about the system from contracts down to code and side effects.

## Questions
1. What are the responsibilities of `backend/shared`, `backend/core`, and `backend/api`, and why does the repo keep all three?
2. Which file defines the Spring Boot entrypoint, and which file defines the main security filter chain?
3. What is the difference between staff authentication and patient authentication in terms of repositories, refresh-token scope, and cookie path?
4. Which public endpoints are intentionally unauthenticated, and where is that rule enforced?
5. What fields in `AppointmentCreateRequest` are required for a valid public booking, and which service actually locks slots?
6. How does the booking flow decide how many slots are needed for one appointment?
7. Which service changes an appointment from `CHECKED_IN` to `IN_PROGRESS`, and what transition is explicitly not allowed through that path?
8. What side effects happen when a doctor creates a medical record besides inserting the record itself?
9. How does a doctor retrieve patient history, and how is CCCD handled in storage versus lookup?
10. Why should you treat vital-signs persistence as a verify-first area right now?
11. Which patient-portal resources are read in the overview response, and which service assembles them?
12. Which endpoints are limited to accountant/admin roles, and which core service owns most finance behavior?
13. What is the relationship between `service_pricing` and invoice creation?
14. Which admin surfaces are handled by `AdminService`, and which are handled by `OperationsAdminService`?
15. What does the public chatbot actually do today, and what does it not do?
16. Why can an admin use the internal assistant only in docs mode, and where is that rule enforced?
17. What are the main storage tables behind the internal assistant knowledge system and conversation system?
18. Which tests give you the most confidence in the end-to-end clinical workflow, and which current red baseline item reduces trust in the test suite as a whole?
19. If a route starts returning `403`, what are the first two places you should inspect in the code?
20. If you had to choose a first starter ticket tomorrow, which repo issue would you pick and why?

## Self-Scoring Rubric

| Score | Meaning |
| --- | --- |
| 0 | Cannot locate the relevant code path or mixes up domains |
| 1 | Knows the general area but cannot name the controller/service/repository chain |
| 2 | Can name the main files and the broad logic |
| 3 | Can explain the flow, side effects, and known caveats clearly |

Recommended threshold before real feature work:
- average score `>= 2`
- no score of `0` on auth, booking, clinical workflow, or assistant questions

## Mentor Prompts
- Ask the intern to whiteboard the staff login flow.
- Ask the intern to trace public booking to reminder/email side effects.
- Ask the intern to explain why the internal assistant is more complex than the public chatbot.
- Ask the intern to identify one docs-vs-code mismatch and one tests-vs-code mismatch.

## Exit Condition
The intern is ready for a real ticket when they can:
- explain the platform by bounded context rather than by folder name alone
- navigate with GitNexus before grepping blindly
- name the controller, service, repository/entity, DTO, and test for a given feature
- distinguish proven behavior from assumed behavior
