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

    const confirm = await vscode.window.showWarningMessage(
      'This will copy Agent Workflow configs (.claude/, .github/) into your workspace. Continue?',
      'Yes', 'Cancel'
    );

    if (confirm !== 'Yes') return;

    const dirsToCopy = [
      { src: '.claude', dest: '.claude' },
      { src: '.github', dest: '.github' },
      { src: 'skills', dest: 'skills' },
      { src: 'agents', dest: 'agents' },
      { src: 'CLAUDE.md', dest: 'CLAUDE.md' }
    ];

    try {
      for (const { src, dest } of dirsToCopy) {
        const srcPath = path.join(extensionRoot, src);
        const destPath = path.join(targetRoot, dest);

        if (!fs.existsSync(srcPath)) continue;

        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
          copyDirSync(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
      vscode.window.showInformationMessage('Agent Workflow configs installed successfully!');
    } catch (err) {
      vscode.window.showErrorMessage(`Setup failed: ${err.message}`);
    }
  });

  context.subscriptions.push(disposable);
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
