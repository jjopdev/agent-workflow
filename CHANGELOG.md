# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.1] - 2026-04-08

### Added
- Uninstall command for VS Code extension — removes only plugin-installed files, preserves user customizations
- macOS `sed -i` portability fix in bump-version.sh

## [1.5.0] - 2026-04-08

### Added
- MCP tools (context7, snyk, playwright, shadcn) added to Claude agent frontmatter with platform-neutral body hints (PR5)
- Summaries.md triggers wired in both orchestrators — post-pipeline add_summary and mark_stale (PR4)
- `always-full-pipeline` rule created in `.claude/rules/` and `.github/instructions/` (PR3)
- Negative validation in build-dist.sh — rejects packages containing evals/, templates/, or references/ (PR6)
- Skill distribution policy documented in build-dist.sh header (PR9)

### Changed
- Operational files unified to `.github/tasks/` — lessons.md, summaries.md, progress.md now single source of truth (PR2)
- Planning work consolidated into `.github/tasks/todo.md` (PR8)
- Hook distribution unified around the shared `hooks/hooks.json` payload with live `SessionStart` and `Stop` automation (Option A)

### Removed
- `PLAN-agent-improvements.md`, `PLAN-selective-install.md` — obsolete planning docs (PR8)
- Distribution optimized: evals/, templates/, references/ excluded from packages — 9 fewer dev files per package (PR6)
- interface-design skill excluded from distribution (domain-specific, 16 skills distributed instead of 17) (PR9)
- Obsolete dev-only hook split removed from packaging and documentation (Option A)
- Claude install paths fixed: `.claude/agents/`, `.claude/skills/`, `.claude/rules/`, hooks via `.claude/settings.json` (PR1)
- Plugin manifests now declare explicit `agents` and `skills` fields (PR1)
- `.claude/agent-memory/` — empty residual directories (PR3)
- `.claude/memory/` — moved feedback rule to `.claude/rules/always-full-pipeline.md` (PR3)

### Fixed
- macOS build compatibility — sed -i portability fix in build-dist.sh (PR6)

## [1.4.0] - 2026-04-06

### Added
- `agents/orchestrator.md` — canonical orchestrator agent distributed via plugin, usable with `--agent agent-workflow:orchestrator`
- Orchestrator usage docs in README and INSTALL.md

### Changed
- `CLAUDE.md` now imports `@agents/orchestrator.md` instead of duplicating orchestration logic (single source of truth)
- Agent count: 6 → 7 (orchestrator added to canonical agents and claude-code package)
- Architecture diagram updated to reference `agents/orchestrator.md` instead of `CLAUDE.md`

## [1.3.2] - 2026-04-06

### Fixed
- hooks.json requires `{"hooks": {...}}` wrapper object, not bare event keys
- Removed explicit path fields from plugin manifest (auto-discovery handles standard locations)

## [1.3.1] - 2026-04-06

### Fixed
- Plugin manifest validation errors preventing installation (`settings` is not a valid schema field; paths require `./` prefix)

## [1.3.0] - 2026-04-06

### Added
- Orchestrator hardening: Coordinator Mode, Pipeline Gates, Stall Detection & Budget Limits, Fallback Strategy
- `/post-session` skill — post-pipeline extraction and lesson recording
- Agent improvements: WebFetch added to Tester, `memory: project` to PR Reviewer, WebSearch to Security/Infra/Implementer, NotebookEdit to Implementer/Tester

### Fixed
- VS Code variant manifests not syncing version from package.json
- VS Code Copilot extension installing skills/hooks at project root instead of .github/
- Root plugin.json files not auto-syncing version on build
- Distribution packages missing `consolidate` and `post-session` skills

## [1.2.0] - 2026-04-05

### Added
- Origin section in README (NotebookLM, Claude Code, Copilot CLI toolchain)
- `/consolidate` skill — 4-phase knowledge base consolidation (Dream System inspired)
- Automatic version sync in `scripts/build-dist.sh` from `package.json` to plugin manifests

### Changed
- Pipeline parallelized: Test + Review now run simultaneously after Implement
- Copilot agent tool lists optimized (~150 → ~106 tools, -29% reduction)
- Security agent model upgraded to Opus (Copilot variant) — never downgraded per RLM
- Planner default model set to Haiku (read-only per RLM paper)
- Removed Haiku from coding agent model arrays (minimum tier is Sonnet)
- `workflow-model-strategy.md` last-verified date updated

### Fixed
- Skills count: 16→15 in INSTALL.md (now 16 with /consolidate)
- Copilot agent count: 8→9 in SETUP.md
- plugin.json version not updated on release (#1)

## [1.0.0] - 2026-03-31

### Added
- Claude Code plugin manifest (`.claude-plugin/plugin.json`)
- Copilot CLI plugin manifest (`plugin.json`)
- VS Code extension wrapper (`package.json`, `src/extension.js`)
- Root-level `skills/` and `agents/` directories (canonical plugin sources)
- `hooks/hooks.json` and root `settings.json` for plugin distribution
- GitHub Actions: CI validation (`ci.yml`) and automated releases (`release.yml`)
- Validation script (`scripts/validate-manifests.py`)
- Branch protection on `main` — fork-only collaboration
- `CODEOWNERS` and `.github/CONTRIBUTING.md`
- `CHANGELOG.md`

### Changed
- `.github/agents/*.agent.md` — updated skill paths from `.github/skills/` to `skills/`
- `.github/copilot-instructions.md` — updated skill paths
- `SETUP.md` — added plugin installation methods and sandbox testing section
- `README.md` — added 4 installation methods, sandbox instructions, and contributing pointer

### Removed
- `.github/skills/` directory (consolidated into root `skills/`)
