---
name: github-cli
description: GitHub CLI (gh) command reference for working with Pull Requests, issues, repos, and API. Activates when you need to interact with GitHub from the terminal.
version: 1.0.0
---

# GitHub CLI — Command Reference

## Setup

```bash
# Verify authentication
gh auth status

# Login (if not authenticated)
gh auth login

# Set default repo (useful for reviewing external repos)
gh repo set-default owner/repo
```

## Pull Requests

### View PRs

```bash
# List open PRs
gh pr list

# List PRs requesting your review
gh pr list --search "review-requested:@me"

# List PRs by author
gh pr list --author "username"

# View status of relevant PRs
gh pr status

# View PR details
gh pr view <number>

# View details in JSON format (for analysis)
gh pr view <number> --json title,body,files,additions,deletions,reviews,comments,labels,state

# View full diff
gh pr diff <number>

# View diff for a specific file
gh pr diff <number> -- path/to/file.ts
```

### Checkout and local work

```bash
# Pull the PR branch for local review
gh pr checkout <number>

# Go back to previous branch
git checkout -
```

### Leave reviews

```bash
# Approve
gh pr review <number> --approve -b "Looks good, clean implementation"

# Request changes
gh pr review <number> --request-changes -b "See inline comments"

# Comment only (without approving or rejecting)
gh pr review <number> --comment -b "General feedback"
```

### Comments on PRs

```bash
# Comment on the PR (general comment)
gh pr comment <number> -b "Comment"

# View existing comments (JSON)
gh pr view <number> --json comments --jq '.comments[].body'

# View existing reviews (JSON)
gh pr view <number> --json reviews --jq '.reviews[] | "\(.author.login): \(.state) - \(.body)"'
```

### Create and manage PRs

```bash
# Create PR from current branch
gh pr create --title "Title" --body "Description"

# Create PR with template (fills title and body from last commit)
gh pr create --fill

# Merge PR
gh pr merge <number> --squash --delete-branch

# Close PR without merging
gh pr close <number>
```

## Issues

```bash
# List open issues
gh issue list

# View issue details
gh issue view <number>

# Create issue
gh issue create --title "Title" --body "Description"

# Close issue
gh issue close <number>
```

## Repos

```bash
# Clone repo
gh repo clone owner/repo

# View repo info
gh repo view

# View in browser
gh pr view <number> --web
gh repo view --web
```

## Direct API (for advanced queries)

```bash
# Get review comments from a PR (inline comments)
gh api repos/{owner}/{repo}/pulls/{pr}/comments \
  --jq '.[] | "\(.path):\(.line) — \(.body)"'

# Get all reviews from a PR
gh api repos/{owner}/{repo}/pulls/{pr}/reviews \
  --jq '.[] | "\(.user.login): \(.state) — \(.body)"'

# Get changed files in a PR
gh api repos/{owner}/{repo}/pulls/{pr}/files \
  --jq '.[] | "\(.filename) (+\(.additions) -\(.deletions))"'
```

## gh-pr-review extension (optional, for advanced reviews)

If you need to manage pending reviews with inline comments:

```bash
# Install
gh extension install agyn-sandbox/gh-pr-review

# View all reviews with threads
gh pr-review review view -R owner/repo --pr <number>

# Only unresolved threads
gh pr-review review view -R owner/repo --pr <number> --unresolved

# Start pending review
gh pr-review review --start -R owner/repo <number>

# Add inline comment to pending review
gh pr-review review --add-comment \
  --review-id PRR_xxx \
  --path src/file.ts \
  --line 42 \
  --body "nit: use helper" \
  -R owner/repo <number>

# Submit pending review
gh pr-review review --submit \
  --review-id PRR_xxx \
  --event COMMENT \
  -R owner/repo <number>
```

## Tips

- Use `--json` + `--jq` to filter output and get only what you need
- `gh pr view --web` opens the PR in the browser if you need to see something visual
- For external repos: `gh pr list -R owner/repo`
- `gh api` commands accept any GitHub REST API endpoint
