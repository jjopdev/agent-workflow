# Work In Progress

> Last saved: 2026-04-08 (session 7 — VS Code Copilot)

## Task
Fix Plugin Installation Paths — hooks, skills, agents no se descubren tras instalar en ninguna plataforma

## Plan
- [x] Investigación docs oficiales (Claude Code, Copilot CLI, VS Code)
- [x] Root cause analysis con hipótesis por target
- [x] Standards documentados con discovery paths por plataforma
- [x] Lessons registradas
- [ ] **Next**: Step 1 — Fix `installClaudeVariant()` en `extension.js`
- [ ] Step 2 — Completar manifest `.claude-plugin/plugin.json`
- [ ] Step 3 — Verificar hooks format por plataforma
- [ ] Step 4 — Verificar VS Code Copilot variant
- [ ] Step 5 — Test en cada plataforma
- [ ] Step 6 — Review

## Key Files
- `src/extension.js` — fix `installClaudeVariant()` paths (skills→`.claude/skills/`, hooks→`.claude/hooks/`, agents→`.claude/agents/`)
- `.claude-plugin/plugin.json` — agregar agents/skills paths explícitos
- `.github/tasks/todo.md` — plan completo § "Fix Plugin Installation Paths"
- `scripts/build-dist.sh` — posible ajuste si estructura del paquete Claude incorrecta

## Next Steps
1. Fix `installClaudeVariant()`: cambiar dest de `skills/`→`.claude/skills/`, `hooks/`→`.claude/hooks/`, `agents/`→`.claude/agents/`
2. Agregar `agents` y `skills` fields al `.claude-plugin/plugin.json`
3. Verificar hooks format (flat vs wrapped) por plataforma
4. Test de instalación en VS Code, Claude Code CLI, Copilot CLI

## Context
- Bug confirmado: VS Code no descubre skills/hooks en workspace root — busca en `.claude/` o `.github/`
- 6 targets de instalación analizados, prioridad en VS Code VSIX Claude (bug confirmado)
- bump-version.sh completado esta sesión (commit `48f4d48`)

## Branch
`main`
