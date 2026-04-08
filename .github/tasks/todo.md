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

### Pipeline: Reproduce → Implement → Test → Review

#### Step 0: Reproducir bugs en cada plataforma

Antes de fixear, confirmar el estado real de cada target:
- [ ] VS Code VSIX Claude: Instalar en workspace vacío → abrir Copilot Chat → `@` muestra agents? `/` muestra skills? Hook se ejecuta?
- [ ] VS Code VSIX Copilot: Mismo test
- [ ] VS Code Agent Plugin (Install from Source): Mismo test
- [ ] Claude Code CLI: `claude plugin install .` → `claude plugins list` → ¿muestra agents/skills count correcto?
- [ ] Copilot CLI: `copilot plugin install .` → verificar discovery

**Output:** Actualizar tabla "Bugs confirmados vs por verificar" con status real (CONFIRMED/OK/BROKEN). Eliminar los "Por verificar" — solo facts.

#### Step 1: Fix VS Code VSIX — Claude variant (bug confirmado)

**Decisión cerrada — paths destino:**

| Tipo | Destino workspace | Formato |
|---|---|---|
| agents | `.claude/agents/` | — |
| skills | `.claude/skills/` | — |
| hooks | `.claude/settings.json` | Wrapped `{"hooks":{...}}` — merge con existente |
| rules | `.claude/rules/` | — |

**Decisión cerrada — hooks format:** `.claude/settings.json` con formato wrapped. Es la ÚNICA ruta de discovery workspace-level para Claude format (docs oficiales). Si el archivo ya existe en el workspace, leer y hacer merge del key `hooks` sin sobrescribir permissions ni otros settings.

- [ ] Actualizar `installClaudeVariant()` en `src/extension.js` con paths corregidos
- [ ] Implementar merge-safe para hooks en `.claude/settings.json` existente

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

**Decisión cerrada — formato correcto por archivo:**

| Archivo | Formato actual | Formato correcto | ¿Fix? |
|---|---|---|---|
| `hooks/hooks.json` | flat | flat (template Copilot) | ✅ OK |
| `hooks/hooks.dev.json` | wrapped | wrapped (Claude dev) | ✅ OK |
| `packages/claude-code/hooks/hooks.json` | wrapped | wrapped (Claude plugin) | ✅ OK |
| `packages/copilot-cli/hooks/hooks.json` | flat | flat (Copilot plugin) | ✅ OK |
| `.github/hooks/hooks.json` (VSIX Copilot) | flat | flat (workspace Copilot) | ✅ OK |
| `.claude/settings.json` (VSIX Claude) | N/A — no existe | wrapped `{"hooks":{}}` | 🔧 Step 1 lo crea |

**Regla:** VS Code plugin-level → hooks auto-detectado por formato. Workspace-level → `.claude/settings.json` (wrapped) o `.github/hooks/` (flat). CLI plugins → formato del manifest.

- [x] ~~Verificar que cada paquete usa el formato correcto~~ — verificado en tabla, todos OK excepto Claude workspace (Step 1 lo resuelve)

#### Step 4: Verificar VS Code Copilot variant
- [ ] Confirmar que `installCopilotVariant()` paths son correctos (`.github/agents/`, `.github/skills/`, `.github/hooks/hooks.json`) — revisar código contra tabla de discovery
- [ ] Verificar que `.github/hooks/hooks.json` usa formato flat (confirmado en Step 3, validar en runtime con Step 0)

#### Step 5: Test en cada plataforma

**Criterio de aceptación concreto:**

**VS Code (VSIX Claude + Copilot + Agent Plugin):**
1. Instalar en workspace vacío (sin archivos previos del plugin)
2. Abrir Copilot Chat → escribir `@` → agents del plugin aparecen en autocomplete
3. Escribir `/` → skills del plugin aparecen
4. Abrir Output panel → canal "Copilot Chat" → buscar líneas de discovery (agents/skills/hooks loaded)
5. Ejecutar acción que trigger un hook → verificar que se ejecuta

**CLI (Claude Code + Copilot):**
1. `claude plugin install .` (o `copilot plugin install .`)
2. `claude plugins list` → agents count, skills count, hooks count correctos
3. Iniciar sesión → agents disponibles como subagents
4. Ejecutar acción que trigger hook → verificar ejecución

- [ ] VS Code VSIX Claude: setup → agents en `@`, skills en `/`, hooks en Output panel
- [ ] VS Code VSIX Copilot: setup → mismo checklist
- [ ] VS Code Agent Plugin (Install from Source): discovery en Output panel
- [ ] Claude Code CLI: `claude plugins list` → counts correctos + hooks ejecutan
- [ ] Copilot CLI: `copilot plugins list` → counts correctos + hooks ejecutan

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
1. `src/extension.js` — fix `installClaudeVariant()` paths + merge-safe hooks en `.claude/settings.json`
2. `.claude-plugin/plugin.json` — agregar `agents` y `skills` paths explícitos
3. Posiblemente `build-dist.sh` — si la estructura del paquete Claude necesita cambios
4. Posiblemente `validate-manifests.py` — si las rutas validadas cambian

