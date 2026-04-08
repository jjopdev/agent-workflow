# Work In Progress

> Last saved: 2026-04-08 (session 9 final — VS Code Copilot)

## Task
Comprehensive plan for fixing plugin installation, aligning agents/skills/hooks across platforms, cleaning project structure, and optimizing distribution — 9 PRs planned, 0 implemented.

## Plan

### PR1: Fix Plugin Installation Paths (`fix/plugin-install-paths`)
- [x] Research + root cause analysis
- [x] Staff Engineer review applied
- [ ] Step 0: Reproduce bugs per platform
- [ ] Steps 1-6: Fix extension.js, manifests, hooks, test

### PR2: Unify operational files (`refactor/unify-operational-files`)
- [ ] Move progress.md → `.github/tasks/`
- [ ] Eliminate lessons.md/summaries.md duplication

### PR3: Cleanup `.claude/` (`cleanup/claude-dead-files`) — depends PR2
- [ ] Remove dead agent-memory/, move feedback rule → rules

### PR4: Wire summaries.md triggers (`feat/wire-summaries-triggers`) — depends PR2
- [ ] Implement add_summary, mark_stale, bootstrap

### PR5: Align agent tools per platform (`fix/agent-tools-per-platform`)
- [ ] Fix inmediato: MCP tools to Claude frontmatter + body hints
- [ ] **Decision PENDING**: Options A-D for long-term architecture

### PR6: Optimize distribution weight (`perf/distribution-weight`)
- [ ] Exclude evals/, templates/ from build
- [ ] Add negative validation in validate_package()

### PR7: Docs alignment + file isolation (`docs/align-with-changes`) — depends PR1+PR6
- [ ] Update README, INSTALL, GUIDE, SETUP, CHANGELOG
- [ ] Truth table test: each target gets only its files

### PR8: Project structure audit (`refactor/project-structure`) — depends PR6
- [ ] Remove PLAN-*.md, evaluate packages/ elimination
- [ ] Evaluate SETUP.md vs INSTALL.md merge

### PR9: Skill audit (`refactor/skill-audit`) — depends PR6
- [ ] Categorize skills (core/optional/domain) in docs
- [ ] **Decision PENDING**: which skills to exclude (Options 1-4)
- [ ] Fix cross-platform skill paths (consolidate, save-progress, lesson)
- [ ] Decide if Stop hooks go in production hooks.json

## Key Findings This Session

### Agent tools (Subtask D)
- YAML frontmatter tools: CORRECT per platform, VS Code auto-maps
- Body text: DIVERGED — Claude natural language vs Copilot `#tool:` syntax
- MCP tools (context7, shadcn, snyk, playwright): MISSING from Claude agents
- Staff Engineer: NOT APPROVED as complete fix — tools without body hints = mute tools

### Skills audit (Subtask H)
- 17 skills, 0 orphaned — all referenced somewhere
- 5 REQUIRED, 9 OPTIONAL, 2 INFRASTRUCTURE, 1 DOMAIN-SPECIFIC
- `post-session` has Stop hook trigger but production hooks are EMPTY
- Skills that write files hardcode platform-specific paths — cross-platform risk

### Distribution weight (Subtask E)
- `evals/`, `templates/` shipped unnecessarily (~50KB/package)
- `packages/` dir is stale — build writes to `dist/`
- RAM in VS Code mostly from MCP servers, not file count

### Hooks gap
- `hooks/hooks.json` (distributed): Stop = [] EMPTY
- `hooks/hooks.dev.json` (dev only): 2 active Stop hooks
- `packages/claude-code/hooks/hooks.json` (stale): 2 active Stop hooks
- Users never get automatic lesson extraction

## Key Files
- `.github/tasks/todo.md` — master plan with 9 PRs, Subtasks A-H
- `skills/workflow-knowledge/lessons.md` — 12 lessons accumulated
- `src/extension.js` — bug in installClaudeVariant() (L55-68)
- `scripts/build-dist.sh` — build logic per variant
- `agents/*.md` — Claude agents (need MCP tools)
- `.github/agents/*.agent.md` — Copilot agents (reference, complete)
- `hooks/hooks.json` — production hooks (Stop empty!)

## Decisions PENDING (need user input)
1. **Subtask D Options A-D**: how to unify agent body text long-term
2. **Subtask H Options 1-4**: which skills to include in distribution
3. **Stop hooks**: include in production hooks.json or keep dev-only?
4. **packages/ dir**: eliminate or keep?
5. **SETUP.md vs INSTALL.md**: merge or keep separate?
6. **Staff Engineer consolidation**: merge PR6+PR8+PR9 into fewer PRs?

## Next Steps (for tomorrow)
1. Make decisions on pending items (especially D and H)
2. Start Fase 1: PR1, PR2, PR5, PR6 in parallel
3. Consider Staff Engineer advice: consolidate PR6+PR8+PR9

## Context
- **9 PRs, 2 phases**: Fase 1 (PR1,2,5,6 parallel) → Fase 2 (PR3,4,7,8,9 sequential)
- **4 commits unpushed**: `08d8ec3`, `fd1a8d3`, `8cb2ccf`, `e556021` + this fix commit
- **11 lessons** recorded across sessions (1 duplicate removed)
- **Session memory** updated with agent tools + skills audit findings

## Branch
`main` — last pushed: `9a961d9`, local HEAD: pending
