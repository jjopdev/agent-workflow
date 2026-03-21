# GitHub Copilot Workflow

This is the GitHub Copilot configuration for the agent orchestration workflow.

## Quick Start

1. **Copy these files to your project:**
   ```bash
   mkdir -p .github/{agents,skills,instructions,tasks}
   cp copilot-instructions.md .github/
   cp -r agents/* .github/agents/
   cp -r skills/* .github/skills/
   cp -r instructions/* .github/instructions/
   cp -r tasks/* .github/tasks/
   ```

2. **Open VS Code with GitHub Copilot installed**
   ```bash
   code .
   ```

3. **Start using the workflow**
   - Copilot agents activate automatically
   - Read `.github/copilot-instructions.md` for the orchestration protocol

## How It Works

### Agents

| Agent | Role | Model |
|-------|------|-------|
| Orchestrator | Coordinates subagents, plans tasks | GPT-5.4 or Claude Opus 4.6 |
| Planner | Decomposes tasks into subtasks | GPT-5.4 |
| Implementer | Writes code | GPT-5.4 |
| Reviewer | Reviews code quality | GPT-5.4 |
| PR Reviewer | Reviews pull requests | GPT-5.4 |
| Tester | Writes and runs tests | GPT-5.4 |
| Scribe | Updates lessons, todo, summaries | GPT-5.4 |
| Security | OWASP Top 10 security review | Claude Opus 4.6 |

### Task Management

**Three files track your work:**

#### `.github/tasks/todo.md` — Active Tasks
```markdown
## Feature: OAuth callback error fix (#42)
- [ ] Investigate root cause
- [ ] Implement fix
- [ ] Write tests
- [ ] Code review
- [ ] Deploy
```

**When:** Update when starting/completing work
**Who:** Delegate writes to the Scribe agent

#### `.github/tasks/lessons.md` — Learnings
```markdown
### [SECURITY] OAuth callback validation
State parameter must be validated to prevent CSRF attacks
```

**When:** After any correction, failed approach, or discovery
**Who:** Delegate to Scribe agent via handoff:
```
TASK: Record lesson learned
ACTION: add_lesson
TARGET: lessons.md
CONTENT: "### [CATEGORY] Title — brief description"
CATEGORY: [SECURITY]
```

**Categories:** `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`

#### `.github/tasks/summaries.md` — Module Navigation Cache
```markdown
## Authentication Module
**Status:** Active
**Location:** `src/lib/auth/`
**Summary:** Handles OAuth, JWT validation, session management
**Last Updated:** 2025-03-21
```

**When:** After exploring a new area, to avoid re-analysis in future sessions
**Who:** Delegate to Scribe agent

### Workflow Steps

1. **Describe the problem** to the Orchestrator agent in VS Code
2. **Orchestrator decides the path:**
   - Quick fix? Handle directly
   - Multi-step task? Plan first
3. **Orchestrator delegates** using this protocol:
   ```
   TASK: [one-line description]
   COMPLEXITY: [low|medium|high]
   SKILLS: [paths to relevant skills, or "none"]
   CONTEXT_FILES: [codebase paths to read]
   LESSONS_FILTER: [lessons category to consult, or "none"]
   ACCEPTANCE: [verifiable criteria]
   CONSTRAINTS: [out-of-scope paths]
   ```
4. **Subagent completes** and returns:
   ```
   STATUS: [done|blocked|failed]
   ARTIFACTS: [files created/modified]
   ISSUES: [problems found]
   LESSONS: [new lessons to record]
   ```
5. **Delegate to Scribe** to update todo.md and lessons.md

### Skills

Located in `.github/skills/`. Each skill is a folder with `SKILL.md`:

- `codebase-navigator/` — Project structure discovery
- `github-cli/` — GitHub CLI reference
- `interface-design/` — UI/UX design system
- `owasp-review/` — Web security (OWASP Top 10)
- `owasp-mcp-review/` — MCP/agent security
- `prompt-refiner/` — Normalize messy input
- `rlm-codebase-navigation/` — RLM navigation protocol
- `skill-creator/` — Create new skills
- `workflow-orchestrator/` — Delegation protocol reference

### Cost Optimization (GitHub Copilot)

| Task | Model | Cost |
|------|-------|------|
| Simple analysis | Claude Haiku 4.5 | 0.33x |
| Most work | GPT-5.4 | 1x |
| Architecture deadlock | Claude Opus 4.6 | 3x |

**Tip:** Use **Auto** mode in VS Code for a 10% discount.

## Key Files

- `copilot-instructions.md` — Global instructions for all agents
- `agents/orchestrator.agent.md` — Root orchestrator definition
- `instructions/tech-lead-workflow.instructions.md` — Universal quality principles
- `skills/workflow-orchestrator/SKILL.md` — Delegation protocol details
- `tasks/lessons.md` — Accumulated organizational knowledge

## Rules

- **Plan first:** Any task with 3+ steps or architectural decisions requires planning
- **Test always:** Never mark complete without demonstrating it works
- **Record lessons:** After ANY correction, delegate to Scribe to update `lessons.md`
- **Delegate everything:** Orchestrator never implements directly — always delegate
- **Context minimization:** Pass only necessary info to each subagent

## What's Different from Claude Code?

| Feature | Copilot | Claude Code |
|---------|---------|-------------|
| **Task tracking** | `.github/tasks/todo.md` (manual) | TaskCreate/TaskUpdate (native) |
| **Lesson recording** | Delegate to Scribe | Automatic stop hook |
| **Agents** | 8 agents (Orchestrator, Planner, Scribe, etc.) | 6 agents (no Planner, Scribe) |
| **Skills location** | `.github/skills/` | `.claude/skills/` |
| **Setup** | Copy `.github/` folder | Copy `.claude/` folder + `CLAUDE.md` |

## Questions?

See the main [README.md](../README.md) for comparison with Claude Code workflow.
