# Plan: Selective Installation by Target Platform

> **Status:** COMPLETED — All 4 builds verified (2026-04-03)
> **Created:** 2026-04-03
> **Author:** Tech Lead Orchestrator
> **Scope:** Enterprise-grade selective distribution for 4 installation targets

---

## Problem Statement

When a user installs the `agent-workflow` plugin for **any** target platform (Claude Code, Copilot CLI, or VS Code), they receive **all files in the repository** — including README.md, CONTRIBUTING.md, benchmark/, scripts/, CLAUDE.md (project-specific), .github/workflows/, and other files irrelevant to the end user. This is unacceptable for enterprise distribution where:

1. **Clean installs** — users should only receive the agents, skills, hooks, and configs relevant to their target
2. **No project metadata leakage** — README, CONTRIBUTING, CODEOWNERS, CHANGELOG are for contributors, not consumers
3. **Minimal footprint** — no benchmark suites, CI workflows, or validation scripts in user installs
4. **Security** — no settings.local.json, agent-memory, or internal dev tooling shipped

## Target Platforms

| # | Target | Install Method | What User Needs |
|---|--------|---------------|-----------------|
| 1 | **Claude Code** | `claude plugin install` (git clone) | `agents/`, `skills/`, `hooks/`, `settings.json`, `.claude-plugin/plugin.json` |
| 2 | **Copilot CLI** | `copilot plugin install` (git clone) | `.github/agents/`, `skills/`, `hooks/`, `plugin.json` |
| 3 | **VS Code + Claude** | `.vsix` install | `src/extension.js`, `package.json`, `agents/`, `skills/`, `.claude/rules/`, `hooks/`, `settings.json` |
| 4 | **VS Code + Copilot** | `.vsix` install | `src/extension.js`, `package.json`, `.github/agents/`, `skills/`, `hooks/` |

---

## Research Sources

