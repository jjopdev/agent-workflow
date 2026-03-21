---
description: Task decomposition and planning guidelines
globs: ["**"]
---

# Planning Rules

## Decomposition limits
- Maximum 8 subtasks per feature. If more are needed, split into multiple features.
- Each subtask must have verifiable acceptance criteria (testable, observable, or diffable).
- If a subtask cannot be verified, it is too vague — refine it.

## Dependency identification
- Before implementation, identify dependencies between subtasks.
- Mark which subtasks can run in parallel vs which must be sequential.
- If subtask B depends on subtask A's output, make that explicit.

## Priority order
Follow this analysis order for any task:
1. **Types/interfaces** — define shapes first
2. **Schemas/validation** — establish constraints
3. **Data layer** — how is data accessed?
4. **API/routes** — how is data exposed?
5. **UI/presentation** — how is it rendered?

## Incremental analysis
- After each implementation round, get the list of changed files.
- For each changed file, find direct dependents.
- Pass ONLY changed files + dependents to the Reviewer.

## Planning triggers
- ANY non-trivial task (more than 3 steps or architectural decisions) requires prior planning.
- If something goes wrong, STOP and re-plan immediately — don't keep forcing.
- Use planning mode for verification steps too, not just building.

## Plan validation
- Review the plan before starting implementation.
- If the plan is not convincing, iterate before proceeding.
- Write detailed specs upfront to reduce ambiguity.
