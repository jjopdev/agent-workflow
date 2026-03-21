# Agent Workflow

A multi-agent orchestration workflow based on the Recursive Language Models paper (arXiv:2512.24601). Choose the platform that works for you.

## What This Is

This is **not** an application. It's a portable configuration that turns your AI assistant into a Tech Lead orchestrator with specialized subagents. Clone it into any project to get a structured development pipeline.

Works with:
- **Claude Code** (Anthropic)
- **GitHub Copilot** (Microsoft/OpenAI)

---

## 🚀 Quick Start

### ➡️ Choose Your Platform

#### **Claude Code**
```bash
cp CLAUDE.md <your-project>/
cp -r .claude <your-project>/
cd <your-project>
claude
```
**→ See [`.claude/README.md`](.claude/README.md)** for workflow details

#### **GitHub Copilot**
```bash
mkdir -p <your-project>/.github/{agents,skills,instructions,tasks}
cp .github/* <your-project>/.github/
cd <your-project>
code .
```
**→ See [`.github/README.md`](.github/README.md)** for workflow details

#### **Can't Decide?**
**→ See [`SETUP.md`](SETUP.md)** for comparison table and guidance

---

## Architecture

Both platforms use the same **orchestration philosophy**: a root model coordinates specialized subagents.

### Claude Code Stack
```
CLAUDE.md (root orchestrator)
.claude/
├── agents/
│   ├── implementer.md      (code writing — Sonnet)
│   ├── reviewer.md         (code review — Sonnet)
│   ├── pr-reviewer.md      (PR review — Sonnet)
│   ├── tester.md           (test writing — Sonnet)
│   ├── infra.md            (DevOps — Sonnet)
│   └── security.md         (OWASP review — Opus)
├── rules/
│   ├── tech-lead.md        (universal principles)
│   └── planning.md         (decomposition rules)
├── skills/                 (15+ reusable skills)
└── settings.json           (permissions + security)
```

### GitHub Copilot Stack
```
.github/copilot-instructions.md (global instructions)
.github/
├── agents/
│   ├── orchestrator.agent.md    (root coordinator)
│   ├── planner.agent.md         (task decomposition)
│   ├── implementer.agent.md     (code writing)
│   ├── reviewer.agent.md        (code review)
│   ├── pr-reviewer.agent.md     (PR review)
│   ├── tester.agent.md          (test writing)
│   ├── scribe.agent.md          (documentation)
│   ├── infra.agent.md           (DevOps)
│   └── security.agent.md        (OWASP review)
├── instructions/
│   └── tech-lead-workflow.instructions.md
├── skills/                 (10+ reusable skills)
└── tasks/
    ├── todo.md             (active tasks)
    ├── lessons.md          (learnings)
    └── summaries.md        (cached analysis)
```

---

## Model Strategy (RLM Foundation)

Based on the paper: an intelligent root model delegating to cheaper sub-models **outperforms** a single expensive model in both quality and cost.

### Claude Code Models
| Role | Model | Why |
|------|-------|-----|
| Orchestrator (root) | Opus | Smart delegation reduces total cost |
| Implementer, Reviewer, Tester, Infra | Sonnet | Cost-effective daily coding |
| Security | Opus | Never downgraded |
| Planner, Explorer | Haiku | Cheap read-only operations |

### Copilot Models
| Tier | Models | When |
|------|--------|------|
| Economy | Claude Haiku 4.5 | 0.33x — simple analysis |
| Standard | GPT-5.4 | 1x — default for most work |
| Premium | Claude Opus 4.6 | 3x — architecture deadlocks only |

See [workflow-model-strategy.md](workflow-model-strategy.md) for the full theoretical foundation.

---

## Task Pipeline

Both platforms use the same pipeline structure:

**Quick** — Direct execution (typos, simple config changes)

**Standard** — Focused delegation (single feature or bug fix)

**Full** — Orchestrated workflow:
1. **Plan** → Decompose into verifiable subtasks
2. **Implement** → Write the code
3. **Test** → Write and run tests
4. **Review** → Quality review
5. **Security** → OWASP review (if auth/API/input/secrets involved)

---

## Shared Skills

Both platforms include these reusable skill modules:

| Skill | Description |
|-------|-------------|
| `codebase-navigator/` | Project structure discovery |
| `rlm-codebase-navigation/` | RLM navigation protocol |
| `github-cli/` | GitHub CLI reference |
| `owasp-review/` | Web security (OWASP Top 10) |
| `owasp-mcp-review/` | MCP/agent security review |
| `interface-design/` | UI/UX design system |
| `prompt-refiner/` | Normalize messy input |
| `skill-creator/` | Create new skills |
| `workflow-orchestrator/` | Delegation protocol reference |

