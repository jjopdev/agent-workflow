# Agent Workflow — Claude Code

A portable, multi-agent orchestration workflow for Claude Code based on the **Recursive Language Models** paper (arXiv:2512.24601). Drop it into any project — Next.js, React, ASP.NET MVC, .NET, Node.js, Python, Go, Rust, and more.

> **Also using GitHub Copilot?** See the [Copilot README](.github/README.md) for the parallel Copilot configuration.

---

## What This Is

This is **not** an application. It is a portable configuration that turns Claude Code into a Tech Lead orchestrator with specialized subagents. Copy `.claude/` and `CLAUDE.md` into any project to get a structured, cost-efficient development pipeline.

---

## Quick Start

```bash
# 1. Clone the workflow repo
git clone https://github.com/jjopdev/agent-workflow.git .agent-workflow

# 2. Copy the workflow files into your project
cd <your-project>
cp .agent-workflow/CLAUDE.md ./
cp -r .agent-workflow/.claude ./

# 3. (Optional) Install LSP plugins for real-time diagnostics
claude /plugin install typescript-lsp@claude-plugins-official   # TypeScript / Next.js
claude /plugin install csharp-lsp@claude-plugins-official       # C# / .NET
claude /plugin install pyright-lsp@claude-plugins-official      # Python

# 4. Start Claude Code — the workflow activates automatically
claude
```

For full setup options (including the Copilot variant), see [`SETUP.md`](SETUP.md).

---

## Architecture

```
CLAUDE.md                          ← Orchestrator brain (opus)
.claude/
├── agents/
│   ├── implementer.md             ← Code writing (sonnet)
│   ├── reviewer.md                ← Code review (sonnet)
│   ├── pr-reviewer.md             ← PR review (sonnet)
│   ├── tester.md                  ← Tests (sonnet)
│   ├── infra.md                   ← DevOps / CI-CD (sonnet)
│   └── security.md                ← OWASP review (opus)
├── rules/
│   ├── tech-lead.md               ← Universal quality principles
│   └── planning.md                ← Task decomposition rules
├── skills/
│   ├── workflow/                  ← /workflow — full pipeline trigger
│   ├── create-issue/              ← /create-issue — Notion + GitHub Issue
│   ├── review-pr/                 ← /review-pr — PR review
│   ├── lesson/                    ← /lesson — record learnings
│   ├── workflow-orchestrator/     ← Delegation protocol reference
│   ├── workflow-knowledge/        ← lessons.md + summaries.md
│   ├── codebase-navigator/        ← Project structure discovery
│   ├── rlm-codebase-navigation/   ← RLM navigation protocol
│   ├── github-cli/                ← gh CLI reference
│   ├── prompt-refiner/            ← Messy input → structured prompt
│   ├── skill-creator/             ← Create new skills
│   ├── interface-design/          ← UI/UX design system
│   ├── owasp-review/              ← Web security review (OWASP Top 10:2025)
│   └── owasp-mcp-review/          ← MCP / agent security review
├── settings.json                  ← Permissions, sandbox, stop hook
└── settings.local.json            ← Personal overrides (gitignored)
```

---

## Model Strategy (RLM)

