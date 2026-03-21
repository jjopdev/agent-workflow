# Agent Workflow — Claude Code

A generic, multi-agent orchestration workflow for Claude Code based on the Recursive Language Models paper (arXiv:2512.24601). Works across any stack: Next.js, React, ASP.NET MVC, .NET Framework, .NET 10, Node.js, Python, Go, Rust, and more.

## What This Is

This is **not** an application. It's a portable configuration that turns Claude Code into a Tech Lead orchestrator with specialized subagents. Clone it into any project to get a structured development pipeline.

## Quick Start

```bash
# 1. Clone into your project (or copy .claude/ and CLAUDE.md)
git clone <this-repo> .agent-workflow

# 2. Copy the workflow files into your project root
cp .agent-workflow/CLAUDE.md ./
cp -r .agent-workflow/.claude ./

# 3. Install recommended plugins (optional)
# For TypeScript/Next.js projects:
/plugin install typescript-lsp@claude-plugins-official

# For C#/.NET projects:
/plugin install csharp-lsp@claude-plugins-official

# 4. Start Claude Code — the workflow activates automatically
claude
```

## Architecture

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
├── skills/
│   ├── workflow/                   ← /workflow — full pipeline
│   ├── create-issue/               ← /create-issue — Notion + GitHub
│   ├── review-pr/                  ← /review-pr — PR review
│   ├── lesson/                     ← /lesson — record learnings
│   ├── workflow-orchestrator/      ← Delegation protocol reference
│   ├── workflow-knowledge/         ← Lessons + summaries
│   ├── codebase-navigator/         ← Project structure discovery
│   ├── rlm-codebase-navigation/    ← RLM navigation protocol
│   ├── github-cli/                 ← gh CLI reference
│   ├── prompt-refiner/             ← Messy input → structured prompt
│   ├── skill-creator/              ← Create new skills
│   ├── interface-design/           ← UI/UX design system
│   ├── owasp-review/               ← Web security review
│   └── owasp-mcp-review/           ← MCP/agent security review
├── settings.json                   ← Shared permissions + security
└── settings.local.json             ← Personal overrides (gitignored)
```

## Model Strategy (RLM)

Based on the paper: an intelligent root model delegating to cheaper sub-models **outperforms** a single expensive model in both quality and cost.

| Role | Model | Why |
|------|-------|-----|
| Orchestrator (brain) | opus | Smart delegation reduces total cost |
| Implementer, Reviewer, Tester, Infra | sonnet | Cost-effective daily coding |
| Security | opus | Never downgraded |
| Explorer, Planner | haiku | Cheap read-only operations |

## Slash Commands

| Command | When to Use |
|---------|-------------|
| `/workflow <task>` | Force the full pipeline: Plan → Implement → Test → Review → Security |
| `/create-issue <summary>` | After analyzing a problem: documents to Notion + GitHub Issue |
| `/review-pr <number>` | Review a PR (your own or a developer's) |
| `/lesson [CATEGORY] <text>` | Record a lesson learned |

## Task Pipeline

The orchestrator classifies tasks and routes them:

**Quick** (direct) — Questions, typos, small config changes. No subagents.

**Standard** (focused) — Bug fixes, single features. Delegates to 1-2 agents.

**Full pipeline** (orchestrated) — Multi-file features, refactors, architecture changes:
1. **Plan** (haiku) → Decompose into verifiable subtasks
2. **Implement** (sonnet) → Write the code
3. **Test** (sonnet) → Write and run tests
4. **Review** (sonnet) → Quality review
5. **Security** (opus) → OWASP review when security-sensitive

## Security & Permissions

- **Sandbox**: OS-level isolation for bash commands (WSL2 required on Windows for full sandbox)
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

## Recommended Plugins

Install via `/plugin install <name>@claude-plugins-official`:

| Plugin | For |
|--------|-----|
| `typescript-lsp` | Next.js, React, TypeScript — auto-diagnostics + navigation |
| `csharp-lsp` | ASP.NET MVC, .NET Framework, .NET 10 — type errors + go-to-definition |
| `gopls-lsp` | Go projects |
| `rust-analyzer-lsp` | Rust projects |
| `pyright-lsp` | Python projects |

These give Claude real-time type checking after edits and code navigation (jump to definition, find references) without grep.

## Monitoring

Configure in `.claude/settings.local.json` (gitignored):

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "console"
  }
}
```

Custom statusline shows real-time: model, cost, context %, git status.

## Learning System

The workflow accumulates knowledge across sessions:

1. **Session start** → Read lesson headers from `lessons.md`
2. **During work** → Filter relevant lessons by category for each subagent
3. **After correction** → Record lesson with category: `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`
4. **Stop hook** → Automatically prompts for lesson recording on corrections/failures

## Historical Archive

The `.github/` directory contains the original GitHub Copilot configuration. It is preserved as a read-only archive — do not modify it.

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Orchestrator brain and delegation protocol |
| `.claude/settings.json` | Security, permissions, sandbox, hooks |
| `.claude/rules/tech-lead.md` | Universal quality principles |
| `.claude/rules/planning.md` | Task decomposition guidelines |
| `workflow-model-strategy.md` | RLM foundations and model rationale |
| `GUIDE.md` | Step-by-step usage guide |
