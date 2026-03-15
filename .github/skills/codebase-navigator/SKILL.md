---
name: codebase-navigator
description: >
  Use this skill when starting work on an unfamiliar codebase, planning
  changes that span multiple modules, or needing to find the right file
  quickly. Activates when the user asks "where is...", "how does X work",
  or needs to understand project structure, module boundaries, and
  dependency graphs — regardless of language or framework.
---

# Codebase Navigator - Project Map

> For the generic RLM navigation protocol, see `~/.copilot/skills/rlm-codebase-navigation/SKILL.md`

## When to use this skill

- Starting work on an unfamiliar area of any codebase
- Need to find the right file quickly
- Planning changes that span multiple modules
- Onboarding to a new project

## Discovery Process

When activated, the agent should build the project map by exploring:

### 1. Identify stack and structure

```
Read: package.json | Cargo.toml | go.mod | *.csproj | pyproject.toml
Read: tsconfig.json | .eslintrc | biome.json (if present)
List: root directory and first level of src/ or app/
```

### 2. Build the Module Map

For each discovered module, capture:

| Field | What to capture |
|-------|-------------|
| **Module** | Descriptive module name |
| **Entry Point** | Main file or index |
| **Responsibility** | What it does in 1 line |

### 3. Trace the Dependency Graph

Search imports/exports to build the graph:
- Types/Interfaces → Schemas/Validation → Data layer → API → UI
- Identify modules that are "leaves" (no dependents) vs "roots" (many dependents)

### 4. Identify key patterns

| Pattern | Where to look |
|--------|-------------|
| Data access | `db.ts`, `prisma/`, `drizzle/`, `repositories/` |
| Auth | `auth.ts`, `middleware.ts`, `guards/` |
| Validation | `schemas.ts`, `validators/`, zod/yup imports |
| Config | `.env.example`, `config/`, env vars |
| Tests | `__tests__/`, `*.test.*`, `*.spec.*` |

## Quick Navigation Template

When exploring a project, the agent answers questions using this format:

```
Q: "How is X stored?"
A: `path/to/file.ts` -> `functionName`, pattern: [description]

Q: "How does auth work?"
A: `path/to/auth.ts` -> `middleware/guard`, flow: [description]
```

## For project-specific cases

If the project has a `codebase-navigator` in `.github/skills/` with the Module Map and Dependency Graph already filled in, **use that instead of exploring**. This generic skill is the fallback when a project-specific one does not exist.

## Rules

- Explore before forming an opinion - never assume the structure without verifying it
- Keep 1 line per module in the Module Map - this is an index, not documentation
- If the project has more than 15 modules, group them by domain
- Update the map if new modules are discovered during the work