### Estrategia de PRs y orden de ejecución

**8 PRs separados** — cada uno con scope claro (principio: "Separate refactoring from feature changes"):

| PR | Scope | Depende de | Branch |
|---|---|---|---|
| **PR1** | Fix Plugin Installation Paths (Steps 0-6) | Nada | `fix/plugin-install-paths` |
| **PR2** | Subtarea A: Unificar archivos operacionales | Nada (independiente) | `refactor/unify-operational-files` |
| **PR3** | Subtarea B: Cleanup `.claude/` + memory→rules | PR2 (progress.md ya movido) | `cleanup/claude-dead-files` |
| **PR4** | Subtarea C: Wire summaries.md triggers | PR2 (paths unificados) | `feat/wire-summaries-triggers` |
| **PR5** | Subtarea D: Alinear tools de agents por plataforma | Nada (independiente) | `fix/agent-tools-per-platform` |
| **PR6** | Subtarea E: Optimizar peso de distribución (RAM/size) | Nada (independiente) | `perf/distribution-weight` |
| **PR7** | Subtarea F: Documentación + aislamiento de archivos por método | PR1 + PR6 | `docs/align-with-changes` |
| **PR8** | Subtarea G: Auditoría estructura del proyecto | PR6 | `refactor/project-structure` |

**Orden:**
- **Fase 1 (paralelo):** PR1, PR2, PR5, PR6
- **Fase 2 (secuencial):** PR3, PR4 (dependen de PR2) y PR7, PR8 (dependen de PR1/PR6)

**Sin conflicto:** PR1 toca `extension.js` + manifests. PR2 toca paths/references. PR3 toca `.claude/` cleanup. PR4 toca orchestrator/scribe logic. PR5 toca agent body text + frontmatter tools. PR6 toca `build-dist.sh` + `.vscodeignore*`. PR7 toca docs `.md` en root. PR8 toca estructura de carpetas.

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

> **Dependencia:** PR3 (Subtarea B) y PR4 (Subtarea C) requieren que este PR esté mergeado primero.

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
  - ~~Opción 1: Mover contenido a `skills/workflow-knowledge/`~~ 
  - ~~Opción 2: Mover a `.github/tasks/`~~
  - ~~Opción 3: Eliminar si es solo artefacto de desarrollo~~
  - **Opción 4 (elegida):** El contenido es una REGLA de workflow, no memoria. Mover a:
    - `.claude/rules/always-full-pipeline.md` → Claude Code la carga automáticamente, se commitea, se distribuye con el plugin
    - `.github/instructions/always-full-pipeline.instructions.md` → Copilot/VS Code la carga automáticamente
  - Luego eliminar `.claude/memory/` completo (MEMORY.md queda obsoleto — Claude Code auto-genera el suyo en `~/.claude/projects/`)
  - **Scope de la regla:** Esta regla ES PARA proyectos target que instalen el plugin — les dice "siempre correr pipeline completo". Es parte del valor del plugin (workflow discipline). SÍ se distribuye intencionalmente.
  - **Justificación:** `~/.claude/projects/<project>/memory/` es auto-managed por Claude Code en HOME, NO en el repo. Poner archivos en `.claude/memory/` del repo no tiene efecto — Claude Code nunca los lee de ahí.
- [ ] Verificar que `build-dist.sh` NO empaqueta `agent-memory/` ni `memory/` en los dist packages
- [ ] Verificar `.gitignore` tiene `settings.local.json`

---

### Subtarea C: Cablear triggers de `summaries.md` (dead code funcional)

#### Problema
`summaries.md` es un caché de navegación del codebase diseñado para evitar re-explorar módulos entre sesiones. El Scribe tiene las operaciones (`add_summary`, `mark_stale`), el Orchestrator lo lee al inicio, pero **nadie triggerea las escrituras**. Es dead code funcional en TODAS las plataformas.

#### Auditoría cruzada

| Plataforma | Bootstrap (crear) | Write (trigger) | Read | Post-Pipeline |
|---|---|---|---|---|
| Copilot (VS Code/CLI) | ✅ Orchestrator L63 | ⚠️ Scribe tiene action, nadie lo llama | ✅ Session start | ❌ Solo lessons |
| Claude Code CLI | ❌ No hay bootstrap | ❌ No hay Scribe | ⚠️ Implícito via skill | ❌ Solo lessons |
| VS Code Extension | Depende del variant | Sin trigger | Depende del variant | N/A |

#### 6 issues identificados