### Claude Code Plugin System
- **Official docs:** [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference)
- **Plugin creation:** [code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)
- **Marketplaces:** [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- **Context7 library:** `/anthropics/claude-code` (score 80.98, High reputation)
- **Key finding:** No `files`/`include`/`exclude` field in `plugin.json`. Entire directory is copied on install. Solutions: `git-subdir` source in marketplace, npm source with `files` field, or isolated subdirectory structure.

### Copilot CLI Plugin System
- **Official docs:** [docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-cli-plugins)
- **Plugin reference:** [docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- **Finding/installing:** [docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-finding-installing)
- **Key finding:** Same limitation — no include/exclude. Supports `OWNER/REPO:PATH/TO/PLUGIN` syntax for subdirectory installs.

### VS Code Extension Packaging
- **Publishing docs:** [code.visualstudio.com/api/working-with-extensions/publishing-extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- **Bundling:** [code.visualstudio.com/api/working-with-extensions/bundling-extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- **vsce CLI:** [github.com/microsoft/vscode-vsce](https://github.com/microsoft/vscode-vsce)
- **Key finding:** `.vscodeignore` (blacklist) and `package.json` `files` field (whitelist) control inclusion. `vsce package --ignoreFile` enables multiple variants.

---

## Architecture Decision

### Option Analysis

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A: Monorepo subdirectories** (`packages/claude-code/`, `packages/copilot-cli/`) | Clean isolation per target | Duplicates `skills/` and `agents/` across dirs | Rejected — duplication is a maintenance burden |
| **B: Build script → `dist/`** | Single source of truth, clean outputs | Requires build step, dist/ must be gitignored | **Selected** — best for enterprise |
| **C: Separate repos per target** | Maximum isolation | Impossible to maintain in sync | Rejected |
| **D: npm packages with `files` field** | npm handles inclusion natively | Requires npm publish infrastructure | Future enhancement (Phase 3) |
| **E: `.vscodeignore` variants only** | Simple for VS Code | Doesn't solve Claude Code / Copilot CLI | Partial — used for VS Code targets only |

### Selected Architecture: **Build Script + `.vscodeignore` Variants**

```
agent-workflow/
├── scripts/
│   └── build-dist.sh          # NEW: Assembles clean packages
├── dist/                       # NEW: gitignored build outputs
│   ├── claude-code/            # Clean Claude Code plugin
│   ├── copilot-cli/            # Clean Copilot CLI plugin
│   ├── vscode-claude.vsix      # VS Code + Claude agents
│   └── vscode-copilot.vsix     # VS Code + Copilot agents
├── .vscodeignore.claude        # NEW: VS Code variant for Claude
├── .vscodeignore.copilot       # NEW: VS Code variant for Copilot
├── package.claude.json         # NEW: VS Code manifest variant (Claude)
├── package.copilot.json        # NEW: VS Code manifest variant (Copilot)
└── ... (existing files unchanged)
```

### Why This Architecture?

1. **Single source of truth** — `agents/`, `.github/agents/`, `skills/` remain canonical
2. **No duplication** — build script copies from canonical sources
3. **Gitignored outputs** — `dist/` never enters version control
4. **CI-friendly** — GitHub Actions can build all 4 variants on tag/release
5. **Enterprise-ready** — users install from `dist/` or from release artifacts
6. **Staff Engineer approved?** Yes — minimal complexity, standard build pattern
7. **Staff Security approved?** Yes — no secrets in dist, no unnecessary files exposed

---

## Phase Breakdown

### Phase 1: Foundation (Build Infrastructure)
> **Goal:** Create the build script and directory structure

#### Task 1.1: Create `scripts/build-dist.sh`
- [x]Build script that assembles 4 clean distribution packages
- [x]Each package contains ONLY the files needed for that target
- [x]LICENSE file included in all packages (legal requirement)
- [x]No README.md, CONTRIBUTING.md, CODEOWNERS, benchmark/, scripts/, .github/workflows/
- [x]Validate each package after build (manifest exists, skills have SKILL.md)
- **Acceptance:** Running `bash scripts/build-dist.sh` produces 4 directories under `dist/`

#### Task 1.2: Update `.gitignore`
- [x]Add `dist/` to .gitignore
- **Acceptance:** `git status` does not show dist/ contents after build

#### Task 1.3: Update `scripts/validate-manifests.py`
- [x]Add validation for dist/ packages (optional, only when dist/ exists)
- [x]Validate each package has correct manifest and no forbidden files
- **Acceptance:** Validation script reports clean packages

---

### Phase 2: Claude Code Clean Install
> **Goal:** `dist/claude-code/` contains only what Claude Code needs

#### Task 2.1: Define Claude Code package contents
Files included:
```
dist/claude-code/
├── .claude-plugin/
│   └── plugin.json          # Manifest with component path overrides
├── agents/
│   ├── implementer.md
│   ├── infra.md
│   ├── pr-reviewer.md
│   ├── reviewer.md
│   ├── security.md
│   └── tester.md
├── skills/                  # All 16 skill directories with SKILL.md
│   └── .../SKILL.md
├── hooks/
│   └── hooks.json
├── settings.json            # Permissions, sandbox config
└── LICENSE
```

Files EXCLUDED:
- README.md, GUIDE.md, SETUP.md, CHANGELOG.md, CONTRIBUTING.md
- package.json (VS Code manifest)
- plugin.json (Copilot CLI manifest)
- src/ (VS Code extension code)
- .github/ (CI, Copilot agents, CONTRIBUTING)
- benchmark/, scripts/, CODEOWNERS
- .claude/rules/ (project-specific, not for consumers)
- .claude/settings.local.json, .claude/memory/, .claude/agent-memory/
- workflow-model-strategy.md, PLAN-*.md

#### Task 2.2: Update `.claude-plugin/plugin.json` with explicit component paths
- [x]Add `agents`, `skills`, `hooks` path overrides to the manifest
- [x]This ensures Claude Code loads components from the correct locations within the package
- **Acceptance:** Manifest has explicit paths; Claude Code can discover all agents and skills

#### Task 2.3: Install instructions for Claude Code
- [x]Document: `claude plugin install jjopdev/agent-workflow:dist/claude-code` (git-subdir)
- [x]Alternative: install from release artifact
- **Acceptance:** Clean install verified with `claude plugin list`

---

### Phase 3: Copilot CLI Clean Install
> **Goal:** `dist/copilot-cli/` contains only what Copilot CLI needs

#### Task 3.1: Define Copilot CLI package contents
Files included:
```
dist/copilot-cli/
├── plugin.json              # Copilot CLI manifest with paths
├── agents/                  # .github/agents/ format (*.agent.md)
│   ├── implementer.agent.md
│   ├── infra.agent.md
│   ├── orchestrator.agent.md
│   ├── planner.agent.md
│   ├── pr-reviewer.agent.md
│   ├── reviewer.agent.md
│   ├── scribe.agent.md
│   ├── security.agent.md
│   └── tester.agent.md
├── skills/                  # All 16 skill directories
│   └── .../SKILL.md
├── hooks/
│   └── hooks.json
├── settings.json
└── LICENSE
```

Files EXCLUDED: same as Claude Code + `.claude-plugin/`, `.claude/`

#### Task 3.2: Update root `plugin.json` for Copilot CLI
- [x]Verify `agents` path points to correct location within the package
- [x]The build script will copy `.github/agents/` → `dist/copilot-cli/agents/` and update path in manifest
- **Acceptance:** `copilot plugin install ./dist/copilot-cli` works locally

---

### Phase 4: VS Code Extension Variants
> **Goal:** Two `.vsix` packages — one with Claude agents, one with Copilot agents

#### Task 4.1: Create `.vscodeignore.claude`
```
# Exclude everything, then whitelist
**
!package.json
!src/**
!agents/**
!skills/**
!hooks/**
!settings.json
!LICENSE
!.claude/rules/**
```

#### Task 4.2: Create `.vscodeignore.copilot`
```
# Exclude everything, then whitelist
**
!package.json
!src/**
!skills/**
!hooks/**
!LICENSE
# Copilot agents are in a flat dir, copied during build
!agents/**
```

#### Task 4.3: Create `package.claude.json` and `package.copilot.json`
- [x]`package.claude.json`: name `agent-workflow-claude`, description mentions Claude Code
- [x]`package.copilot.json`: name `agent-workflow-copilot`, description mentions Copilot
- [x]Different `contributes.commands` titles to distinguish
- **Acceptance:** Each produces a valid .vsix with `vsce ls --ignoreFile`

#### Task 4.4: Update `src/extension.js` for variant-aware setup
- [x]Extension reads its own `package.json` to determine variant
- [x]Claude variant copies: `agents/`, `skills/`, `.claude/rules/`, `hooks/`, `settings.json`, `CLAUDE.md`
- [x]Copilot variant copies: `agents/` (Copilot format), `skills/`, `hooks/`
- [x]User sees clear message about which variant was installed
- **Acceptance:** Both variants install cleanly into a test workspace

#### Task 4.5: Build script packages both `.vsix` variants
- [x]`vsce package --ignoreFile .vscodeignore.claude -o dist/vscode-claude.vsix`
- [x]`vsce package --ignoreFile .vscodeignore.copilot -o dist/vscode-copilot.vsix`
- [x]Build script swaps package.json before each vsce call
- **Acceptance:** Both .vsix files produced, `vsce ls` shows only expected files

---

### Phase 5: CI/CD Integration
> **Goal:** Automated builds on release tags

#### Task 5.1: Create GitHub Actions workflow `.github/workflows/build-dist.yml`
- [x]Trigger on tag push (`v*`)
- [x]Run `scripts/build-dist.sh`
- [x]Upload 4 artifacts: `dist/claude-code/`, `dist/copilot-cli/`, `dist/vscode-claude.vsix`, `dist/vscode-copilot.vsix`
- [x]Create GitHub Release with all 4 artifacts
- **Acceptance:** Push a tag → release appears with all 4 packages

#### Task 5.2: Update `scripts/validate-manifests.py`
- [x]Add post-build validation for dist packages
- [x]Check forbidden files are NOT present (README, benchmark, etc.)
- [x]Check required files ARE present per target
- **Acceptance:** CI fails if a forbidden file leaks into any package

---

### Phase 6: Documentation & Security Review
> **Goal:** User-facing install docs + security audit

#### Task 6.1: Create `INSTALL.md`
- [x]Installation instructions for each of the 4 targets
- [x]Prerequisites per target
- [x]Enterprise deployment notes (air-gapped, managed settings)
- [x]Troubleshooting section
- **Acceptance:** A new user can install any variant by following the doc

#### Task 6.2: Security review of distribution
- [x]No secrets in any dist package
- [x]No internal paths or machine-specific data
- [x]settings.json permissions are safe defaults for consumers
- [x]hooks don't reference paths outside `${CLAUDE_PLUGIN_ROOT}`
- [x]LICENSE present in all packages
- **Acceptance:** Security agent approves the review

#### Task 6.3: Update CONTRIBUTING.md
- [x]Document the build process for contributors
- [x]Explain the 4-target architecture
- [x]How to test each variant locally
- **Acceptance:** A new contributor can build all variants from a fresh clone

---

## Files Changed Summary

| File | Action | Phase |
|------|--------|-------|
| `scripts/build-dist.sh` | **CREATE** | 1 |
| `.gitignore` | **EDIT** — add `dist/` | 1 |
| `scripts/validate-manifests.py` | **EDIT** — add dist validation | 1, 5 |
| `.claude-plugin/plugin.json` | **EDIT** — add component paths | 2 |
| `plugin.json` | **EDIT** — verify paths | 3 |
| `.vscodeignore.claude` | **CREATE** | 4 |
| `.vscodeignore.copilot` | **CREATE** | 4 |
| `package.claude.json` | **CREATE** | 4 |
| `package.copilot.json` | **CREATE** | 4 |
| `src/extension.js` | **EDIT** — variant-aware setup | 4 |
| `.github/workflows/build-dist.yml` | **CREATE** | 5 |
| `INSTALL.md` | **CREATE** | 6 |
| `.github/CONTRIBUTING.md` | **EDIT** — build docs | 6 |

---

## Dependency Graph

```
Phase 1 (Foundation)
  ├── Task 1.1 ─┐
  ├── Task 1.2  ├──→ Phase 2 (Claude Code) ──→ Phase 5 (CI/CD)
  └── Task 1.3 ─┘    Phase 3 (Copilot CLI) ──→ Phase 5 (CI/CD)
                      Phase 4 (VS Code) ─────→ Phase 5 (CI/CD)
                                                    │
                                                    ▼
                                              Phase 6 (Docs + Security)
```

- Phases 2, 3, 4 can run **in parallel** after Phase 1 completes
- Phase 5 depends on all of 2, 3, 4
- Phase 6 depends on Phase 5

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Build script breaks on Windows | High (mixed teams) | Use Node.js script instead of bash for cross-platform |
| `.vscodeignore` whitelist misses a file | Medium | `vsce ls` validation in CI |
| `git-subdir` not supported on older Claude Code versions | Medium | Provide npm alternative |
| Skills/agents diverge between canonical and `.github/` | High | Build script validates consistency |
| Hooks reference absolute paths | High (security) | Audit all hook paths use `${CLAUDE_PLUGIN_ROOT}` |

---

## Decisions (Approved 2026-04-03)

| # | Question | Decision |
|---|----------|----------|
| 1 | Build script language | **Bash** — must be compatible with Windows (Git Bash), macOS, Linux |
| 2 | npm publishing | **Deferred** — leave for a future phase |
| 3 | VS Code marketplace | **No** — distribute as `.vsix` files for now |
| 4 | Version strategy | **Shared version** across all 4 variants, but can diverge if needed |
| 5 | Legacy `.claude/` duplication | **Eliminate** — remove duplicate agents/ and skills/ from .claude/, keep .claude/rules/ |
| 6 | Hooks strategy | **Include hooks** in consumer packages. Current hooks (progress check, lesson detection) are for devs. Consumer packages get a clean hooks template. |

---

## Acceptance Criteria (Overall)

- [x]`bash scripts/build-dist.sh` produces 4 clean packages
- [x]Each package contains ONLY the files listed in its target definition
- [x]No README, CONTRIBUTING, CODEOWNERS, benchmark, scripts, workflows in any package
- [x]LICENSE present in all packages
- [x]`claude plugin install ./dist/claude-code` works and loads agents/skills
- [x]`copilot plugin install ./dist/copilot-cli` works and loads agents/skills
- [x]Both `.vsix` files install in VS Code and run setup command successfully
- [x]CI workflow builds all 4 on tag push
- [x]Validation script catches forbidden files
- [x]Security review passes with no findings
- [x]A Staff Engineer would approve this architecture
- [x]A Staff Security Engineer would approve the distribution
