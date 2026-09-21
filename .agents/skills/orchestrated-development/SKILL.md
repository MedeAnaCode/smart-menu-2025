---
name: orchestrated-development
description: Coordinate non-trivial software development work in this repository with implementation, testing, mandatory code review, and UI design input when the task has visual or UX ambiguity. Do not use for conversation, explanation, brainstorming, or other non-development requests.
---

# Orchestrated development

Use this skill for implementation, bug-fix, refactoring, test, migration, and other repository changes that benefit from coordinated agent work.

## Coordination

1. Inspect the working tree before acting and preserve unrelated changes.
2. Assign implementation to a developer for a bounded change.
3. Ask a tester to define acceptance checks and regression risks when behavior changes.
4. Ask a designer before finalizing a UI, layout, accessibility, or visual decision when the request is ambiguous or has material visual impact.
5. Obtain code review before every implementation commit. The reviewer must inspect the final worktree, not an earlier snapshot.
6. Do not have multiple agents edit the same files concurrently. The orchestrator resolves disagreements using the user request, existing project conventions, accessibility, and verification evidence.

## Delivery

- Run checks proportionate to the change and report environmental blockers precisely.
- Commit only the files belonging to the requested change; do not include unrelated staged or working-tree changes.
- In the final response, report the commit, changed files, verification, and any remaining limitation.

## Boundaries

- Do not use this skill for ordinary conversation, conceptual explanations, planning-only requests, or tasks without repository changes.
- Use the available agents and concurrency capacity; do not assume unavailable roles or tools exist.
- Follow higher-priority safety, permission, and project instructions.
