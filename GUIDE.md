# Usage Guide — From Task Arrival to Completion

This guide covers the complete workflow from receiving a task to closing it, including both scenarios: doing it yourself and delegating to a developer.

---

## 1. A Task Arrives

A client calls with a bug, feature request, or requirement. You open Claude Code in the project directory.

```bash
cd ~/projects/my-project
claude
```

## 2. Describe the Problem

Tell Claude what happened. Be as specific or as vague as you want — the prompt-refiner skill handles messy input.

**Examples:**

```
# Bug report
"El cliente dice que al hacer login con Google le da error 500,
parece que es en el callback de OAuth"

# Feature request
"Necesitan un export a Excel de la tabla de facturas,
con filtros de fecha y estado"

# Vague requirement
"hay un problema con los permisos en la api de usuarios,
algunos roles no pueden ver lo que deberian"
```

Claude will:
1. Investigate the codebase (find relevant files, trace the issue)
2. Identify the root cause (for bugs) or scope (for features)
3. Generate a technical plan with affected files and steps

## 3. Document and Create the Issue

Once Claude has analyzed the problem and you're satisfied with the plan:

```
/create-issue El callback de OAuth con Google falla con error 500
```

This will:
- Create a **Notion page** with the full analysis, plan, and acceptance criteria
- Create a **GitHub Issue** with the technical plan and linked files
- Link both together
- Ask you: **execute yourself or delegate?**

## 4a. Execute Yourself (Full Pipeline)

If you're doing the work yourself, run the full agent pipeline:

```
/workflow Implement the fix for OAuth callback error #42
```

The pipeline runs automatically:
1. **Plan** → Decomposes the task into subtasks (you review and approve)
2. **Implement** → Writes the code changes
3. **Test ∥ Review** → Run in parallel: tests + new test cases, and code quality review
4. **Security** → OWASP review if auth/input/secrets are touched

After completion, create a PR:

```
Create a PR for this fix, reference issue #42
```

Then review your own PR:

```
/review-pr 15
```

## 4b. Delegate to a Developer

If you're assigning the work:

> "Asignar el issue #42 al developer. El issue tiene toda la información necesaria."

The developer works in their own environment with their own workflow. When they submit a PR, you review it:

```
/review-pr 18
```

The review checks:
- Correctness, architecture, tests, security
- Whether acceptance criteria from the Issue are met
- Posts the review on GitHub (APPROVE / REQUEST_CHANGES)

## 5. Record Lessons

After any correction, discovery, or mistake worth remembering:

```
/lesson [SECURITY] The OAuth callback needs to validate the state parameter to prevent CSRF
```

Categories: `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`

The stop hook also auto-prompts for lessons when corrections or failures are detected.

---

## Common Scenarios

### Bug Fix (Simple)

```
"El botón de guardar no funciona en la página de edición de perfil"
```

Claude investigates → finds the issue → fixes directly (quick path, no full pipeline needed).

### Bug Fix (Complex)

```
"Los reportes de ventas no cuadran con los datos de la base de datos,
parece que hay un problema en el cálculo de impuestos"
```

Claude investigates → finds multiple files involved → you run `/create-issue` → then `/workflow` for the full pipeline.

### New Feature

```
"Agregar autenticación con Microsoft Azure AD para el portal de administración"
```

Claude scopes the feature → `/create-issue` → `/workflow` runs Plan → Implement → [Test ∥ Review] → Security (auth changes trigger security review automatically).

### Code Review (Developer PR)

```
/review-pr 25
```

Claude reads the full diff, checks the linked Issue, verifies acceptance criteria, posts the review on GitHub.

### Infrastructure Change

```
"Configurar CI/CD con GitHub Actions para deploy a Azure App Service"
```

Claude delegates to the infra agent for DevOps work.

---

## Stack-Specific Notes

### Next.js / React (TypeScript)

Install the TypeScript LSP plugin for real-time diagnostics:
```
/plugin install typescript-lsp@claude-plugins-official
```

Claude gains: auto-detection of type errors after edits, jump to definition, find references.

### ASP.NET MVC / .NET Framework / .NET 10

Install the C# LSP plugin:
```
/plugin install csharp-lsp@claude-plugins-official
```

The `dotnet`, `msbuild`, and `nuget` CLI tools are pre-approved in settings.

### Python (Django, FastAPI, Flask)

Install the Pyright LSP plugin:
```
/plugin install pyright-lsp@claude-plugins-official
```

### Any Stack

The workflow is stack-agnostic. The agents discover the project's stack by reading config files (`package.json`, `*.csproj`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc.) and adapt their behavior accordingly.

---

## Daily Workflow Summary

```
Morning:
  1. Open Claude Code in your project
  2. Claude reads lessons.md headers at session start

When a task arrives:
  3. Describe the problem → Claude investigates
  4. /create-issue → Documents in Notion + GitHub
  5. Decide: /workflow (do it yourself) or delegate

When reviewing:
  6. /review-pr <number> → Reviews any PR

When learning:
  7. /lesson [CATEGORY] description → Records for future sessions

End of day / periodically:
  8. /consolidate → Merges duplicate lessons and prunes stale summaries
  9. Stop hook auto-captures any missed lessons
```

---

## Tips

- **Messy input is fine** — The prompt-refiner skill normalizes typos, mixed languages, and unstructured ideas
- **Don't over-specify** — Let Claude explore the codebase; it often finds related issues you didn't know about
- **Trust the pipeline** — The full workflow (Plan → Implement → [Test ∥ Review] → Security) catches issues that single-pass coding misses
- **Security is automatic** — When changes touch auth, APIs, secrets, or user input, the security review triggers without you asking
- **Lessons compound** — Each recorded lesson makes future sessions smarter across all projects using this workflow
