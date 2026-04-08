---
name: consolidate
description: >
  Consolidate the workflow knowledge base by merging duplicate lessons,
  grouping entries by category, marking stale summaries, and enforcing
  size limits. Inspired by the Dream System's orient-gather-consolidate-prune cycle.
argument-hint: "[--dry-run]"
---

# /consolidate — Knowledge Base Consolidation

Consolidate `lessons.md` and `summaries.md` by merging duplicates, grouping by category, and pruning stale entries. Runs the 4-phase Dream cycle.

## Target files

| File | Path |
|------|------|
| Lessons | `.github/tasks/lessons.md` |
| Summaries | `.github/tasks/summaries.md` |

## Process

### Phase 1: Orient

1. Read both target files
2. Count entries in each (lessons = `### ` headings, summaries = `### ` headings)
3. Report current state to user:
   - Total lesson count and distribution by category (`[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`)
   - Total summary count and how many are `Status: stale`
   - Whether either file exceeds size limits (lessons > 50, summaries > 30)

### Phase 2: Gather

1. **Lessons:** Parse all entries. Group by category tag. Identify candidates for merge:
   - Same category AND 3+ shared keywords = likely duplicate
   - Entries covering the same file/module/pattern = merge candidate
2. **Summaries:** Parse all entries. Identify:
   - Entries with `Status: stale`
   - Entries covering overlapping paths (candidates for merge)

### Phase 3: Consolidate

1. **Show the consolidation plan** to the user before making changes:
   - Which lessons will be merged (show pairs/groups)
   - Which summaries will be merged or removed
   - If `--dry-run` flag was passed, STOP here
2. **Merge duplicate lessons** into single richer entries preserving all unique information
3. **Reorganize lessons** under category headers: `## [DX]`, `## [ARCH]`, etc.
4. **Merge overlapping summaries** (same paths or areas)
5. **Update dates** on refreshed summaries

### Phase 4: Prune

1. If lessons > 50 after consolidation: mark lowest-signal entries with `[ARCHIVED]` prefix (e.g., `[ARCHIVED][DX]`). Never delete — only archive
2. If summaries > 30: remove entries marked `Status: stale` that haven't been updated in 30+ days
3. Write the consolidated files
4. Report before/after summary:
   - Lessons: X → Y (merged Z, archived W)
   - Summaries: X → Y (merged Z, removed W stale)

## Size limits

| File | Max entries | Action when exceeded |
|------|-------------|---------------------|
| `lessons.md` | ~50 | Archive lowest-signal entries with `[ARCHIVED]` prefix |
| `summaries.md` | ~30 | Remove stale entries older than 30 days |

## Copilot variant

When running in Copilot, delegate writes to the **Scribe** agent:

```
TASK: Consolidate knowledge base
ACTION: consolidate_lessons
TARGET: lessons.md
CONTENT: [full consolidated content]
```

## Rules

- **Never delete a lesson** — merge duplicates or archive, never remove
- Always show the consolidation plan before executing
- If `--dry-run`: stop after showing the plan, do not write
- Preserve original category tags when merging
- Keep the same Markdown format conventions as the original files
- Report a before/after summary when done
