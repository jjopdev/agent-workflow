---
last-verified: 2026-03-14
copilot-pricing-source: https://docs.github.com/en/copilot/concepts/billing/copilot-requests#premium-requests
rlm-paper: https://arxiv.org/abs/2512.24601
---

# Workflow Model Strategy

> Current recommendation document for this repository, valid as long as the capabilities, pricing, and operational behavior described here remain unchanged.

Based on the official GitHub Copilot pricing (docs.github.com), the actual nature of each agent's work, and the findings of the **Recursive Language Models** paper (Zhang, Kraska & Khattab — MIT/Stanford, ICML 2025).

## Scientific Foundations — Recursive Language Models

The current recommendation for this workflow is grounded in the [Recursive Language Models](https://arxiv.org/abs/2512.24601) paper (arXiv:2512.24601), which shows that an intelligent root model that recursively delegates to cheaper sub-models **can outperform, in both performance and cost**, feeding all context into a single expensive model.

### Paper principles applied to the workflow

| RLM Principle | How the Workflow Applies It | Evidence from the Paper |
|---|---|---|
| **Intelligent Root LM + cost-tiered Sub-LMs** | Orchestrator = GPT-5.4 / Opus 4.6 (brain); subagents = GPT-5.4 as the 1x baseline, with Haiku 4.5 (0.33x) reserved for LOW cost-sensitive tasks | GPT-5 root + GPT-5-mini subs → median cost **lower** than a single expensive model |
| **Prompt as an environment variable** (do not load everything into context) | Orchestrator does not load the codebase; Explore subagent navigates selectively | RLM scales to **10M+ tokens** vs the base model's 272K window |
| **Symbolic recursion** (sub-LMs in programmatic loops) | Planner decomposes → Orchestrator delegates sequentially/in parallel to subagents | OOLONG: RLM **56.5%** vs Base 44.0% (+28.4%) |
| **Filtering with model priors** (regex/code before LLM calls) | Skills + lessons.md + summaries.md filter context before each sub-call | RLM filters without seeing the full context, reducing processed tokens |
| **No destructive context condensation** | summaries.md = navigation cache, not a substitute for the original context | Summary Agent: 70.5% vs RLM: **91.3%** on BrowseComp+ (1K docs) |
| **Cross-domain transfer** | lessons.md: errors discovered in one module prevent errors in others | Fine-tuning with 1,000 samples from a different domain → **+28.3%** cross-domain |

### Key results from the paper

- **RLM(GPT-5) on BrowseComp+ (1K docs, 6-11M tokens):** 91.3% vs Base Model 0% (does not fit in context) vs Summary Agent 70.5%
- **RLM(GPT-5) on OOLONG-Pairs:** Base GPT-5 achieves <0.1% F1 → RLM reaches **58.0%** F1 on information-dense tasks
- **Cost:** The median cost of RLM is **comparable to or lower** than a direct base-model call
- **Cross-domain:** Training with only 1,000 samples from an unrelated domain improves performance by **28.3%** on average in other domains
- **Relevant negative result:** Models without sufficient coding ability fail as RLMs → this supports Haiku 4.5 (0.33x) as the minimum floor rather than free models (GPT-4o, GPT-5 mini) that do not load skills reliably

### Why the Orchestrator is the Root LM

The central finding of the paper is that the **Root LM must be the strongest reasoning model**. Sub-LMs can be cheap because they execute bounded tasks, but the root decides:
- **What** to decompose and **how** to partition the problem
- **Who** should receive each subtask
- **When** to verify and **how** to integrate results

Saving on the root degrades the entire pipeline. That is why the current recommendation is for the Orchestrator to use **GPT-5.4 (400K ctx)** as the default baseline, with **Opus 4.6** reserved for explicit escalation on the hardest orchestration deadlocks.

## Current GitHub Copilot Costs and Operating Assumptions

| Tier | Models | Multiplier |
|------|---------|--------------|
| **Free (0x)** | GPT-4o, GPT-4.1, GPT-5 mini, Raptor mini | 0x |
| **Economy** | Claude Haiku 4.5, Gemini 3 Flash | 0.33x (~0.30x Auto) |
| **Standard** | Claude Sonnet 4.5/4.6, GPT-5.2/5.3-Codex/5.4 | 1x (0.9x Auto for Sonnet 4.5) |
| **Premium** | Claude Opus 4.5/4.6 | 3x |

### Auto mode (10% discount)
- Pool: GPT-4.1, GPT-5.2-Codex, GPT-5.3-Codex, Haiku 4.5, Sonnet 4.5, Grok Code Fast 1, Raptor mini
- Excludes models with a multiplier greater than 1.0 (Opus never enters Auto)
- Sonnet 4.5 in Auto drops to 0.9x; Sonnet 4.6 requires manual selection (1x)

### Manual model selection (current VS Code behavior)

As of the last verification date, GitHub Copilot in VS Code does **not** automatically
select models based on task complexity or agent configuration. The `model:` field in
agent frontmatter lists the **recommended** models, but the human operator must manually
select the active model in the Copilot UI.

The COMPLEXITY signal in the handoff protocol serves as guidance for the operator:
- `COMPLEXITY: low` → Operator selects Claude Haiku 4.5
- `COMPLEXITY: medium` → Operator selects GPT-5.4
- `COMPLEXITY: high` → Operator selects GPT-5.4 (escalate to Opus 4.6 only for explicit deadlocks)

This may change in future Copilot updates. If auto-selection becomes available,
the `model:` field in each agent definition should be updated to reflect the
automatic routing behavior.

## Optimization Principle

The current recommendation uses GPT-5.4 as the 1x baseline when the work requires more context, and reserves Haiku 4.5 for explicitly cost-sensitive LOW tasks.

| Type of work | Optimal model | Reason |
|---|---|---|
| **Orchestration (brain)** | GPT-5.4 (1x, 400K ctx) / Opus 4.6 (3x) | GPT-5.4 as the baseline; Opus only for explicit escalation |
| Read-only + reasoning | GPT-5.4 (1x, 400K ctx) | More context at the same 1x base cost |
| Read-only + broad context | GPT-5.4 (1x, 400K ctx) | Recommended baseline for multi-file or cross-module tasks |
| Code writing (medium) | GPT-5.4 (1x, 400K ctx) | Better repository context at the same base cost |
| Code writing (high) | GPT-5.4 (1x, 400K ctx) | Default baseline; Codex or Sonnet remain situational alternatives |
| Mechanical/boilerplate tasks | Haiku 4.5 (0.33x) | Reserved for LOW when cost is prioritized over context |
| Critical architecture | Opus 4.6 (3x manual) | Only for Staff Engineer-level deadlocks |

## Strategic Model and Agent Assignment

| Agent | Writes Code? | Low | Medium | High |
|---|---|---|---|---|
| **Orchestrator** | No (brain) | GPT-5.4 (1x, 400K ctx) | GPT-5.4 (1x, 400K ctx) | GPT-5.4 (1x, 400K ctx) |
| **Planner** | No | Haiku 4.5 | GPT-5.4 | GPT-5.4 (400K ctx) |
| **Implementer** | **YES** | Haiku 4.5 | GPT-5.4 | GPT-5.4 |
| **Reviewer** | No | Haiku 4.5 | GPT-5.4 | GPT-5.4 |
| **PR Reviewer** | No | Haiku 4.5 | GPT-5.4 | GPT-5.4 |
| **Tester** | Formulaic | Haiku 4.5 | GPT-5.4 | GPT-5.4 |
| **Infra** | Config | Haiku 4.5 | GPT-5.4 | GPT-5.4 |
| **Security** | No (review) | GPT-5.4 (1x) | GPT-5.4 (1x) | GPT-5.4 (1x) |

> **Note:** In the current recommendation, free models (GPT-4o, GPT-5 mini, Raptor mini) are not used in the workflow because their behavior with skills is not considered sufficiently reliable for this repository. Haiku 4.5 at 0.33x is treated as the current operating floor.

## Per-Agent Detail

### A. Orchestrator (Workflow Brain — Root LM)
Role: **It is the brain of the workflow.** It coordinates subagents, decides decomposition, and verifies results. Following the RLM paradigm, it acts as the Root LM and should be the strongest reasoning model because its decisions determine the quality of the entire pipeline.
- **Low:** GPT-5.4 (1x, 400K ctx) — even simple delegations require deciding who to delegate to and how to delegate correctly
- **Medium:** GPT-5.4 (1x, 400K ctx) — multi-agent coordination, reading summaries.md/lessons.md, structured handoff prompts
- **High:** GPT-5.4 (1x, 400K ctx) — default baseline for complex orchestration; escalate to Opus 4.6 (3x manual) only for explicit architecture deadlocks or cross-module integration conflicts
- **Justification:** The RLM paper shows that total cost is lower with an intelligent Root LM + cheap sub-LMs than with a mediocre model that creates more errors and rework

### B. Planner (Task Architect)
Role: Breaks requirements into verifiable steps and analyzes codebase dependencies.
- **Low:** Haiku 4.5 (0.33x) — simple features with <4 subtasks
- **Medium:** GPT-5.4 (1x) — standard decomposition when global context matters
- **High:** GPT-5.4 (1x) — cross-module decomposition in large codebases (400K ctx)

### C. Implementer (Code Writer)
Role: Implements minimal changes while following standards. This is the only agent where coding quality has a direct impact.
- **Low:** Haiku 4.5 (0.33x) — renaming, seed data, boilerplate, config
- **Medium:** GPT-5.4 (1x) — typical features and refactoring with more repository context
- **High:** GPT-5.4 (1x) — complex logic, debugging, and multi-file changes with broader context

### D. Reviewer & PR Reviewer (Quality and Security)
Role: Reviews correctness, security, architecture, and performance through diffs and the gh CLI.
- **Low:** Haiku 4.5 (0.33x) — style review, common mistakes, PRs under 100 lines
- **Medium:** GPT-5.4 (1x) — logic, pattern, and security review with more context
- **High:** GPT-5.4 (1x) — complex architecture, advanced security, and large diffs

### E. Tester (Validation and Errors)
Role: Writes and runs tests (unit tests, Playwright E2E) and diagnoses failures.
- **Low:** Haiku 4.5 (0.33x) — standard unit tests, boilerplate
- **Medium/High:** GPT-5.4 (1x) — tests with edge cases, E2E, and debugging when context matters
- Haiku remains available for LOW cases where savings matter more than context

### F. Infra (DevOps and Infrastructure)
Role: Manages cloud infrastructure, CI/CD, and terminal/Bash commands.
- **Low:** Haiku 4.5 (0.33x) — env vars, minor config, and simple checks
- **Medium/High:** GPT-5.4 (1x) — Docker, CI/CD, Terraform, and cloud architecture with broader context

### G. Security (OWASP Review)
Role: Performs deep security review based on OWASP Top 10:2025. Read-only with optional Snyk scans.
- **All complexities:** GPT-5.4 (1x, 400K ctx) — Security review is never downgraded
- **Justification:** Security analysis requires maximum context to trace data flows, auth chains, and injection vectors across the full codebase. Wider context directly reduces false negatives.

## Strategic Summary for Your Workflow
The **current recommendation** is for GPT-5.4 to be the 1x baseline for the main agents when the work needs more repository context. Opus 4.6 (3x) remains reserved for explicit Orchestrator escalations. Haiku 4.5 (0.33x) stays in place for LOW tasks where savings are prioritized. Free models remain outside this current recommendation because of operational reliability.

> **Cost logic (validated by the RLM paper):** Investing more in the Orchestrator (~5-10 additional requests per session) reduces delegation errors and subagent rework, resulting in a total cost that is comparable or lower. The paper shows that the median cost of RLM (intelligent root + cheap subs) is lower than using a single expensive model for everything.

## Continuous Learning System

Agents learn from each session through 3 persistent files in `.github/tasks/`:

| File | Purpose | Who uses it |
|---------|-----------|-------------|
| `todo.md` | Active tasks and session progress | Orchestrator (writes), everyone (reads) |
| `lessons.md` | Discovered errors and patterns, categorized | Orchestrator (writes), Planner/Implementer (consult through LESSONS_FILTER) |
| `summaries.md` | Cache of explored modules to avoid re-exploration | Orchestrator (writes/reads), Planner (reads) |

### Learning flow
1. **Session start:** Orchestrator reads summaries.md and the headers of lessons.md
2. **During the task:** Planner/Implementer consult filtered lessons.md by category
3. **After user correction:** Orchestrator records a lesson in lessons.md with category
4. **After exploration:** Orchestrator caches a summary in summaries.md
5. **If a module changes:** Mark it as `[STALE]` in summaries.md to force re-exploration

https://docs.github.com/en/copilot/concepts/billing/copilot-requests#premium-requests
https://docs.github.com/en/copilot/concepts/auto-model-selection

Zhang, Kraska & Khattab. "Recursive Language Models." arXiv:2512.24601, ICML 2025.
https://arxiv.org/abs/2512.24601
