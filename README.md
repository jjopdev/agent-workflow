# Agent Workflow

A generic, multi-agent orchestration workflow based on the Recursive Language Models paper (arXiv:2512.24601). Works across any stack: Next.js, React, ASP.NET MVC, .NET Framework, .NET 10, Node.js, Python, Go, Rust, and more.

Supports **two platforms**: [Claude Code](#claude-code-workflow) and [GitHub Copilot](#github-copilot-workflow).

## What This Is

This is **not** an application. It's a portable configuration that turns your AI assistant into a Tech Lead orchestrator with specialized subagents. Clone it into any project to get a structured development pipeline.

## Quick Start

### Claude Code

```bash
# 1. Clone into your project (or copy .claude/ and CLAUDE.md)
git clone https://github.com/jjopdev/agent-workflow.git .agent-workflow

# 2. Copy the workflow files into your project root
cp .agent-workflow/CLAUDE.md ./
cp -r .agent-workflow/.claude ./

# 3. (Optional) Copy the .gitignore entries
cat .agent-workflow/.gitignore >> .gitignore

# 4. Start Claude Code — the workflow activates automatically
claude
```

### GitHub Copilot (VS Code)

```bash
# 1. Clone into your project (or copy .github/ folder)
git clone https://github.com/jjopdev/agent-workflow.git .agent-workflow

# 2. Copy the workflow files
cp .agent-workflow/.github/copilot-instructions.md .github/
cp -r .agent-workflow/.github/agents .github/
cp -r .agent-workflow/.github/skills .github/
cp -r .agent-workflow/.github/instructions .github/
cp -r .agent-workflow/.github/tasks .github/

# 3. Open VS Code with GitHub Copilot — agents activate automatically
code .
```

## Architecture

Both platforms share the same orchestration philosophy: a root model (the orchestrator) delegates tasks to specialized subagents.

### Claude Code Workflow

```
CLAUDE.md                          ← Orchestrator brain (opus)
.claude/
├── agents/
│   ├── implementer.md             ← Code writing (sonnet)
│   ├── reviewer.md                ← Code review (sonnet)
│   ├── pr-reviewer.md             ← PR review (sonnet)
│   ├── tester.md                  ← Tests (sonnet)
│   ├── infra.md                   ← DevOps/CI-CD (sonnet)
│   └── security.md                ← OWASP review (opus)
├── rules/
│   ├── tech-lead.md               ← Universal quality principles
│   └── planning.md                ← Task decomposition rules
├── skills/                        ← 15+ reusable skill modules
├── settings.json                  ← Shared permissions + security
└── settings.local.json            ← Personal overrides (gitignored)
```

**Model strategy:**

| Role | Model | Why |
|------|-------|-----|
| Orchestrator (brain) | opus | Smart delegation reduces total cost |
| Implementer, Reviewer, Tester, Infra | sonnet | Cost-effective daily coding |
| Security | opus | Never downgraded |
| Explorer, Planner | haiku | Cheap read-only operations |

### GitHub Copilot Workflow

```
.github/
├── copilot-instructions.md        ← Global instructions
├── agents/
│   ├── orchestrator.agent.md      ← Root orchestrator
│   ├── planner.agent.md           ← Task decomposition
│   ├── implementer.agent.md       ← Code writing
│   ├── reviewer.agent.md          ← Code review
│   ├── pr-reviewer.agent.md       ← PR review
│   ├── scribe.agent.md            ← Documentation/lessons
│   ├── infra.agent.md             ← DevOps/CI-CD
│   └── security.agent.md          ← OWASP review
├── instructions/
│   └── tech-lead-workflow.instructions.md
├── skills/                        ← 10+ reusable skill modules
└── tasks/
    ├── todo.md                    ← Active tasks
    ├── lessons.md                 ← Accumulated learnings
    └── summaries.md               ← Module summaries
```

**Model strategy (GitHub Copilot):**

| Tier | Models | Multiplier | Use for |
|------|--------|------------|---------|
| Economy | Claude Haiku 4.5 | 0.33x | Simple reasoning, trivial analysis |
| Standard | GPT-5.4 | 1x | Default baseline for most work |
| Premium | Claude Opus 4.6 | 3x | Hardest orchestration or architecture |

## RLM Foundation

Based on the paper: an intelligent root model delegating to cheaper sub-models **outperforms** a single expensive model in both quality and cost (91.3% on BrowseComp+).

Key insight: invest compute in **smart delegation** (the orchestrator), not in raw model power for every task.

See [workflow-model-strategy.md](workflow-model-strategy.md) for the full theoretical foundation.

## Task Pipeline

The orchestrator classifies tasks and routes them:

**Quick** (direct) — Questions, typos, small config changes. No subagents.

**Standard** (focused) — Bug fixes, single features. Delegates to 1-2 agents.

**Full pipeline** (orchestrated) — Multi-file features, refactors, architecture changes:
1. **Plan** → Decompose into verifiable subtasks
2. **Implement** → Write the code
3. **Test** → Write and run tests
4. **Review** → Quality review
5. **Security** → OWASP review when security-sensitive

## Slash Commands (Claude Code)

| Command | When to Use |
|---------|-------------|
| `/workflow <task>` | Force the full pipeline: Plan → Implement → Test → Review → Security |
| `/create-issue <summary>` | After analyzing a problem: documents to Notion + GitHub Issue |
| `/review-pr <number>` | Review a PR (your own or a developer's) |
| `/lesson [CATEGORY] <text>` | Record a lesson learned |

## Skills

Both platforms include reusable skill modules:

| Skill | Shared | Description |
|-------|--------|-------------|
| `codebase-navigator` | Both | Project structure discovery |
| `rlm-codebase-navigation` | Both | RLM navigation protocol |
| `github-cli` | Both | gh CLI reference |
| `owasp-review` | Both | Web security review (OWASP Top 10) |
| `owasp-mcp-review` | Both | MCP/agent security review |
| `interface-design` | Both | UI/UX design system |
| `prompt-refiner` | Both | Messy input → structured prompt |
| `skill-creator` | Both | Create new skills |
| `workflow-orchestrator` | Both | Delegation protocol reference |
| `create-issue` | Claude Code | Notion + GitHub issue creation |
| `review-pr` | Claude Code | PR review workflow |
| `lesson` | Claude Code | Record learnings |
| `workflow` | Claude Code | Full pipeline trigger |
| `workflow-knowledge` | Claude Code | Lessons + summaries |

## Security & Permissions (Claude Code)

- **Sandbox**: OS-level isolation for bash commands
- **Accept Edits mode**: Auto-approves file edits, reduces approval fatigue
- **50+ allow rules**: git, gh, npm, dotnet, docker, kubectl, terraform, aws, gcloud, etc.
- **30+ deny rules**: Blocks destructive commands, secrets access, network attack tools
- **Network allowlist**: Only approved domains (GitHub, npm, NuGet, PyPI, docs sites)

## Supported Stacks

The workflow is stack-agnostic. Settings include tools for:

| Stack | Tools |
|-------|-------|
| **JavaScript/TypeScript** | npm, npx, node, pnpm, yarn, bun, tsc, eslint, prettier, jest, vitest |
| **C# / .NET** | dotnet, msbuild, nuget |
| **Python** | python, pip, poetry, uv |
| **Go** | go |
| **Rust** | cargo |
| **DevOps** | docker, kubectl, terraform, aws, gcloud, az |

## Recommended Plugins (Claude Code)

Install via `/plugin install <name>@claude-plugins-official`:

| Plugin | For |
|--------|-----|
| `typescript-lsp` | Next.js, React, TypeScript |
| `csharp-lsp` | ASP.NET MVC, .NET Framework, .NET 10 |
| `gopls-lsp` | Go projects |
| `rust-analyzer-lsp` | Rust projects |
| `pyright-lsp` | Python projects |

## Learning System

The workflow accumulates knowledge across sessions:

1. **Session start** → Read lesson headers
2. **During work** → Filter relevant lessons by category for each subagent
3. **After correction** → Record lesson with category: `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`
4. **Stop hook** (Claude Code) → Automatically prompts for lesson recording

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Claude Code orchestrator brain and delegation protocol |
| `.claude/settings.json` | Security, permissions, sandbox, hooks |
| `.claude/rules/tech-lead.md` | Universal quality principles (Claude Code) |
| `.github/copilot-instructions.md` | GitHub Copilot global instructions |
| `.github/agents/orchestrator.agent.md` | Copilot orchestrator agent |
| `.github/instructions/tech-lead-workflow.instructions.md` | Universal quality principles (Copilot) |
| `workflow-model-strategy.md` | RLM foundations and model rationale |
| `GUIDE.md` | Step-by-step usage guide |

## License

MIT
