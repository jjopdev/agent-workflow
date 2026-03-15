---
name: rlm-codebase-navigation
description: Recursive Language Model protocol for efficient codebase exploration and navigation across any project.
---

# RLM Codebase Navigation

Based on the Recursive Language Model paradigm (arxiv 2512.24601): treat large codebases as external environments to navigate, not inline context to memorize.

## When to use this skill
- Exploring an unfamiliar codebase or module
- Planning changes that span multiple files or modules
- Delegating codebase analysis to subagents
- Any task where context window management matters

## Core Principles

### 1. Explore, don't inline
- Never read an entire file "to understand it" — read specific functions/exports
- Use search tools to find entry points, then trace only the relevant path
- Reference file paths in delegation prompts, don't paste file contents
- Let the agent write code to examine, decompose, and call itself recursively on specific fragments

### 2. Decompose by semantic boundaries
For changes spanning multiple files:
1. Identify **module boundaries** (e.g., data layer, auth, UI, API)
2. Within a module, identify **function/class boundaries**
3. Assign work per module boundary, not per file
4. If a change touches 3+ modules, decompose into sequential subtasks with explicit interfaces

### 3. Priority-based analysis order
Analyze any codebase in this order (adapt names to the project's structure):
1. **Types/interfaces** — what shapes are we working with?
2. **Schemas/validation** — what constraints exist?
3. **Data layer** — how is data stored and accessed?
4. **API/routes/handlers** — how is data exposed?
5. **UI/presentation** — how is data rendered?

### 4. Incremental analysis
When modifying existing code:
- Only re-analyze changed files and their **direct dependents**
- Use usage/reference search to find dependents, not full codebase scans
- Pass reviewers only changed files + immediate import graph

### 6. Fragment-level delegation
For large tasks across big codebases:
- Deploy separate agents on different code sections
- Use lightweight orchestration to coordinate outputs
- Cache intermediate summaries to avoid redundant processing
- When users modify code, re-analyze only affected fragments

## Navigation Heuristics

| Question | Action |
|----------|--------|
| "Where is X defined?" | Search codebase for the export/definition |
| "What uses X?" | Search for usages/references of the symbol |
| "What does this endpoint do?" | Read the handler, trace its imports |
| "How is data validated?" | Find schema/validation files |
| "How is this entity stored?" | Find the data layer module |
| "What styles apply here?" | Find CSS/style config files |

## Anti-patterns

- **Context stuffing**: Pasting entire files into prompts → use file paths instead
- **Speculative scanning**: Reading all directories "just in case" → read on demand
- **Monolithic analysis**: "Read the whole codebase first" → decompose by module
- **Stale context**: Using old summaries after modifications → mark as stale and refresh
- **Flat delegation**: Sending all context to every subagent → pass only what's needed

## Integration with Multi-Agent Workflows

When used with an Orchestrator pattern:
- The orchestrator applies RLM decomposition when planning tasks
- Each subagent receives only the relevant code fragment and context
- Summaries flow back to the orchestrator for caching
- Incremental analysis keeps the review scope minimal
