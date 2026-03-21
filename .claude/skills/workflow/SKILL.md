---
name: workflow
description: Force the full orchestration pipeline (Plan → Implement → Test → Review → Security) on any task. Use when you want the complete workflow regardless of task complexity.
disable-model-invocation: true
context: fork
agent: general-purpose
argument-hint: <task description>
---

# Full Workflow Pipeline

Execute the complete orchestration pipeline for the following task:

**Task:** $ARGUMENTS

## Pipeline Steps

### Step 1: Plan
Decompose the task into verifiable subtasks. For each subtask identify:
- What needs to change
- Which files are involved
- Acceptance criteria
- Dependencies on other subtasks

Present the plan and wait for user approval before proceeding.

### Step 2: Implement
For each subtask in the plan:
- Read the relevant files
- Implement the minimum necessary change
- Verify the change compiles/runs

### Step 3: Test
- Run existing tests to verify nothing is broken
- Write new tests for the changes if applicable
- Report test results

### Step 4: Review
- Review all changed files for quality, readability, and correctness
- Check for code duplication
- Verify naming conventions and patterns
- Report findings by priority (critical, warning, suggestion)

### Step 5: Security (conditional)
If the changes touch any of: auth, user input, APIs, secrets, dependencies, CORS, headers, data storage, encryption, error handling, or logging:
- Perform OWASP Top 10:2025 review on the changed files
- Report vulnerabilities by severity

## Rules
- If any step fails, stop and re-plan
- After completion, summarize what was done and any lessons learned
- Record any new lessons to .claude/skills/workflow-knowledge/lessons.md
