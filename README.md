<p align="center">
  <strong>Agent Workflow</strong><br>
  Multi-agent orchestration for Claude Code & GitHub Copilot
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://arxiv.org/abs/2512.24601"><img src="https://img.shields.io/badge/paper-arXiv%3A2512.24601-b31b1b.svg" alt="RLM Paper"></a>
  <img src="https://img.shields.io/badge/stack-agnostic-green.svg" alt="Stack Agnostic">
</p>

---

A portable configuration that turns Claude Code into a **Tech Lead orchestrator** with specialized subagents. Based on the [Recursive Language Models](https://arxiv.org/abs/2512.24601) paper (MIT/Stanford, ICML 2025) — an intelligent root model delegating to cheaper sub-models outperforms a single expensive model in both quality and cost.

Drop it into any project. No runtime dependencies. No framework lock-in.

## Why

- **Lower cost** — Opus orchestrates, Sonnet does the work, Haiku handles read-only tasks
- **Higher quality** — Specialized agents with focused context outperform a single overloaded prompt
- **Automatic security** — OWASP Top 10:2025 review triggers on auth, secrets, user input, and dependency changes
- **Persistent learning** — Lessons accumulate across sessions via stop hook and `/lesson` command
- **Stack-agnostic** — Works with TypeScript, .NET, Python, Go, Rust, and any stack with a CLI

## Quick Start

```bash
# Clone
git clone https://github.com/jjopdev/agent-workflow.git .agent-workflow

# Copy into your project
cd <your-project>
cp .agent-workflow/CLAUDE.md ./
cp -r .agent-workflow/.claude ./

# Start Claude Code — the workflow activates automatically
claude
```

> For full setup options (including the Copilot variant), see [`SETUP.md`](SETUP.md).

## Architecture

```
You (prompt)
 │
 ▼
┌─────────────────────────────┐
│  Orchestrator (opus)        │  ← CLAUDE.md — classifies tasks, delegates
│  ┌────────────────────────┐ │
│  │ Quick   → direct fix   │ │
│  │ Standard→ single agent │ │
│  │ Full    → pipeline ▼   │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
         │
         ▼
Plan (haiku) → Implement (sonnet) → Test (sonnet) → Review (sonnet) → Security (opus)
```

The orchestrator picks the lightest path that fits the task. Force the full pipeline with `/workflow <task>`.

## Model Strategy (RLM)

| Agent | Model | Rationale |
|-------|-------|-----------|
| Orchestrator | opus | Delegation quality determines pipeline quality |
| Implementer, Reviewer, PR Reviewer, Tester, Infra | sonnet | Cost-effective for daily coding |
| Security | opus | Never downgraded — maximum reasoning for security |
| Planner, Explorer | haiku | Cheap read-only operations |

## Slash Commands

| Command | Description |
|---------|-------------|
| `/workflow <task>` | Full pipeline: Plan → Implement → Test → Review → Security |
| `/create-issue <summary>` | Document to Notion + create GitHub Issue |
| `/review-pr <number>` | Review a PR and post results on GitHub |
| `/lesson [CATEGORY] <text>` | Record a lesson (`[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`) |

## Project Structure

```
CLAUDE.md                          ← Orchestrator brain
.claude/
├── agents/                        ← 6 specialized agents
│   ├── implementer.md               Code writing (sonnet)
│   ├── reviewer.md                  Code review (sonnet)
│   ├── pr-reviewer.md               PR review (sonnet)
│   ├── tester.md                    Tests (sonnet)
│   ├── infra.md                     DevOps / CI-CD (sonnet)
│   └── security.md                  OWASP review (opus)
├── rules/                         ← Quality & planning principles
├── skills/                        ← 14 reusable skills
│   ├── workflow/                    /workflow — full pipeline trigger
│   ├── create-issue/                /create-issue — Notion + GitHub Issue
│   ├── review-pr/                   /review-pr — PR review
│   ├── lesson/                      /lesson — record learnings
│   ├── owasp-review/                Web security (OWASP Top 10:2025)
│   ├── owasp-mcp-review/            MCP / agent security
│   └── ...                          and 8 more
└── settings.json                  ← Permissions, sandbox, hooks
```

## Security

The security agent runs automatically when changes touch auth, tokens, user input, secrets, dependencies, CORS, encryption, or error handling.

`settings.json` ships with:
- OS-level sandbox for bash commands
- 50+ allow rules (git, gh, npm, dotnet, docker, kubectl, terraform, aws...)
- 30+ deny rules (destructive commands, secret access, network attack tools)
- Network allowlist (GitHub, npm, NuGet, PyPI, crates.io, OWASP, Anthropic)

## Supported Stacks

| Stack | Tools |
|-------|-------|
| JavaScript / TypeScript | npm, pnpm, yarn, bun, tsc, eslint, prettier, jest, vitest |
| C# / .NET | dotnet, msbuild, nuget |
| Python | python, pip, poetry, uv |
| Go | go |
| Rust | cargo |
| DevOps | docker, kubectl, terraform, aws, gcloud, az |

## Documentation

| File | Description |
|------|-------------|
| [`CLAUDE.md`](CLAUDE.md) | Orchestrator identity, delegation protocol, pipeline routing |
| [`SETUP.md`](SETUP.md) | Installation guide — Claude Code & Copilot variants |
| [`GUIDE.md`](GUIDE.md) | Step-by-step usage with real-world scenarios |
| [`workflow-model-strategy.md`](workflow-model-strategy.md) | RLM scientific foundations and model rationale |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a pull request

## License

[MIT](LICENSE) — jjopdev
