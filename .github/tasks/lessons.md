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
