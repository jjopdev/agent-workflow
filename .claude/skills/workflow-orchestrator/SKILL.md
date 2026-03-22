---
name: workflow-orchestrator
description: >
  Reference for the agent workflow pipeline and delegation protocol.
  Use this skill when working on any non-trivial development task as the pipeline
  protocol for planning, implementing, reviewing, and testing code.
user-invocable: false
---

# Workflow Orchestrator — Pipeline Reference

> The main delegation protocol, pipeline flow, and context rules live in `CLAUDE.md`.
> This skill provides the structured handoff templates and supplementary details.

## Structured Handoff Protocol

### Outbound (orchestrator -> subagent)

Every delegation must follow this structure:

```
TASK: [one-line description]
SKILLS: [full paths to relevant SKILL.md files, or "none"]
CONTEXT_FILES: [codebase paths the agent should read before starting]
LESSONS_FILTER: [lessons.md category to consult, or "none"]
ACCEPTANCE: [verifiable acceptance criteria]
CONSTRAINTS: [out-of-scope paths, specific restrictions]
```

### Inbound (subagent -> orchestrator)

Expect this return structure:

```
STATUS: [done|blocked|failed]
ARTIFACTS: [files created/modified, test results]
ISSUES: [problems found, if any]
LESSONS: [new lessons to record, if any]
```

## Skill System

### Layer 1: Personal skills (`~/.claude/skills/`)
Generic reusable patterns for any project (navigation, design guidelines, CLI reference, etc.)

### Layer 2: Project skills (`.claude/skills/`)
Specific patterns for the current codebase (module maps, conventions, env vars, etc.)

### Discovery protocol
1. At session start, list both directories and read only the frontmatter of each skill
2. For each delegation, select relevant skills based on the domain
3. Include full paths in the handoff's `SKILLS:`
4. Subagents read full content only of skills they receive (progressive disclosure)

## Rules

- If something goes wrong, STOP and re-plan. Don't keep forcing.
- After any user correction, record a lesson with category.
- Subagents do NOT inherit instructions — always pass context explicitly.
- Delegate ALL file writes to the appropriate subagent.
- Model routing is automatic via agent frontmatter — no manual selection needed.
