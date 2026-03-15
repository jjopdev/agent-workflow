---
name: Tech Lead Workflow
description: Universal quality and scope principles — applies to all agents
applyTo: "**"
---

# Universal Coding Principles

These principles apply to EVERY agent in EVERY project. Non-negotiable.

## Simplicity first
- Make each change as simple as possible. Touch the minimum code necessary.
- Each PR must have a clear, scoped purpose.
- If you touch 10+ files, question if there's a simpler way.
- Bug fixes don't need surrounding refactors. Simple features don't need extra configurability.
- Separate refactoring from feature changes (different PRs).

## Quality bar
- Never mark a task complete without demonstrating it works.
- Run tests, check logs, prove correctness.
- Ask: "Would a Staff Engineer approve this?" before finalizing.

## Demand elegance (balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
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
- When given a bug report: identify the root cause, fix it — no hand-holding needed from user.
- Identify logs, errors, or failing tests, then resolve them.
- Go fix failing CI tests without being told how.
- Zero context-switching required from the user.

## Continuous improvement loop
- After ANY user correction: update `.github/tasks/lessons.md` immediately.
- Write rules for yourself that prevent the same mistake.
- Review lessons at the start of each session for the corresponding project.
- Iterate relentlessly on these lessons until error rate decreases.
