# Installation Guide

Agent Workflow ships as **4 separate packages** — install only the one that matches your tool.

---

## 1. Claude Code

### From GitHub (recommended)

Inside an active Claude Code session:

```
/plugin marketplace add jjopdev/agent-workflow
/plugin install agent-workflow@jjopdev-agent-workflow
```

This registers `jjopdev/agent-workflow` as a plugin marketplace and installs the `agent-workflow` plugin (sourced from `packages/claude-code/`, not the full repo).

### From GitHub Release

```bash
curl -L https://github.com/jjopdev/agent-workflow/releases/latest/download/agent-workflow-claude-code.tar.gz -o agent-workflow-claude-code.tar.gz
mkdir -p agent-workflow-claude-code
tar -xzf agent-workflow-claude-code.tar.gz -C agent-workflow-claude-code
```

### From Source (build locally)

```bash
git clone https://github.com/jjopdev/agent-workflow.git
cd agent-workflow
bash scripts/build-dist.sh --target claude-code
# Output: dist/claude-code/
```

### What's Included

| File/Directory | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Plugin manifest |
| `agents/` | 6 agent definitions (.md) |
| `skills/` | 17 skill directories |
| `hooks/hooks.json` | Hook template (empty, customizable) |
| `settings.json` | Permissions and sandbox config |
| `LICENSE` | MIT license |

---

## 2. Copilot CLI

### From GitHub (recommended)

```bash
# Installs only the clean Copilot CLI package (not the full repo)
copilot plugin install jjopdev/agent-workflow:packages/copilot-cli
```

### From GitHub Release

```bash
curl -L https://github.com/jjopdev/agent-workflow/releases/latest/download/agent-workflow-copilot-cli.tar.gz -o agent-workflow-copilot-cli.tar.gz
mkdir -p agent-workflow-copilot-cli
tar -xzf agent-workflow-copilot-cli.tar.gz -C agent-workflow-copilot-cli
```

### From Source

```bash
git clone https://github.com/jjopdev/agent-workflow.git
cd agent-workflow
bash scripts/build-dist.sh --target copilot-cli
# Output: dist/copilot-cli/
```

### What's Included

| File/Directory | Purpose |
|---|---|
| `plugin.json` | Plugin manifest |
| `agents/` | 9 agent definitions (.agent.md) |
| `skills/` | 17 skill directories |
| `hooks/hooks.json` | Hook template (empty, customizable) |
| `settings.json` | Permissions and sandbox config |
| `LICENSE` | MIT license |

---

## 3. VS Code — Claude Agents

### From GitHub Release

1. Download `vscode-claude.vsix` from the [latest release](https://github.com/jjopdev/agent-workflow/releases/latest)
2. In VS Code: Extensions view > `...` > **Install from VSIX...**
3. Select the downloaded `.vsix` file
4. Run command: **Agent Workflow (Claude): Setup in Current Workspace**

### From Source

```bash
git clone https://github.com/jjopdev/agent-workflow.git
cd agent-workflow
bash scripts/build-dist.sh --target vscode-claude
# Output: dist/vscode-claude.vsix
code --install-extension dist/vscode-claude.vsix
```

---

## 4. VS Code — Copilot Agents

### From GitHub Release

1. Download `vscode-copilot.vsix` from the [latest release](https://github.com/jjopdev/agent-workflow/releases/latest)
2. In VS Code: Extensions view > `...` > **Install from VSIX...**
3. Select the downloaded `.vsix` file
4. Run command: **Agent Workflow (Copilot): Setup in Current Workspace**

### From Source

```bash
git clone https://github.com/jjopdev/agent-workflow.git
cd agent-workflow
bash scripts/build-dist.sh --target vscode-copilot
# Output: dist/vscode-copilot.vsix
code --install-extension dist/vscode-copilot.vsix
```

---

## Enterprise Deployment

### Air-gapped Environments

For environments without internet access, build all packages locally and distribute the artifacts:

```bash
bash scripts/build-dist.sh --target all
```

Distribute:
- `dist/claude-code/` directory (or tarball)
- `dist/copilot-cli/` directory (or tarball)
- `dist/vscode-claude.vsix`
- `dist/vscode-copilot.vsix`

### Hooks

All packages include an empty `hooks/hooks.json` template. To add custom hooks:

```json
{
  "PreToolUse": [],
  "PostToolUse": [],
  "Notification": [],
  "Stop": [],
  "SessionStart": []
}
```

See the [Claude Code hooks documentation](https://code.claude.com/docs/en/hooks) for details.

---

## Building All Targets

```bash
bash scripts/build-dist.sh --target all
```

Requires: bash (Git Bash on Windows), Node.js 20+ (for VS Code builds only).
