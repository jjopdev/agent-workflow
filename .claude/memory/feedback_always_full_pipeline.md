---
name: Always run full pipeline for code tasks
description: User wants every development task (bugs, features, refactors) to run the full Plan→Implement→Test→Review→Security pipeline, never skip stages
type: feedback
---

Always run the full workflow pipeline for ANY task involving code changes — even single-file bug fixes.

**Why:** The user observed that when the orchestrator classified a task as "quick" or "standard", it skipped delegation and the subagents never activated. This defeated the purpose of the workflow. The user expects to always see the model switch between opus/sonnet/haiku as agents are delegated.

**How to apply:** When a user describes a bug or development task (e.g., "there's an error in login, trace from view → controller → queries"), always:
1. Plan first (decompose the investigation/fix flow)
2. Implement via subagent
3. Test via subagent
4. Review via subagent
5. Security if applicable

Only skip the pipeline for pure information queries (questions, explanations, doc reads).
