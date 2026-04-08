# Summaries

> Repository navigation cache. Store brief summaries of already-explored modules, files, or areas to avoid unnecessary re-analysis.

## Format

Use one section per explored area:

```md
### [AREA] Short name
- Date: YYYY-MM-DD
- Status: active | stale
- Paths: path/a, path/b
- Summary: 2-4 lines with structure, responsibility, and key points
- Notes: dependencies, risks, or relevant decisions
```

## Conventions

- Mark as `stale` if an important file in that area changes.
- Keep summaries brief and operational.
- Do not duplicate information already captured in `lessons.md`.

<!-- Module summaries below -->

### [BUILD] Distribution System (build-dist.sh)
- Date: 2026-04-08
- Status: active
- Paths: scripts/build-dist.sh, .vscodeignore.claude, .vscodeignore.copilot
- Summary: Builds 4 targets from single repo: claude-code (CLI plugin), copilot-cli (CLI plugin), vscode-claude (VSIX), vscode-copilot (VSIX). Uses backup/restore pattern for staging. Claude VSIX translates tool names and stages rules. Copilot VSIX stages .github/agents/ as agents/. Skills cleaned via remove_skill_dev_artifacts(). interface-design excluded from all distributions.
- Notes: macOS/Linux/Windows(Git Bash) portable. Depends on replace_in_file() for sed portability. v1.5.2 added translate_claude_tools_for_vscode().

### [EXTENSION] VS Code Extension (src/extension.js)
- Date: 2026-04-08
- Status: active
- Paths: src/extension.js, package.json, package.claude.json, package.copilot.json
- Summary: Two commands: agentWorkflow.setup (installs agents/skills/hooks/rules into workspace) and agentWorkflow.uninstall (removes only plugin files, preserves custom). Claude variant → .claude/ paths with settings.json merge. Copilot variant → .github/ paths. Detects variant from package.json agentVariant field.
- Notes: Uninstall uses whitelists (CLAUDE_AGENT_FILES, WORKFLOW_SKILL_DIRS, CLAUDE_RULE_FILES) to avoid deleting user files.

### [TOOLS] Platform Tool Name Mapping
- Date: 2026-04-08
- Status: active
- Paths: agents/*.md, .github/agents/*.agent.md
- Summary: Claude CLI uses generic names (Read, Edit, Bash, Glob, Grep, Agent). VS Code uses namespaced names (read/readFile, edit/editFiles, execute/runInTerminal, search/fileSearch, search/textSearch, agent/runSubagent). MCP tools (context7/*, snyk/*, playwright/*, shadcn/*) are identical across platforms. WebFetch, WebSearch, Task* are built-in in VS Code (no explicit declaration needed).
- Notes: Translation happens at build time only — source agents/ always uses Claude CLI names.