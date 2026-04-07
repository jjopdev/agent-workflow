# Agent Workflow — Claude Code

@agents/orchestrator.md

## Scope (repo-specific)
- Primary sources of truth: `agents/`, `skills/`, `.claude/rules/`, and root Markdown files
- Prefer minimal, focused changes
- Do not assume there is a runnable app unless such files exist
- Documentation may be in Spanish; code-like examples in English when clearer

## Plugin Distribution
This repo is distributable as a plugin for Claude Code and Copilot CLI:
- **Claude Code plugin manifest:** `.claude-plugin/plugin.json`
- **Copilot CLI plugin manifest:** `plugin.json` (root)
- **VS Code extension:** `package.json` + `src/extension.js`
- Root `skills/` and `agents/` are the canonical plugin sources
- `packages/claude-code/` and `packages/copilot-cli/` are distribution copies built by `scripts/build-dist.sh`

## Orchestrator Discipline (repo-specific)
- The main session (orchestrator) MUST NOT use Edit, Write, or state-changing Bash on project files
- If a "quick fix" tempts you to edit directly, delegate it anyway — the pipeline exists for a reason
- The only exceptions are meta-files: lessons.md, progress.md, MEMORY.md (workflow artifacts, not project code)
- Delegating a one-line fix to an Implementer costs less than debugging a pipeline bypass

## Scope
- Primary sources of truth: `agents/`, `skills/`, `.claude/rules/`, and root Markdown files
- Prefer minimal, focused changes
- Do not assume there is a runnable app unless such files exist
- Documentation may be in Spanish; code-like examples in English when clearer

### Plugin Distribution
This repo is distributable as a plugin for Claude Code and Copilot CLI:
- **Claude Code plugin manifest:** `.claude-plugin/plugin.json`
- **Copilot CLI plugin manifest:** `plugin.json` (root)
- **VS Code extension:** `package.json` + `src/extension.js`
- Root `skills/` and `agents/` are the canonical plugin sources

## Rules
- If something goes wrong, STOP and re-plan before retrying
- After any user correction, record a lesson
- Subagents do NOT inherit your instructions — include necessary context in each delegation
- Verify referenced paths and filenames actually exist before recommending them
- Prefer updating existing files over creating new ones unless a new file has a clear purpose
- Never mark a task complete without demonstrating it works
- Ask: "Would a Staff Engineer approve this?" before finalizing