**Plus platform-specific skills:**
- Claude Code: `create-issue/`, `review-pr/`, `lesson/`, `workflow/`, `workflow-knowledge/`
- Copilot: (built into agent definitions)

---

## Task Management

### Claude Code
- **Live tracking:** TaskCreate/TaskUpdate (session-only)
- **Persistent learning:** `.claude/skills/workflow-knowledge/lessons.md`
- **Auto-capture:** stop hook prompts for lessons on exit

### GitHub Copilot
- **Live tracking:** `.github/tasks/todo.md` (manual updates)
- **Persistent learning:** `.github/tasks/lessons.md` (delegate to Scribe)
- **Cached analysis:** `.github/tasks/summaries.md` (delegate to Scribe)

---

## Security & Permissions

### Claude Code
- **Sandbox:** OS-level isolation (WSL2 on Windows)
- **Auto-approve:** Edits are auto-approved (`acceptEdits` mode)
- **50+ allow rules:** git, npm, docker, dotnet, kubernetes, aws, etc.
- **30+ deny rules:** Blocks destructive commands, secrets, network attacks
- **Network allowlist:** GitHub, npm, NuGet, PyPI, docs sites only

### GitHub Copilot
- **Cost control:** Choose model tier per delegation
- **Skills:** Reference `.github/skills/` for domain-specific patterns
- **Lessons:** Accumulate knowledge in `.github/tasks/lessons.md`

---

## Supported Stacks

**Stack-agnostic.** Both workflows support:

| Stack | Tools |
|-------|-------|
| **JavaScript/TypeScript** | npm, pnpm, yarn, bun, TypeScript, Node.js |
| **C# / .NET** | dotnet, msbuild, nuget |
| **Python** | python, pip, poetry, uv |
| **Go** | go |
| **Rust** | cargo |
| **DevOps** | docker, kubernetes, terraform, aws, gcloud, azure |

---

## Learning System

Both platforms accumulate knowledge across sessions:

1. **Session start** → Read lessons headers
2. **During work** → Filter relevant lessons by category for each agent
3. **After correction** → Record lesson: `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`
4. **Persistent** → Lessons survive between sessions

---

## Documentation

| File | Audience | Content |
|------|----------|---------|
| `SETUP.md` | Choosing a platform | Comparison, installation, troubleshooting |
| `.claude/README.md` | Claude Code users | Workflow, slash commands, task tracking |
| `.github/README.md` | Copilot users | Agents, delegations, todo.md system |
| `CLAUDE.md` | Technical reference | Orchestrator protocol (Claude Code) |
| `GUIDE.md` | Daily usage | Step-by-step examples, scenarios |
| `workflow-model-strategy.md` | Theory | RLM foundations, model rationale |

---

## Key Principles (Both Platforms)

- **Plan first:** 3+ steps or architectural decisions → plan before implementing
- **Test always:** Never mark complete without demonstrating it works
- **Record lessons:** After corrections, failures, or discoveries
- **Delegate smartly:** Root LM coordinates, subagents focus
- **Context minimization:** Reference paths, don't inline full files
- **Security automatic:** Auth, APIs, user input → security review triggered

---

## Which Should You Choose?

### Use Claude Code if:
- You want lower costs (Sonnet for most work)
- You like native CLI + VS Code integration
- You work on multi-file features frequently
- You want automatic lesson capture (stop hook)

### Use Copilot if:
- You already have a Copilot subscription
- You prefer familiar agent-based workflows
- You like manual control over documentation
- You want to avoid CLI setup

### Use Both:
- **In different projects** ✅
- **In the same project** ❌ (choose one per project)

See [SETUP.md](SETUP.md) for detailed comparison.

---

## What's Different from Typical AI Workflows?

**Traditional:** You talk to one AI model that tries to handle everything.

**This workflow:** You (the Tech Lead) coordinate specialized AI agents:
- Each agent is optimized for one job (implement, review, test, etc.)
- You stay in control — you decide what to delegate
- Cheaper and more reliable than raw model power
- Knowledge compounds across sessions via lessons
- Built-in security review for sensitive changes

Based on research showing: **intelligent delegation outperforms brute-force scaling.**

---

## License

MIT

---

## Questions?

- **Getting started?** → [SETUP.md](SETUP.md)
- **Using Claude Code?** → [`.claude/README.md`](.claude/README.md)
- **Using Copilot?** → [`.github/README.md`](.github/README.md)
- **Day-to-day usage?** → [GUIDE.md](GUIDE.md)
- **Theory & foundations?** → [workflow-model-strategy.md](workflow-model-strategy.md)
