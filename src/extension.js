const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const WORKFLOW_SKILL_DIRS = [
  'codebase-navigator',
  'consolidate',
  'create-issue',
  'github-cli',
  'lesson',
  'owasp-mcp-review',
  'owasp-review',
  'post-session',
  'prompt-refiner',
  'review-pr',
  'rlm-codebase-navigation',
  'save-progress',
  'skill-creator',
  'workflow',
  'workflow-knowledge',
  'workflow-orchestrator'
];

const CLAUDE_AGENT_FILES = [
  'orchestrator.md',
  'implementer.md',
  'reviewer.md',
  'pr-reviewer.md',
  'tester.md',
  'infra.md',
  'security.md'
];

const COPILOT_AGENT_FILES = [
  'orchestrator.agent.md',
  'implementer.agent.md',
  'reviewer.agent.md',
  'pr-reviewer.agent.md',
  'tester.agent.md',
  'infra.agent.md',
  'security.agent.md',
  'planner.agent.md',
  'scribe.agent.md'
];

const CLAUDE_RULE_FILES = [
  'planning.md',
  'tech-lead.md',
  'always-full-pipeline.md'
];

function activate(context) {
  const setupCommand = vscode.commands.registerCommand('agentWorkflow.setup', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder open. Open a folder first.');
      return;
    }

    const targetRoot = workspaceFolders[0].uri.fsPath;
    const extensionRoot = context.extensionPath;
    const variant = detectVariant(extensionRoot);
    const label = getVariantLabel(variant);
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

  const uninstallCommand = vscode.commands.registerCommand('agentWorkflow.uninstall', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder open. Open a folder first.');
      return;
    }

    const targetRoot = workspaceFolders[0].uri.fsPath;
    const extensionRoot = context.extensionPath;
    const variant = detectVariant(extensionRoot);
    const label = getVariantLabel(variant);

    const confirm = await vscode.window.showWarningMessage(
      `Remove Agent Workflow (${label}) files from your workspace? Custom files will be preserved.`,
      { modal: true },
      'Remove'
    );

    if (confirm !== 'Remove') return;

    try {
      if (variant === 'copilot') {
        uninstallCopilotVariant(targetRoot);
        vscode.window.showInformationMessage('Agent Workflow (Copilot) removed.');
      } else {
        uninstallClaudeVariant(targetRoot);
        vscode.window.showInformationMessage(
          'Agent Workflow (Claude Code) removed. Review .claude/settings.json to remove plugin hooks if needed.'
        );
      }
    } catch (err) {
      vscode.window.showErrorMessage(`Uninstall failed: ${err.message}`);
    }
  });

  context.subscriptions.push(setupCommand, uninstallCommand);
}

function getVariantLabel(variant) {
  return variant === 'copilot' ? 'Copilot' : 'Claude Code';
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
    { srcSegments: ['agents'], destSegments: ['.claude', 'agents'] },
    { srcSegments: ['skills'], destSegments: ['.claude', 'skills'] },
    { srcSegments: ['rules'], destSegments: ['.claude', 'rules'] }
  ];

  for (const { srcSegments, destSegments } of items) {
    const srcPath = path.join(extensionRoot, ...srcSegments);
    const destPath = path.join(targetRoot, ...destSegments);
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
    { srcSegments: ['agents'], destSegments: ['.github', 'agents'] },
    { srcSegments: ['skills'], destSegments: ['.github', 'skills'] },
    { srcSegments: ['hooks', 'hooks.json'], destSegments: ['.github', 'hooks', 'hooks.json'] }
  ];

  for (const { srcSegments, destSegments } of items) {
    const srcPath = path.join(extensionRoot, ...srcSegments);
    const destPath = path.join(targetRoot, ...destSegments);
    if (!fs.existsSync(srcPath)) continue;
    copyEntry(srcPath, destPath);
  }
}

function uninstallClaudeVariant(targetRoot) {
  const claudeRoot = path.join(targetRoot, '.claude');
  const agentsRoot = path.join(claudeRoot, 'agents');
  const skillsRoot = path.join(claudeRoot, 'skills');
  const rulesRoot = path.join(claudeRoot, 'rules');

  for (const fileName of CLAUDE_AGENT_FILES) {
    removeFileIfExists(path.join(agentsRoot, fileName));
  }

  for (const dirName of WORKFLOW_SKILL_DIRS) {
    removeDirIfExists(path.join(skillsRoot, dirName));
  }

  for (const fileName of CLAUDE_RULE_FILES) {
    removeFileIfExists(path.join(rulesRoot, fileName));
  }

  removeDirIfEmpty(agentsRoot);
  removeDirIfEmpty(skillsRoot);
  removeDirIfEmpty(rulesRoot);
}

function uninstallCopilotVariant(targetRoot) {
  const githubRoot = path.join(targetRoot, '.github');
  const agentsRoot = path.join(githubRoot, 'agents');
  const skillsRoot = path.join(githubRoot, 'skills');
  const hooksRoot = path.join(githubRoot, 'hooks');

  for (const fileName of COPILOT_AGENT_FILES) {
    removeFileIfExists(path.join(agentsRoot, fileName));
  }

  for (const dirName of WORKFLOW_SKILL_DIRS) {
    removeDirIfExists(path.join(skillsRoot, dirName));
  }

  removeFileIfExists(path.join(hooksRoot, 'hooks.json'));

  removeDirIfEmpty(agentsRoot);
  removeDirIfEmpty(skillsRoot);
  removeDirIfEmpty(hooksRoot);
}

function removeFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) return;

  const stat = fs.lstatSync(filePath);
  if (stat.isDirectory()) return;

  fs.rmSync(filePath, { force: true });
}

function removeDirIfExists(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const stat = fs.lstatSync(dirPath);
  if (!stat.isDirectory()) return;

  fs.rmSync(dirPath, { recursive: true, force: true });
}

function removeDirIfEmpty(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const stat = fs.lstatSync(dirPath);
  if (!stat.isDirectory()) return;
  if (fs.readdirSync(dirPath).length !== 0) return;

  fs.rmSync(dirPath, { recursive: true, force: true });
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
