# Follow-up Reminder Workflow

## Scheduling rule
- A follow-up reminder is scheduled only after the doctor confirms a follow-up date in the medical record.
- Reminder jobs use the stored follow-up date and should not invent or infer a new appointment date.

## Reminder timing
- The standard reminder window is one day before the follow-up appointment at 08:00 local hospital time.
- If a follow-up date is removed or changed, the reminder plan must be recalculated from the latest saved record.

## Operational safety
- Reminder delivery must not block medical record completion.
- If reminder delivery fails, the failure is logged and can be retried without changing the medical record.
