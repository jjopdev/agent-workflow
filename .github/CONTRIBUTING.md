# Contribution Guide

## Workflow: fork-only

This project **does not accept direct pushes to any branch**, even from collaborators. All contributions must come through a fork and a Pull Request.

## Why forks?

- Keeps the repository history clean and linear.
- Ensures every change is reviewed by the owner before being merged.
- Protects the `main` branch from accidental or unreviewed changes.

## Steps to contribute

1. **Fork** — Fork this repository to your GitHub account.
2. **Clone** — Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/agent-workflow.git
   cd agent-workflow
   ```
3. **Branch** — Create a descriptive branch for your change:
   ```bash
   git checkout -b feat/short-description
   ```
4. **Changes** — Make your modifications following the project conventions.
5. **Push** — Push the branch to **your fork** (not the original repository):
   ```bash
   git push origin feat/short-description
   ```
6. **Pull Request** — Open a PR from your fork targeting `jjopdev/agent-workflow:main`.

## PR Requirements

- Must pass all status checks (if any).
- Requires approval from the owner (`@jjopdev`) before it can be merged.
- History must be linear — merge commits are not accepted; use `rebase` if needed.
- Branches are automatically deleted after merge.

## What is NOT allowed

- Direct push to `main` or any other branch of the original repository.
- Force push on protected branches.
- Deleting protected branches.

## Contact

If you have questions, open an Issue in the repository.
