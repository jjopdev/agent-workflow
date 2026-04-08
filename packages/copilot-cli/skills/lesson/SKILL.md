---
name: lesson
description: Record a lesson learned from this session. Use after a mistake, correction, or discovery worth remembering.
disable-model-invocation: true
argument-hint: "[CATEGORY] description of the lesson"
---

# Record Lesson

Record the following lesson to `.github/tasks/lessons.md`:

**Input:** $ARGUMENTS

## Process

1. Parse the category from the input. Valid categories: `[DX]`, `[ARCH]`, `[SECURITY]`, `[FAIL]`, `[PERF]`
   - If no category is provided, infer the most appropriate one from the content
2. Read the current `.github/tasks/lessons.md` to check for duplicates
3. If a similar lesson already exists, update it instead of adding a duplicate
4. Append the new lesson at the end of the file in this format, deriving a concise short title from the takeaway:
   ```
   ### [CATEGORY] Short title
   Description of the lesson — what went wrong and how to avoid it
   ```
5. Confirm the lesson was recorded and show what was added

## Rules
- Keep lessons concise (1-2 lines)
- Focus on the actionable takeaway, not the story
- If the user doesn't provide a description, ask for one
