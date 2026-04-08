# Work In Progress

> Last saved: 2026-04-08 (session 7 — VS Code Copilot)

## Task
Crear script de version bump (`scripts/bump-version.sh`)

## Status: COMPLETE ✓

## Plan
- [x] Auditoría de versiones — todas en 1.4.0, CHANGELOG al día
- [x] Plan aprobado por usuario
- [x] Implementar `scripts/bump-version.sh`
- [x] Test: todos los modos verificados (patch, minor, major, explicit)
- [x] Review: bash puro, sin deps, idempotente, validate-manifests pasa
- [x] Repo revertido a 1.4.0 (estado limpio)

## Key Files
- `scripts/bump-version.sh` — NUEVO: script a crear
- `scripts/build-dist.sh` — referencia (no modificar)
- `scripts/validate-manifests.py` — referencia (no modificar)
- `package.json` — single source of truth para versión
- `CHANGELOG.md` — agregar entrada template
- `.github/tasks/todo.md` — tracking del pipeline

## Acceptance Criteria
1. `bash scripts/bump-version.sh patch` desde 1.4.0 → 1.4.1 en todos los manifests
2. `bash scripts/bump-version.sh minor` → 1.5.0
3. `bash scripts/bump-version.sh major` → 2.0.0
4. `bash scripts/bump-version.sh 1.6.0` → versión explícita
5. CHANGELOG.md recibe nueva entrada template
6. `validate-manifests.py` pasa después del bump

## Constraints
- Pure bash, no npm/node
- No modificar build-dist.sh ni validate-manifests.py

## Standards
- **Semver 2.0.0** — MAJOR.MINOR.PATCH (semver.org)
- **Keep a Changelog 1.1.0** — formato ya usado en CHANGELOG.md
- Categorías: Added, Changed, Fixed, Deprecated, Removed, Security
- Formato: `## [X.Y.Z] - YYYY-MM-DD` + secciones `### Category`
- Template genera entrada vacía con Added/Changed/Fixed para completar
- Después del bump, correr validate-manifests.py
- Idempotente: no duplicar entrada si la versión ya existe en CHANGELOG

## Context
- build-dist.sh ya tiene `sync_version()` que propaga desde package.json
- validate-manifests.py ya verifica consistencia

## Branch
`main`
