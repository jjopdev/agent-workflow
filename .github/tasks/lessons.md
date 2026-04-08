# Lessons

> Record after every user correction. Format: `### [CATEGORY] Title` + brief description.

---

<!-- Lessons below -->

### [DX] MD reformatting: use `rm` + `create_file` instead of heredoc if there are encoding issues
### [ARCH] Skills derived from legacy source: require structural fidelity (same header, blocks, logging)
### [ARCH] Generated RPGLE source: comments always in English, documentation can be in Spanish
### [ARCH] RPGLE daemon skills: separate stable daemon core vs project-adaptable SQL layer
### [DX] Multi-file skills: minimal path by default (`SKILL.md` + template), prompts/checklists optional
### [DX] If the template already has the canonical pattern, the skill should be a brief contract — don't repeat
### [ARCH] Reusable skills must avoid hard dependencies on repo-specific instruction files unless explicitly project-scoped
### [ARCH] Control DTAARA: always create with `VALUE('STOP')`, use `RUN` only for explicit startup
### [DX] RPGLE skill: generate only the source by default, no auxiliary DDL/scripts unless explicitly requested
### [DX] Before recommending deletions, re-validate current directories because the user may have already cleaned the workspace
### [ARCH] Tailor active instructions to the actual repo type; remove app-specific rules from workflow-only repositories
### [ARCH] If the workflow references operational files like summaries.md, bootstrap and orchestrator startup must create/read them too
### [ARCH] Reusable skills and their templates/evals should stay in English unless the user explicitly asks for another language
### [ARCH] When model policy changes, update both live agent files and workflow bootstrap templates so future scaffolds do not regress
### [ARCH] Prompt-refiner must suggest workflow routing without implying automatic execution; for non-trivial work it must preserve planning-first guidance and use the structured handoff as the reliable path
### [ARCH] If a skill defines strict output branches, the output template must be the single source of truth: direct-answer branches cannot require wrapper metadata, and copy-first branches cannot require extra prose outside the primary block
### [ARCH] SKILL.md is the canonical source for all agent definitions — never edit .agent.md files directly; re-run bootstrap to sync
### [ARCH] Scribe agent owns all writes to .github/tasks/ — Orchestrator delegates, never writes directly
### [DX] Model selection in Copilot VS Code is manual — COMPLEXITY signal is guidance for the human operator, not automated routing
### [SECURITY] OWASP Top 10:2025 review is a dedicated Security agent — Reviewer only does basic security checks and flags for escalation
### [ARCH] Snyk tools are optional — Security agent checks availability and falls back to manual review without blocking
### [ARCH] Security reports overwrite (not append) in security-report.md — each review cycle produces a fresh report
### [SECURITY] Security agent auto-generates project security-context skill on first review — Scribe persists it, subsequent reviews read and update it
### [ARCH] Security context skill is a living document — grows with each review cycle, never reset
### [ARCH] Scribe scope expanded to include .github/skills/security-context/ — only security-context, not arbitrary skills
### [DX] Windows `command -v python` lies — the Microsoft Store alias passes the check but fails at runtime. Always verify with `python --version` before using
### [ARCH] VS Code does NOT discover skills/hooks/agents at workspace root — must use platform-specific discovery paths: `.claude/skills/`, `.claude/settings.json` (Claude format) or `.github/skills/`, `.github/hooks/` (Copilot format). Putting files at root means they're invisible.
### [ARCH] Plugin manifests should declare ALL component paths explicitly (agents, skills, hooks) — relying on defaults is fragile and undocumented behavior varies across CLI versions
### [ARCH] Workflow operational files (lessons, todo, progress, summaries) are PROJECT-scoped, not platform-scoped — single source of truth in `.github/tasks/`, never duplicated per platform
### [ARCH] `.claude/agent-memory/` is user-level (`~/.claude/agent-memory/`), NOT project-level — never commit empty agent-memory dirs to a repo, they're dead code
### [ARCH] `.claude/memory/` in a plugin repo is a development artifact — don't distribute it, as it would inject foreign memories into target projects
### [ARCH] Claude Code project memory lives at `~/.claude/projects/<project>/memory/` (user HOME) — `.claude/memory/` in the repo is NOT read by Claude Code at all, files there have zero effect
### [ARCH] Content that is functionally a behavioral rule ("always run full pipeline") belongs in `.claude/rules/` (Claude) or `.github/instructions/` (Copilot), NOT in memory files — even if originally captured as "feedback" during development
### [PLANNING] Plans must pass Staff Engineer pre-review before implementation: Step 0 (reproduce bugs first), all architectural decisions closed (no "TBD" in impl steps), concrete acceptance criteria (what command, what output), PR strategy with dependency graph, cross-dependencies between subtasks documented

