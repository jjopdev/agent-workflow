# Claude Code Workflow

This is the Claude Code configuration for the agent orchestration workflow.

## Quick Start

1. **Copy these files to your project root:**
   ```bash
   cp CLAUDE.md <your-project>/
   cp -r .claude/ <your-project>/
   ```

2. **Start Claude Code**
   ```bash
   cd <your-project>
   claude
   ```

3. **Start using the workflow**
   - Claude Code loads CLAUDE.md automatically
   - Workflow activates on first task

## How It Works

### Agents

| Agent | Role | Model |
|-------|------|-------|
| Orchestrator (you) | Coordinates subagents, smart delegation | Claude Opus 4.6 |
| Implementer | Writes code | Claude Sonnet 4.6 |
| Reviewer | Reviews code quality | Claude Sonnet 4.6 |
| PR Reviewer | Reviews pull requests | Claude Sonnet 4.6 |
| Tester | Writes and runs tests | Claude Sonnet 4.6 |
| Infra | DevOps, CI/CD, deployment | Claude Sonnet 4.6 |
| Security | OWASP Top 10 security review | Claude Opus 4.6 |
| Planner (built-in) | Decomposes tasks | Claude Haiku 4.5 |
| Explorer (built-in) | Codebase exploration | Claude Haiku 4.5 |

### Task Management

**Two mechanisms track your work:**

#### 1. TaskCreate / TaskUpdate (During Session)

Create tasks for tracking work in the current session:

```bash
TaskCreate({
  "subject": "Implement OAuth callback fix",
  "description": "Fix error 500 in Google OAuth callback, validate state parameter",
  "status": "pending"
})
```

**Progress tracking:**
- `TaskCreate` → creates task
- `TaskUpdate` with `status: "in_progress"` → marks active
- `TaskUpdate` with `status: "completed"` → marks done

**Scope:** Current session only. Tasks don't persist between sessions.

**When to use:** Complex features with 3+ subtasks, or work spanning multiple files.

#### 2. Lessons File (Persistent Learning)

`skills/workflow-knowledge/lessons.md` — survives between sessions

```markdown
## [SECURITY] OAuth callback state parameter validation
OAuth callbacks must validate the state parameter to prevent CSRF attacks.
Implement in `src/lib/auth/oauth-callback.ts` before any token exchange.

Why: OWASP A01:2021 — Broken Access Control
```

**When:** After corrections, failures, or important discoveries
**How:** Automatic via **stop hook** or manual with `/lesson [CATEGORY] description`

**Categories:** `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`

### Workflow Steps

1. **Describe the problem** to Claude Code (any language, natural)
   ```
   El cliente reporta error 500 en login con Google,
   parece que es en el callback de OAuth
   ```

2. **Claude investigates** (quick path) or **suggests planning** (complex path)

3. **You approve plan** (if planning needed)

4. **Run full pipeline** with `/workflow` or **delegate subtasks**:
   ```
   /workflow Implement OAuth callback fix
   ```
   This runs: Plan → Implement → [Test ∥ Review] → Security (if auth-related)

5. **Record lessons** at session end:
   - Manual: `/lesson [SECURITY] OAuth state validation required`
   - Automatic: Stop hook prompts after corrections/failures

### Agent Delegation

When delegating to a subagent (internal, not visible to you):

```
TASK: Implement OAuth callback error handling
SKILLS: skills/owasp-review/SKILL.md
CONTEXT_FILES: src/lib/auth/, src/api/oauth/
ACCEPTANCE: Error handling for all OAuth providers, state parameter validation
CONSTRAINTS: Don't modify other auth flows
```

**Models:**
- **Implementer/Reviewer/Tester/Infra:** Sonnet (fast, cost-effective)
- **Security:** Opus (never downgraded, always best available)
- **Planner/Explorer:** Haiku (cheap read-only operations)

### Slash Commands

