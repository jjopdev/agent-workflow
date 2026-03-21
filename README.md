# Agent Workflow Repository

Repository for defining a multi-agent workflow, focused on orchestration, reusable skills, specialized agents, and operational documentation. Now configured for **Claude Code** with historical Copilot configuration preserved in `.github/`.

## Objective

This project is not a web application or a runtime library. Its purpose is to maintain a clear, reusable configuration for working with AI agents in a multi-agent orchestration pattern.

## Structure

### Active configuration (Claude Code)
- `CLAUDE.md`: Root orchestrator instructions — the brain of the workflow
- `.claude/agents/`: Specialized agent definitions (implementer, reviewer, tester, etc.)
- `.claude/skills/`: Project skills for navigation, orchestration, and domain knowledge
- `.claude/rules/`: Universal rules applied by glob pattern (tech-lead, planning)
- `.claude/settings.json`: Shared permission settings

### Documentation
- `workflow-model-strategy.md`: Model strategy, RLM foundations, and cost/quality criteria

### Historical archive (Copilot — read-only)
- `.github/agents/`: Original Copilot agent definitions
- `.github/skills/`: Original Copilot skills
- `.github/instructions/`: Original Copilot instructions
- `.github/tasks/`: Workflow operating state and lessons learned

## Model Strategy

Based on the Recursive Language Models paper (arXiv:2512.24601): an intelligent root model delegating to cheaper sub-models outperforms a single expensive model.

| Role | Model | Rationale |
|------|-------|-----------|
| Orchestrator (you) | opus | Root LM — smart delegation reduces total cost |
| Implementer, Reviewer, Tester, Infra | sonnet | Cost-effective for daily coding |
| Security | opus | Security analysis is never downgraded |
| Explorer, Planner | haiku | Cheap read-only operations |

## How It Works

1. The session runs on **opus** as the orchestrator (defined in `CLAUDE.md`)
2. The orchestrator delegates to specialized agents, each running their declared model
3. Model routing is automatic via agent frontmatter — no manual selection needed
4. Skills in `.claude/skills/` provide domain-specific context to agents
5. Rules in `.claude/rules/` apply automatically by file glob
6. Lessons learned are recorded and consulted across sessions

## Maintenance Criteria

- Keep instructions aligned with actual repository contents
- Avoid rules for stacks that do not exist in the project
- Make changes small and easy to verify
- Prioritize operational clarity in agents, skills, and documentation
- Do NOT modify `.github/` — preserved as historical archive

## Key Files

- `CLAUDE.md` — Orchestrator brain and delegation protocol
- `.claude/settings.json` — Shared permissions
- `.claude/rules/tech-lead.md` — Universal quality principles
- `.claude/rules/planning.md` — Task decomposition guidelines
- `workflow-model-strategy.md` — Model strategy and RLM foundations
