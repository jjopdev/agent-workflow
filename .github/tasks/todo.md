# Todo

> Active session tasks. Orchestrator manages. One section per feature with date.

---

<!-- Active tasks below -->

## Documentation Review — 2026-04-07

Revisión completa de la documentación del proyecto por etapas.

### Etapa 1: Entrada del usuario
- [x] **README.md** — ¿Se entiende qué es, cómo instalarlo, cómo arranca? Conteos actualizados (agents, skills, files).

### Etapa 2: Instalación y setup
- [x] **INSTALL.md** — Pasos correctos y completos. Conteos de archivos/skills/agents al día.
- [x] **SETUP.md** — Instrucciones claras para ambos workflows (Claude Code / Copilot).

### Etapa 3: Uso diario
- [x] **GUIDE.md** — Flujo de trabajo claro. Ejemplos realistas. Slash commands actualizados.

### Etapa 4: Referencia interna
- [x] **CLAUDE.md** — Refleja el estado actual del repo.
- [x] **CHANGELOG.md** — Todas las versiones documentadas, formato consistente.

### Hooks learning (paralelo)
- [x] SessionStart hook — progress.md detectado al iniciar sesión
- [x] Stop hook (lesson-detection) — Tests de validación creados (25/25 passing) ⚠️ *Live test pendiente en Claude Code CLI*
- [x] Stop hook (post-pipeline) — Tests de validación creados (25/25 passing) ⚠️ *Live test pendiente en Claude Code CLI*

---

## Version Bump Script — 2026-04-08

Automatizar el flujo de release: bump de versión + CHANGELOG + propagación a todos los manifests.

### Pipeline: Plan → Implement → Test ∥ Review → Security

#### Step 1: Plan
- [x] Auditoría de estado actual de versiones — todas en 1.4.0 ✓
- [x] Identificar gap: no existe script de version bump
- [x] Definir acceptance criteria

#### Step 2: Implement
- [x] Crear `scripts/bump-version.sh` — acepta `patch|minor|major` o versión explícita
- [x] Actualiza `version` en 5 manifests directamente (package.json, package.claude.json, package.copilot.json, plugin.json, .claude-plugin/plugin.json)
- [x] Prepende entrada template en `CHANGELOG.md`
- [x] Valida con `validate-manifests.py` post-bump (con fallback si Python no está disponible)

#### Step 3: Test + Review
- [x] Test: `bump-version.sh patch` → 1.4.1 en todos los manifests ✓
- [x] Test: `bump-version.sh minor` → 1.5.0 ✓
- [x] Test: `bump-version.sh major` → 2.0.0 ✓
- [x] Test: `bump-version.sh 1.4.0` (explicit) → revierte correctamente ✓
- [x] Test: idempotencia CHANGELOG — no duplica entrada existente ✓
- [x] Test: `validate-manifests.py` → ALL CHECKS PASSED ✓
- [x] Review: script es puro bash, sin dependencias npm/node, idempotente ✓

#### Step 4: Security
- [x] N/A — no toca auth, input de usuario, APIs, ni secrets. Input validado con regex semver.

### Constraints
- Pure bash, no npm/node dependencies
- No modificar `build-dist.sh` ni `validate-manifests.py`
- `package.json` sigue siendo single source of truth