| Command | Use |
|---------|-----|
| `/workflow <task>` | Run full pipeline: Plan → Implement → [Test ∥ Review] → Security |
| `/create-issue <summary>` | Document analysis in Notion + GitHub Issue |
| `/review-pr <number>` | Review a PR (your own or developer's) |
| `/lesson [CAT] <text>` | Record lesson with category `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]` |
| `/consolidate [--dry-run]` | Merge duplicate lessons, group by category, prune stale entries |

### Skills

Located in `skills/`. Each skill is a folder with `SKILL.md`:

**Shared with Copilot:**
- `codebase-navigator/` — Project structure discovery
- `github-cli/` — GitHub CLI reference
- `interface-design/` — UI/UX design system
- `owasp-review/` — Web security (OWASP Top 10)
- `owasp-mcp-review/` — MCP/agent security
- `prompt-refiner/` — Normalize messy input
- `rlm-codebase-navigation/` — RLM navigation protocol
- `skill-creator/` — Create new skills
- `workflow-orchestrator/` — Delegation protocol reference

**Claude Code only:**
- `create-issue/` — Notion + GitHub issue creation
- `review-pr/` — PR review workflow
- `lesson/` — Record learnings
- `workflow/` — Full pipeline trigger
- `workflow-knowledge/` — Lessons + summaries reference

### Cost Optimization

| Task Complexity | Model | Why |
|-----------------|-------|-----|
| Simple fix | Haiku | 0.33x cost, good for read-only |
| Most work | Sonnet | 1x cost, fast, handles 95% of tasks |
| Security review | Opus | Never compromise, always best available |
| Orchestration | Opus | Root LM makes smart delegation decisions |

**Result:** Intelligent delegation often costs less than a single Opus pass.

## Configuration

### settings.json (Shared)

- **Permissions:** 50+ allow rules (git, npm, dotnet, docker, etc.)
- **Deny rules:** 30+ security rules (blocks rm -rf, force push, secret access)
- **Network allowlist:** GitHub, npm, PyPI, NuGet, docs sites
- **Sandbox:** Enabled by default, WSL2 required on Windows
- **Auto-approve edits:** `defaultMode: "acceptEdits"`

### settings.local.json (Personal, Gitignored)

Add your personal overrides:
```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1"
  },
  "theme": "dark",
  "model": "claude-opus-4-6"
}
```

### Stop Hook (Automatic Learning)

When you stop Claude Code (`Ctrl+C`), the hook checks:
> "Was there a user correction or failed attempt?"

**If YES:** Prompts to record lesson in `skills/workflow-knowledge/lessons.md`
**If NO:** Stops cleanly

This ensures important discoveries are captured automatically.

## Key Files

- `../CLAUDE.md` (root) — Orchestrator brain
- `../GUIDE.md` (root) — Step-by-step usage guide
- `settings.json` — Shared security & permissions
- `rules/tech-lead.md` — Universal quality principles
- `rules/planning.md` — Task decomposition guidelines
- `../skills/workflow-knowledge/lessons.md` — Accumulated learnings
- `../agents/implementer.md` — Implementer instructions
- `../agents/security.md` — Security review protocol

## Rules

- **Plan first:** 3+ steps or architectural decisions → plan first
- **Test always:** Never mark complete without demonstrating it works
- **Record lessons:** /lesson records for next session
- **Delegate smartly:** Root LM (opus) coordinates, coders use sonnet
- **Context minimization:** Reference paths, don't inline full files
- **Security automatic:** Auth, APIs, user input → security review triggered

## What's Different from Copilot?

| Feature | Copilot | Claude Code |
|---------|---------|-------------|
| **Task tracking** | `.github/tasks/todo.md` (manual) | TaskCreate (session) |
| **Lesson recording** | Delegate to Scribe | Automatic stop hook |
| **Agents** | 8 (Orchestrator, Planner, Scribe...) | 6 + built-in Planner/Explorer |
| **Setup** | Copy `.github/` folder | Copy `.claude/` + `CLAUDE.md` |
| **Task files** | update via Scribe agent | native tools |

## Questions?

See the main [README.md](../README.md) for comparison with Copilot workflow.
