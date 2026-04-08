const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
  const disposable = vscode.commands.registerCommand('agentWorkflow.setup', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder open. Open a folder first.');
      return;
    }

    const targetRoot = workspaceFolders[0].uri.fsPath;
    const extensionRoot = context.extensionPath;
    const variant = detectVariant(extensionRoot);

    const label = variant === 'copilot' ? 'Copilot' : 'Claude Code';
    const confirm = await vscode.window.showWarningMessage(
      `Install Agent Workflow (${label} agents) into your workspace?`,
      'Yes', 'Cancel'
    );

    if (confirm !== 'Yes') return;

    try {
      if (variant === 'copilot') {
        installCopilotVariant(extensionRoot, targetRoot);
      } else {
        installClaudeVariant(extensionRoot, targetRoot);
      }
      vscode.window.showInformationMessage(
        `Agent Workflow (${label}) installed successfully!`
      );
    } catch (err) {
      vscode.window.showErrorMessage(`Setup failed: ${err.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function detectVariant(extensionRoot) {
  try {
    const pkgPath = path.join(extensionRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.agentVariant === 'copilot' || (pkg.name && pkg.name.includes('copilot'))) {
      return 'copilot';
    }
  } catch (_) {
    // fallback to claude
  }
  return 'claude';
}

function installClaudeVariant(extensionRoot, targetRoot) {
  const items = [
    { src: 'agents', dest: '.claude/agents' },
    { src: 'skills', dest: '.claude/skills' },
    { src: 'rules', dest: '.claude/rules' }
  ];

  for (const { src, dest } of items) {
    const srcPath = path.join(extensionRoot, src);
    const destPath = path.join(targetRoot, dest);
    if (!fs.existsSync(srcPath)) continue;
    copyEntry(srcPath, destPath);
  }

  installClaudeSettings(extensionRoot, targetRoot);
}

function installClaudeSettings(extensionRoot, targetRoot) {
  const hooksSrc = path.join(extensionRoot, 'hooks', 'hooks.json');
  const settingsDest = path.join(targetRoot, '.claude', 'settings.json');

  let incomingHooks = {};
  if (fs.existsSync(hooksSrc)) {
    incomingHooks = JSON.parse(fs.readFileSync(hooksSrc, 'utf8'));
  }

  fs.mkdirSync(path.dirname(settingsDest), { recursive: true });

  const existing = fs.existsSync(settingsDest)
    ? JSON.parse(fs.readFileSync(settingsDest, 'utf8'))
    : {};

  // Merge hooks arrays per event key — do not replace existing handlers
  const existingHooks = existing.hooks || {};
  const mergedHooks = Object.assign({}, existingHooks);
  for (const [event, handlers] of Object.entries(incomingHooks)) {
    mergedHooks[event] = [...(mergedHooks[event] || []), ...handlers];
  }

  const output = Object.assign({}, existing, { hooks: mergedHooks });
  fs.writeFileSync(settingsDest, JSON.stringify(output, null, 2), 'utf8');
}

function installCopilotVariant(extensionRoot, targetRoot) {
  const items = [
    { src: 'agents', dest: '.github/agents' },
    { src: 'skills', dest: '.github/skills' },
    { src: 'hooks/hooks.json', dest: '.github/hooks/hooks.json' }
  ];

  for (const { src, dest } of items) {
    const srcPath = path.join(extensionRoot, src);
    const destPath = path.join(targetRoot, dest);
    if (!fs.existsSync(srcPath)) continue;
    copyEntry(srcPath, destPath);
  }
}

function copyEntry(srcPath, destPath) {
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    copyDirSync(srcPath, destPath);
  } else {
    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
