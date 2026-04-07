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

## Origin

This project was built by applying the RLM paper's own principles to its construction:

1. **[NotebookLM](https://notebooklm.google.com/)** — Used to analyze, summarize, and deeply understand the [Recursive Language Models paper](https://arxiv.org/abs/2512.24601) (MIT/Stanford, ICML 2025)
2. **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** — Used to design, implement, and iterate on the entire agent workflow system
3. **[GitHub Copilot CLI](https://docs.github.com/en/copilot)** — Used to test cross-platform compatibility and validate the Copilot agent variant

The workflow was dogfooded from day one — it was built using itself.

## Why

- **Lower cost** — Opus orchestrates, Sonnet does the work, Haiku handles read-only tasks
- **Higher quality** — Specialized agents with focused context outperform a single overloaded prompt
- **Automatic security** — OWASP Top 10:2025 review triggers on auth, secrets, user input, and dependency changes
- **Persistent learning** — Lessons accumulate across sessions via stop hook and `/lesson` command
- **Stack-agnostic** — Works with TypeScript, .NET, Python, Go, Rust, and any stack with a CLI

## Installation

Each target installs **only the files it needs** — no project metadata, benchmarks, or scripts.

### Claude Code

Inside an active Claude Code session, run:

```
/plugin marketplace add jjopdev/agent-workflow
/plugin install agent-workflow@jjopdev-agent-workflow
```

The first command registers this repo as a plugin marketplace; the second installs the `agent-workflow` plugin from it.

#### Using the Orchestrator

After installing the plugin, start Claude Code with the orchestrator agent:

```bash
claude --agent agent-workflow:orchestrator
```

Or set it as the default agent in your project's `.claude/settings.json`:

```json
{
  "agent": "agent-workflow:orchestrator"
}
```

### GitHub Copilot CLI

```bash
copilot plugin install jjopdev/agent-workflow:packages/copilot-cli
```

### VS Code Extension

Download the `.vsix` for your variant from [GitHub Releases](https://github.com/jjopdev/agent-workflow/releases):

| File | Agents |
|------|--------|
| `vscode-claude.vsix` | Claude Code agents (.md) |
| `vscode-copilot.vsix` | Copilot agents (.agent.md) |

```bash
code --install-extension vscode-claude.vsix
# or
code --install-extension vscode-copilot.vsix
```

> For full setup options, enterprise deployment, and local testing, see [`INSTALL.md`](INSTALL.md) and [`SETUP.md`](SETUP.md).

## Local Testing

Test a local checkout before publishing:

- **Claude Code:** `claude --plugin-dir /path/to/agent-workflow`
- **Copilot CLI:** `copilot plugin install ./dist/copilot-cli`
- **VS Code:** Open the repo in VS Code and press F5
- **Build all packages:** `bash scripts/build-dist.sh --target all`

## Architecture

```
You (prompt)
 │
 ▼
┌─────────────────────────────┐
│  Orchestrator (opus)        │  ← agents/orchestrator.md
│  ┌────────────────────────┐ │
│  │ Question → direct      │ │
│  │ Code change → pipeline │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
         │
         ▼
Plan (haiku) → Implement (sonnet) → ┬─ Test (sonnet)   ┬→ Security (opus)
                                     └─ Review (sonnet) ┘
```

Every code change runs the full pipeline. Test and Review run in parallel after Implement, then Security runs last. Questions and explanations are handled directly. Use `/workflow <task>` to make the pipeline intent explicit.

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
| `/workflow <task>` | Full pipeline: Plan → Implement → [Test ∥ Review] → Security |
| `/save-progress [state]` | Save current plan and progress to `.claude/progress.md` for session resumption |
| `/create-issue <summary>` | Document to Notion + create GitHub Issue |
| `/review-pr <number>` | Review a PR and post results on GitHub |
| `/lesson [CATEGORY] <text>` | Record a lesson (`[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`) |
| `/consolidate [--dry-run]` | Consolidate knowledge base: merge duplicate lessons, group by category, prune stale entries |

## Project Structure

```
CLAUDE.md                          ← Repo-specific config (imports orchestrator)
agents/                            ← 7 agents (canonical)
│   ├── orchestrator.md              Tech Lead coordinator (opus)
│   ├── implementer.md               Code writing (sonnet)
│   ├── reviewer.md                  Code review (sonnet)
│   ├── pr-reviewer.md               PR review (sonnet)
│   ├── tester.md                    Tests (sonnet)
│   ├── infra.md                     DevOps / CI-CD (sonnet)
│   └── security.md                  OWASP review (opus)
skills/                            ← 17 reusable skills (canonical)
│   ├── workflow/                    /workflow — full pipeline trigger
│   ├── save-progress/               /save-progress — persist work state
│   ├── owasp-review/                Web security (OWASP Top 10:2025)
│   └── ...                          and 12 more
.claude/
│   ├── rules/                     ← Quality & planning principles
│   └── settings.json              ← Permissions, sandbox, hooks
packages/                          ← Clean distribution packages
│   ├── claude-code/                 Claude Code plugin (37 files)
│   └── copilot-cli/                 Copilot CLI plugin (39 files)
```

## Security

The security agent runs automatically when changes touch auth, tokens, user input, secrets, dependencies, CORS, encryption, or error handling.

`settings.json` ships with:
- OS-level sandbox for bash commands
- 50+ allow rules (git, gh, npm, dotnet, docker, kubectl, terraform, aws...)
- 30+ deny rules (destructive commands, secret access, network attack tools)
- Network allowlist (GitHub, npm, NuGet, PyPI, crates.io, OWASP, Anthropic)

### Hooks

| Event | Type | Purpose |
|-------|------|---------|
| `SessionStart` | agent | Detects saved work in `.claude/progress.md` and notifies on resume |
| `Stop` | agent | Detects user corrections or failures and enforces lesson recording |

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
| [`CLAUDE.md`](CLAUDE.md) | Repo-specific config — imports `agents/orchestrator.md` |
| [`agents/orchestrator.md`](agents/orchestrator.md) | Orchestrator identity, delegation protocol, pipeline routing |
| [`INSTALL.md`](INSTALL.md) | Installation guide for all 4 targets |
| [`SETUP.md`](SETUP.md) | Setup guide — Claude Code & Copilot variants |
| [`GUIDE.md`](GUIDE.md) | Step-by-step usage with real-world scenarios |
| [`workflow-model-strategy.md`](workflow-model-strategy.md) | RLM scientific foundations and model rationale |

## Contributing

This project uses a fork-only workflow. See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Open a pull request against `main`

## License

[MIT](LICENSE) — jjopdev
