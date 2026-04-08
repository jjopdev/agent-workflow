# Work In Progress

> Last saved: 2026-04-08 (session 9 — VS Code Copilot)

## Task
Fix plugin installation paths + cleanup `.claude/` + unify operational files + wire summaries.md + align agent tools per platform — 5 PRs planificados.

## Plan

### PR1: Fix Plugin Installation Paths (`fix/plugin-install-paths`)
- [x] Research: discovery paths oficiales por plataforma
- [x] Root cause analysis: bug confirmado `installClaudeVariant()` → paths incorrectos
- [x] Plan con hipótesis, decisiones cerradas, acceptance criteria concretos
- [x] Staff Engineer review aplicado al plan
- [ ] Step 0: Reproducir bugs en cada plataforma (5 targets)
- [ ] Step 1: Fix `installClaudeVariant()` → `.claude/agents/`, `.claude/skills/`, `.claude/settings.json`
- [ ] Step 2: Completar `.claude-plugin/plugin.json` con agents/skills paths
- [ ] Step 3: Hooks format (cerrado — tabla por archivo)
- [ ] Step 4: Verificar VS Code Copilot variant
- [ ] Step 5: Test en cada plataforma
- [ ] Step 6: Review

### PR2: Unificar archivos operacionales (`refactor/unify-operational-files`)
- [ ] Mover `progress.md` → `.github/tasks/progress.md`
- [ ] Eliminar duplicación lessons.md y summaries.md
- [ ] Actualizar agents/skills/hooks references

### PR3: Cleanup `.claude/` (`cleanup/claude-dead-files`) — depende de PR2
- [ ] Eliminar `.claude/agent-memory/` (dead code)
- [ ] Mover feedback rule → `.claude/rules/` + `.github/instructions/`
- [ ] Eliminar `.claude/memory/` completo

### PR4: Wire summaries.md triggers (`feat/wire-summaries-triggers`) — depende de PR2
- [ ] Implementar `add_summary` trigger en orchestrator
- [ ] Implementar `mark_stale` trigger en post-pipeline
- [ ] Bootstrap summaries.md si no existe (Claude Code)
- [ ] Post-Pipeline Extraction incluye summaries

### PR5: Alinear agent tools por plataforma (`fix/agent-tools-per-platform`)
- [ ] **Fix inmediato (additive, zero-break):**
  - [ ] Claude agents: agregar MCP tools al frontmatter (context7, shadcn, snyk, playwright)
  - [ ] Claude agents: body hints neutros para docs lookup
  - [ ] Security agent Claude: agregar Snyk/Playwright refs
  - [ ] Verificar mapeo VS Code (qué tools mapean, cuáles se ignoran)
  - [ ] Propagar a distribution copies
- [ ] **Decisión arquitectural PENDIENTE** — 4 opciones en todo.md, requiere input del usuario

## Key Files
- `.github/tasks/todo.md` — plan completo con 5 PRs, Subtask A-D, acceptance criteria
- `skills/workflow-knowledge/lessons.md` — 9 lessons acumuladas
- `src/extension.js` — bug confirmado en `installClaudeVariant()` (L55-68)
- `.claude-plugin/plugin.json` — falta agents/skills paths
- `agents/*.md` — Claude agents (fix: agregar MCP tools frontmatter)
- `.github/agents/*.agent.md` — Copilot agents (referencia completa)
- `scripts/build-dist.sh` — build logic por variante VSIX

## Next Steps
1. **Decidir opción arquitectural (A-D)** para alinear body text de agents a largo plazo
2. Crear branch `fix/agent-tools-per-platform` y ejecutar fix inmediato (PR5)
3. Crear branch `fix/plugin-install-paths` y ejecutar Step 0 (reproducir bugs)
4. Implementar Steps 1-5 de PR1
5. PR2-PR4 en secuencia después de PR1/PR5

## Context
- **VS Code mapea Claude tool names automáticamente** (Read → read/readFile, etc.)
- **MCP tools NO se mapean** — deben estar explícitos en frontmatter
- **Tools desconocidos se ignoran silenciosamente** en ambas plataformas
- **Body text NO se transforma** — "Use Grep" queda literal en VS Code
- **PR order:** PR1, PR2, PR5 en paralelo → PR3 y PR4 después de PR2
- **3 new lessons** recorded: VS Code tool mapping, body text not transformed, MCP gap real

## Branch
`main` — commit `60cf005`