### [ARCH] Plugin manifests copy entire directories
Claude Code and Copilot CLI `plugin.json` manifests have no `files` or include/exclude field, so the entire plugin directory is copied on install. To control distribution, use a git-subdir source, an npm source with a `files` whitelist, or a build script that assembles clean packages into a separate directory.

### [ARCH] VSIX contents need explicit packaging control
VS Code supports `.vscodeignore` as a blacklist and the `package.json` `files` field as a whitelist for controlling VSIX contents. Use `vsce package --ignoreFile` when you need multiple distribution variants from the same repo.

### [DX] Prefer whitelists for multi-target plugin distribution
When distributing a plugin repo to multiple targets, always use a whitelist approach and include only what each target needs. Whitelists are safer because new files cannot leak into distributions by accident.

### [ARCH] Multi-variant VS Code builds should use per-variant ignore files
For VS Code multi-variant builds from a single repo, use the `--ignoreFile` flag with separate `.vscodeignore.<variant>` files and swap `package.json` temporarily before `vsce package`. Always back up and restore the original files.

### [DX] Distributed hooks should be the single source of truth
Ship the real workflow automation in `hooks/hooks.json` so distributed packages inherit the same `SessionStart` and `Stop` behavior instead of relying on a separate dev-only hook file.

### [ARCH] Canonical workflow sources should not be duplicated
Eliminate canonical source duplication early. Duplicating `agents/` and `skills/` across root and `.claude/` creates maintenance burden and drift risk, so keep the single source of truth at the repository root and reserve `.claude/` for rules and settings.

### [ARCH] MCP tools are not inferred from platform mappings
VS Code auto-maps Claude frontmatter tool names such as `Read` and `Bash`, and silently ignores unknown tool names. MCP tools like `context7`, `shadcn`, `snyk`, and `playwright` must still be declared explicitly because the platform does not infer them from installed extensions.

### [ARCH] Agent body text is not translated across platforms
Agent body text is passed through as written. Instructions like "Use Grep to scan" remain literal in VS Code, so use platform-neutral wording such as "Search the codebase for..." or explicit per-platform tool syntax when a capability matters.

### [DX] Body text drift creates real cross-platform capability gaps
When agents support multiple platforms, frontmatter drift is usually manageable because tool names get mapped. Body text drift is more dangerous because missing MCP references in Claude agents prevent VS Code from using `context7`, `shadcn`, or `snyk` even when those tools are available.

### [FAIL] Validate distributed hook payloads instead of stale snapshots
Always inspect the exact `hooks/hooks.json` file that packages ship, or installed plugins may miss automations such as `/post-session --auto` even when local snapshots look correct.

### [ARCH] Cross-platform skills need path resolution
Skills that write files, such as `consolidate`, `save-progress`, and `lesson`, cannot hardcode platform-specific paths. They must detect the active platform or resolve paths centrally, or they will write to the wrong location.

### [ARCH] Claude variant discovery uses platform-specific paths
VS Code discovers the Claude variant under `.claude/agents/`, `.claude/skills/`, and `.claude/rules/`, not under root-level `agents/` or `skills/`. Hooks belong in `.claude/settings.json` with a wrapped `{"hooks": ...}` structure, and updates must merge into the existing file so workspace permissions are not overwritten.

### [ARCH] Claude plugin manifests must declare agents and skills
Claude Code CLI plugin manifests require explicit `agents` and `skills` fields in `plugin.json`. Without them, only `hooks` resolve and agents or skills go missing silently even when the folders exist on disk.
