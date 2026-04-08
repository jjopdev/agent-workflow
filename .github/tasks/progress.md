# Work In Progress

> Last saved: 2026-04-08 (session 13)

## Task
v1.5.2 release — fix VS Code Claude VSIX tool names + packaging

## Plan
- [x] Manual test: install VSIX Claude v1.5.1 in clean Windows workspace
- [x] Verified: agents discovered (7), skills discovered (16+1 leaked), settings.json with hooks, SessionStart hook works
- [x] Bug found: agent tool names use Claude CLI format (Read, Edit, Bash) — VS Code ignores them, no restrictions enforced
- [x] Bug found: interface-design skill leaking into VSIX despite exclusion policy
- [x] Bug found: .claude/rules/ not packaged in VSIX
- [x] Implement: translate_claude_tools_for_vscode() in build-dist.sh
- [x] Implement: Claude VSIX staging — backup agents + skills, translate tools, stage rules, restore after build
- [x] Implement: .vscodeignore.claude — added rules whitelist, interface-design exclusion
- [x] Fix: stale .bak dir guard (rm before cp -r), find instead of ls for counting
- [x] Review: Staff Engineer approved — 2 critical fixes applied
- [x] Test: all 4 builds passing (claude-code 30, copilot-cli 31, vscode-claude 36 files 62KB, vscode-copilot 44 files 90KB)
- [x] v1.5.2 released — commit 831ee71, tag v1.5.2, GitHub release with both VSIX + CLI tarballs
- [x] Manual test: reinstalled vscode-claude.vsix v1.5.2 in Windows workspace — agents, rules, skills all in correct paths

## Key Files
- `scripts/build-dist.sh` — added translate_claude_tools_for_vscode() + claude staging/restore
- `.vscodeignore.claude` — rules whitelist + interface-design exclusion
- `CHANGELOG.md` — v1.5.2 entry
- `dist/vscode-claude.vsix` — fixed VSIX (36 files, 62KB)

## Next Steps
1. Verify in Windows VS Code: tool restrictions enforced (orchestrator can't edit, reviewer can't run terminal)
2. Live test: Claude Code CLI plugin install + orchestrator agent
3. Live test: Copilot CLI plugin install
4. Live test: Stop hooks (lesson-detection, post-pipeline) in Claude Code CLI
5. Consider: update release workflow to build both VSIX variants + CLI tarballs
6. Consider: CI workflow to auto-build all 4 targets on tag push

## Context
- v1.5.2: 11 files, +122/-111 lines (tool translation fix)
- Tool mapping: Read→read/readFile, Edit→edit/editFiles, Write→edit/createFile, Bash→execute/runInTerminal, Glob→search/fileSearch, Grep→search/textSearch, Agent→agent/runSubagent, NotebookEdit→edit/editNotebook
- MCP tools (context7/*, snyk/*, playwright/*, shadcn/*) passed through unchanged
- WebFetch, WebSearch, Task* tools removed (built-in in VS Code)
- Branch: main

## Resume Command
`claude --continue` or `claude --resume`
