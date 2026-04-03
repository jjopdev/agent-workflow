---
name: workflow-knowledge
description: Use this skill to consult lessons learned, error patterns, and project knowledge before starting work or after encountering issues.
user-invocable: false
---

# Workflow Knowledge Base

This skill contains accumulated lessons and navigation summaries from the project workflow.

## Files
- `lessons.md` — Error patterns, pitfalls, and cross-domain insights categorized by [DX], [ARCH], [SECURITY], [FAIL], [PERF]
- `summaries.md` — Cached module exploration summaries (mark [STALE] when code changes)

## When to Consult
- At session start: scan lesson headers for relevant categories
- Before implementing: check for lessons related to the task domain
- After user correction: add a new lesson
- Before exploring a module: check if a cached summary exists
