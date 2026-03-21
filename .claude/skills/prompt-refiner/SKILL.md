---
name: prompt-refiner
description: Use this skill when the user writes a messy, incomplete, or typo-filled idea and needs it converted into a structured prompt for the agent workflow. Activates when the message looks like brainstorming, has poor spelling, or mixes multiple intents.
version: 1.0.0
---

# Prompt Refiner — Idea Organizer

Your job is to take the user's raw idea, interpret and normalize it, and convert it into either a clear direct answer or a clear, actionable prompt routed to the appropriate agent.

## When to use this skill

- The user writes with typos or mixes languages
- The message has multiple ideas mixed without structure
- It's unclear whether it's a new task, a bug, a review, or a question
- The user says something like "I want to do X but also Y and I don't know where to start"

## Process

1. **Understand and normalize the intent** — Ignore writing errors, focus on the meaning, and interpret, correct, and translate messy or multilingual input into clear English before producing the final output
2. **Classify the type and suggest the first route:**
   - `new-feature` -> Suggested route: Planner first, then implementer agent
   - `bug-fix` -> Suggested route: Planner first when non-trivial; simple fixes go to implementer agent directly
   - `review` -> Suggested route: reviewer agent
   - `question` -> Suggested route: Answer directly
   - `refactor` -> Suggested route: Planner first to assess impact, then implementer agent
   - `infra` -> Suggested route: infra agent
   - `security` -> Suggested route: security agent
3. **Separate the pieces** — If there are multiple tasks, separate them
4. **Formulate the clean output** — Split the final output into one of two explicit branches. For `question`, give a direct answer only, with no handoff block. For routed work, produce one copy-ready prompt block in a fenced `text` code block that already includes the structured handoff fields.

## Output format

```
This section is the single source of truth for the final response shape.

If ambiguity remains after interpretation, ask exactly ONE concrete clarifying question before reformulating. Do not emit a partial result.

If Type = `question`:

Return only the direct answer in clear English.
Do not add headings, labels, workflow-route text, metadata, bullets, or a handoff block.

If Type != `question`:

Return exactly one fenced `text` code block in clear English, with no wrapper sections or explanatory text before or after it.
The block must contain the prompt first, followed by these fields in this order:

```text
[Short prompt sentence or paragraph in clear English that describes what to do]

TASK: [one-line description]
SKILLS: [full paths to relevant SKILL.md files, or "none"]
CONTEXT_FILES: [codebase paths to read first, or "none"]
ACCEPTANCE: [verifiable criteria]
CONSTRAINTS: [out-of-scope paths or restrictions]
```
```

## Rules

- Never judge the user's writing
- If there's ambiguity, ask ONE concrete thing before reformulating
- The resulting prompt must be executable without additional clarifications
- If it mixes several tasks, suggest an execution order
- Interpret the user's original wording by correcting obvious mistakes and translating multilingual or messy input into clear English before producing the final result
- Keep the final prompt block in English
- Keep the workflow route aligned with the documented types above; do not invent new trigger keywords
- For `bug-fix`, respect planning-first workflow guidance when the work is non-trivial or diagnostic
- For `question`, provide a direct answer only and do not include a handoff block
- Treat auto-routing as a best-effort heuristic; the manually copied prompt block with embedded handoff fields is the reliable fallback
- For routed work, return exactly one copy-ready fenced `text` code block and nothing outside it
