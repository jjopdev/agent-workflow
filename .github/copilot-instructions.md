# Copilot Instructions for This Repository

This repository is a workflow and agent-configuration project, not an application codebase.

## Scope

- Treat `.github/agents/`, `skills/`, `.github/tasks/`, and root Markdown files as the primary source of truth.
- Prefer minimal edits focused on prompts, skills, agent definitions, and documentation.
- Do not assume there is a runnable app, API, frontend, or test suite unless such files are added later.

## Editing rules

- Preserve YAML frontmatter exactly in `.agent.md`, `.instructions.md`, and `SKILL.md` files.
- Keep skill files concise and practical; avoid repeating generic guidance when a short project-specific contract is enough.
- Keep agent definitions aligned with the current repository structure and existing agent names.
- When documenting workflows, optimize for operational clarity over theory.

## Repository conventions

- Documentation is in English.
- Prefer updating existing workflow files over adding new ones unless a new file has a clear purpose.
- If a rule only makes sense for a stack not present in this repository, do not introduce it.

## Validation

- After changing workflow files, verify that referenced paths and filenames actually exist in the repository.
- Before recommending cleanup, re-check the current workspace state because the user may already have removed files.