| # | Severidad | Issue |
|---|---|---|
| 1 | 🔴 | Path fragmentado: `.github/tasks/` vs `skills/workflow-knowledge/` (se resuelve en PR2) |
| 2 | 🔴 | Claude Code `agents/orchestrator.md` no bootstrapea summaries.md |
| 3 | 🔴 | Claude Code no tiene Scribe — no hay mecanismo para escribir summaries |
| 4 | 🟡 | Sin trigger explícito para `add_summary` en Orchestrator (Copilot ni Claude Code) |
| 5 | 🟡 | Sin trigger explícito para `mark_stale` cuando código cambia |
| 6 | 🟡 | Post-Pipeline Extraction ignora summaries — solo extrae lessons |

#### Fix — triggers a cablear

**Trigger 1: `add_summary` después de explorar un módulo**
- [ ] Orchestrator Copilot (`.github/agents/orchestrator.agent.md`): agregar regla en pipeline — *"Después de que Explore/Reviewer analice un módulo, delega `add_summary` al Scribe con paths y hallazgos"*
- [ ] Orchestrator Claude Code (`agents/orchestrator.md`): agregar Post-Pipeline step — *"Después del pipeline, si se exploró un módulo nuevo, registrar summary"*
- [ ] Definir qué cuenta como "módulo" → directorio con 3+ archivos que fue analizado durante el pipeline

**Trigger 2: `mark_stale` cuando código en un área summarizada cambia**
- [ ] Orchestrator Copilot: agregar regla — *"Al inicio de cada pipeline, revisar ARTIFACTS del Implementer. Si algún path coincide con un summary active, delegar `mark_stale` al Scribe"*
- [ ] Orchestrator Claude Code: mismo trigger en Post-Pipeline Extraction

**Trigger 3: Post-Pipeline Extraction**
- [ ] Ambos orchestrators: expandir Post-Pipeline Extraction para incluir — *"Si se exploró código nuevo durante el pipeline (Explore, Reviewer, Planner), extraer module summary y delegar `add_summary`"*

**Bootstrap Claude Code:**
- [ ] `agents/orchestrator.md`: agregar session start step — *"Si `summaries.md` no existe, crear con header mínimo"*
- [ ] Decidir mecanismo de escritura para Claude Code: ¿agregar Scribe como subagent? ¿O el orchestrator escribe directo con ultrathink?

**Distribution copies:**
- [ ] Propagar cambios a `packages/copilot-cli/agents/orchestrator.agent.md`
- [ ] Propagar cambios a `packages/claude-code/agents/orchestrator.md`

#### Acceptance criteria
1. Después de un pipeline que explora `src/auth/`, el orchestrator delega `add_summary` → summaries.md tiene entrada `### [AREA] src/auth/ ...`
2. Si un pipeline modifica `src/auth/handler.ts` y existe summary active para `src/auth/`, se marca stale automáticamente
3. Claude Code bootstrapea summaries.md si no existe
4. Post-Pipeline Extraction incluye summaries además de lessons

---

### Subtarea D: Alinear herramientas de agents por plataforma — 2026-04-08

#### Problema

Los agents Claude Code (`agents/*.md`) y los agents Copilot/VS Code (`.github/agents/*.agent.md`) tienen **cuerpos (body) completamente diferentes** en cuánto a herramientas referenciadas, capabilities, y MCP integrations.

Cuando un agent Claude termina cargado en VS Code (via VSIX Claude variant o plugin con detección Claude), funciona pero con capacidades degradadas.

#### Auditoría: diferencias por agent

| Aspecto | Claude agents (`agents/`) | Copilot agents (`.github/agents/`) | ¿Gap? |
|---|---|---|---|
| **Frontmatter tools** | `Read, Edit, Bash, Grep, Glob...` | `read/readFile, edit/editFiles, execute/runInTerminal...` | ✅ VS Code mapea automáticamente |
| **Body tool references** | `"Use Grep to..."` (natural language) | `#tool:search/textSearch` (explicit syntax) | ⚠️ Funcional pero impreciso en VS Code |
| **MCP tools (context7)** | ❌ No referenciados | ✅ `context7/resolve-library-id`, `context7/query-docs` | 🔴 Gap real — Claude agents no consultan docs |
| **MCP tools (shadcn)** | ❌ No referenciados | ✅ `shadcn/add_component` | 🔴 Gap real |
| **MCP tools (snyk)** | ❌ No referenciados | ✅ `snyk/snyk_code_scan`, `snyk_sca_scan`, `snyk_iac_scan` | 🔴 Gap real — Security agent sin Snyk |
| **MCP tools (playwright)** | ❌ No referenciados | ✅ `playwright/browser_*` | 🔴 Gap real — Tester/Security sin browser |
| **VS Code specifics** | ❌ Sin `read/problems` | ✅ Lint errors inline | 🟡 Reducido |
| **VS Code specifics** | ❌ Sin `search/usages` | ✅ Find references | 🟡 Reducido |
| **VS Code specifics** | ❌ Sin `vscode/memory`, `vscode/askQuestions` | ✅ Orchestrator los usa | 🟡 Reducido |
| **VS Code specifics** | ❌ Sin `execute/testFailure`, `execute/runTests` | ✅ Tester los usa | 🟡 Reducido |
| **Task management** | `TaskCreate/Update/List/Get` | `todo` | ✅ VS Code mapea |
| **Model selection** | `model: sonnet` (Claude Code format) | `model: ['GPT-5.4 (copilot)', ...]` (VS Code format) | ✅ Cada plataforma usa su formato |
| **Handoff protocol** | No tiene YAML handoffs | `handoffs:` con labels, agents, prompts | 🟡 Claude delega con `Agent` tool |
| **Context loading** | Genérico ("Read the task") | Estructurado ("Read SKILLS: from handoff") | 🟡 Diferente calidad de guidance |

