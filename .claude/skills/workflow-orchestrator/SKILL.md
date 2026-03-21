---
name: workflow-orchestrator
description: >
  Reference for the agent workflow pipeline, delegation protocol, and learning system.
  Use this skill when working on any non-trivial development task as the pipeline
  protocol for planning, implementing, reviewing, and testing code.
version: 2.0.0
---

# Workflow Orchestrator — Pipeline Reference

## Structured Handoff Protocol

### Outbound (orchestrator -> subagent)

Every delegation must follow this structure:

```
TASK: [one-line description]
COMPLEXITY: [low|medium|high]
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

### Complexity signal

Always include `COMPLEXITY` in the handoff:
- **low** — trivial delegations with small context
- **medium** — task spans files, modules, or broader repo context
- **high** — cross-module work, complex logic, architectural decisions

---

## Pipeline Flow

1. **Planning** — Delegate to `Planner`:
   - `TASK:` the feature/task to decompose
   - `SKILLS:` relevant project skill paths
   - `LESSONS_FILTER:` relevant lessons.md category

2. **Validation** — Review the plan. If not convincing, iterate with Planner.

3. **Implementation** — Delegate to `Implementer` and/or `Infra`:
   - `TASK:` specific subtask from approved plan
   - `COMPLEXITY:` signal for model selection
   - `SKILLS:` relevant paths
   - `CONTEXT_FILES:` key files to read before starting
   - `ACCEPTANCE:` verifiable criteria
   - `CONSTRAINTS:` out-of-scope paths

4. **Testing** — Delegate to `Tester`:
   - `ARTIFACTS:` files changed by the Implementer
   - `ACCEPTANCE:` behavior to verify

5. **Review** — Delegate to `Reviewer`:
   - `ARTIFACTS:` changed files
   - `SKILLS:` pattern skills to review against
   - `ACCEPTANCE:` original criteria

5b. **Security review (conditional)** — Delegate to `Security` when the change touches auth, sessions, APIs, user input, secrets, dependencies, CORS/CSP, error handling, or when the Reviewer flags security concerns.

6. **Closure** — Delegate to `Scribe` to update todo.md and record lessons.

---

## Context Minimization

When delegating to a subagent:
1. Pass ONLY the information necessary for that specific subtask
2. Reference file paths, don't paste file contents
3. Never forward the full conversation history to a subagent

Per agent context scope:
- **Planner:** feature description + relevant skill paths + lessons category
- **Implementer:** plan with specific subtask + file paths + skills + acceptance criteria
- **Reviewer:** changed files + acceptance criteria + project pattern skills
- **Security:** changed files + security-relevant context (auth, APIs, config)
- **Tester:** changed files + behavior to verify
- **Infra:** specific requirement + env vars or config involved

---

## Two-Layer Skill System

### Layer 1: Personal skills (`~/.claude/skills/`)
Generic reusable patterns for any project (navigation, design guidelines, CLI reference, etc.)

### Layer 2: Project skills (`.claude/skills/`)
Specific patterns for the current codebase (module maps, conventions, env vars, etc.)

### Discovery protocol
1. At session start, list both directories and read only the frontmatter of each skill
2. For each delegation, select relevant skills based on the domain
3. Include full paths in the handoff's `SKILLS:`
4. Subagents read full content only of skills they receive (progressive disclosure)

---

## Failure Handling Protocol

### Step 1: Retry with more context
Add additional `CONTEXT_FILES` or `SKILLS`. Include the error description from the failed attempt.

### Step 2: Retry with higher complexity
If the subagent was using low complexity, retry with medium/high.

### Step 3: Re-plan
Delegate back to Planner with the failure context. The original approach may have been wrong.

### Step 4: Escalate to user
If 2 re-plans fail on the same subtask, report to the user with what was attempted, what failed, and suggested alternatives.

### Recording failures
After ANY failure, delegate to Scribe to record a lesson in `.claude/skills/workflow-knowledge/lessons.md` with category `[FAIL]`.

---

## Learning System

- **Lessons:** `.claude/skills/workflow-knowledge/lessons.md` — format: `### [CATEGORY] Title`
- **Summaries:** `.claude/skills/workflow-knowledge/summaries.md` — cached module exploration
- **Scribe** owns all writes to workflow-knowledge files
- After any user correction, record a lesson immediately
- Consult lessons at session start and before implementing in a new domain

---

## Rules

- If something goes wrong, STOP and re-plan. Don't keep forcing.
- After any user correction, update lessons with category.
- Subagents do NOT inherit instructions — always pass context explicitly.
- Never implement directly — always delegate through Planner -> Implementer -> Reviewer.
- Delegate ALL file writes to the appropriate subagent.
