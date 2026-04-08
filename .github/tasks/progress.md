# Work In Progress

> Last saved: 2026-04-08 (session 12)

## Task
v1.5.0 + v1.5.1 release cycle — unified operations, MCP tools, optimized distribution, safe uninstall command.

## Plan
- [x] PR1: Fix plugin installation paths (VSIX, CLI, manifests)
- [x] PR2: Unify operational files to .github/tasks/
- [x] PR3: Clean .claude/ directory
- [x] PR4: Wire summaries.md triggers in orchestrators
- [x] PR5: Add MCP tools to Claude agents
- [x] PR6: Optimize distribution weight
- [x] PR7: Documentation alignment
- [x] PR8: Project structure cleanup (PLAN files)
- [x] PR9: Skill distribution audit
- [x] Final docs review — all aligned, Spanish→English, Staff Engineer approved
- [x] Hook distribution — merged dev hooks into hooks.json (Option A)
- [x] Version bump 1.5.0 — all manifests synced
- [x] v1.5.0 released — commit 2531852, tag v1.5.0, CI triggered
- [x] Safe uninstall command — removes only plugin files, preserves user custom files
- [x] macOS sed portability fix in bump-version.sh
- [x] v1.5.1 released — commit f860864, tag v1.5.1, CI triggered

## Key Files
- `src/extension.js` — VS Code extension (setup + uninstall commands)
- `scripts/build-dist.sh` — build system with skill distribution policy
- `scripts/bump-version.sh` — version bump (macOS sed fix applied)
- `scripts/validate-manifests.py` — manifest validation
- `agents/` — 7 Claude agents with MCP tools
- `skills/` — 17 canonical (16 distributed, interface-design excluded)
- `hooks/hooks.json` — ships real hooks (SessionStart + 2 Stop)
- `.github/tasks/` — unified operational files

## Next Steps
1. Live test: install VSIX in a clean workspace, verify Setup + Uninstall commands
2. Live test: Claude Code CLI plugin install + orchestrator agent
3. Live test: Copilot CLI plugin install
4. Live test: Stop hooks (lesson-detection, post-pipeline) in Claude Code CLI
5. Consider: update release workflow to build both VSIX variants + CLI tarballs

## Context
- v1.5.0: 96 files, +758/-2937 lines (major cleanup)
- v1.5.1: 9 files, +198/-23 lines (uninstall feature)
- All 4 builds passing: claude-code 30 files, copilot-cli 31 files, vscode-claude.vsix 83KB, vscode-copilot.vsix 92KB
- validate-manifests.py: ALL CHECKS PASSED
- No hardcoded local paths (grep verified clean)
- All docs in English, no Spanish remaining

## Resume Command
`claude --continue` or `claude --resume`
