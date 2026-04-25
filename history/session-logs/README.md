# Session Logs

Checkpoint files saving progress after each work session.

## File Naming
```
SESSION-{YYYYMMDD-HHMM}-{topic}.md
```

**Examples:**
- `SESSION-20260410-1430-frontend-redesign.md`
- `SESSION-20260410-0900-backend-api-fixes.md`
- `SESSION-20260410-1100-docs-update.md`

## Contents
Each session file tracks:
- Duration and focus area
- What was accomplished
- Blockers/issues encountered
- Files modified and commit hashes
- Test coverage impact
- Next session tasks

## Use Case
Quick reference of work history, blockers, and continuity between sessions without needing to trace git log or ask "what was done last time?"
