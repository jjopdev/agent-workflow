# Work In Progress

> Last saved: 2026-04-08 (session 11 — VS Code Copilot, final save)

## Task
Comprehensive plan for fixing plugin installation, aligning agents/skills/hooks across platforms, cleaning project structure, and optimizing distribution — 9 PRs planned, PR1 Steps 1-2 implemented + Staff Engineer reviewed.

## Plan

### PR1: Fix Plugin Installation Paths (`fix/plugin-install-paths`)
- [x] Research + root cause analysis
- [x] Staff Engineer review applied
- [ ] Step 0: Reproduce bugs per platform (manual — deferred to end)
- [x] Step 1: Fix `installClaudeVariant()` in `src/extension.js` — paths now `.claude/agents/`, `.claude/skills/`, `.claude/rules/`; hooks via merge-safe `installClaudeSettings()` into `.claude/settings.json`
- [x] Step 2: Complete `.claude-plugin/plugin.json` — added `agents` and `skills` fields; same for `packages/claude-code/.claude-plugin/plugin.json`
- [ ] Step 3: Hooks format verified (table done, no code change needed)
- [ ] Step 4: Verify `installCopilotVariant()` paths
- [ ] Step 5: Test in each platform (manual — deferred to end)
- [ ] Step 6: Review build-dist.sh output

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
- [x] Option A applied: distributed `hooks/hooks.json` now carries `SessionStart` and `Stop` hooks

## Key Findings (sessions 1-9)

### Agent tools (Subtask D)
- YAML frontmatter tools: CORRECT per platform, VS Code auto-maps
- Body text: DIVERGED — Claude natural language vs Copilot `#tool:` syntax
- MCP tools (context7, shadcn, snyk, playwright): MISSING from Claude agents
- Staff Engineer: NOT APPROVED as complete fix — tools without body hints = mute tools

### Skills audit (Subtask H)
- 17 skills, 0 orphaned — all referenced somewhere
- 5 REQUIRED, 9 OPTIONAL, 2 INFRASTRUCTURE, 1 DOMAIN-SPECIFIC
- `post-session` has Stop hook trigger and distributed hooks now include it
- Skills that write files hardcode platform-specific paths — cross-platform risk

### Distribution weight (Subtask E)
- `evals/`, `templates/` shipped unnecessarily (~50KB/package)
- `packages/` dir is stale — build writes to `dist/`
- RAM in VS Code mostly from MCP servers, not file count

### Hooks distribution
- `hooks/hooks.json` (distributed): `SessionStart` + 2 active `Stop` hooks
- `packages/claude-code/hooks/hooks.json`: synced from build output
- `packages/copilot-cli/hooks/hooks.json`: synced from build output
- Users now get automatic lesson extraction and resume prompts

## Key Files
- `.github/tasks/todo.md` — master plan with 9 PRs, Subtasks A-H
- `.github/tasks/lessons.md` — merged lessons accumulated
- `src/extension.js` — **FIXED**: installClaudeVariant() now copies to .claude/agents|skills|rules; hooks via merge-safe installClaudeSettings()
- `.claude-plugin/plugin.json` — **FIXED**: added agents and skills fields
- `packages/claude-code/.claude-plugin/plugin.json` — **FIXED**: same
- `scripts/build-dist.sh` — build logic per variant
- `agents/*.md` — Claude agents (need MCP tools)
- `.github/agents/*.agent.md` — Copilot agents (reference, complete)
- `hooks/hooks.json` — shared distributed hooks with `SessionStart` and `Stop` events

## Decisions PENDING (need user input)
1. **Subtask D Options A-D**: how to unify agent body text long-term
2. **Subtask H Options 1-4**: which skills to include in distribution
3. **packages/ dir**: eliminate or keep?
4. **SETUP.md vs INSTALL.md**: merge or keep separate?
5. **Staff Engineer consolidation**: merge PR6+PR8+PR9 into fewer PRs?

## Next Steps
1. Continue PR1: Step 4 (verify installCopilotVariant paths), Step 6 (review build-dist.sh)
2. Make decisions on pending items (D and H)
3. Start Fase 1 remaining: PR2, PR5, PR6 in parallel
4. Manual testing (Steps 0+5 in PR1) deferred to end — verify all platforms before release

## Context
- **9 PRs, 2 phases**: Fase 1 (PR1,2,5,6 parallel) → Fase 2 (PR3,4,7,8,9 sequential)
- **PR1 Steps 1+2 implemented** this session — extension.js + manifests fixed
- **Staff Engineer review**: APPROVED with 2 observations (hooks empty, Copilot variant copies Claude agents — both are planned future steps)
- **13 lessons** recorded across sessions (2 new this session)
- **Branch**: `main`
- **Changes**: uncommitted — `src/extension.js`, `.claude-plugin/plugin.json`, `packages/claude-code/.claude-plugin/plugin.json`, `.github/tasks/lessons.md`

## Resume
Read this file → then `.github/tasks/todo.md` for detailed plans per subtask.

## Branch
`main` — last pushed: `9a961d9`, local HEAD: pending