The workflow is grounded in the [Recursive Language Models paper](https://arxiv.org/abs/2512.24601) (Zhang, Kraska & Khattab — MIT/Stanford, ICML 2025): an intelligent root model delegating to cheaper sub-models **outperforms a single expensive model in both quality and cost**.

| Agent | Model | Why |
|-------|-------|-----|
| Orchestrator | opus | Root LM — delegation quality determines pipeline quality |
| Implementer, Reviewer, PR Reviewer, Tester, Infra | sonnet | Cost-effective for daily coding |
| Security | opus | Never downgraded — security analysis requires maximum reasoning |
| Planner (built-in), Explorer (built-in) | haiku | Cheap read-only operations |

Model routing is **automatic** via agent frontmatter — no manual selection needed.

> **Cost logic:** Investing in the orchestrator reduces delegation errors and subagent rework. The paper shows the median cost of RLM (intelligent root + cheap subs) is comparable to or lower than using a single expensive model for everything.

---

## Task Pipeline

The orchestrator classifies every task and routes it to the appropriate path:

### Quick path — direct action, no delegation
- Questions, explanations, config changes
- Single-file typos or obvious bug fixes
- Documentation edits

### Standard path — focused delegation
- Bug fixes requiring investigation
- Single-feature implementations
- Code review of specific files

### Full pipeline — orchestrated workflow
Tasks touching 3+ files, refactors, architecture changes, or ambiguous requirements:

```
Plan (haiku)
  └─▶ Implement (sonnet)
        └─▶ Test (sonnet)
              └─▶ Review (sonnet)
                    └─▶ Security (opus) ← triggered automatically on auth/input/secrets
```

Force the full pipeline on any task:

```
/workflow <task description>
```

---

## Slash Commands

| Command | When to Use |
|---------|-------------|
| `/workflow <task>` | Force the full pipeline: Plan → Implement → Test → Review → Security |
| `/create-issue <summary>` | After analyzing a problem: documents to Notion + creates a GitHub Issue |
| `/review-pr <number>` | Review any PR — yours or a developer's — and post the result on GitHub |
| `/lesson [CATEGORY] <text>` | Record a lesson learned (`[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`) |

---

## Security Triggers

The security agent (opus, OWASP Top 10:2025) is invoked **automatically** when changes touch:

- Auth, sessions, tokens, middleware, or access control
- User input — forms, APIs, file uploads, URL params
- Environment variables, secrets, or security config
- Dependencies (added or updated)
- CORS, CSP, or security headers
- Data storage, encryption, or sensitive data
- Error handling or logging

---

## Security & Permissions

`settings.json` ships with a pre-configured permission model:

- **Sandbox:** OS-level isolation for bash commands (WSL2 required on Windows for full sandbox)
- **Accept Edits mode:** Auto-approves file edits to reduce approval fatigue
- **50+ allow rules:** git, gh, npm, dotnet, docker, kubectl, terraform, aws, gcloud, and more
- **30+ deny rules:** Blocks destructive commands, secret access, and network attack tools
- **Network allowlist:** GitHub, npm, NuGet, PyPI, crates.io, MDN, OWASP, Anthropic docs

---

## Learning System

The workflow accumulates knowledge across sessions:

| Step | What Happens |
|------|-------------|
| Session start | Orchestrator reads `lessons.md` headers to prime context |
| During work | Relevant lessons are filtered by category and passed to each subagent |
| After a correction | Orchestrator records a lesson with `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, or `[PERF]` |
| Stop hook | When you exit (`Ctrl+C`), Claude checks for uncaptured corrections and prompts to record them |

Lessons are stored in `.claude/skills/workflow-knowledge/lessons.md` and persist between sessions.

---

## Supported Stacks

The workflow is stack-agnostic. Agents discover the project stack by reading config files (`package.json`, `*.csproj`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc.) and adapt accordingly.

| Stack | Tools Available |
|-------|----------------|
| **JavaScript / TypeScript** | npm, npx, node, pnpm, yarn, bun, tsc, eslint, prettier, jest, vitest |
| **C# / .NET** | dotnet, msbuild, nuget |
| **Python** | python, pip, poetry, uv |
| **Go** | go |
| **Rust** | cargo |
| **DevOps** | docker, kubectl, terraform, aws, gcloud, az |

---

## LSP Plugins

Install for real-time diagnostics after edits and code navigation (jump to definition, find references):

| Plugin | Stack |
|--------|-------|
| `typescript-lsp` | Next.js, React, TypeScript |
| `csharp-lsp` | ASP.NET MVC, .NET Framework, .NET 10 |
| `pyright-lsp` | Python (Django, FastAPI, Flask) |
| `gopls-lsp` | Go |
| `rust-analyzer-lsp` | Rust |

Install via: `/plugin install <name>@claude-plugins-official`

---

## Monitoring

Configure in `.claude/settings.local.json` (gitignored, not committed):

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "console"
  }
}
```

The custom statusline shows real-time: model, cost, context %, and git status.

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Orchestrator identity, delegation protocol, and pipeline routing |
| `.claude/settings.json` | Security permissions, sandbox config, stop hook |
| `.claude/rules/tech-lead.md` | Universal quality principles applied to every agent |
| `.claude/rules/planning.md` | Task decomposition guidelines and limits |
| `workflow-model-strategy.md` | RLM scientific foundations and model assignment rationale |
| `GUIDE.md` | Step-by-step usage guide with real-world scenarios |
| `SETUP.md` | Installation and comparison: Claude Code vs Copilot |

---

## Historical Archive

The `.github/` directory contains the original GitHub Copilot configuration, preserved as a read-only archive. Do not modify it.
