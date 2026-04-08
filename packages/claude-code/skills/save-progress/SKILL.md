---
name: save-progress
description: Save current work state so it can be resumed in a future session. Use before closing Claude Code when work is in progress.
disable-model-invocation: true
argument-hint: "[optional description of current state]"
---

# Save Progress

Save the current work state to `.github/tasks/progress.md` for resuming later.

**Context:** $ARGUMENTS

## Process

1. Analyze the current conversation to extract:
   - **Task**: What was being worked on
   - **Plan**: The decomposition/subtasks if any
   - **Completed**: What's already done
   - **In Progress**: What was being worked on when stopped
   - **Next Steps**: What to do next
   - **Key Files**: Files involved in the work
   - **Branch**: Current git branch if relevant

2. Write to `.github/tasks/progress.md` using this format:

```markdown
# Work In Progress

> Last saved: [date and time]

## Task
[One-line description of the overall task]

## Plan
- [x] Completed subtask 1
- [x] Completed subtask 2
- [ ] **In Progress**: Current subtask
- [ ] Pending subtask

## Key Files
- `path/to/file.ts` — [what was changed/needs changing]

## Next Steps
1. [Immediate next action]
2. [Following action]

## Context
[Any important context, decisions made, or blockers]

## Resume Command
\`claude --continue\` or \`claude --resume [session-id]\`
```

3. Confirm the save and show the session ID for `--resume`

## Rules
- Overwrite `.github/tasks/progress.md` if it already exists (each save is a fresh snapshot)
- Include the current git branch name
- Keep descriptions concise — this is a reference, not documentation
- Always show the session ID at the end so the user can resume
