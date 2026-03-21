---
name: review-pr
description: Review a Pull Request as Tech Lead — code quality, architecture, security, and actionable feedback. Works for both your own PRs and developer PRs.
disable-model-invocation: true
argument-hint: <PR number>
---

# Review PR — Tech Lead Review

Review a Pull Request before merge. Works for your own PRs (self-review) and developer PRs.

**Input:** $ARGUMENTS

## Process

### 1. Get PR context
```bash
gh pr view <number> --json title,body,author,files,additions,deletions,baseRefName,headRefName,reviews,comments,labels
gh pr diff <number>
```

If the PR body references a GitHub Issue, read it for context:
```bash
gh issue view <issue-number> --json title,body
```

### 2. Read changed files in full
Don't just read the diff — read the COMPLETE files to understand surrounding context. Use `Read` for each changed file.

### 3. Determine review depth

**Self-PR** (you are the author):
- Focus on: bugs you might have missed, edge cases, test coverage
- Lighter on style/architecture (you already know your intent)
- Still run security check if applicable

**Developer PR** (someone else):
- Full review: correctness, architecture, patterns, naming, tests
- Verify it follows the plan from the GitHub Issue
- Check if acceptance criteria from the Issue are met

### 4. Analyze

**Correctness**
- Does the code do what the PR/Issue claims?
- Edge cases handled?
- Error handling adequate?
- Types correct?

**Architecture**
- Follows project patterns?
- Simplest solution? Over-engineered?
- Naming clear and consistent?
- No unnecessary files changed?

**Tests**
- Tests included for the changes?
- Run tests if possible: `npm test`, `cargo test`, `go test`, etc.

**Security (triage)**
If changes touch: auth, user input, APIs, secrets, dependencies, CORS, headers, data storage, encryption, or logging:
- Flag it and delegate to the `security` agent (opus) for OWASP review
- Include findings in the report

### 5. Produce review report

```markdown
## PR Review: #<number> — <title>
> Author: @<author> | Branch: <head> → <base>
> Files: <count> | +<additions> / -<deletions>
> Issue: #<linked-issue> (if any)

### Summary
[1-2 sentences: what this PR does and overall impression]

### Critical (blocks merge)
| # | File:Line | Issue | Fix |
|---|-----------|-------|-----|

### Important (should fix)
| # | File:Line | Issue | Fix |
|---|-----------|-------|-----|

### Suggestions (nice to have)
- ...

### What's Good
- [always include positive feedback]

### Acceptance Criteria Check
- [x] Criterion from Issue met
- [ ] Criterion from Issue NOT met — [why]

### Security: [PASS | NEEDS_REVIEW]

### Decision: [APPROVE | REQUEST_CHANGES | COMMENT]
```

### 6. Post review on GitHub
```bash
# Approve
gh pr review <number> --approve -b "<summary>"

# Request changes (developer PRs with critical issues)
gh pr review <number> --request-changes -b "<critical issues summary>"
```

### 7. Update Notion (if linked)
If you can identify the Notion task for this work, update its status:
- PR approved → move to "En QA" or "Done"
- PR needs changes → keep in "En Review"

## Rules
- ALWAYS read the full diff before any verdict
- ALWAYS include "What's Good"
- Be specific: file, line, what's wrong, how to fix
- For self-PRs: focus on what you might have missed, not style
- For dev PRs: verify the Issue's acceptance criteria are met
- If PR >500 lines, flag it and suggest splitting
- No critical issues = APPROVE — don't block for nitpicks
- If security-sensitive, the security agent review is MANDATORY
- Small team context: pragmatic > perfect. Ship quality code, don't over-process
