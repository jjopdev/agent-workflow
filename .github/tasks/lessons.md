# Lessons

> Record after every user correction. Format: `### [CATEGORY] Title` + brief description.

---

## [ARCH]

### [ARCH] VS Code silently ignores unknown tool names — disabling all restrictions
When agent `.md` files declare tools VS Code doesn't recognize (Claude CLI names like `Read`, `Edit`, `Bash`, or undeclared MCP tools), VS Code silently drops them and gives the agent ALL default tools. MCP tools (`context7`, `shadcn`, `snyk`, `playwright`) must be declared explicitly — the platform does not infer them.

### [ARCH] Cross-platform agent body text is not auto-translated
Agent body text is passed through as-is. Instructions like "Use Grep to scan" remain literal in VS Code. Use platform-neutral wording ("Search the codebase for...") or body text drift will create real capability gaps — missing MCP references prevent VS Code from using tools even when available.

### [ARCH] Plugin manifests must declare ALL component paths explicitly
Claude Code and Copilot CLI `plugin.json` manifests require explicit `agents`, `skills`, and `hooks` fields. Without them, components go missing silently. Relying on defaults is fragile and behavior varies across CLI versions.

### [ARCH] Plugin manifests copy entire directories — no include/exclude control
`plugin.json` manifests have no `files` or include/exclude field, so the entire plugin directory is copied on install. Control distribution via a build script that assembles clean packages into a separate directory.

### [ARCH] VSIX packaging: use build-time source modification, not .vscodeignore re-exclusions
`.vscodeignore` with `**` deny-all + `!skills/**` whitelist, then `skills/interface-design/**` re-exclude doesn't reliably work with `vsce package`. Safer: modify the source directory before packaging. For multi-variant builds, use `--ignoreFile` with per-variant `.vscodeignore.<variant>` files and swap `package.json` temporarily.

### [ARCH] VS Code discovery uses platform-specific paths, not workspace root
VS Code discovers Claude variant under `.claude/agents/`, `.claude/skills/`, `.claude/rules/` — NOT root-level `agents/` or `skills/`. Hooks go in `.claude/settings.json` with wrapped `{"hooks": {...}}` structure, merging with existing settings. Copilot variant uses `.github/` paths.

### [ARCH] Workflow operational files are PROJECT-scoped, not platform-scoped
Single source of truth in `.github/tasks/` (lessons, todo, progress, summaries). Never duplicated per platform.

### [ARCH] Canonical workflow sources should not be duplicated
Keep single source of truth at repo root (`agents/`, `skills/`). Reserve `.claude/` for rules and settings only. Duplicating across root and `.claude/` creates maintenance burden and drift.

### [ARCH] `.claude/memory/` and `.claude/agent-memory/` are NOT project-level
Project memory lives at `~/.claude/projects/<project>/memory/` (user HOME). `.claude/memory/` in a repo has zero effect. `.claude/agent-memory/` is user-level (`~/.claude/agent-memory/`). Never commit these.

### [ARCH] Behavioral rules belong in rules/instructions, not memory files
Content like "always run full pipeline" belongs in `.claude/rules/` (Claude) or `.github/instructions/` (Copilot), even if originally captured as "feedback" during development.

### [ARCH] Reusable skills must avoid hard dependencies on repo-specific instruction files
Unless explicitly project-scoped.

### [ARCH] If the workflow references operational files, bootstrap must create/read them
Orchestrator startup must handle `summaries.md` and other operational files referenced in the workflow.

### [ARCH] When model policy changes, update both live agents and bootstrap templates
So future scaffolds do not regress.

### [ARCH] Prompt-refiner: suggest routing, don't imply automatic execution
For non-trivial work, preserve planning-first guidance and use the structured handoff as the reliable path.

### [ARCH] Skill output branches: template is the single source of truth
Direct-answer branches cannot require wrapper metadata, and copy-first branches cannot require extra prose outside the primary block.

### [ARCH] SKILL.md is the canonical source for agent definitions
Never edit `.agent.md` files directly; re-run bootstrap to sync.

### [ARCH] Scribe agent owns all writes to .github/tasks/
Orchestrator delegates, never writes directly.

### [ARCH] Security reports overwrite (not append) in security-report.md
Each review cycle produces a fresh report.

### [ARCH] Security context skill is a living document
Grows with each review cycle, never reset. Scribe scope includes `.github/skills/security-context/`.

### [ARCH] Snyk tools are optional
Security agent checks availability and falls back to manual review without blocking.

### [ARCH] Cross-platform skills need path resolution
Skills that write files (`consolidate`, `save-progress`, `lesson`) must detect the active platform or resolve paths centrally.

### [ARCH] Tailor active instructions to the actual repo type
Remove app-specific rules from workflow-only repositories.

### [ARCH] Reusable skills and templates/evals stay in English
Unless the user explicitly asks for another language.

## [DX]

### [DX] Skill authoring: minimal path, brief contracts
`SKILL.md` + template by default; prompts/checklists optional. If the template already has the canonical pattern, the skill should be a brief contract — don't repeat.

### [DX] cp -r merge bug when destination already exists
`cp -r dir/ dir.bak/` when `dir.bak/` already exists copies INTO it as `dir.bak/dir/`. Always `rm -rf` the backup target before `cp -r`.

### [DX] git push --tags pushes ALL local tags
Use `git push origin <tag>` to push only a specific tag. `--tags` pushes every local tag and fails if any already exists on the remote.

### [DX] Prefer whitelists for multi-target plugin distribution
Include only what each target needs. Whitelists are safer because new files cannot leak by accident.

### [DX] Distributed hooks should be the single source of truth
Ship real automation in `hooks/hooks.json` so distributed packages inherit the same behavior.

### [DX] Before recommending deletions, re-validate current state
The user may have already cleaned the workspace.

### [DX] Model selection in Copilot VS Code is manual
COMPLEXITY signal is guidance for the human operator, not automated routing.

### [DX] Windows `command -v python` lies
The Microsoft Store alias passes the check but fails at runtime. Always verify with `python --version`.

### [DX] MD reformatting: use `rm` + `create_file` instead of heredoc
If there are encoding issues.

## [SECURITY]

### [SECURITY] OWASP Top 10:2025 review is a dedicated Security agent
Reviewer only does basic security checks and flags for escalation.

### [SECURITY] Security agent auto-generates project security-context skill on first review
Scribe persists it, subsequent reviews read and update it.

## [FAIL]

### [FAIL] Validate distributed hook payloads, not stale snapshots
Always inspect the exact `hooks/hooks.json` file that packages ship, or installed plugins may miss automations.

## [PLANNING]

### [PLANNING] Plans must pass Staff Engineer pre-review before implementation
Step 0 (reproduce bugs first), all architectural decisions closed (no "TBD"), concrete acceptance criteria, PR strategy with dependency graph, cross-dependencies documented.

## [ARCHIVED]

### [ARCHIVED][ARCH] RPGLE daemon skills: separate stable daemon core vs project-adaptable SQL layer
### [ARCHIVED][ARCH] Control DTAARA: always create with `VALUE('STOP')`, use `RUN` only for explicit startup
### [ARCHIVED][ARCH] Generated RPGLE source: comments always in English, documentation can be in Spanish
### [ARCHIVED][DX] RPGLE skill: generate only the source by default, no auxiliary DDL/scripts unless explicitly requested
