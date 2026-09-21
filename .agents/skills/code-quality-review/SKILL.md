---
name: code-quality-review
description: Review implementation changes for correctness, maintainability, performance, scalable-but-proportionate architecture, cache behavior, and obsolete code. Use for code reviews and substantial implementation changes, not for prose-only or formatting-only edits.
---

# Code quality review

Review the final relevant worktree and diff before a development commit. Report evidence-backed findings; do not change code unless the user explicitly requests a fix.

## Review criteria

1. Check correctness, error handling, data ownership, API boundaries, and consistency with local project conventions.
2. Look for avoidable repeated work, unnecessary renders, expensive I/O, resource leaks, and inefficient data access.
3. When caching is present or proposed, check invalidation, stale data, memory growth, concurrency, and whether the cache has a demonstrated benefit. Do not recommend speculative caching or infrastructure that exceeds the project's needs.
4. Prefer a design that can grow with the likely project scope while remaining simple. Flag unnecessary abstractions, premature generalization, and dependencies that add more complexity than value.
5. Identify obsolete artifacts left by earlier iterations: dead branches, unused imports or helpers, duplicate paths, stale feature flags, unreachable code, and no-longer-used configuration or assets. Flag removal candidates only when their lack of use is supported by repository evidence.
6. Preserve the requested scope. Distinguish blocking defects from optional follow-up improvements.

## Review output

- List findings by priority with file and line references, impact, and a concrete remediation.
- State explicitly when no blocking or non-blocking findings remain.
- Confirm the review covered the final revision, not an earlier snapshot.
