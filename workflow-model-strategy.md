---
last-verified: 2026-03-21
rlm-paper: https://arxiv.org/abs/2512.24601
stacks: [nextjs, react, aspnet-mvc, dotnet-framework, dotnet-10, nodejs, python, go, rust]
---

# Workflow Model Strategy

> Current recommendation document for this repository, valid as long as the capabilities and operational behavior described here remain unchanged.

Based on the actual nature of each agent's work and the findings of the **Recursive Language Models** paper (Zhang, Kraska & Khattab — MIT/Stanford, ICML 2025).

## Scientific Foundations — Recursive Language Models

The current recommendation is grounded in the [Recursive Language Models](https://arxiv.org/abs/2512.24601) paper (arXiv:2512.24601), which shows that an intelligent root model that recursively delegates to cheaper sub-models **can outperform, in both performance and cost**, feeding all context into a single expensive model.

### Paper principles applied to the workflow

| RLM Principle | How the Workflow Applies It | Evidence from the Paper |
|---|---|---|
| **Intelligent Root LM + cost-tiered Sub-LMs** | Orchestrator = opus (brain); subagents = sonnet as the coding baseline, with haiku for read-only tasks | Root + cheap subs → median cost **lower** than a single expensive model |
| **Prompt as an environment variable** (do not load everything into context) | Orchestrator does not load the codebase; Explore subagent navigates selectively | RLM scales to **10M+ tokens** vs the base model's context window |
| **Symbolic recursion** (sub-LMs in programmatic loops) | Planner decomposes → Orchestrator delegates sequentially/in parallel to subagents | OOLONG: RLM **56.5%** vs Base 44.0% (+28.4%) |
| **Filtering with model priors** (regex/code before LLM calls) | Skills + lessons.md filter context before each sub-call | RLM filters without seeing the full context, reducing processed tokens |
| **No destructive context condensation** | Navigation cache, not a substitute for the original context | Summary Agent: 70.5% vs RLM: **91.3%** on BrowseComp+ (1K docs) |
| **Cross-domain transfer** | lessons.md: errors discovered in one module prevent errors in others | Fine-tuning with 1,000 samples from a different domain → **+28.3%** cross-domain |

### Key results from the paper

- **RLM on BrowseComp+ (1K docs, 6-11M tokens):** 91.3% vs Base Model 0% (does not fit in context) vs Summary Agent 70.5%
- **RLM on OOLONG-Pairs:** Base achieves <0.1% F1 → RLM reaches **58.0%** F1 on information-dense tasks
- **Cost:** The median cost of RLM is **comparable to or lower** than a direct base-model call
- **Cross-domain:** Training with only 1,000 samples from an unrelated domain improves performance by **28.3%** on average in other domains

### Why the Orchestrator is the Root LM

The central finding is that the **Root LM must be the strongest reasoning model**. Sub-LMs can be cheap because they execute bounded tasks, but the root decides:
- **What** to decompose and **how** to partition the problem
- **Who** should receive each subtask
- **When** to verify and **how** to integrate results

Saving on the root degrades the entire pipeline. That is why the Orchestrator uses **opus** as the root model.

## Claude Code Integration

Claude Code natively routes models through agent frontmatter. Unlike the previous Copilot setup where a human operator manually selected models in the UI, Claude Code agents declare their model in their definition file and the system routes automatically.

Agent definitions in `agents/*.md` use YAML frontmatter:
```yaml
---
model: sonnet
---
```

The orchestrator session runs on **opus** (set in CLAUDE.md). Subagents declare their own model. This eliminates the need for COMPLEXITY signals in handoffs — model selection is built into the agent definition.

### Stack-agnostic design

The workflow is designed to work across any technology stack. Agents discover the project's stack by reading configuration files (`package.json`, `*.csproj`, `*.sln`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc.) and adapt their behavior accordingly. No stack-specific rules are hardcoded into the agents.

### Recommended LSP plugins

For enhanced code intelligence (auto-diagnostics after edits, jump to definition, find references), install the appropriate LSP plugin:

| Stack | Plugin | Binary |
|-------|--------|--------|
| TypeScript/Next.js | `typescript-lsp` | `typescript-language-server` |
| C#/.NET | `csharp-lsp` | `csharp-ls` |
| Python | `pyright-lsp` | `pyright-langserver` |
| Go | `gopls-lsp` | `gopls` |
| Rust | `rust-analyzer-lsp` | `rust-analyzer` |

Install via: `/plugin install <name>@claude-plugins-official`

## Optimization Principle

| Type of work | Optimal model | Reason |
|---|---|---|
| **Orchestration (brain)** | opus | Root LM — strongest reasoning for delegation decisions |
| Read-only exploration | haiku | Cheapest option for codebase discovery |
| Code writing | sonnet | Cost-effective with strong coding ability |
| Code review | sonnet | Sufficient reasoning for pattern and logic review |
| Security review | opus | Security analysis requires maximum reasoning — never downgraded |
| Planning/decomposition | haiku | Read-only task decomposition |
| Testing | sonnet | Test writing and execution |
| Infrastructure | sonnet | Config and CI/CD work |

## Strategic Model and Agent Assignment

| Agent | Writes Code? | Model | Rationale |
|---|---|---|---|
| **Orchestrator** | No (brain) | opus | Root LM — delegation quality determines pipeline quality |
| **Planner** | No | haiku | Read-only decomposition, cheap |
| **Implementer** | **YES** | sonnet | Cost-effective coding with strong ability |
| **Reviewer** | No | sonnet | Pattern and logic review |
| **PR Reviewer** | No | sonnet | Diff-based review |
| **Tester** | Formulaic | sonnet | Test writing and execution |
| **Infra** | Config | sonnet | DevOps and configuration |
| **Security** | No (review) | opus | Security is NEVER downgraded |

## Per-Agent Detail

### A. Orchestrator (Workflow Brain — Root LM)
Role: **The brain of the workflow.** Coordinates subagents, decides decomposition, verifies results. Acts as the Root LM per the RLM paradigm.
- **Model:** opus — even simple delegations require deciding who and how to delegate correctly
- **Justification:** The RLM paper shows total cost is lower with an intelligent Root LM + cheap sub-LMs than with a mediocre model that creates more errors and rework

### B. Planner (Task Architect)
Role: Breaks requirements into verifiable steps and analyzes codebase dependencies.
- **Model:** haiku — read-only task, no code generation needed

### C. Implementer (Code Writer)
Role: Implements minimal changes while following standards. The only agent where coding quality has direct impact.
- **Model:** sonnet — strong coding ability at cost-effective pricing

### D. Reviewer & PR Reviewer (Quality)
Role: Reviews correctness, architecture, and performance through diffs.
- **Model:** sonnet — sufficient reasoning for pattern detection and logic review

### E. Tester (Validation)
Role: Writes and runs tests, diagnoses failures.
- **Model:** sonnet — test writing benefits from coding ability

### F. Infra (DevOps)
Role: Manages infrastructure, CI/CD, and configuration.
- **Model:** sonnet — config and DevOps work

### G. Security (OWASP Review)
Role: Performs deep security review based on OWASP Top 10:2025. Read-only with structured reports.
- **Model:** opus — Security review requires maximum reasoning to trace data flows, auth chains, and injection vectors. Never downgraded.

## Strategic Summary
The Orchestrator and Security use **opus** for maximum reasoning. All coding agents use **sonnet** for cost-effective implementation. Read-only exploration and planning use **haiku** for minimum cost. Model routing is automatic via agent frontmatter — no manual selection needed.

> **Cost logic (validated by the RLM paper):** Investing more in the Orchestrator reduces delegation errors and subagent rework, resulting in a total cost that is comparable or lower. The paper shows that the median cost of RLM (intelligent root + cheap subs) is lower than using a single expensive model for everything.

## Continuous Learning System

Agents learn from each session through persistent files:

| File | Purpose | Who uses it |
|---------|-----------|-------------|
| `lessons.md` | Discovered errors and patterns, categorized | Orchestrator (writes), Planner/Implementer (consult) |

### Learning flow
1. **Session start:** Orchestrator reads lessons.md headers
2. **During the task:** Agents consult filtered lessons by category
3. **After user correction:** Orchestrator records a lesson with category
4. **Categories:** [DX], [ARCH], [SECURITY], [FAIL], [PERF]

Zhang, Kraska & Khattab. "Recursive Language Models." arXiv:2512.24601, ICML 2025.
https://arxiv.org/abs/2512.24601