### Standards
- **Semver** — [semver.org/spec/v2.0.0](https://semver.org/spec/v2.0.0.html): MAJOR (breaking), MINOR (features), PATCH (fixes)
- **Keep a Changelog** — [keepachangelog.com/en/1.1.0](https://keepachangelog.com/en/1.1.0/): formato ya usado en CHANGELOG.md
- **Categorías válidas**: Added, Changed, Fixed, Deprecated, Removed, Security
- **Formato de entrada**: `## [X.Y.Z] - YYYY-MM-DD` seguido de secciones `### Category`
- **Template**: el script debe generar una entrada vacía con todas las categorías comunes (Added, Changed, Fixed) para que el usuario la complete
- **Validación**: después del bump, correr `validate-manifests.py` para verificar consistencia
- **Idempotencia**: si la versión ya existe en CHANGELOG, no duplicar la entrada

---

## Fix Plugin Installation Paths — 2026-04-08

**Bug:** Tras instalar el plugin en cualquier plataforma, hooks y skills no son descubiertos automáticamente — requiere mover manualmente las carpetas a `.claude/` o `.github/` según el caso.

### Root Cause Analysis

Hay **6 targets de instalación** (2 niveles × 3 plataformas). Analicé docs oficiales, código actual y rutas esperadas.

#### Hipótesis por target

**1. VS Code VSIX — Claude variant (extension.js setup command)**
- **BUG CONFIRMADO:** `installClaudeVariant()` copia skills a `skills/` y hooks a `hooks/hooks.json` en el root del workspace
- VS Code busca skills en: `.claude/skills/`, `.github/skills/`, `.agents/skills/`
- VS Code busca hooks en: `.claude/settings.json`, `.claude/settings.local.json`, `.github/hooks/`
- `skills/` y `hooks/` en root **NO están en las rutas de discovery** → no se descubren
- **Fix:** Cambiar dest a `.claude/skills/`, `.claude/hooks/hooks.json` o `.claude/settings.json`

**2. VS Code VSIX — Copilot variant (extension.js setup command)**
- `installCopilotVariant()` copia a `.github/agents/`, `.github/skills/`, `.github/hooks/hooks.json`
- VS Code busca skills en `.github/skills/` ✓ y hooks en `.github/hooks/*.json` ✓
- **Probablemente OK** — pero verificar si hooks.json necesita wrapper `{"hooks": {...}}`

**3. VS Code Agent Plugin (Install from Source / marketplace)**
- Plugin se instala en perfil del user, VS Code autodetecta formato (Claude/Copilot) y descubre desde el dir del plugin
- Para plugins: hooks en `hooks.json` o `hooks/hooks.json` → autodetectado
- **Nivel user:** debería funcionar si VS Code resuelve paths del plugin correctamente
- **Nivel project:** no aplica — plugins son siempre user-level
- **Hipótesis:** `.claude-plugin/plugin.json` no declara `agents` ni `skills` paths — depende de default discovery. Verificar.

**4. Claude Code CLI (plugin install)**
- Plugin va a `~/.claude/plugins/cache/` — user-level
- `.claude-plugin/plugin.json` declara solo `"hooks": "./hooks/hooks.json"` — no declara `agents` ni `skills`
- Defaults: `agents/`, `skills/` relativas al plugin root → **debería funcionar**
- **Nivel project:** Si el usuario quiere hooks a nivel de proyecto (no global), necesita copiar a `.claude/settings.json` del proyecto. El plugin NO hace esto automáticamente.
- **Hipótesis:** El plugin funciona a nivel user, pero el usuario espera comportamiento a nivel project. O el manifest incompleto causa que skills no se descubran.

**5. Copilot CLI (plugin install from repo)**
- Root `plugin.json` declara: `agents: ".github/agents/"`, `skills: "skills/"`, `hooks: "hooks/hooks.json"`
- Los agents en el repo están en `.github/agents/` ✓
- Skills en `skills/` ✓, hooks en `hooks/hooks.json` ✓
- **Nivel user:** debería funcionar
- **Nivel project:** mismo caso — plugin es user-level, si quiere project-level, necesita copiar a `.github/`

**6. Copilot CLI (plugin install from dist/package)**
- `dist/copilot-cli/plugin.json` → `agents: "agents/"`, `skills: "skills/"`, `hooks: "hooks/hooks.json"`
- Estructura interna del package ya tiene `agents/`, `skills/`, `hooks/hooks.json`
- **Debería funcionar a nivel user**

### Bugs confirmados vs por verificar

| # | Target | Status | Problema |
|---|---|---|---|
| 1 | VS Code VSIX Claude | **BUG CONFIRMADO** | Skills a `skills/` y hooks a `hooks/` — VS Code no los descubre |
| 2 | VS Code VSIX Copilot | Por verificar | Paths correctos pero hooks format podría fallar |
| 3 | VS Code Agent Plugin | Por verificar | Manifest Claude no declara agents/skills paths |
| 4 | Claude Code CLI | Por verificar | Manifest no declara agents/skills; project-level requiere copia manual |
| 5 | Copilot CLI (repo) | Probablemente OK | Paths declarados coinciden con estructura |
| 6 | Copilot CLI (dist) | Probablemente OK | build-dist.sh ya ajusta paths |

### Pipeline: Implement → Test → Review

#### Step 1: Fix VS Code VSIX — Claude variant (bug confirmado)

Cambiar `installClaudeVariant()` en `extension.js`:
```
agents  → .claude/agents/        (o dejar root — VS Code busca en .claude/agents/)
skills  → .claude/skills/        (VS Code NO busca en skills/)
hooks   → .claude/settings.json  (VS Code busca en .claude/settings.json, NO en hooks/)
```
- [ ] Actualizar `installClaudeVariant()` en `src/extension.js`
- [ ] Decidir formato hooks: archivo separado `.claude/hooks/hooks.json` o embebido en `.claude/settings.json`

#### Step 2: Completar manifest de Claude Code plugin

Agregar `agents` y `skills` al `.claude-plugin/plugin.json`:
```json
{
  "agents": "./agents/",
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json"
}
```
- [ ] Actualizar `.claude-plugin/plugin.json` con paths explícitos
- [ ] Actualizar `packages/claude-code/.claude-plugin/plugin.json` (copia del build)

#### Step 3: Verificar hooks format por plataforma

Los hooks tienen 2 formatos:
- **Flat (Copilot/root):** `{ "PreToolUse": [], "Stop": [] }`
- **Wrapped (Claude):** `{ "hooks": { "PreToolUse": [], "Stop": [] } }`

Estado actual:
- `hooks/hooks.json` → flat (template vacío)
- `packages/claude-code/hooks/hooks.json` → wrapped (con hooks reales)
- `packages/copilot-cli/hooks/hooks.json` → flat (template vacío)
- `hooks/hooks.dev.json` → wrapped (hooks de desarrollo)

VS Code docs: "For Claude format, it's `hooks/hooks.json`, and for Copilot format, it's `hooks.json` at the plugin root. VS Code auto-detects the plugin format."
- [ ] Verificar que cada paquete usa el formato correcto para su plataforma

#### Step 4: Verificar VS Code Copilot variant
- [ ] Confirmar que `.github/hooks/hooks.json` es descubierto por VS Code
- [ ] Verificar formato hooks (flat vs wrapped) para workspace `.github/hooks/`

#### Step 5: Test en cada plataforma
- [ ] VS Code VSIX Claude: instalar en workspace vacío → verificar skills y hooks descubiertos
- [ ] VS Code VSIX Copilot: instalar en workspace vacío → verificar discovery
- [ ] VS Code Agent Plugin (Install from Source): verificar discovery
- [ ] Claude Code CLI: `claude plugin install` → verificar skills/hooks/agents
- [ ] Copilot CLI: `copilot plugin install` → verificar skills/hooks/agents

#### Step 6: Review
- [ ] Verificar que la instalación existente no se rompe
- [ ] Confirmar que build-dist.sh produce paquetes con rutas correctas

### Constraints
- No romper instalación existente en ninguna plataforma
- Cambios mínimos — solo lo necesario
- `build-dist.sh`: modificar solo si empaqueta con estructura incorrecta
- `validate-manifests.py`: actualizar si se cambian rutas de manifests

### Standards — Discovery paths oficiales por plataforma

Fuentes: [VS Code Copilot Customization docs](https://code.visualstudio.com/docs/copilot/customization/), [Claude Code plugin reference](https://code.claude.com/docs/en/plugins-reference), [Copilot CLI plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)

#### VS Code — workspace-level (archivos dentro del proyecto)

| Tipo | Claude format | Copilot format |
|---|---|---|
| Agents | `.claude/agents/*.md` | `.github/agents/*.agent.md` |
| Skills | `.claude/skills/*/SKILL.md` | `.github/skills/*/SKILL.md` |
| Hooks | `.claude/settings.json` o `.claude/settings.local.json` (wrapped `{"hooks":{}}`) | `.github/hooks/*.json` (flat) |
| Instructions | `.claude/rules/*.md` | `.github/instructions/*.instructions.md` |

> Configurable via `chat.agentFilesLocations`, `chat.agentSkillsLocations`, `chat.hookFilesLocations`

#### VS Code — user-level (perfil del usuario)

| Tipo | Claude format | Copilot format |
|---|---|---|
| Agents | `~/.claude/agents/` | `~/.copilot/agents/` |
| Skills | `~/.claude/skills/` | `~/.copilot/skills/` |
| Hooks | `~/.claude/settings.json` | `~/.copilot/hooks/` |

#### VS Code — plugin-level (instalado via marketplace/source)

Plugins viven en directorio del perfil del usuario, NO en el workspace.
- VS Code autodetecta formato (Claude vs Copilot) por presencia de `.claude-plugin/` vs `plugin.json` en root
- Hooks: Claude format → `hooks/hooks.json`, Copilot format → `hooks.json` (root)
- Agents/Skills: resueltos desde plugin dir por paths del manifest o defaults
- Scripts referencian `${CLAUDE_PLUGIN_ROOT}` para paths

#### Claude Code CLI — plugin-level

| Tipo | Path (relativa al plugin root) | Default si no declarado en manifest |
|---|---|---|
| Manifest | `.claude-plugin/plugin.json` | — |
| Agents | campo `agents` del manifest | `agents/` |
| Skills | campo `skills` del manifest | `skills/` |
| Hooks | campo `hooks` del manifest | `hooks/hooks.json` |
| Settings | `settings.json` | — |

Plugins se cachean en `~/.claude/plugins/cache/`. No copian al workspace.

#### Copilot CLI — plugin-level

| Tipo | Path (relativa al plugin root) | Default si no declarado en manifest |
|---|---|---|
| Manifest | `plugin.json` (root) | — |
| Agents | campo `agents` del manifest | `agents/` |
| Skills | campo `skills` del manifest | `skills/` |
| Hooks | campo `hooks` del manifest | `hooks.json` |
| Settings | `settings.json` | — |

Plugins se instalan en `~/.copilot/installed-plugins/`. No copian al workspace.

#### Regla de oro para el fix

> **Cada target de instalación debe poner archivos EXACTAMENTE donde la plataforma los busca.**
> - VS Code VSIX (setup command) → copia al workspace en paths de discovery
> - CLI plugins → manifest declara paths relativos al plugin root (defaults OK si estructura coincide)
> - VS Code agent plugin → estructura interna del plugin + manifest, VS Code resuelve

### Archivos a modificar (estimado)
1. `src/extension.js` — fix `installClaudeVariant()` paths: skills → `.claude/skills/`, hooks → `.claude/hooks/hooks.json`, agents → `.claude/agents/`
2. `.claude-plugin/plugin.json` — agregar `agents` y `skills` paths explícitos
3. Posiblemente `build-dist.sh` — si la estructura del paquete Claude necesita cambios
4. Posiblemente `validate-manifests.py` — si las rutas validadas cambian

---

### Subtarea A: Unificar ubicación de archivos operacionales del workflow

#### Problema
Los archivos operacionales (lessons, todo, progress, summaries) están fragmentados en 3 ubicaciones:

| Archivo | Ubicación actual | Quién lo usa |
|---|---|---|
| `lessons.md` | `.github/tasks/lessons.md` | Copilot agents (Scribe) — hard-coded |
| `lessons.md` | `skills/workflow-knowledge/lessons.md` | Claude Code (orchestrator skill) |
| `todo.md` | `.github/tasks/todo.md` | Copilot agents (Scribe) |
| `summaries.md` | `.github/tasks/summaries.md` | Copilot agents (Scribe) |
| `summaries.md` | `skills/workflow-knowledge/summaries.md` | Claude Code skill |
| `progress.md` | `.claude/progress.md` | Claude Code (save-progress skill) |

**Resultado:** lessons duplicadas con contenido diferente, progress aislado de las demás, cada plataforma apunta a un lugar distinto.

#### Decisión arquitectural

**Estos archivos son de PROYECTO** — registran conocimiento del equipo sobre ESE proyecto, sin importar si el developer usa Claude Code, Copilot CLI o VS Code.

**Single source of truth: `.github/tasks/`**
- `.github/` es convención estándar para metadata de proyecto (GitHub lo usa para templates, workflows, etc.)
- Funciona en todas las plataformas — es solo un directorio
- Claude Code no exige que archivos operacionales estén en `.claude/`
- Los agents/skills de cada plataforma se configuran para apuntar ahí

#### Fix
- [ ] Mover `progress.md` de `.claude/` a `.github/tasks/progress.md`
- [ ] Eliminar duplicación: `skills/workflow-knowledge/lessons.md` → referenciar `.github/tasks/lessons.md`
- [ ] Eliminar duplicación: `skills/workflow-knowledge/summaries.md` → referenciar `.github/tasks/summaries.md`
- [ ] Actualizar agent orchestrator Claude Code → apuntar a `.github/tasks/lessons.md`
- [ ] Actualizar skill `save-progress` → apuntar a `.github/tasks/progress.md`
- [ ] Actualizar hooks que referencian `.claude/progress.md`
- [ ] Actualizar packages Claude Code y Copilot CLI (copias del build)

---

### Subtarea B: Limpiar archivos muertos y mal ubicados en `.claude/`

#### Auditoría completa

| Archivo/Carpeta | ¿Qué es? | ¿Funcional? | Veredicto |
|---|---|---|---|
| `.claude/rules/planning.md` | Reglas de planning | ✅ Claude Code carga al inicio | **MANTENER** — config del plugin para proyectos target |
| `.claude/rules/tech-lead.md` | Principios de calidad | ✅ Claude Code carga al inicio | **MANTENER** — config del plugin |
| `.claude/settings.json` | Permisos y sandbox | ✅ Committeable, aplica al equipo | **MANTENER** — config del plugin |
| `.claude/settings.local.json` | Overrides locales | ✅ No commitear | **MANTENER** — pero verificar .gitignore |
| `.claude/README.md` | Docs setup Claude Code | ✅ Documentación | **MANTENER** |
| `.claude/progress.md` | WIP tracking | ✅ Funcional | **MOVER** → `.github/tasks/progress.md` (subtarea A) |
| `.claude/agent-memory/` (5 dirs) | Memoria de subagents | ❌ **Vacías** — 0 archivos | **ELIMINAR** — dead code, en producción vive en `~/.claude/agent-memory/` |
| `.claude/memory/MEMORY.md` | Índice de memoria proyecto | ⚠️ Artefacto de desarrollo | **EVALUAR** — es knowledge del plugin, no para distribuir |
| `.claude/memory/feedback_always_full_pipeline.md` | Feedback de user | ⚠️ Artefacto de desarrollo | **EVALUAR** — mismo caso |

#### Contexto de docs oficiales

- **`agent-memory/`**: Claude Code almacena memorias de subagents en `~/.claude/agent-memory/<agent-name>/` (user-level). Las carpetas en el repo son residuos de desarrollo, nunca se popularon.
- **`memory/`**: Claude Code almacena memory del proyecto en `~/.claude/projects/<project>/memory/`. Los archivos en `.claude/memory/` del repo son artefactos de cuando se desarrolló el workflow. Si el plugin distribuyera esto, inyectaría memorias ajenas en proyectos target.
- **`rules/`**: Sí se distribuyen — son las reglas que el plugin aplica a proyectos target. Correcto.

#### Fix
- [ ] Eliminar `.claude/agent-memory/` — carpetas vacías, dead code
- [ ] Decidir qué hacer con `.claude/memory/` — opciones:
  - Opción 1: Mover contenido a `skills/workflow-knowledge/` (donde ya vive el knowledge base del workflow)
  - Opción 2: Mover a `.github/tasks/` (si es knowledge de proyecto)
  - Opción 3: Eliminar si es solo artefacto de desarrollo
- [ ] Verificar que `build-dist.sh` NO empaqueta `agent-memory/` ni `memory/` en los dist packages
- [ ] Verificar `.gitignore` tiene `settings.local.json`
