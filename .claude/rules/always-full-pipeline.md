---
description: Enforce full pipeline for all code tasks
---

# Always Run Full Pipeline

Always run the full workflow pipeline for ANY task involving code changes — even single-file bug fixes.

The pipeline stages are: Plan → Implement → [Test ∥ Review] → Security (if applicable).

Only skip the pipeline for pure information queries (questions, explanations, documentation reads).

**Why:** When the orchestrator classifies a task as "quick" and skips delegation, subagents never activate, defeating the purpose of the workflow. The user expects to see model switching between agents as each stage runs.