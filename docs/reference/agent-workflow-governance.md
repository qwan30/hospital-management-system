# Agent Workflow Governance

**Status:** current development-workflow reference for the April 26, 2026 repository baseline.

This document classifies agent-related files as development workflow assets. They are not HMS product features, API capabilities, or runtime modules.

## 1. Workflow Assets

| Path | Classification | Notes |
| --- | --- | --- |
| `AGENTS.md` | active agent instructions | project-level coding and GitNexus workflow guidance |
| `CLAUDE.md` | active agent instructions | Claude-compatible instruction surface |
| `.instructions.md` | active agent instructions | additional workspace guidance |
| `.agents/` | development workflow asset | agents, skills, commands, rules, hooks, and MCP configs |
| `.agent/` | development workflow asset | additional skill assets |
| `.claude/` | development workflow asset | Claude/GitNexus skill references |
| `.codex/` | development workflow asset | Codex-local configuration/skills |
| `.codex-run/` | temporary/generated | not product documentation |
| `_bmad/` | development workflow/reference asset | planning workflow material |
| `_bmad-output/` | generated/reference output | not product source of truth unless curated |

## 2. Documentation Rules

- Do not describe agent workflow files as hospital product capabilities.
- Do not include agent command counts as product implementation metrics.
- Keep product docs focused on HMS backend, frontend, API, data, testing, and deployment behavior.
- If agent workflow behavior changes, update this file and `docs/09-agent-workflows/README.md`.

## 3. GitNexus Notes

The root `AGENTS.md` includes GitNexus instructions for code-intelligence workflows. Those instructions govern code-edit tasks, but this documentation pass did not edit application symbols.

## 4. Maintenance

When agent workflow assets are added, removed, or reorganized:

- update this classification table
- keep generated/temp folders out of product source-of-truth docs
- archive superseded workflow docs only when they are no longer referenced by active tooling
