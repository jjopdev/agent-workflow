---
description: Enforce full pipeline for all code tasks
applyTo: "**"
---

# Always Run Full Pipeline

Always run the full workflow pipeline for ANY task involving code changes — even single-file bug fixes.

The pipeline stages are: Plan → Implement → [Test ∥ Review] → Security (if applicable).

Only skip the pipeline for pure information queries (questions, explanations, documentation reads).