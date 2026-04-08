# Work In Progress

> Last saved: 2026-04-08 (session 8 — VS Code Copilot)

## Task
Fix plugin installation paths + cleanup `.claude/` + unify operational files — 3 PRs planificados.

## Plan

### PR1: Fix Plugin Installation Paths (`fix/plugin-install-paths`)
- [x] Research: discovery paths oficiales por plataforma
- [x] Root cause analysis: bug confirmado `installClaudeVariant()` → paths incorrectos
- [x] Plan con hipótesis, decisiones cerradas, acceptance criteria concretos
- [x] Staff Engineer review aplicado al plan
- [ ] Step 0: Reproducir bugs en cada plataforma (5 targets)
- [ ] Step 1: Fix `installClaudeVariant()` → `.claude/agents/`, `.claude/skills/`, `.claude/settings.json` (hooks wrapped, merge-safe)
- [ ] Step 2: Completar `.claude-plugin/plugin.json` con agents/skills paths
- [ ] Step 3: ~~Hooks format~~ (cerrado — tabla por archivo, todos OK excepto Claude workspace)
- [ ] Step 4: Verificar VS Code Copilot variant
- [ ] Step 5: Test en cada plataforma (acceptance criteria concretos en plan)
- [ ] Step 6: Review

### PR2: Unificar archivos operacionales (`refactor/unify-operational-files`)
- [ ] Mover `progress.md` → `.github/tasks/progress.md`
- [ ] Eliminar duplicación lessons.md y summaries.md (skills/ vs .github/tasks/)
- [ ] Actualizar agents/skills/hooks references

### PR3: Cleanup `.claude/` (`cleanup/claude-dead-files`) — depende de PR2
- [ ] Eliminar `.claude/agent-memory/` (carpetas vacías, dead code)
- [ ] Mover `.claude/memory/feedback_always_full_pipeline.md` → `.claude/rules/always-full-pipeline.md` + `.github/instructions/always-full-pipeline.instructions.md`
- [ ] Eliminar `.claude/memory/` completo
- [ ] Verificar build-dist.sh y .gitignore

## Key Files
- `.github/tasks/todo.md` — plan completo con 3 PRs, steps, y acceptance criteria
- `.github/tasks/lessons.md` — 6+ lessons de esta sesión
- `src/extension.js` — bug confirmado en `installClaudeVariant()` (L55-68)
- `.claude-plugin/plugin.json` — falta agents/skills paths
- `.claude/memory/feedback_always_full_pipeline.md` — contenido a mover a rules
- `scripts/bump-version.sh` — completado esta sesión

## Next Steps
1. Crear branch `fix/plugin-install-paths` y ejecutar Step 0 (reproducir bugs)
2. Implementar Steps 1-2 (fix extension.js + manifest)
3. Test Step 5 con acceptance criteria concretos
4. PR1 review + merge
5. Branches PR2 y PR3 en secuencia

## Context
- **Staff Engineer review aplicado**: Step 0 reproduce, decisiones cerradas, acceptance criteria, PR strategy, cross-deps, rule scope
- **Decisiones cerradas:** hooks → `.claude/settings.json` wrapped + merge-safe; regla pipeline SÍ se distribuye
- **PR order:** PR1 ∥ PR2 → PR3 (depends on PR2)
- **6 targets:** VS Code VSIX Claude (BUG CONFIRMED), Copilot (verify), Agent Plugin (verify), Claude CLI (verify), Copilot CLI repo (probably OK), Copilot CLI dist (probably OK)

## Branch
`main` — commit `0c46bda`
