# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