#### Root cause

Los agents se mantienen como **2 bases de código independientes**: `agents/` (Claude Code) y `.github/agents/` (Copilot/VS Code). Cuando se cambia uno, no se propaga al otro. No hay mecanismo automático de sincronización.

El `build-dist.sh` solo copia — no transforma. Así que:
- `packages/claude-code/agents/` = copia exacta de `agents/`
- `packages/copilot-cli/agents/` = copia exacta de `.github/agents/`
- VSIX Claude variant = empaqueta `agents/` directamente
- VSIX Copilot variant = staging: copia `.github/agents/` → `agents/` temporal

#### 3 escenarios donde Claude agents terminan en VS Code

| # | Escenario | ¿Qué agents se cargan? | Resultado |
|---|---|---|---|
| 1 | VSIX Claude variant | Claude agents en `.claude/agents/` | ⚠️ Funciona pero sin MCP tools, sin VS Code specifics |
| 2 | Plugin "Install from Source" | VS Code detecta `.claude-plugin/` → Claude format | ⚠️ Carga desde `agents/` default → Claude agents en VS Code |
| 3 | VSIX Copilot variant | Copilot agents en `.github/agents/` | ✅ Full VS Code tools |

#### Docs oficiales relevantes

> **"VS Code maps Claude-specific tool names to the corresponding VS Code tools."**
> — [VS Code Customization docs](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

> **"If a given tool is not available when using the custom agent, it is ignored."**

Esto significa:
- ✅ Frontmatter `tools:` se mapean correctamente (Read → read/readFile, etc.)
- ⚠️ Tools que no tienen mapeo (TaskCreate?) se ignoran silenciosamente
- ❌ Body text NO se transforma — el modelo recibe "Use Grep" sin context de que el tool real es `search/textSearch`
- ❌ MCP tools (context7, shadcn, snyk, playwright) NO están en agents Claude → nunca se usan aunque estén disponibles en VS Code

#### Opciones de fix

**Opción A: Mantener 2 bases independientes + proceso de sync manual**
- Pros: cada plataforma optimizada para su runtime
- Cons: drift inevitable, más mantenimiento, ya está desincronizado

**Opción B: Single source → Copilot format, transform para Claude Code**
- `.github/agents/*.agent.md` = fuente canónica
- `build-dist.sh` transforma a Claude format: strip YAML arrays → comma-separated, rename tools, strip MCP refs, strip model arrays
- Pros: single source of truth, cambios se propagan automáticamente
- Cons: transform complejo, puede perder nuance por plataforma

**Opción C: Single source → Claude format (simpler), VS Code mapea**
- `agents/*.md` = fuente canónica (Claude format)
- VS Code ya mapea Claude tool names automáticamente
- `build-dist.sh` transforma a Copilot format para `.github/agents/`: add YAML arrays, add MCP tools, add `#tool:` syntax
- Pros: fuente simple, VS Code compatibility nativa
- Cons: pierde MCP tool guidance en la fuente canónica

**Opción D (recomendada): Unificar body, frontmatter por plataforma**
- Body (instrucciones) = compartido en un template o include
- Frontmatter (tools, model, handoffs) = específico por plataforma
- Body usa syntax neutral: ni `#tool:search/codebase` ni "Use Grep" — sino "Search the codebase for...", "Verify APIs in documentation"
- Cada `build-dist.sh` target inyecta el frontmatter correcto + agrega platform-specific tool hints al body
- Pros: zero drift en instrucciones, tools optimizados por plataforma
- Cons: requiere template system en build

#### Decisión: PENDIENTE

> ⚠️ Esta decisión requiere input del usuario antes de implementar. Las 4 opciones tienen trade-offs significativos.

#### Staff Engineer review — 2026-04-08

**NO APROBADO como fix completo.** Aprobado como PR incremental con 2 objeciones:

**Objeción 1: Tools sin instrucciones = herramienta muda**
Agregar `snyk/snyk_code_scan` al frontmatter sin instrucciones de USO en el body es inútil. El modelo ve la tool disponible pero el body dice "Use WebSearch to discover CVEs" — nunca va a invocar Snyk espontáneamente.

**Requisito:** Cada MCP tool agregado al frontmatter DEBE tener al menos 1 línea de guidance en el body (neutral, funciona en ambas plataformas):
- Security: "Run automated vulnerability scans when available (Snyk, dependency audit)"
- Security: "Verify security headers by navigating to the target URL when a browser tool is available"
- Implementer: "Verify library APIs and usage with documentation tools before implementing unfamiliar patterns"

**Objeción 2: Pregunta arquitectural sin responder**
Los targets VS Code VSIX Claude + Plugin source van a seguir siendo ciudadanos de segunda clase (body con "Use Grep", sin VS Code specifics como `read/problems`, `search/usages`, `execute/testFailure`). La pregunta de fondo: **¿por qué un usuario de VS Code recibiría Claude agents en vez de Copilot agents?**

Si la respuesta es "no debería":
- VSIX Claude variant → debería instalar `.github/agents/` (Copilot format) en VS Code
- Plugin source → VS Code debería preferir `.github/agents/` sobre `agents/` cuando ambos existen
- Esto elimina los escenarios degradados por completo

**Trazabilidad post-PR5 fix inmediato (solo frontmatter + hints):**

| # | Target | MCP tools | Body text | VS Code specifics | Veredicto |
|---|---|---|---|---|---|
| 1 | Claude Code CLI | Ignorados (no MCP) | Claude nativo ✅ | N/A | ✅ Sin regresión |
| 2 | Copilot CLI | Ya incluidos ✅ | `#tool:` ✅ | N/A | ✅ Sin cambios |
| 3 | VS Code VSIX Copilot | Ya incluidos ✅ | `#tool:` ✅ | Todos ✅ | ✅ Sin cambios |
| 4 | VS Code VSIX Claude | **Agregados ✅** | "Use Grep" ⚠️ | Faltan ❌ | ⚠️ Mejorado, degradado |
| 5 | VS Code Plugin source | **Agregados ✅** | "Use Grep" ⚠️ | Faltan ❌ | ⚠️ Mejorado, degradado |

**Recomendación:**
1. Decidir opción A-D ANTES de implementar — especialmente si VSIX Claude para VS Code debería usar Copilot agents
2. Si se mantienen 2 variantes: Opción D (template body + frontmatter per-platform) es obligatoria
3. El fix inmediato se expande: frontmatter + body hints con instrucciones concretas por MCP tool

#### Fix inmediato expandido (independiente de la decisión arquitectural)

Mientras se decide la opción, hay fixes que ya se pueden hacer:

- [ ] **Claude agents: agregar MCP tools al frontmatter** — `context7/resolve-library-id`, `context7/query-docs` para Implementer, Infra, Tester. Claude Code los ignora, VS Code los activa.
- [ ] **Claude agents: agregar body hints CON instrucciones de uso por tool** — NO solo "verify APIs" genérico, sino guidance concreto:
  - Implementer body: "Verify library APIs and usage with documentation tools before implementing unfamiliar patterns"
  - Security body: "Run automated vulnerability scans when available (Snyk, dependency audit)" + "Verify security headers by navigating to the target URL when a browser tool is available"
  - Tester body: "Use browser automation tools when available for E2E test verification"
- [ ] **Security agent Claude: agregar Snyk/Playwright al frontmatter + body** — tools se ignoran si no disponibles
- [ ] **Verificar mapeo VS Code** — confirmar qué Claude tools mapean y cuáles se ignoran silenciosamente
- [ ] **Propagar a distribution copies** — `packages/claude-code/agents/` y `packages/copilot-cli/agents/`

#### Acceptance criteria (fix inmediato expandido)
1. Claude agents con MCP tools en frontmatter → al cargar en VS Code, context7 aparece como tool disponible
2. Claude agent Security con snyk/playwright en frontmatter → Snyk scan funciona si extensión instalada
3. Body hints incluyen guidance de USO por tool → el modelo sabe CUÁNDO invocar cada MCP tool
4. Body hints neutros → funciona en Claude Code CLI Y VS Code sin confusión
5. Claude Code CLI no se rompe → tools desconocidos se ignoran silenciosamente

---

### Subtarea E: Optimizar peso de distribución (RAM/tamaño) — 2026-04-08

#### Problema

Al instalar los agents en VS Code y Copilot CLI / Claude Code CLI, el usuario reporta mayor consumo de RAM. Cada instalación copia la totalidad de `skills/` sin filtrar contenido innecesario.

#### Auditoría de peso actual

| Contenido | Incluido en distribución | Necesario para runtime | Impacto |
|---|---|---|---|
| `skills/*/SKILL.md` (16 skills) | ✅ Sí | ✅ Sí — core del plugin | Necesario |
| `skills/*/evals/` (4 skills) | ✅ Sí | ❌ No — solo para desarrollo | ~50KB/paquete basura |
| `skills/*/templates/` (skill-creator) | ✅ Sí | ⚠️ Solo si usuario crea skills | ~10KB, marginal |
| `skills/interface-design/references/` (4 archivos) | ✅ Sí | ⚠️ Referencia pero pesada | ~100KB, considerable |
| `skills/workflow-knowledge/lessons.md` | ✅ Sí | ✅ Sí — memoria del workflow | Necesario |
| `skills/workflow-knowledge/summaries.md` | ✅ Sí | ✅ Sí — cache de navegación | Necesario |
| Skills triplicadas (claude-code + copilot-cli + vsix) | ✅ Sí | ❌ Cada target solo necesita 1 copia | ~590KB × 3 = 1.7MB waste |
| `packages/` snapshots manuales | ✅ En repo | ❌ Stale, build escribe en `dist/` | Confusión + mantenimiento |

#### Root cause

1. `build-dist.sh` copia `skills/` completo con `copy_dir` — no excluye subdirectorios de desarrollo
2. `validate_package()` verifica que `skills/*/SKILL.md` existe pero NO verifica que `evals/` NO existe
3. No hay `.vscodeignore` entry para `**/evals/` ni `**/references/`
4. Las skills se empaquetan idénticas para cada target — sin filtro per-platform
5. `packages/` mantiene snapshots manuales que compiten con `dist/` (build output)

#### Plan de fix

- [ ] **Excluir `evals/` del build** — agregar exclusión en `copy_dir` o post-copy cleanup en `build-dist.sh`
- [ ] **Excluir `templates/` del build** — solo útil para desarrollo de nuevas skills
- [ ] **Evaluar `references/`** — si `interface-design/SKILL.md` los referencia inline, mantener; si son archivo de soporte, excluir
- [ ] **Agregar validación negativa** — `validate_package()` falla si encuentra `evals/`, `templates/` o `*.test.*` en distribución
- [ ] **Actualizar `.vscodeignore.*`** — agregar `**/evals/**`, `**/templates/**`
- [ ] **Medir antes/después** — comparar tamaño de paquete y file count

#### Sobre RAM

La RAM adicional en VS Code NO viene del tamaño de archivos en disco — viene de:
1. **Más archivos indexados** por VS Code file watcher → más entradas en memoria
2. **Más context cargado** si agents/skills referencian archivos que VS Code pre-lee
3. **MCP servers activos** (context7, playwright) consumen RAM independientemente

Reducir archivos innecesarios (evals, templates) reduce el file count que VS Code indexa. Pero si el delta de RAM es significativo (>100MB), la causa probable es MCP servers, no archivos.

#### Acceptance criteria
1. `dist/claude-code/skills/` NO contiene subdirectorios `evals/` ni `templates/`
2. `dist/copilot-cli/skills/` NO contiene subdirectorios `evals/` ni `templates/`
3. VSIX packages NO contienen `**/evals/**` ni `**/templates/**`
4. `validate_package()` falla si encuentra archivos de desarrollo en paquete
5. File count del paquete reducido (medir antes/después)
6. Runtime no se rompe — skills cargan sin error en Claude Code y VS Code

---

### Subtarea F: Documentación alineada + aislamiento de archivos por método de instalación — 2026-04-08

#### Problema 1: Documentación desactualizada

Los documentos del proyecto (README.md, INSTALL.md, GUIDE.md, SETUP.md) reflejan la estructura ANTES de los cambios planificados. Si se ejecutan PR1-PR6 sin actualizar docs, el usuario encontrará instrucciones que no corresponden a la realidad.

#### Problema 2: Archivos incorrectos por método de instalación

Cada método de instalación debe entregar SOLO los archivos que le corresponden:

| Archivo / Carpeta | Claude Code CLI | Copilot CLI | VS Code VSIX Claude | VS Code VSIX Copilot | Justificación |
|---|---|---|---|---|---|
| `agents/` (Claude format) | ✅ | ❌ | ✅ | ❌ | Solo targets Claude |
| `agents/` (Copilot format) | ❌ | ✅ | ❌ | ✅ | Solo targets Copilot |
| `skills/` (completo) | ✅ | ✅ | ✅ | ✅ | Compartido, universal |
| `skills/*/evals/` | ❌ | ❌ | ❌ | ❌ | Solo desarrollo (PR6 lo excluye) |
| `hooks/hooks.json` | ✅ | ✅ | ✅ | ✅ | Compartido |
| `hooks/hooks.dev.json` | ❌ | ❌ | ❌ | ❌ | Solo desarrollo |
| `settings.json` | ✅ | ✅ | ❌ | ❌ | Solo CLI plugins |
| `.claude-plugin/plugin.json` | ✅ | ❌ | ❌ | ❌ | Solo Claude Code |
| `plugin.json` (root) | ❌ | ✅ | ❌ | ❌ | Solo Copilot CLI |
| `package.json` | ❌ | ❌ | ✅ | ✅ | Solo VS Code VSIX |
| `src/extension.js` | ❌ | ❌ | ✅ | ✅ | Solo VS Code VSIX |
| `LICENSE` | ✅ | ✅ | ✅ | ✅ | Siempre incluido |
| `README.md`, `GUIDE.md`, etc. | ❌ | ❌ | ❌ | ❌ | Solo repo (ya en FORBIDDEN) |
| `benchmark/`, `scripts/` | ❌ | ❌ | ❌ | ❌ | Solo desarrollo (ya excluidos) |
| `workflow-knowledge/lessons.md` | ✅ | ✅ | ✅ | ✅ | Memoria — se llena per-proyecto |
| `workflow-knowledge/summaries.md` | ✅ | ✅ | ✅ | ✅ | Cache — se llena per-proyecto |

#### Archivos compartidos de proyecto (SÍ se distribuyen)

Estos archivos se distribuyen vacíos/template y se llenan durante el uso:
- `skills/workflow-knowledge/lessons.md` — cada proyecto acumula sus propias lecciones
- `skills/workflow-knowledge/summaries.md` — cada proyecto acumula su propio cache
- `hooks/hooks.json` — hooks de producción, el proyecto puede agregar los suyos

#### Plan de fix

**Documentación:**
- [ ] **Revisar README.md** — ¿refleja la estructura post-PR1/PR2? ¿Paths de instalación correctos?
- [ ] **Revisar INSTALL.md** — ¿instrucciones de instalación por método son correctas?
- [ ] **Revisar GUIDE.md** — ¿guía de uso alineada con agents/skills/hooks paths?
- [ ] **Revisar SETUP.md** — ¿setup inicial correcto post-cambios?
- [ ] **Verificar CHANGELOG.md** — agregar entradas para PR1-PR8

**Aislamiento de archivos:**
- [ ] **Auditar `build_claude_code()`** — verificar contra tabla de arriba, cada archivo presente/ausente
- [ ] **Auditar `build_copilot_cli()`** — verificar contra tabla
- [ ] **Auditar `build_vscode_variant("claude")`** — verificar contra tabla
- [ ] **Auditar `build_vscode_variant("copilot")`** — verificar contra tabla
- [ ] **Agregar test automatizado** — script que verifica contenido de cada `dist/<target>/` contra tabla expected

#### Acceptance criteria
1. Cada doc root (README, INSTALL, GUIDE, SETUP) refleja structure post-PRs
2. `build-dist.sh` para cada target contiene EXACTAMENTE los archivos de la tabla
3. Test script verifica: para cada target, lista files en dist/ y compara contra expected list
4. Ningún target instala archivos de otro target (Claude agents no van a Copilot, y viceversa)
5. CHANGELOG.md tiene entradas para todos los PRs ejecutados

---

### Subtarea G: Auditoría y limpieza de estructura del proyecto — 2026-04-08

#### Problema

El repositorio ha crecido orgánicamente y tiene:
1. **Duplicación**: `packages/claude-code/` y `packages/copilot-cli/` son snapshots manuales que `build-dist.sh` NO usa (escribe en `dist/`)
2. **Archivos planning obsoletos**: `PLAN-agent-improvements.md`, `PLAN-selective-install.md`, `workflow-model-strategy.md` son documentos de planificación que ya están en `todo.md`
3. **Estructura inconsistente**: el build genera en `dist/` pero `packages/` también existe como pre-built
4. **VS Code VSIX estructura**: la distribución VS Code podría servir como referencia para la estructura canónica del repo

#### Auditoría de archivos root

| Archivo | Propósito | ¿Mantener? | Acción |
|---|---|---|---|
| `README.md` | Docs principal | ✅ | Actualizar (PR7) |
| `INSTALL.md` | Guía de instalación | ✅ | Actualizar (PR7) |
| `GUIDE.md` | Guía de uso | ✅ | Actualizar (PR7) |
| `SETUP.md` | Setup inicial | ⚠️ ¿Redundante con INSTALL? | Evaluar merge con INSTALL |
| `CHANGELOG.md` | Historial cambios | ✅ | Actualizar (PR7) |
| `CLAUDE.md` | Config Claude Code | ✅ | Necesario para Claude Code entrypoint |
| `CODEOWNERS` | GitHub ownership | ✅ | Mantener |
| `LICENSE` | Licencia | ✅ | Mantener |
| `PLAN-agent-improvements.md` | Plan viejo | ❌ | Eliminar — contenido ya en todo.md |
| `PLAN-selective-install.md` | Plan viejo | ❌ | Eliminar — contenido ya en todo.md |
| `workflow-model-strategy.md` | Estrategia de modelos | ⚠️ | Evaluar — ¿migrar a skill o eliminar? |
| `package.json` | VS Code main manifest | ✅ | Mantener |
| `package.claude.json` | VS Code Claude variant | ✅ | Mantener |
| `package.copilot.json` | VS Code Copilot variant | ✅ | Mantener |
| `plugin.json` | Copilot CLI manifest | ✅ | Mantener |
| `settings.json` | Config compartido | ✅ | Mantener |

#### Auditoría de `packages/` vs `dist/`

| Directorio | Propósito | Estado actual | Acción |
|---|---|---|---|
| `packages/claude-code/` | Snapshot manual Claude | ❌ Stale — `build-dist.sh` escribe en `dist/` | **Eliminar** o convertir en symlink a `dist/claude-code/` |
| `packages/copilot-cli/` | Snapshot manual Copilot | ❌ Stale — `build-dist.sh` escribe en `dist/` | **Eliminar** o convertir en symlink a `dist/copilot-cli/` |
| `dist/` (gitignored) | Build output real | ✅ Generado por build | Mantener como está |

> **Decisión PENDIENTE:** ¿Eliminar `packages/` completamente? Si otros repos o CI dependen de `packages/` como source, necesitan migrar a `dist/`. Verificar si hay references externas.

#### Estructura propuesta (post-PR8)

```
agent-workflow/
├── agents/                  # Claude Code canonical agents
├── .github/
│   ├── agents/              # Copilot/VS Code canonical agents
│   ├── instructions/        # Workspace instructions
│   └── tasks/               # todo.md, lessons.md, progress.md, summaries.md
├── skills/                  # Shared skills (universal)
├── hooks/                   # hooks.json (prod) + hooks.dev.json (dev)
├── src/                     # VS Code extension source
├── scripts/                 # Build tools
├── benchmark/               # Performance testing (dev only)
├── .claude/                 # Claude Code config (rules, settings)
├── .claude-plugin/          # Claude Code plugin manifest
├── dist/                    # Build output (gitignored)
├── README.md                # Main documentation
├── INSTALL.md               # Installation guide
├── GUIDE.md                 # Usage guide
├── CHANGELOG.md             # Version history
├── CLAUDE.md                # Claude Code entrypoint
├── LICENSE                  # License
├── package.json             # VS Code main manifest
├── package.claude.json      # VS Code Claude variant
├── package.copilot.json     # VS Code Copilot variant
├── plugin.json              # Copilot CLI manifest
└── settings.json            # Shared config
```

#### Plan de fix

- [ ] **Eliminar PLAN-*.md** — contenido ya consolidado en `.github/tasks/todo.md`
- [ ] **Evaluar workflow-model-strategy.md** — ¿migrar contenido a skill o eliminar?
- [ ] **Evaluar SETUP.md vs INSTALL.md** — ¿merge o mantener separados?
- [ ] **Decidir qué hacer con `packages/`** — eliminar, symlink, o mantener como referencia
- [ ] **Si se elimina `packages/`**: actualizar `.gitignore`, build scripts, y cualquier referencia
- [ ] **Verificar que `dist/` está en `.gitignore`**
- [ ] **Actualizar CLAUDE.md** si la estructura cambia

#### Staff Engineer review — 2026-04-08

**Aplica a Subtareas E, F, y G en conjunto:**

**APROBADO con condiciones:**

1. **E (distribución)**: Plan sólido. La hipótesis de RAM es correctamente matizada — archivos en disco reducen file watcher entries, pero RAM significativa viene de MCP servers. El fix es correcto: excluir `evals/`, `templates/`, agregar validación negativa. **Condición:** medir antes/después en VS Code con extensión activa.

2. **F (docs + aislamiento)**: La tabla de archivos por método es excelente — es el contrato de distribución. **Condición:** la tabla DEBE convertirse en test automatizado (no solo doc), y cada PR debe verificar que el build sigue pasando.

3. **G (estructura)**: El riesgo está en `packages/` — si repos externos dependen de esa ruta, eliminar rompe. **Condición:** antes de eliminar, buscar references en GitHub (issues, READMEs de otros repos, CI configs). Si no hay dependencias externas, eliminar con confidence.

4. **Scope creep alert**: 8 PRs es mucho. Considerar si PR6/PR7/PR8 se pueden consolidar en 1 PR de cleanup (no tocan lógica, solo archivos/docs). **Recomendación:** PR6+PR8 → 1 PR "clean distribution" ya que ambos tocan `build-dist.sh` y estructura.

5. **Orden correcto**: PR7 (docs) DEBE ser el último — documenta el estado final, no un intermedio.

#### Acceptance criteria (G)
1. No existen `PLAN-*.md` en root
2. `packages/` eliminado o documentado por qué se mantiene
3. `dist/` está en `.gitignore`
4. Estructura del repo coincide con la tabla propuesta
5. CLAUDE.md actualizado si estructura cambió
