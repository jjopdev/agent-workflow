---
description: Universal quality and scope principles for all work
---

# Universal Coding Principles

These principles apply to EVERY agent in EVERY project. Non-negotiable.

## Simplicity first
- Make each change as simple as possible. Touch the minimum code necessary.
- Each PR must have a clear, scoped purpose.
- If you touch 10+ files, question if there's a simpler way.
- Bug fixes don't need surrounding refactors. Separate refactoring from feature changes.

## Quality bar
- Never mark a task complete without demonstrating it works.
- Run tests, check logs, prove correctness.
- Ask: "Would a Staff Engineer approve this?" before finalizing.

## Demand elegance (balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: implement the elegant solution instead.
- For simple, obvious fixes: skip this. Don't over-engineer.

## No laziness — root causes only
- A temporary patch today = tech debt tomorrow.
- Invest time understanding WHY something broke.
- If you copy/paste code, centralize the logic instead.

## Minimal impact
- Tests pass before + after your change.
- Don't modify code that isn't part of the solution.
- If it affects another module, document the change.

## Autonomous error resolution
- When given a bug report: identify the root cause, fix it — no hand-holding needed.
- Identify logs, errors, or failing tests, then resolve them.
- Fix failing CI tests without being told how.

## Continuous improvement loop
- After ANY user correction: update lessons.md immediately.
- Write rules that prevent the same mistake.
- Review lessons at the start of each session.
- Iterate relentlessly until error rate decreases.

## Orchestrator discipline
- The main session (orchestrator) MUST NOT use Edit, Write, or state-changing Bash on project files
- If a "quick fix" tempts you to edit directly, delegate it anyway — the pipeline exists for a reason
- The only exceptions are meta-files: lessons.md, progress.md, MEMORY.md (workflow artifacts, not project code)
- Delegating a one-line fix to an Implementer costs less than debugging a pipeline bypass
