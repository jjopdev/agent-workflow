---
name: skill-creator
description: >
  Use this skill when the user wants to create, design, or improve an Agent
  Skill for any project. Activates when the user mentions creating skills,
  SKILL.md files, skill templates, skill evaluation, or organizing project
  knowledge into reusable agent instructions. Also triggers when the user
  says "create a skill for...", "make a skill that...", or wants to package
  domain knowledge, conventions, or patterns into a structured skill format.
---

# Skill Creator - Project Skill Generator

Create optimized skills following agentskills.io best practices and the RLM multi-agent workflow model strategy.

## When to use this skill

- The user wants to create a new skill for a project
- The user wants to improve or evaluate an existing skill
- The user wants to package domain knowledge as a skill
- The user needs a `SKILL.md` for a pattern, technology, or convention

## Creation Process

### Step 1: Domain Analysis

1. **Identify the scope** - What domain does the skill cover? (framework, pattern, API, convention)
2. **Identify the consumers** - Which agents will use it? (Implementer, Reviewer, Planner, etc.)
3. **Identify the codebase** - Explore the project to find existing patterns:
  - Read `package.json`, `tsconfig.json`, and project configs
  - Search for repeated patterns with Grep
  - Identify naming conventions, folder structure, and import patterns

### Step 2: SKILL.md Structure

Every skill should follow this template:

```markdown
---
name: [kebab-case-name]  # max 64 chars, must match the directory name
description: >
  [Imperative 2-4 sentence description. Start with "Use this skill when..."
  Include contexts where it applies even if the user does not mention the domain.
  Maximum 1024 characters.]
---

# [Name] - [Descriptive subtitle]

## When to use this skill
- [Context 1]
- [Context 2]
- [Context 3]

## [Main section with rules/patterns]

### [Rule 1] -> [reference to a rules file if complex]
- **Correct:** [example]
- **Incorrect:** [example]

### [Rule 2]
...

## Quick Reference
| Question | Answer |
|----------|-----------|
| "How do I do X?" | [Direct answer] |

## Rules
- [Non-negotiable rule 1]
- [Non-negotiable rule 2]
```

### Step 3: Description Optimization

The `description` field is the MOST IMPORTANT one - it determines whether the skill activates.

**Principles:**
- **Imperative phrasing:** "Use this skill when..." instead of "This skill does..."
- **Focus on user intent**, not internal mechanics
- **Be explicitly inclusive:** "even if they don't explicitly mention 'X'"
- **Concise but complete:** 2-4 sentences, maximum 1024 characters
- **Cover synonyms and indirect ways** of asking for the same thing

**Before/after example:**

```yaml
# Before (too generic)
description: Helps with database operations.

# After (optimized)
description: >
  Use this skill when working with DynamoDB operations — CRUD, queries,
  batch operations, GSI design, and data modeling. Applies when the user
  needs to read, write, query, or design tables, even if they don't
  explicitly mention "DynamoDB" but reference "the database" or "data layer."
```

### Step 4: Create Evaluations

Create `evals/evals.json` with at least 3 test cases:

```json
{
  "skill_name": "[name]",
  "evals": [
    {
      "id": 1,
      "prompt": "[Realistic user prompt - with typos, personal context, paths]",
      "expected_output": "[Description of what the skill should produce]",
      "files": [],
      "assertions": [
        "[Verifiable assertion 1]",
        "[Verifiable assertion 2]"
      ]
    }
  ]
}
```

**Test case tips:**
- Vary the level of formality (casual vs precise)
- Include near-misses that should NOT trigger the skill
- Include prompts where the user does NOT mention the domain explicitly
- Minimum: 2-3 should-trigger + 2-3 should-not-trigger

### Step 5: Advanced File Structure (optional)

For complex skills with many rules:

```
skill-name/
├── SKILL.md              # Main instructions (<5000 tokens)
├── evals/
│   └── evals.json        # Test cases
├── rules/                # Detailed rules with Correct/Incorrect examples
│   ├── naming.md
│   ├── patterns.md
│   └── security.md
├── templates/            # Reusable code templates
│   └── component.md
├── checklists/           # Process checklists
│   └── deploy.md
└── scripts/              # Helper scripts
    └── validate.py
```

**Token rule:** `SKILL.md` should stay under 5000 tokens. If it exceeds that, move detailed rules into `rules/` and reference them with relative links.

## Integration with the Multi-Agent Workflow

### Where to place the skill

| Type | Location | When |
|------|-----------|--------|
| **Generic** (cross-project) | `~/.claude/skills/[name]/` | React patterns, testing, Git, etc. |
| **Specific** (single project) | `.claude/skills/[name]/` | Module map, PK/SK patterns, env vars |

### How agents consume it

1. The **Orchestrator** discovers skills at session start (reads frontmatter only)
2. In the handoff, it includes relevant paths in `SKILLS:`
3. The **subagent** reads the full content only if needed (progressive disclosure)
4. Project skills reference personal skills with `> see also ~/.claude/skills/...`

### Complexity optimization

The skill should be useful across all 3 complexity levels:
- **LOW:** Quick reference tables, clear rules without ambiguity
- **MEDIUM:** Patterns with Correct/Incorrect examples
- **HIGH:** Links to detailed `rules/`, templates, and checklists

## Quality Evaluation

### Created skill checklist

- [ ] `name` is in kebab-case and matches the directory
- [ ] `description` is < 1024 chars, imperative, and covers user intent
- [ ] SKILL.md < 5000 tokens
- [ ] Includes a "When to use this skill" section
- [ ] Rules include Correct/Incorrect examples
- [ ] `evals/evals.json` has 3+ test cases
- [ ] Assertions are verifiable, not vague like "output is good"
- [ ] Includes a Quick Reference table for common questions

### Success metrics

| Metric | Target |
|---------|--------|
| Trigger rate (should-trigger) | > 80% |
| Trigger rate (should-not-trigger) | < 20% |
| Assertion pass rate (with skill) | > 75% |
| Delta vs without skill | > +30pp |

## Rules

- Never create a skill without first exploring the project's codebase
- The description is the most important field - optimize it first
- Keep `SKILL.md` under 5000 tokens - use `rules/` for details
- Always include `evals/evals.json` with verifiable assertions
- Project skills should reference personal skills when relevant
- Do not duplicate knowledge that already exists in another skill - reference it instead
