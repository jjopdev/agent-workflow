# Lessons

> Record after every user correction. Format: `- **[CATEGORY]** Description` with actionable takeaway.

---

<!-- Generic workflow lessons — project-specific lessons go in each project's own lessons file -->

- **[DX]** Before recommending deletions, re-validate current directories because the user may have already cleaned the workspace
- **[ARCH]** Tailor active instructions to the actual repo type; remove app-specific rules from workflow-only repositories
- **[ARCH]** If the workflow references operational files like summaries.md, bootstrap and orchestrator startup must create/read them too
- **[ARCH]** Reusable skills and their templates/evals should stay in English unless the user explicitly asks for another language
- **[ARCH]** When model policy changes, update both live agent files and workflow bootstrap templates so future scaffolds do not regress
- **[ARCH]** Prompt-refiner must suggest workflow routing without implying automatic execution; for non-trivial work it must preserve planning-first guidance and use the structured handoff as the reliable path
- **[ARCH]** If a skill defines strict output branches, the output template must be the single source of truth
- **[DX]** Model selection in Claude Code is automatic via agent frontmatter — no manual COMPLEXITY signal needed
- **[SECURITY]** OWASP Top 10:2025 review is a dedicated Security agent — Reviewer only does basic security checks and flags for escalation
- **[ARCH]** Snyk tools are optional — Security agent checks availability and falls back to manual review without blocking
- **[ARCH]** Security reports overwrite (not append) — each review cycle produces a fresh report
- **[SECURITY]** Security agent auto-generates project security-context on first review — subsequent reviews read and update it
- **[DX]** ALWAYS run the full pipeline (Plan → Implement → Test → Review → Security) for any task involving code changes, even single-file bug fixes. The Quick/Standard paths caused the orchestrator to skip delegation when there was real work to do. The cost of running the pipeline is always lower than the cost of missing a bug.
- **[FAIL]** Tester agent must NEVER create temporary debug scripts (test_debug*.mjs) in the same directory as production test files. These scripts import shared modules and contaminate in-memory state, causing unrelated tests to fail. Debug scripts must use a separate /tmp directory or be cleaned up immediately after use.
