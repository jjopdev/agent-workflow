# Setup Guide — Choose Your Workflow

This project supports **two independent workflows**. Choose ONE based on what you have installed.

## Plugin Installation (Recommended)

The fastest way to install is via plugin:

```bash
# Claude Code
claude plugin install jjopdev/agent-workflow

# GitHub Copilot CLI
copilot plugin install jjopdev/agent-workflow
```

For VS Code, download the `.vsix` from [GitHub Releases](https://github.com/jjopdev/agent-workflow/releases) and run:

```bash
code --install-extension agent-workflow-1.0.0.vsix
```

Or in VS Code: Extensions → "..." menu → "Install from VSIX..."

---

## Sandbox / Local Testing

Test a local checkout without publishing:

- **Claude Code:** `claude --plugin-dir /path/to/agent-workflow`
- **Copilot CLI:** `copilot plugin install /path/to/agent-workflow`
- **VS Code:** Open the repo in VS Code and press F5 to launch an Extension Development Host

---

## Manual Setup (Legacy / Standalone)

Use this if you prefer to manage files directly or cannot use the plugin system.

## ❌ DO NOT MIX

**Important:** Do not use both Copilot and Claude Code in the same project session. Each has a different task management system. Mixing them causes confusion and lost work tracking.

---

## Option A: Claude Code

### Prerequisites
- Claude Code CLI installed: `npm install -g @anthropic-ai/claude-code`
- OR VS Code Extension: [Claude Code](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code)

### Installation

```bash
# 1. Clone this repo or copy the .claude directory
git clone https://github.com/jjopdev/agent-workflow.git .agent-workflow
cd <your-project>

# 2. Copy workflow files to project root
cp .agent-workflow/CLAUDE.md ./
cp -r .agent-workflow/.claude ./

# 3. (Optional) Add recommended plugins
claude /plugin install typescript-lsp@claude-plugins-official  # For TS/JS
claude /plugin install csharp-lsp@claude-plugins-official      # For .NET
claude /plugin install pyright-lsp@claude-plugins-official     # For Python
```

### How to Use

```bash
# Start Claude Code in your project directory
cd <your-project>
claude

# Describe your task
"Fix the OAuth callback error in Google login"

# Claude investigates, then you choose:
/workflow Implement OAuth callback fix       # Full pipeline: Plan → Implement → Test → Review → Security
/create-issue OAuth callback error fix       # Create GitHub Issue + Notion page
/review-pr 15                                # Review a PR
/lesson [SECURITY] OAuth state validation    # Record learning for future sessions
```

### Task Tracking

**During session (current work):**
- Use `TaskCreate` tool (built-in) to track subtasks
- Mark progress: `TaskUpdate` → `in_progress` → `completed`
- Tasks exist only for this session

**Between sessions (persistent learning):**
- Lessons auto-recorded via stop hook in `.claude/skills/workflow-knowledge/lessons.md`
- Or manually: `/lesson [CATEGORY] description`

### Key Files
- `CLAUDE.md` — Root orchestrator
- `.claude/settings.json` — Permissions, security, hooks
- `.claude/agents/` — Subagent instructions
- `.claude/rules/` — Quality principles
- `.claude/skills/` — Reusable skills

**See:** `.claude/README.md` for detailed workflow explanation.

---

## Option B: GitHub Copilot

### Prerequisites
- GitHub Copilot subscription
- VS Code with [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)

### Installation

```bash
# 1. Clone this repo or copy the .github directory
git clone https://github.com/jjopdev/agent-workflow.git .agent-workflow
cd <your-project>

# 2. Copy workflow files
mkdir -p .github/{agents,instructions,tasks} skills
cp .agent-workflow/.github/copilot-instructions.md .github/
cp -r .agent-workflow/.github/agents/* .github/agents/
cp -r .agent-workflow/skills/* skills/
cp -r .agent-workflow/.github/instructions/* .github/instructions/
cp -r .agent-workflow/.github/tasks/* .github/tasks/ 2>/dev/null || true

# 3. Open VS Code
code .
```

### How to Use

In the Copilot chat:

```
@orchestrator Describe your task
"El cliente reporta error 500 en Google login, parece ser en el callback OAuth"

# Orchestrator analyzes, then delegates:
@orchestrator Use /workflow to start the full pipeline
@planner Decompose this task into steps
@implementer Implement the OAuth callback fix
@reviewer Review the changes
@security OWASP review
```

### Task Tracking

**Active tasks:**
- Update `.github/tasks/todo.md` manually or delegate to Scribe
- Format: Markdown checklist with dates and feature names

**Persistent learning:**
- Delegate to Scribe to update `.github/tasks/lessons.md`
- Format: `### [CATEGORY] Title — description`

**Cached navigation:**
- Update `.github/tasks/summaries.md` after exploring new modules
- Format: Status, Location, Summary, Last Updated

### Key Files
- `.github/copilot-instructions.md` — Global instructions
- `.github/agents/orchestrator.agent.md` — Root orchestrator
- `.github/agents/` — 8 specialized agents
- `skills/` — Reusable skills
- `.github/tasks/` — todo.md, lessons.md, summaries.md

**See:** `.github/copilot-instructions.md` for the orchestration protocol.

---

## Comparison

| Aspect | Claude Code | Copilot |
|--------|-------------|---------|
| **Setup complexity** | 2 files/dirs | Multiple files/dirs |
| **Task tracking (live)** | TaskCreate (native) | Manual `.github/tasks/todo.md` |
| **Lesson recording** | Auto stop hook | Manual via Scribe delegation |
| **Cost model** | Opus/Sonnet/Haiku mix | GPT-5.4/Opus (premium) |
| **Agents** | 6 + built-in helpers | 8 (Orchestrator, Planner, Scribe...) |
| **Integration** | CLI + VS Code | VS Code only |
| **Learning curve** | Steeper (RLM concepts) | Gentler (familiar agents) |
| **Best for** | Complex multi-file features, cost-conscious teams | Quick bugs, existing Copilot users |

---

## Choosing Between Them

### Use **Claude Code** if:
- You want lower costs (Sonnet for most work)
- You like native CLI + VS Code integration
- You're comfortable with RLM delegation concepts
- You want automatic lesson recording (stop hook)
- You work on multi-file refactors frequently

### Use **Copilot** if:
- You already have Copilot subscription
- You prefer familiar agent-based workflows
- You like manual control over task documentation
- You want to avoid CLI setup
- You're new to multi-agent orchestration

### Use **Both** (different projects) if:
- You have multiple projects with different stacks
- One project uses Copilot, another uses Claude Code
- **Don't mix in the same project**

---

## Stack Support

Both workflows support:
- **JavaScript/TypeScript:** npm, Node.js, TypeScript, Next.js, React
- **C# / .NET:** dotnet, msbuild, nuget, ASP.NET
- **Python:** Python, pip, poetry, FastAPI, Django
- **Go:** go, Go modules
- **Rust:** cargo, Rust toolchain
- **DevOps:** Docker, Kubernetes, Terraform, AWS, Azure, GCP

---

## Troubleshooting

### "I accidentally mixed Copilot and Claude Code"
- Use only ONE in a single session
- If confused: stop both, choose one, restart with fresh context

### "Settings aren't being read"
- **Claude Code:** `.claude/settings.json` and personal `settings.local.json`
- **Copilot:** Agent files have settings in YAML frontmatter

### "Lessons aren't being recorded"
- **Claude Code:** Check stop hook works by stopping with `Ctrl+C` and answering the prompt
- **Copilot:** Delegate to Scribe explicitly to update `.github/tasks/lessons.md`

### "Can I switch workflows later?"
- Yes, but start fresh. Don't try to convert `.github/tasks/` to TaskCreate
- Copy the lessons.md from old system to new system's location
- Delete the old system's files if not needed

---

## What Next?

### For Claude Code
1. Read `.claude/README.md` for detailed workflow
2. Read `CLAUDE.md` for orchestrator protocol
3. See `GUIDE.md` for step-by-step examples

### For Copilot
1. Read `.github/copilot-instructions.md` for orchestrator protocol
2. See `.github/agents/orchestrator.agent.md` for agent definitions
3. Explore `skills/` for reusable skills

### For Both
- Read `workflow-model-strategy.md` for RLM foundations (applies to both)
- Read `README.md` for architecture overview (applies to both)
