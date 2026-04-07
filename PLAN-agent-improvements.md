# Plan: Agent Improvements Based on DeepWiki Claude Code Architecture

> **Status:** APPROVED — Ready to implement
> **Date:** 2026-04-06
> **Source:** deepwiki.com/zackautocracy/claude-code (Claude Code internal architecture)
> **Staff review:** Passed — only changes with concrete justification survived

## Context

The previous session upgraded the orchestrator framework (Tool Restrictions, Pipeline Gates, Stall Detection, Fallback Strategy, Post-session skill+hook). Those changes are **complete but uncommitted** in the working tree. This plan addresses the **next phase**: fixing gaps in individual agent definitions found by comparing our repo against Claude Code's actual architecture.

## Prerequisite

Before implementing this plan, commit the pending orchestrator changes first:
- `.claude/rules/tech-lead.md` — Orchestrator discipline section
- `.claude/settings.json` — Post-pipeline extraction hook
- `CLAUDE.md` — Tool Restrictions, Pipeline Gates, Stall Detection, Fallback Strategy
- `hooks/hooks.dev.json` — Post-pipeline hook replicated
- `skills/workflow-orchestrator/SKILL.md` — Budget & monitoring
- `skills/post-session/SKILL.md` — New /post-session skill

## Approved Changes (4 subtasks)

### 1. Fix Tester's missing WebFetch tool (BUG)
- **File:** `agents/tester.md`
- **Change:** Add `WebFetch` to frontmatter `tools` list (after `Grep`)
- **Why:** The body text (line 36) already instructs "Use WebFetch or existing test files as reference for testing framework APIs" but WebFetch is NOT in the tools list — the agent is told to use a tool it cannot access

### 2. Add `memory: project` to PR Reviewer (INCONSISTENCY)
- **File:** `agents/pr-reviewer.md`
- **Change:** Add `memory: project` to frontmatter (between `skills` and `tools`)
- **Why:** Every other agent with a `skills` field also has `memory: project`. PR Reviewer is the only one missing it

### 3. Add WebSearch to Security, Infra, and Implementer (CAPABILITY GAP)
- **Files:** `agents/security.md`, `agents/infra.md`, `agents/implementer.md`
- **Change per file:**
  - Add `WebSearch` to frontmatter `tools` list
  - Add brief usage note in the body: "Use WebSearch to discover relevant URLs (CVEs, docs, guides), then WebFetch to retrieve specific pages"
- **Why:** No agent can currently search the web — they can only fetch known URLs. Security needs CVE lookups, Infra needs cloud docs discovery, Implementer needs framework migration guides

### 4. Add NotebookEdit to Implementer and Tester (CONSISTENCY)
- **Files:** `agents/implementer.md`, `agents/tester.md`
- **Change per file:**
  - Add `NotebookEdit` to frontmatter `tools` list
  - Add brief note: "When the project uses Jupyter notebooks (.ipynb), use NotebookEdit to modify cells"
- **Why:** CLAUDE.md already says "NotebookEdit — delegate to Implementer" but the Implementer doesn't list the tool. Same gap for Tester with test notebooks

## Backlog (implement when justified by a real incident or use case)

| Item | Trigger to implement |
|------|---------------------|
| Worktree isolation docs | When parallel agent filesystem conflict actually occurs |
| PreToolUse safety hooks | When a subagent modifies a protected file |
| UserPromptSubmit hook for prompt-refiner | When vague prompts become a recurring problem |
| Background agent patterns docs | When we have a concrete `run_in_background` use case |

## Verification

After implementation:
1. Check all agent frontmatter is valid YAML (no syntax errors in `---` blocks)
2. Verify CLAUDE.md tool restrictions are consistent with agent tool lists
3. Run `git diff --stat` to confirm only expected files changed (should be 5 agent files)
4. Commit as a separate commit from the orchestrator changes
