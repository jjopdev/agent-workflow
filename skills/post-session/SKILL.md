---
name: post-session
description: >
  Extract lessons learned from the current session. Analyzes conversation for
  decisions, failures, user corrections, and patterns discovered. Classifies
  findings and appends unique lessons to the knowledge base. Use at end of
  session or after a pipeline run completes.
argument-hint: "[--auto]"
---

# /post-session — Session Lesson Extraction

Analyze the current conversation and extract actionable lessons for the knowledge base.

## Process

### Step 1: Scan conversation
Review the full conversation for:
- **Decisions made**: architectural choices, tool selections, approach changes mid-task
- **Failures encountered**: errors, failed attempts, timeouts, subagent stalls
- **User corrections**: moments where the user redirected, corrected, or refined the approach
- **Patterns discovered**: reusable techniques, project-specific conventions, or anti-patterns found

### Step 2: Classify findings
For each finding, assign exactly one category:
- `[DX]` — Developer experience, workflow improvements, tooling insights
- `[ARCH]` — Architecture decisions, patterns, module boundaries
- `[SECURITY]` — Security findings, vulnerabilities, hardening techniques
- `[FAIL]` — Failed approaches, what did not work and why
- `[PERF]` — Performance insights, optimization discoveries

### Step 3: Deduplicate
1. Read `skills/workflow-knowledge/lessons.md`
2. For each new finding, check if a similar lesson already exists (same category + 3 or more shared keywords)
3. If duplicate found: update existing entry only if the new information adds meaningful value; skip otherwise
4. If genuinely new: proceed to append

### Step 4: Append
For each new unique lesson, append to `skills/workflow-knowledge/lessons.md` using the established format:
```
- **[CATEGORY]** Actionable takeaway — context of what happened and how to avoid or replicate it
```

### Step 5: Report
Show the user a summary:
- Number of new lessons extracted
- Number of duplicates skipped or updated
- The exact lessons that were added (with category tags)

## Flags

- `--auto`: Skip user confirmation, append directly and report. Used by the post-pipeline Stop hook.
- No flag (default): Show findings and ask user to confirm before appending.

## Rules
- Keep each lesson to 1-2 lines — actionable, not narrative
- Maximum 5 lessons per extraction to avoid noise accumulation
- Only extract from corrections, failures, and genuine discoveries — NOT from routine successful operations
- If the session had no corrections, failures, or discoveries, report "No lessons to extract" and exit
- Always check for duplicates before appending — the knowledge base must stay lean
- Follow the exact format used in existing lessons.md entries
